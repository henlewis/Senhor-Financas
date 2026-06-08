from duckduckgo_search import DDGS
from openai import OpenAI
import os
import logging
from typing import List, Dict, Any
import uuid
from db.client import supabase
from models import NewsItem

logger = logging.getLogger(__name__)

# Mock fallback data
PROCESSED_NEWS = [
    {
        "id": "1",
        "headline": "Tech Sector Rally Continues",
        "summary": "Major tech stocks see updated gains as AI adoption accelerates.",
        "sentiment_score": 85,
        "category": "Technology",
        "affected_tickers": ["NVDA", "MSFT", "PLTR"],
        "impact": "positive",
        "impact_reason": "Strong demand for AI chips and cloud services.",
        "risk_level": "low",
        "link": "https://example.com/tech-news",
        "published": "2024-03-20T10:00:00Z",
        "source": "Bloomberg"
    }
]

from services import rss_service

def fetch_news() -> List[Dict[str, Any]]:
    """Fetch raw financial news from RSS Feeds"""
    try:
        # Use RSS for freshness/latest news
        return rss_service.fetch_rss_news()
    except Exception as e:
        logger.error(f"Error fetching news: {e}")
        return []

def save_analyzed_news(news_item: NewsItem):
    """Save an analyzed news item to the database"""
    if not supabase:
        logger.warning("Supabase unavailable, cannot save news.")
        return

    try:
        # 1. Insert/Upsert Article
        article_data = {
            "url": news_item.link,
            "headline": news_item.headline,
            "summary": news_item.summary,
            "source": news_item.source,
            "published_at": news_item.published, 
            "sentiment_score": news_item.sentiment_score,
            "risk_level": news_item.risk_level,
            "impact_level": news_item.impact,
            # NEW FIELDS
            "impact_reason": news_item.impact_reason,
            "related_sources": news_item.related_sources
        }
        
        # upsert, match on url
        res = supabase.table("news_articles").upsert(article_data, on_conflict="url").execute()
        
        if not res.data:
            # Fallback for some DB configs that don't return data on upsert unless asked
            # But Supabase usually does. If not, we query ID by URL
            res = supabase.table("news_articles").select("id").eq("url", news_item.link).execute()
            
        article_id = res.data[0]['id']
        
        # 2. Associations (Tickers)
        for ticker in news_item.affected_tickers:
            try:
                supabase.table("news_ticker_associations").upsert({
                    "news_id": article_id,
                    "ticker": ticker
                }).execute()
            except Exception as e:
                logger.error(f"Failed to link ticker {ticker}: {e}")
                
    except Exception as e:
        logger.error(f"Failed to save analyzed news to DB: {e}")

def get_latest_news() -> List[NewsItem]:
    """Fetch cached analyzed news from DB"""
    if not supabase:
        return []
        
    try:
        # Fetch latest 20 articles
        res = supabase.table("news_articles").select("*").order("created_at", desc=True).limit(20).execute()
        
        items = []
        for row in res.data:
            # Fetch tickers
            ticker_res = supabase.table("news_ticker_associations").select("ticker").eq("news_id", row['id']).execute()
            tickers = [t['ticker'] for t in ticker_res.data]
            
            item = NewsItem(
                id=row['id'],
                headline=row['headline'],
                summary=row['summary'] or "",
                sentiment_score=row['sentiment_score'] or 50,
                category="General", 
                affected_tickers=tickers,
                impact=row['impact_level'] or "neutral",
                impact_reason=row.get('impact_reason', "") or "Analysis pending...", 
                risk_level=row['risk_level'] or "medium",
                link=row['url'],
                published=row['published_at'],
                source=row['source'] or "Unknown",
                related_sources=row.get('related_sources', []) or []
            )
            items.append(item)
        return items
    except Exception as e:
        logger.error(f"Failed to fetch news from DB: {e}")
        return []
