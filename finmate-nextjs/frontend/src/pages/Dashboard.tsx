import { useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { useNews, useRefreshNews, usePortfolio, useGenerateReport } from "@/lib/api";
import { RefreshCw, Download } from "lucide-react";
import type { NewsItem } from "@/lib/types";
import { cn } from "@/lib/utils";
import { NewsCard } from "@/components/NewsCard";
import { NewsDetailModal } from "@/components/NewsDetailModal";
import { CompanyDetailModal } from "@/components/CompanyDetailModal";
import { DashboardTickerCard } from "@/components/DashboardTickerCard";

import { useTour } from "@/hooks/useTour";

export default function Dashboard() {
    useTour();
    const { data: portfolio } = usePortfolio();
    const { data: news, isLoading: newsLoading } = useNews();
    const refreshNews = useRefreshNews();
    const generateReport = useGenerateReport();
    const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
    const [selectedCompanyTicker, setSelectedCompanyTicker] = useState<string | null>(null);

    const handleRefreshNews = () => {
        refreshNews.mutate();
    };

    const handleGenerateReport = () => {
        if (news) {
            generateReport.mutate(news, {
                onSuccess: (blob) => {
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'senhor_financas_briefing.pdf';
                    a.click();
                }
            });
        }
    };

    // Mock data for portfolio cards to match the visual style if real data is missing details
    // In a real app, we'd fetch this detailed info
    const getCompanyDetails = (ticker: string) => {
        // 1. Try backend profile
        if (portfolio?.profiles && portfolio.profiles[ticker]) {
            const profile = portfolio.profiles[ticker];
            let icon = "🏢";
            if (profile.sector) {
                if (profile.sector.includes("Technology")) icon = "💻";
                else if (profile.sector.includes("Communication")) icon = "📱";
                else if (profile.sector.includes("Consumer")) icon = "🛍️";
                else if (profile.sector.includes("Financial")) icon = "💸";
                else if (profile.sector.includes("Energy")) icon = "⚡";
                else if (profile.sector.includes("Health")) icon = "🏥";
                else if (profile.sector.includes("Auto")) icon = "🚗";
            }
            return { name: profile.name, icon };
        }

        const details: Record<string, { name: string, icon: string }> = {
            "AAPL": { name: "Apple Inc.", icon: "🍎" },
            "MSFT": { name: "Microsoft Corp.", icon: "🪟" },
            "GOOGL": { name: "Alphabet Inc.", icon: "🔍" },
            "AMZN": { name: "Amazon.com", icon: "📦" },
            "TSLA": { name: "Tesla Inc.", icon: "🚗" },
            "META": { name: "Meta Platforms", icon: "♾️" },
            "NVDA": { name: "NVIDIA Corp.", icon: "🎮" },
        };
        return details[ticker] || { name: `${ticker} Corp`, icon: "🏢" };
    };

    return (
        <div className="space-y-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight mb-2">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/60">
                            Dashboard
                        </span>
                    </h1>
                    <p className="text-muted-foreground text-lg">
                        Your daily financial intelligence briefing
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button
                        onClick={handleRefreshNews}
                        disabled={refreshNews.isPending}
                        variant="outline"
                        className="bg-secondary/50 border-secondary hover:bg-secondary text-foreground"
                    >
                        <RefreshCw className={cn("h-4 w-4 mr-2", refreshNews.isPending && "animate-spin")} />
                        Refresh
                    </Button>
                    <Button
                        onClick={handleGenerateReport}
                        disabled={!news || news.length === 0 || generateReport.isPending}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground border-0 shadow-lg shadow-primary/20"
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Briefing PDF
                    </Button>
                </div>
            </div>

            {/* Portfolio Impact Section */}
            <section className="space-y-6 animate-slide-in">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-semibold text-foreground">Portfolio - Today's Impact Previsions</h2>
                </div>

                {portfolio && portfolio.tickers.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {portfolio.tickers.map((ticker) => (
                            <DashboardTickerCard
                                key={ticker}
                                ticker={ticker}
                                details={getCompanyDetails(ticker)}
                                news={news || []}
                                onSelect={() => setSelectedCompanyTicker(ticker)}
                            />
                        ))}

                        {/* Add New Ticker Card */}
                        <Link to="/portfolio" className="rounded-2xl p-5 border border-dashed border-border bg-card/50 flex flex-col items-center justify-center text-center hover:bg-card transition-colors cursor-pointer min-h-[140px]">
                            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center mb-2">
                                <span className="text-xl">+</span>
                            </div>
                            <p className="text-sm font-medium text-muted-foreground">Add Asset</p>
                        </Link>
                    </div>
                ) : (
                    <Card className="bg-card border-border p-8 text-center">
                        <p className="text-muted-foreground mb-4">No assets in your portfolio yet.</p>
                        <Link to="/portfolio">
                            <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
                                Add Your First Asset
                            </Button>
                        </Link>
                    </Card>
                )}
            </section>

            {/* News Feed Section */}
            <section className="space-y-6">
                <h2 className="text-2xl font-semibold text-foreground">Today's Important Financial News</h2>

                {newsLoading && (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-muted-foreground animate-pulse">Analyzing global markets...</p>
                    </div>
                )}

                <div className="grid gap-4">
                    {news?.sort((a, b) => new Date(b.published || 0).getTime() - new Date(a.published || 0).getTime())
                        .map((item: NewsItem, index) => (
                            <NewsCard
                                key={item.id || index}
                                item={item}
                                onClick={() => setSelectedNews(item)}
                            />
                        ))}
                </div>
            </section>

            <NewsDetailModal
                isOpen={!!selectedNews}
                onClose={() => setSelectedNews(null)}
                newsItem={selectedNews}
            />

            <CompanyDetailModal
                isOpen={!!selectedCompanyTicker}
                onClose={() => setSelectedCompanyTicker(null)}
                ticker={selectedCompanyTicker}
                profile={selectedCompanyTicker && portfolio?.profiles ? portfolio.profiles[selectedCompanyTicker] : null}
            />
        </div>
    );
}
