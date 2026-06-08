import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { LayoutDashboard, PieChart, MessageSquare, Newspaper, Settings, LogOut } from "lucide-react";
import { ModeToggle } from "./mode-toggle";
import { SettingsModal } from "./SettingsModal";
import { supabase } from "@/lib/supabase";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Layout({ children }: { children: React.ReactNode }) {
    const location = useLocation();
    const navigate = useNavigate();
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const navItems = [
        { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
        { name: "Portfolio", path: "/portfolio", icon: PieChart },
        { name: "News", path: "/news", icon: Newspaper },
        { name: "Assistant", path: "/chat", icon: MessageSquare },
    ];

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate("/");
    };

    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
            {/* Top Navigation Bar */}
            <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center pt-6 px-6 pointer-events-none">
                <div className="flex items-center justify-between w-full max-w-7xl pointer-events-auto">
                    {/* Logo (Fades out on scroll) */}
                    <div className={cn("flex items-center gap-2 transition-opacity duration-300", isScrolled ? "opacity-0 pointer-events-none" : "opacity-100")}>
                        <img src="/logo.png" alt="Senhor Finanças" className="w-10 h-10 rounded-xl shadow-lg shadow-green-500/20" />
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60 hidden sm:block">
                            Senhor Finanças
                        </span>
                    </div>

                    {/* Centered Pill Navigation */}
                    <nav className="hidden md:flex items-center gap-1 p-1.5 rounded-full bg-background/50 backdrop-blur-xl border border-border/40 shadow-2xl shadow-black/20">
                        {navItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={cn(
                                        "px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2",
                                        isActive
                                            ? "bg-secondary text-primary shadow-inner border border-border/50"
                                            : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                                    )}
                                >
                                    <item.icon className="w-4 h-4" />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Right Actions (Fades out on scroll) */}
                    <div className={cn("flex items-center gap-4 transition-opacity duration-300", isScrolled ? "opacity-0 pointer-events-none" : "opacity-100")}>
                        <ModeToggle />

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/80 border border-border/50 flex items-center justify-center shadow-lg cursor-pointer hover:ring-2 ring-primary ring-offset-2 ring-offset-background transition-all">
                                    <span className="text-sm font-medium text-primary-foreground">SW</span>
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem onClick={() => setSettingsOpen(true)}>
                                    <Settings className="mr-2 h-4 w-4" />
                                    <span>Settings</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Logout</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </header>

            {/* Mobile Bottom Nav */}
            <nav className="md:hidden fixed bottom-6 left-6 right-6 z-50 bg-background/90 backdrop-blur-xl border border-border rounded-2xl p-2 flex justify-around shadow-2xl">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={cn(
                                "p-3 rounded-xl transition-all duration-300",
                                isActive
                                    ? "bg-primary/20 text-primary"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <item.icon className="w-6 h-6" />
                        </Link>
                    );
                })}
            </nav>

            {/* Main Content */}
            <main className="pt-32 px-6 pb-24 max-w-7xl mx-auto animate-fade-in">
                {children}
            </main>

            <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
        </div>
    );
}
