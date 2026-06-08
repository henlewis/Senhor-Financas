# Backend Models
from pydantic import BaseModel
from typing import List, Optional, Dict

class CompanyProfile(BaseModel):
    name: str
    sector: Optional[str] = None
    industry: Optional[str] = None
    summary: Optional[str] = None
    currency: Optional[str] = None
    website: Optional[str] = None

class Portfolio(BaseModel):
    tickers: List[str]
    profiles: Optional[Dict[str, CompanyProfile]] = {}

class AddTickerRequest(BaseModel):
    ticker: str

class NewsItem(BaseModel):
    id: Optional[str] = None
    headline: str
    summary: str
    sentiment_score: int
    category: str
    affected_tickers: List[str]
    impact: str  # "positive" | "neutral" | "negative"
    impact_reason: str
    risk_level: str  # "low" | "medium" | "high"
    link: str
    published: Optional[str] = None
    source: Optional[str] = "Unknown"
    related_sources: List[str] = []

class ChatMessage(BaseModel):
    id: Optional[str] = None
    conversation_id: Optional[str] = None
    role: str  # "user" | "assistant"
    content: str
    created_at: Optional[str] = None

class ChatRequest(BaseModel):
    query: str
    conversation_id: Optional[str] = None
    portfolio: Optional[List[str]] = None
    news_context: Optional[List[NewsItem]] = None
    document_context: Optional[str] = None
