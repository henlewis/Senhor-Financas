// API Types
export interface CompanyProfile {
    name: string;
    sector?: string;
    industry?: string;
    summary?: string;
    currency?: string;
    website?: string;
}

export interface Portfolio {
    tickers: string[];
    profiles?: Record<string, CompanyProfile>;
}

export interface NewsItem {
    id: string;
    headline: string;
    summary: string;
    sentiment_score: number;
    category: string;
    affected_tickers: string[];
    impact: "positive" | "neutral" | "negative";
    impact_reason: string;
    risk_level: "low" | "medium" | "high";
    link: string;
    published?: string;
    source?: string;
    related_sources?: string[];
}

export interface Conversation {
    id: string;
    title: string;
    updated_at: string;
}

export interface ChatMessage {
    role: "user" | "assistant";
    content: string;
}

export interface ChatRequest {
    query: string;
    portfolio?: string[];
    news_context?: NewsItem[];
    document_context?: string;
}

export interface DocumentUploadResponse {
    filename: string;
    text: string;
    message: string;
}
