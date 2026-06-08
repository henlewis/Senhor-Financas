import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Briefcase, MessageSquare } from "lucide-react";

export function Navbar() {
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;

    return (
        <nav className="border-b bg-card">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-2">
                            <img src="/senhor-logo.png" alt="Logo" className="w-8 h-8 rounded-lg" />
                            <h1 className="text-2xl font-bold">Senhor Finanças</h1>
                        </div>
                        <div className="flex gap-2">
                            <Link to="/">
                                <Button
                                    variant={isActive("/") ? "default" : "ghost"}
                                    className="gap-2"
                                >
                                    <LayoutDashboard className="h-4 w-4" />
                                    Dashboard
                                </Button>
                            </Link>
                            <Link to="/portfolio">
                                <Button
                                    variant={isActive("/portfolio") ? "default" : "ghost"}
                                    className="gap-2"
                                >
                                    <Briefcase className="h-4 w-4" />
                                    Portfolio
                                </Button>
                            </Link>
                            <Link to="/chat">
                                <Button
                                    variant={isActive("/chat") ? "default" : "ghost"}
                                    className="gap-2"
                                >
                                    <MessageSquare className="h-4 w-4" />
                                    AI Assistant
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}
