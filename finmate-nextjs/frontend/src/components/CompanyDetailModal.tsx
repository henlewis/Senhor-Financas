import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Building2, Globe, Banknote, Activity, TrendingUp, TrendingDown, RefreshCcw } from "lucide-react";
import type { CompanyProfile } from "@/lib/types";
import { useStockQuote } from "@/lib/api";

interface CompanyDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    ticker: string | null;
    profile: CompanyProfile | null;
}

export function CompanyDetailModal({ isOpen, onClose, ticker, profile }: CompanyDetailModalProps) {
    if (!ticker) return null;

    // Use the new hook to get live data
    const { data: quote, isLoading: isQuoteLoading } = useStockQuote(isOpen ? ticker : null);

    // Fallback if profile is missing (e.g. old data)
    const displayProfile = profile || {
        name: `${ticker} Corp`,
        sector: "Unknown",
        industry: "Unknown",
        summary: "No detailed profile information available.",
        currency: "USD",
        website: ""
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl bg-zinc-950 border-zinc-800 text-white p-0 overflow-hidden gap-0 max-h-[85vh] flex flex-col">
                <DialogHeader className="p-6 pb-4 border-b border-border/50 bg-zinc-900/50 flex-shrink-0">
                    <div className="flex items-start justify-between pr-8">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl bg-zinc-800 flex items-center justify-center flex-shrink-0 border border-zinc-700/50">
                                <span className="text-xl font-bold">
                                    {displayProfile.name.charAt(0)}
                                </span>
                            </div>
                            <div>
                                <DialogTitle className="text-xl font-bold font-serif leading-tight mb-1">
                                    {displayProfile.name}
                                </DialogTitle>
                                <div className="flex items-center gap-3 text-sm text-zinc-400 font-mono">
                                    <span>{ticker}</span>
                                    {displayProfile.website && (
                                        <>
                                            <span className="w-1 h-1 rounded-full bg-zinc-700" />
                                            <a
                                                href={displayProfile.website}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 transition-colors group"
                                            >
                                                <Globe className="h-3 w-3 group-hover:scale-110 transition-transform" />
                                                <span className="underline decoration-blue-400/30 underline-offset-2 group-hover:decoration-blue-400/80">
                                                    Visit Website
                                                </span>
                                            </a>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Live Price Widget */}
                        <div className="flex flex-col items-end">
                            {isQuoteLoading ? (
                                <div className="flex items-center gap-2 text-zinc-500 animate-pulse bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-800">
                                    <RefreshCcw className="w-4 h-4 animate-spin" />
                                    <span className="text-sm font-mono">Loading Price...</span>
                                </div>
                            ) : quote ? (
                                <div className={`flex flex-col items-end px-3 py-1.5 rounded-lg border bg-zinc-900/50 ${quote.change >= 0 ? 'border-green-900/30' : 'border-red-900/30'}`}>
                                    <div className="text-2xl font-bold font-mono tracking-tight flex items-center gap-2">
                                        {quote.currency === 'USD' ? '$' : ''}{quote.price.toFixed(2)}
                                        <span className={`text-xs px-1.5 py-0.5 rounded ${quote.change >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                            {quote.currency}
                                        </span>
                                    </div>
                                    <div className={`flex items-center gap-1 text-sm font-medium ${quote.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        {quote.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                        <span>{quote.change > 0 ? '+' : ''}{quote.change.toFixed(2)}</span>
                                        <span>({quote.change_percent.toFixed(2)}%)</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-zinc-500 text-sm italic">Price unavailable</div>
                            )}
                        </div>
                    </div>
                </DialogHeader>

                <div className="p-6 space-y-6 flex-1 overflow-y-auto custom-scrollbar">
                    <DialogDescription className="sr-only">
                        Company details for {ticker}
                    </DialogDescription>

                    {/* Key Metrics / Tags */}
                    <div className="flex flex-wrap gap-2">
                        {displayProfile.sector && (
                            <Badge variant="secondary" className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 gap-1.5">
                                <Building2 className="h-3 w-3" />
                                {displayProfile.sector}
                            </Badge>
                        )}
                        {displayProfile.industry && (
                            <Badge variant="secondary" className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 gap-1.5">
                                <Activity className="h-3 w-3" />
                                {displayProfile.industry}
                            </Badge>
                        )}
                        {displayProfile.currency && (
                            <Badge variant="secondary" className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 gap-1.5">
                                <Banknote className="h-3 w-3" />
                                {displayProfile.currency}
                            </Badge>
                        )}
                    </div>

                    {/* About Section */}
                    <div className="space-y-2">
                        <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">About</h3>
                        <div className="p-4 rounded-lg bg-zinc-900/50 border border-zinc-800/50">
                            <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-line">
                                {displayProfile.summary}
                            </p>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
