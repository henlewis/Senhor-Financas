import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { usePortfolio, useNews, useChat, useUploadDocument, useChatHistory, useChatMessages } from "@/lib/api";
import { Send, Upload, FileText, Bot, User, Sparkles, Paperclip, X, History, Plus } from "lucide-react";
import type { ChatMessage, Conversation } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function Chat() {
    const queryClient = useQueryClient();

    // State
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState("");
    const [documentContext, setDocumentContext] = useState<string>("");
    const [uploadedFile, setUploadedFile] = useState<string>("");
    const [sidebarView, setSidebarView] = useState<"history" | "context">("history");

    // Refs
    const fileInputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Queries
    const { data: portfolio } = usePortfolio();
    const { data: news } = useNews();
    const { data: history = [] } = useChatHistory();
    const { data: serverMessages } = useChatMessages(conversationId);

    // Mutations
    const chat = useChat();
    const uploadDocument = useUploadDocument();

    // Effects
    useEffect(() => {
        if (serverMessages) {
            setMessages(serverMessages);
        }
    }, [serverMessages]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Handlers
    const handleNewChat = () => {
        setConversationId(null);
        setMessages([]);
        setInput("");
        setSidebarView("context"); // Switch to context for setup
    };

    const handleLoadChat = (id: string) => {
        setConversationId(id);
        // Messages will load via useEffect -> serverMessages
    };

    const handleSendMessage = (overrideInput?: string) => {
        const textToSend = overrideInput || input;
        if (!textToSend.trim()) return;

        const userMessage: ChatMessage = {
            role: "user",
            content: textToSend
        };

        // Optimistic update
        setMessages(prev => [...prev, userMessage]);
        setInput(""); // Always clear input even if using override

        chat.mutate({
            query: textToSend,
            portfolio: portfolio?.tickers,
            news_context: news,
            document_context: documentContext
        }, {
            onSuccess: (response: any) => {
                // Determine Conversation ID from response if it was new
                if (!conversationId && response.conversation_id) {
                    setConversationId(response.conversation_id);
                    queryClient.invalidateQueries({ queryKey: ['chatHistory'] });
                }

                // Append assistant message
                setMessages(prev => [...prev, { role: "assistant", content: response.response }]);
            }
        });
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        uploadDocument.mutate(file, {
            onSuccess: (response) => {
                setDocumentContext(response.text);
                setUploadedFile(response.filename);
            }
        });
    };

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col md:flex-row gap-6 animate-fade-in text-foreground">
            {/* Sidebar */}
            <div className="md:w-80 flex flex-col gap-4">
                <Card className="glass-card p-0 border-border/50 flex-1 flex flex-col overflow-hidden">
                    {/* Sidebar Toggle */}
                    <div className="grid grid-cols-2 border-b border-border/50">
                        <button
                            onClick={() => setSidebarView("history")}
                            className={cn(
                                "flex items-center justify-center gap-2 p-3 text-sm font-medium transition-colors",
                                sidebarView === "history"
                                    ? "bg-accent/50 text-foreground border-b-2 border-primary"
                                    : "hover:bg-accent/20 text-muted-foreground"
                            )}
                        >
                            <History className="w-4 h-4" />
                            History
                        </button>
                        <button
                            onClick={() => setSidebarView("context")}
                            className={cn(
                                "flex items-center justify-center gap-2 p-3 text-sm font-medium transition-colors",
                                sidebarView === "context"
                                    ? "bg-accent/50 text-foreground border-b-2 border-primary"
                                    : "hover:bg-accent/20 text-muted-foreground"
                            )}
                        >
                            <Sparkles className="w-4 h-4" />
                            Context
                        </button>
                    </div>

                    {/* Sidebar Content */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
                        {sidebarView === "history" ? (
                            <div className="space-y-3">
                                <Button
                                    onClick={handleNewChat}
                                    className="w-full justify-start gap-2 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/20 mb-4"
                                >
                                    <Plus className="w-4 h-4" />
                                    New Chat
                                </Button>

                                {history.length === 0 ? (
                                    <p className="text-center text-xs text-muted-foreground py-4">No recent chats</p>
                                ) : (
                                    <div className="space-y-1">
                                        {history.map((conv: Conversation) => (
                                            <button
                                                key={conv.id}
                                                onClick={() => handleLoadChat(conv.id)}
                                                className={cn(
                                                    "w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all truncate",
                                                    conversationId === conv.id
                                                        ? "bg-accent text-foreground font-medium"
                                                        : "text-muted-foreground hover:text-foreground hover:bg-accent/20"
                                                )}
                                            >
                                                {conv.title || "Untitled Chat"}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            // Context View (Existing)
                            <div className="space-y-6">
                                {/* Portfolio */}
                                <div className="space-y-2">
                                    <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Portfolio</h3>
                                    {portfolio && portfolio.tickers.length > 0 ? (
                                        <div className="flex flex-wrap gap-2">
                                            {portfolio.tickers.map((ticker) => (
                                                <Badge key={ticker} variant="secondary" className="bg-secondary/50 hover:bg-secondary border-border/50">
                                                    {ticker}
                                                </Badge>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-muted-foreground italic">No active portfolio</p>
                                    )}
                                </div>

                                {/* News */}
                                <div className="space-y-2">
                                    <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Market Intel</h3>
                                    <div className="bg-card/50 rounded-lg p-3 border border-border/50">
                                        <p className="text-xs text-muted-foreground">
                                            {news ? (
                                                <span className="text-green-500 flex items-center gap-1">
                                                    <span className="relative flex h-2 w-2">
                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                                    </span>
                                                    {news.length} live articles
                                                </span>
                                            ) : "No data"}
                                        </p>
                                    </div>
                                </div>

                                {/* Documents */}
                                <div className="space-y-2">
                                    <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Documents</h3>
                                    <input ref={fileInputRef} type="file" accept=".pdf" onChange={handleFileUpload} className="hidden" />

                                    {!uploadedFile ? (
                                        <Button
                                            onClick={() => fileInputRef.current?.click()}
                                            variant="outline"
                                            className="w-full border-dashed border-border/50 bg-card/50 hover:bg-accent/50 text-muted-foreground hover:text-foreground h-20 flex flex-col gap-2"
                                            disabled={uploadDocument.isPending}
                                        >
                                            <Upload className="h-5 w-5" />
                                            <span className="text-xs">Upload PDF</span>
                                        </Button>
                                    ) : (
                                        <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 flex items-center justify-between">
                                            <div className="flex items-center gap-2 overflow-hidden">
                                                <FileText className="h-4 w-4 text-primary shrink-0" />
                                                <span className="text-xs text-foreground truncate">{uploadedFile}</span>
                                            </div>
                                            <button onClick={() => { setUploadedFile(""); setDocumentContext(""); }} className="text-muted-foreground hover:text-foreground">
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </Card>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col min-h-0">
                <Card className="glass-card border-border/50 flex-1 flex flex-col overflow-hidden shadow-2xl">
                    {/* Header */}
                    <div className="p-4 border-b border-border/50 flex items-center justify-between bg-accent/20">
                        <div className="flex items-center gap-3">
                            <img src="/logo.png" alt="AI" className="w-10 h-10 rounded-xl shadow-lg shadow-primary/20" />
                            <div>
                                <h2 className="font-semibold text-foreground">Senhor Finanças AI</h2>
                                <p className="text-xs text-green-500 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                    {conversationId ? "History Validated" : "New Conversation"}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                        {messages.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                                <Bot className="w-16 h-16 text-muted-foreground mb-4" />
                                <h3 className="text-xl font-medium text-foreground mb-2">How can I help you today?</h3>
                                <p className="text-sm text-muted-foreground max-w-md mb-8">
                                    Ready to analyze your portfolio or discuss market trends.
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-lg">
                                    {/* Dynamic Prompts based on Portfolio */}
                                    {portfolio && portfolio.tickers.length > 0 ? (
                                        <>
                                            {portfolio.tickers.slice(0, 2).map(ticker => (
                                                <Button
                                                    key={ticker}
                                                    variant="outline"
                                                    className="justify-start h-auto py-3 px-4 bg-card/50 border-border/50 hover:bg-accent/50 hover:text-primary text-muted-foreground text-sm whitespace-normal text-left"
                                                    onClick={() => {
                                                        setInput(`Analyze ${ticker} fundamentals and technicals`);
                                                        handleSendMessage(`Analyze ${ticker} fundamentals and technicals`);
                                                    }}
                                                >
                                                    <span className="truncate">Analyze <strong>{ticker}</strong> fundamentals</span>
                                                </Button>
                                            ))}
                                            <Button
                                                variant="outline"
                                                className="justify-start h-auto py-3 px-4 bg-card/50 border-border/50 hover:bg-accent/50 hover:text-primary text-muted-foreground text-sm whitespace-normal text-left"
                                                onClick={() => handleSendMessage(`What is the latest news affecting my portfolio (${portfolio.tickers.slice(0, 3).join(', ')})?`)}
                                            >
                                                <span>Check <strong>Portfolio News</strong></span>
                                            </Button>
                                        </>
                                    ) : (
                                        <Button
                                            variant="outline"
                                            className="justify-start h-auto py-3 px-4 bg-card/50 border-border/50 hover:bg-accent/50 hover:text-primary text-muted-foreground text-sm whitespace-normal text-left"
                                            onClick={() => handleSendMessage("What is the current state of the S&P 500 and Nasdaq?")}
                                        >
                                            <span>Market <strong>Overview</strong></span>
                                        </Button>
                                    )}

                                    <Button
                                        variant="outline"
                                        className="justify-start h-auto py-3 px-4 bg-card/50 border-border/50 hover:bg-accent/50 hover:text-primary text-muted-foreground text-sm whitespace-normal text-left"
                                        onClick={() => handleSendMessage("Identify 3 undervalued tech stocks based on current P/E ratios.")}
                                    >
                                        <span>Find <strong>Undervalued Stocks</strong></span>
                                    </Button>
                                </div>
                            </div>
                        )}

                        {messages.map((message, index) => (
                            <div key={index} className={cn("flex gap-4 max-w-[85%]", message.role === "user" ? "ml-auto flex-row-reverse" : "")}>
                                <div className={cn("w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1", message.role === "user" ? "bg-secondary text-secondary-foreground" : "bg-primary/20 text-primary")}>
                                    {message.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                                </div>
                                <div className={cn("p-4 rounded-2xl text-sm leading-relaxed shadow-md", message.role === "user" ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-card border border-border text-foreground rounded-tl-sm backdrop-blur-sm")}>
                                    <div className={cn(
                                        "prose prose-sm dark:prose-invert max-w-none break-words",
                                        message.role === "user" ? "prose-p:text-primary-foreground prose-headings:text-primary-foreground prose-strong:text-primary-foreground" : ""
                                    )}>
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                            {message.content}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {chat.isPending && (
                            <div className="flex gap-4 max-w-[85%] animate-pulse">
                                <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center flex-shrink-0 mt-1"><Bot className="w-4 h-4" /></div>
                                <div className="bg-card border border-border p-4 rounded-2xl rounded-tl-sm flex items-center gap-2">
                                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></span>
                                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-75"></span>
                                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-150"></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-4 bg-accent/20 border-t border-border/50">
                        <div className="relative flex items-center gap-2">
                            <Button variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()} className="text-muted-foreground hover:text-foreground hover:bg-accent/50">
                                <Paperclip className="w-5 h-5" />
                            </Button>
                            <Input
                                placeholder="Ask about market trends..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                disabled={chat.isPending}
                                className="bg-background/50 border-input focus:border-primary/50 focus:ring-primary/20 text-foreground placeholder:text-muted-foreground rounded-full py-6 pl-6 pr-12"
                            />
                            <Button onClick={() => handleSendMessage()} disabled={!input.trim() || chat.isPending} size="icon" className="absolute right-1.5 top-1.5 bottom-1.5 w-9 h-9 rounded-full bg-primary hover:bg-primary/90">
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
