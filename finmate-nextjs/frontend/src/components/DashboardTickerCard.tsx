import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStockQuote } from "@/lib/api";
import type { NewsItem } from "@/lib/types";

interface DashboardTickerCardProps {
    ticker: string;
    details: { name: string, icon: string };
    news: NewsItem[];
    onSelect: () => void;
}

export function DashboardTickerCard({ ticker, details, news, onSelect }: DashboardTickerCardProps) {
    const { data: quote, isLoading: isQuoteLoading } = useStockQuote(ticker);

    // Calculate Impact Score
    // Find news for this ticker to determine impact
    const tickerNews = news.filter(n => n.affected_tickers.includes(ticker));
    const impactScore = tickerNews.reduce((acc, n) => {
        if (n.impact === 'positive') return acc + 1;
        if (n.impact === 'negative') return acc - 1;
        return acc;
    }, 0);

    const isPositiveImpact = impactScore >= 0;
    // Prioritize Price Change for coloring if available, otherwise fallback to Impact
    const isPositive = quote ? quote.change >= 0 : isPositiveImpact;

    return (
        <div
            onClick={onSelect}
            className={cn(
                "relative overflow-hidden rounded-2xl p-5 border transition-all duration-300 hover:scale-[1.02] cursor-pointer group bg-card hover:shadow-lg",
                isPositive
                    ? "dark:bg-gradient-to-br dark:from-green-950/30 dark:to-black border-green-500/20 hover:border-green-500/40"
                    : "dark:bg-gradient-to-br dark:from-red-950/30 dark:to-black border-red-500/20 hover:border-red-500/40"
            )}
        >
            {/* Light mode alternate background */}
            <div className={cn("absolute inset-0 opacity-0 dark:opacity-0 transition-opacity",
                isPositive ? "bg-green-50/50" : "bg-red-50/50",
                "group-hover:opacity-100 dark:group-hover:opacity-0"
            )} />

            <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-secondary/50 flex items-center justify-center text-xl backdrop-blur-sm">
                        {details.icon}
                    </div>
                    <div>
                        <h3 className="font-bold text-foreground text-lg leading-none">{ticker}</h3>
                        <p className="text-xs text-muted-foreground mt-1">{details.name}</p>
                    </div>
                </div>

                {isPositive ? (
                    <div className="bg-green-500/10 p-1.5 rounded-full">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                    </div>
                ) : (
                    <div className="bg-red-500/10 p-1.5 rounded-full">
                        <TrendingDown className="w-4 h-4 text-red-500" />
                    </div>
                )}
            </div>

            <div className="flex items-end justify-between mt-2 relative z-10">
                <Badge variant="outline" className="bg-background/50 border-border text-xs font-normal h-6">
                    {tickerNews.length} news items
                </Badge>

                {/* Live Price Section (Replacing Sparkline) */}
                <div className="text-right">
                    {isQuoteLoading ? (
                        <div className="h-8 w-20 bg-muted/20 animate-pulse rounded" />
                    ) : quote ? (
                        <div>
                            <div className="text-lg font-bold font-mono tracking-tight leading-none mb-1">
                                ${quote.price.toFixed(2)}
                            </div>
                            <div className={cn("flex items-center justify-end gap-1 text-xs font-medium",
                                quote.change >= 0 ? "text-green-500" : "text-red-500"
                            )}>
                                <span>{quote.change > 0 ? '+' : ''}{quote.change.toFixed(2)} ({quote.change_percent.toFixed(2)}%)</span>
                            </div>
                        </div>
                    ) : (
                        <span className="text-xs text-muted-foreground">Price Unavailable</span>
                    )}
                </div>
            </div>
        </div>
    );
}
