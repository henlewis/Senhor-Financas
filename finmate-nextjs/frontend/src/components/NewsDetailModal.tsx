import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Globe } from "lucide-react";
import type { NewsItem } from "@/lib/types";

interface NewsDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    newsItem: NewsItem | null;
}

export function NewsDetailModal({ isOpen, onClose, newsItem }: NewsDetailModalProps) {
    if (!newsItem) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl bg-card border-border text-foreground p-0 overflow-hidden gap-0">
                <DialogHeader className="p-6 pb-0 text-left">
                    <div className="space-y-2">
                        <div className="flex justify-between items-start">
                            <DialogTitle className="text-xl font-serif font-bold leading-tight pr-8">
                                {newsItem.headline}
                            </DialogTitle>
                        </div>
                    </div>
                </DialogHeader>
                <div className="p-6 space-y-6 pt-2">
                    <DialogDescription className="sr-only">
                        Detailed view of the news article including summary, impact, and sources.
                    </DialogDescription>

                    <div className="space-y-4">
                        {/* Summary Section - Moved to top as primary info */}
                        <div>
                            <h3 className="text-sm font-semibold text-muted-foreground mb-2">Summary</h3>
                            <p className="text-foreground text-sm leading-relaxed">
                                {newsItem.summary}
                            </p>
                        </div>

                        {/* Sentiment Bar Visualization */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-sm font-semibold text-muted-foreground">Sentiment Analysis</h3>
                                <span className="text-sm font-mono text-foreground">{newsItem.sentiment_score}/10</span>
                            </div>
                            <div className="relative h-2 w-full rounded-full bg-zinc-800 overflow-hidden">
                                <div className="absolute inset-y-0 left-0 right-0 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 opacity-80" />
                                <div
                                    className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                                    style={{ left: `${newsItem.sentiment_score * 10}%` }}
                                />
                            </div>
                            <div className="flex justify-between text-[10px] uppercase tracking-wider text-muted-foreground mt-1">
                                <span>Critical</span>
                                <span>Neutral</span>
                                <span>Great</span>
                            </div>
                        </div>

                        {/* Overall Impact Section */}
                        <div>
                            <h3 className="text-sm font-semibold text-muted-foreground mb-2">Overall Impact</h3>
                            <p className="text-foreground text-sm leading-relaxed mb-3">
                                {newsItem.impact_reason || "AI analysis of impact is pending or unavailable."}
                            </p>

                            <div className="flex flex-wrap gap-2 text-xs">
                                {newsItem.affected_tickers.map((ticker) => {
                                    const isNegative = newsItem.impact === 'negative' || newsItem.sentiment_score < 4;
                                    const variantStyles = isNegative
                                        ? "bg-red-900/30 text-red-400 border-red-900/50 hover:bg-red-900/50"
                                        : "bg-green-900/30 text-green-400 border-green-900/50 hover:bg-green-900/50";
                                    const sign = isNegative ? "(-)" : "(+)";

                                    return (
                                        <Badge key={ticker} variant="outline" className={variantStyles}>
                                            {ticker} {sign}
                                        </Badge>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Read Full News Button */}
                        {newsItem.link && (
                            <Button
                                variant="outline"
                                className="rounded-full border-zinc-700 bg-transparent text-white hover:bg-zinc-800 h-8 text-xs gap-2"
                                onClick={() => window.open(newsItem.link, '_blank')}
                            >
                                <ExternalLink className="w-3 h-3" />
                                Read full news
                            </Button>
                        )}

                        {/* Related Sources / Verification */}
                        {newsItem.related_sources && newsItem.related_sources.length > 0 && (
                            <div className="space-y-2 pt-4 border-t border-zinc-800">
                                <h3 className="text-sm font-semibold text-zinc-400 flex items-center gap-2">
                                    <Globe className="w-3 h-3" />
                                    Verified Sources & Cross-Reference
                                </h3>
                                <div className="grid gap-2">
                                    {newsItem.related_sources.map((source, idx) => (
                                        <a
                                            key={idx}
                                            href={source}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs flex items-center justify-between p-2 rounded bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800 transition-colors group"
                                        >
                                            <span className="truncate text-zinc-300 font-mono">
                                                {new URL(source).hostname.replace('www.', '')}
                                            </span>
                                            <ExternalLink className="h-3 w-3 text-zinc-500 group-hover:text-blue-400" />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
