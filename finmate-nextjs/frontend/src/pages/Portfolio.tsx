// ... imports remain same
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { usePortfolio, useAddTicker, useRemoveTicker } from "@/lib/api";
import { Plus, Trash2, Wallet, TrendingUp, TrendingDown, Search } from "lucide-react";
import { useStockQuote } from "@/lib/api";
import { CompanyDetailModal } from "@/components/CompanyDetailModal";

interface TickerCardProps {
    ticker: string;
    details: { name: string, icon: string };
    onSelect: () => void;
    onRemove: () => void;
    isRemoving: boolean;
}

function TickerCard({ ticker, details, onSelect, onRemove, isRemoving }: TickerCardProps) {
    const { data: quote, isLoading } = useStockQuote(ticker);

    return (
        <div
            onClick={onSelect}
            className="group flex items-center justify-between p-4 rounded-xl border border-border/50 bg-card/50 hover:bg-accent/50 transition-all duration-300 hover:border-border hover:translate-x-1 cursor-pointer shadow-sm"
        >
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-2xl border border-border">
                    {details.icon}
                </div>
                <div>
                    <div className="flex items-center gap-2">
                        <h3 className="font-bold text-foreground text-lg">{ticker}</h3>
                        <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/20 text-[10px] px-1.5 h-5">
                            LIVE
                        </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{details.name}</p>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="hidden sm:block text-right mr-4">
                    {isLoading ? (
                        <div className="flex flex-col items-end gap-1">
                            <div className="h-5 w-20 bg-muted rounded animate-pulse" />
                            <div className="h-4 w-12 bg-muted/50 rounded animate-pulse" />
                        </div>
                    ) : quote ? (
                        <div className="flex flex-col items-end">
                            <div className="text-lg font-bold font-mono tracking-tight text-foreground flex items-center gap-2">
                                ${quote.price.toFixed(2)}
                            </div>
                            <div className={`flex items-center gap-1 text-xs font-medium ${quote.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {quote.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                <span>{quote.change > 0 ? '+' : ''}{quote.change.toFixed(2)} ({quote.change_percent.toFixed(2)}%)</span>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-1 text-muted-foreground text-sm font-medium">
                            <span>Unavailable</span>
                        </div>
                    )}
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                        e.stopPropagation();
                        onRemove();
                    }}
                    disabled={isRemoving}
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                >
                    <Trash2 className="h-5 w-5" />
                </Button>
            </div>
        </div>
    );
}

export default function Portfolio() {
    const [newTicker, setNewTicker] = useState("");
    const [selectedCompanyTicker, setSelectedCompanyTicker] = useState<string | null>(null);
    const { data: portfolio, isLoading } = usePortfolio();
    const addTicker = useAddTicker();
    const removeTicker = useRemoveTicker();

    const handleAddTicker = () => {
        if (newTicker.trim()) {
            addTicker.mutate(newTicker.toUpperCase(), {
                onSuccess: () => setNewTicker("")
            });
        }
    };

    const handleRemoveTicker = (ticker: string) => {
        removeTicker.mutate(ticker);
    };

    // Mock data for company names/icons
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
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight mb-2 text-foreground">
                        Portfolio Management
                    </h1>
                    <p className="text-muted-foreground text-lg">
                        Track and manage your assets
                    </p>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {/* Left Column: Add Ticker */}
                <div className="md:col-span-1 space-y-6">
                    <Card className="glass-card p-6 border-border/50">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <Plus className="w-5 h-5" />
                            </div>
                            <h2 className="text-xl font-semibold text-foreground">Add Asset</h2>
                        </div>

                        <div className="space-y-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="Enter ticker (e.g. AAPL)"
                                    value={newTicker}
                                    onChange={(e) => setNewTicker(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleAddTicker()}
                                    className="pl-9 bg-background/50 border-input text-foreground placeholder:text-muted-foreground focus:ring-primary/50 focus:border-primary/50"
                                />
                            </div>
                            <Button
                                onClick={handleAddTicker}
                                disabled={!newTicker.trim() || addTicker.isPending}
                                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
                            >
                                {addTicker.isPending ? "Adding..." : "Add to Portfolio"}
                            </Button>
                        </div>
                    </Card>

                    <Card className="glass-card p-6 border-border/50 bg-gradient-to-br from-primary/5 to-transparent">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <Wallet className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-foreground">Total Assets</h3>
                                <p className="text-2xl font-bold text-foreground">{portfolio?.tickers.length || 0}</p>
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Your portfolio is monitored 24/7 by our AI for significant market events.
                        </p>
                    </Card>
                </div>

                {/* Right Column: List */}
                <div className="md:col-span-2">
                    <Card className="glass-card border-border/50 min-h-[500px]">
                        <div className="p-6 border-b border-border/50">
                            <h2 className="text-xl font-semibold text-foreground">Your Holdings</h2>
                        </div>

                        <div className="p-6">
                            {isLoading && (
                                <div className="flex justify-center py-12">
                                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                                </div>
                            )}

                            {portfolio && portfolio.tickers.length === 0 && !isLoading && (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                                        <Wallet className="w-8 h-8 text-muted-foreground" />
                                    </div>
                                    <p className="text-muted-foreground mb-2">No assets tracked yet</p>
                                    <p className="text-sm text-muted-foreground">Add your first ticker to get started</p>
                                </div>
                            )}

                            <div className="grid gap-3">
                                {portfolio?.tickers.map((ticker) => (
                                    <TickerCard
                                        key={ticker}
                                        ticker={ticker}
                                        details={getCompanyDetails(ticker)}
                                        onSelect={() => setSelectedCompanyTicker(ticker)}
                                        onRemove={() => handleRemoveTicker(ticker)}
                                        isRemoving={removeTicker.isPending}
                                    />
                                ))}
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            <CompanyDetailModal
                isOpen={!!selectedCompanyTicker}
                onClose={() => setSelectedCompanyTicker(null)}
                ticker={selectedCompanyTicker}
                profile={selectedCompanyTicker && portfolio?.profiles ? portfolio.profiles[selectedCompanyTicker] : null}
            />
        </div>
    );
}
