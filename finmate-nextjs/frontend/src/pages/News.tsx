// ... imports
import { useState, useMemo } from "react";
import { NewsCard } from "@/components/NewsCard";
import { RefreshCw, Filter, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNews, useRefreshNews, usePortfolio } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { NewsItem } from "@/lib/types";
import { NewsDetailModal } from "@/components/NewsDetailModal";

export default function NewsPage() {
    const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
    const [filterSource, setFilterSource] = useState("all");
    const [filterPeriod, setFilterPeriod] = useState("all");
    const [filterTicker, setFilterTicker] = useState("all");
    const [sortBy, setSortBy] = useState("newest");

    const { data: news = [], isLoading, isRefetching } = useNews();
    const { data: portfolio } = usePortfolio();
    const refreshMutation = useRefreshNews();

    // extract unique sources
    const sources = useMemo(() => {
        const unique = new Set(news.map((i: NewsItem) => i.source || "Unknown"));
        return Array.from(unique).filter(Boolean) as string[];
    }, [news]);

    // Derived state for filtered news
    const filteredNews = useMemo(() => {
        return news.filter((item: NewsItem) => {
            // 1. Source Filter
            if (filterSource !== "all" && (item.source || "Unknown") !== filterSource) return false;

            // 2. Ticker Filter
            if (filterTicker !== "all") {
                if (!item.affected_tickers.includes(filterTicker)) return false;
            }

            // 3. Period Filter
            if (filterPeriod !== "all") {
                const date = new Date(item.published || new Date());
                const now = new Date();
                const diffTime = Math.abs(now.getTime() - date.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (filterPeriod === "24h" && diffTime > 1000 * 60 * 60 * 24) return false;
                if (filterPeriod === "week" && diffDays > 7) return false;
                if (filterPeriod === "month" && diffDays > 30) return false;
            }

            return true;
        }).sort((a: NewsItem, b: NewsItem) => {
            if (sortBy === "newest") {
                return (new Date(b.published || 0).getTime()) - (new Date(a.published || 0).getTime());
            }
            if (sortBy === "sentiment_high") {
                return b.sentiment_score - a.sentiment_score;
            }
            if (sortBy === "sentiment_low") {
                return a.sentiment_score - b.sentiment_score;
            }
            return 0;
        });
    }, [news, filterSource, filterPeriod, filterTicker, sortBy]);

    return (
        <div className="min-h-screen p-6 md:p-12 space-y-8 animate-fade-in pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-2">
                <div>
                    <h1 className="text-4xl font-serif font-bold tracking-tight mb-2 text-foreground">Financial News</h1>
                    <p className="text-muted-foreground max-w-xl text-lg">
                        Real-time market signals with AI-powered analysis
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        onClick={() => refreshMutation.mutate()}
                        disabled={refreshMutation.isPending || isRefetching}
                        className={cn("gap-2 min-w-[140px]", refreshMutation.isPending && "animate-pulse")}
                        variant="outline"
                    >
                        <RefreshCw className={cn("h-4 w-4", (refreshMutation.isPending || isRefetching) && "animate-spin")} />
                        {refreshMutation.isPending ? "Analyzing..." : "Refresh Feed"}
                    </Button>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-wrap items-center gap-4 bg-card border border-border/50 p-4 rounded-xl shadow-sm">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mr-2">
                    <Filter className="w-4 h-4" />
                    Filters:
                </div>

                {/* Source Filter */}
                <Select value={filterSource} onValueChange={setFilterSource}>
                    <SelectTrigger className="w-[180px] bg-background border-input">
                        <SelectValue placeholder="All Sources" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Sources</SelectItem>
                        {sources.map(s => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* Period Filter */}
                <Select value={filterPeriod} onValueChange={setFilterPeriod}>
                    <SelectTrigger className="w-[140px] bg-background border-input">
                        <SelectValue placeholder="Any Time" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Any Time</SelectItem>
                        <SelectItem value="24h">Last 24 Hours</SelectItem>
                        <SelectItem value="week">Past Week</SelectItem>
                        <SelectItem value="month">Past Month</SelectItem>
                    </SelectContent>
                </Select>

                {/* Portfolio Ticker Filter */}
                <Select value={filterTicker} onValueChange={setFilterTicker}>
                    <SelectTrigger className="w-[160px] bg-background border-input">
                        <SelectValue placeholder="Filter by Ticker" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Tickers</SelectItem>
                        {portfolio?.tickers.map((t: string) => (
                            <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <div className="h-6 w-px bg-border mx-2" />

                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mr-2">
                    <ArrowUpDown className="w-4 h-4" />
                    Sort:
                </div>

                {/* Sort */}
                <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[180px] bg-background border-input">
                        <SelectValue placeholder="Sort By" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="newest">Newest First</SelectItem>
                        <SelectItem value="sentiment_high">Sentiment (Highest)</SelectItem>
                        <SelectItem value="sentiment_low">Sentiment (Lowest)</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Content */}
            <div className="flex flex-col gap-4 max-w-5xl mx-auto">
                {isLoading ? (
                    [1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="h-48 bg-muted/50 rounded-xl animate-pulse" />
                    ))
                ) : filteredNews.length > 0 ? (
                    filteredNews.map((item: NewsItem) => (
                        <NewsCard
                            key={item.id}
                            item={item}
                            onClick={() => setSelectedNews(item)}
                        />
                    ))
                ) : (
                    <div className="col-span-full py-20 text-center text-muted-foreground border border-dashed border-border rounded-xl">
                        No news found matching your filters.
                    </div>
                )}
            </div>

            <NewsDetailModal
                isOpen={!!selectedNews}
                onClose={() => setSelectedNews(null)}
                newsItem={selectedNews}
            />
        </div>
    );
}
