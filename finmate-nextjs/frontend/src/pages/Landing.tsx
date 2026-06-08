import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart2, MessageSquare, Shield, Zap, TrendingUp, Globe } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function Landing() {
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                navigate("/dashboard");
            }
        };
        checkAuth();
    }, [navigate]);

    return (
        <div className="min-h-screen flex flex-col bg-zinc-950 text-white overflow-hidden selection:bg-primary/30">

            {/* Background Gradients */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px]" />
                <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] bg-blue-600/20 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-[120px]" />
            </div>

            {/* Navbar */}
            <nav className="relative z-10 p-6 flex items-center justify-between max-w-7xl mx-auto w-full">
                <div className="flex items-center gap-3">
                    <img src="/logo.png" alt="Logo" className="w-10 h-10 rounded-xl shadow-lg shadow-primary/20" />
                    <span className="font-bold text-xl tracking-tight">Senhor Finanças</span>
                </div>
                <div className="flex items-center gap-4">
                    <Link to="/auth?mode=login">
                        <Button variant="ghost" className="text-zinc-400 hover:text-white hover:bg-white/5">
                            Sign In
                        </Button>
                    </Link>
                    <Link to="/auth?mode=signup">
                        <Button className="bg-white text-black hover:bg-zinc-200 font-medium">
                            Get Started
                        </Button>
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4 py-20 lg:py-32 max-w-5xl mx-auto">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-zinc-300 mb-8 animate-fade-in-up">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    AI Agent V2.0 Now Live
                </div>

                <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 bg-gradient-to-b from-white to-white/50 bg-clip-text text-transparent animate-fade-in-up delay-100">
                    Your Personal <br />
                    <span className="text-white">AI Hedge Fund Manager</span>
                </h1>

                <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mb-10 leading-relaxed animate-fade-in-up delay-200">
                    Experience the future of portfolio management. Real-time analytics, autonomous web research, and institutional-grade insights—powered by advanced AI.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 w-full justify-center animate-fade-in-up delay-300">
                    <Link to="/auth?mode=signup">
                        <Button size="lg" className="h-12 px-8 text-base bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 w-full sm:w-auto">
                            Start Trading Smarter <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </Link>
                    <Link to="/demo">
                        <Button size="lg" variant="outline" className="h-12 px-8 text-base bg-transparent border-white/10 hover:bg-white/5 text-white w-full sm:w-auto">
                            View Live Demo
                        </Button>
                    </Link>
                </div>

                <div className="mt-20 relative w-full aspect-video rounded-xl border border-white/10 bg-zinc-950/80 backdrop-blur-md overflow-hidden shadow-2xl animate-fade-in-up delay-500 group text-left">
                    {/* Window Controls */}
                    <div className="absolute top-0 left-0 right-0 h-12 bg-white/5 border-b border-white/5 flex items-center px-4 gap-2 z-20">
                        <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
                        <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                        <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
                        <div className="bg-black/50 px-3 py-1 rounded-md text-xs text-zinc-500 ml-4 font-mono">senhor-financas.com/dashboard</div>
                    </div>

                    {/* Mock Interface */}
                    <div className="absolute inset-0 pt-12 p-6 flex gap-6 overflow-hidden">

                        {/* Sidebar Mock */}
                        <div className="w-64 hidden md:flex flex-col gap-4 border-r border-white/5 pr-6">
                            <div className="h-8 w-8 rounded-lg bg-green-500 mb-6" />
                            <div className="h-10 w-full rounded-lg bg-white/10" />
                            <div className="h-10 w-full rounded-lg bg-transparent hover:bg-white/5" />
                            <div className="h-10 w-full rounded-lg bg-transparent hover:bg-white/5" />
                        </div>

                        {/* Main Content Mock */}
                        <div className="flex-1 flex flex-col gap-6">
                            {/* Header */}
                            <div className="flex justify-between items-center">
                                <div>
                                    <div className="h-4 w-32 bg-white/20 rounded mb-2" />
                                    <div className="h-8 w-64 bg-white/10 rounded" />
                                </div>
                                <div className="h-10 w-32 bg-green-600 rounded-lg" />
                            </div>

                            {/* Cards Grid */}
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                                {/* Card 1 */}
                                <div className="bg-white/5 border border-white/5 p-4 rounded-xl">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center">🍎</div>
                                        <div>
                                            <div className="h-4 w-12 bg-white/20 rounded mb-1" />
                                            <div className="h-3 w-20 bg-white/10 rounded" />
                                        </div>
                                    </div>
                                    <div className="text-2xl font-bold text-green-400">+$2.45</div>
                                </div>
                                {/* Card 2 */}
                                <div className="bg-white/5 border border-white/5 p-4 rounded-xl">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-full bg-purple-500/20 text-purple-500 flex items-center justify-center">🚗</div>
                                        <div>
                                            <div className="h-4 w-12 bg-white/20 rounded mb-1" />
                                            <div className="h-3 w-20 bg-white/10 rounded" />
                                        </div>
                                    </div>
                                    <div className="text-2xl font-bold text-red-400">-$1.20</div>
                                </div>
                                {/* Card 3 */}
                                <div className="bg-white/5 border border-white/5 p-4 rounded-xl hidden lg:block">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-full bg-yellow-500/20 text-yellow-500 flex items-center justify-center">🔍</div>
                                        <div>
                                            <div className="h-4 w-12 bg-white/20 rounded mb-1" />
                                            <div className="h-3 w-20 bg-white/10 rounded" />
                                        </div>
                                    </div>
                                    <div className="text-2xl font-bold text-green-400">+$14.20</div>
                                </div>
                            </div>

                            {/* News Feed Mock */}
                            <div className="flex-1 bg-white/5 border border-white/5 rounded-xl p-4 flex flex-col gap-4">
                                <div className="h-6 w-40 bg-white/10 rounded mb-2" />

                                <div className="flex gap-4 items-start">
                                    <div className="w-24 h-16 bg-white/10 rounded-lg shrink-0" />
                                    <div className="flex-1">
                                        <div className="h-4 w-3/4 bg-white/20 rounded mb-2" />
                                        <div className="h-3 w-1/2 bg-white/10 rounded" />
                                    </div>
                                </div>
                                <div className="flex gap-4 items-start">
                                    <div className="w-24 h-16 bg-white/10 rounded-lg shrink-0" />
                                    <div className="flex-1">
                                        <div className="h-4 w-3/4 bg-white/20 rounded mb-2" />
                                        <div className="h-3 w-1/2 bg-white/10 rounded" />
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </main>

            {/* Features Grid */}
            <section className="relative z-10 py-24 bg-zinc-900/50 border-t border-white/5">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">Institutional Tools for Everyone</h2>
                        <p className="text-zinc-400 max-w-xl mx-auto">Stop guessing. Start knowing. Our AI agent works 24/7 to give you the edge.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<Zap className="w-6 h-6 text-yellow-400" />}
                            title="Real-Time Data"
                            description="Live stock prices and market moves updates instantly. No 15-minute delays."
                        />
                        <FeatureCard
                            icon={<MessageSquare className="w-6 h-6 text-purple-400" />}
                            title="Agentic Chat"
                            description="Ask complex questions like 'Is NVDA overbought?' and get data-backed answers."
                        />
                        <FeatureCard
                            icon={<Globe className="w-6 h-6 text-blue-400" />}
                            title="Deep Web Research"
                            description="The AI autonomously browses the web to find the latest news and verify rumors."
                        />
                        <FeatureCard
                            icon={<BarChart2 className="w-6 h-6 text-emerald-400" />}
                            title="Fundamental Analysis"
                            description="Instant access to P/E ratios, market caps, and dividend yields for any ticker."
                        />
                        <FeatureCard
                            icon={<TrendingUp className="w-6 h-6 text-red-400" />}
                            title="Technical Indicators"
                            description="RSI, Moving Averages, and trend detection calculated on the fly."
                        />
                        <FeatureCard
                            icon={<Shield className="w-6 h-6 text-white" />}
                            title="Bank-Grade Security"
                            description="Your portfolio data is encrypted and isolated. Only you have the keys."
                        />
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="relative z-10 py-12 border-t border-white/5 bg-black/20 text-center text-zinc-500 text-sm">
                <p>&copy; 2024 Senhor Finanças. All rights reserved.</p>
            </footer>
        </div>
    );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <div className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors group">
            <div className="w-12 h-12 rounded-lg bg-black/50 border border-white/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                {icon}
            </div>
            <h3 className="text-lg font-semibold mb-2 text-white">{title}</h3>
            <p className="text-zinc-400 leading-relaxed">{description}</p>
        </div>
    );
}
