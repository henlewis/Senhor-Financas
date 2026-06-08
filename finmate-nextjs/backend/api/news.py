from fastapi import APIRouter, HTTPException, Query, Depends
from typing import List, Optional
from models import NewsItem
from services import news_service, llm_service, portfolio_service
from dependencies import get_current_user
import uuid
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/news", tags=["news"])

@router.get("", response_model=List[NewsItem])
async def get_news():
    """Get persisted news from database"""
    try:
        return news_service.get_latest_news()
    except Exception as e:
        logger.error(f"Error fetching news: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch news: {str(e)}")

@router.post("/refresh", response_model=List[NewsItem])
async def refresh_news(user_id: str = Depends(get_current_user)):
    """Fetch fresh news, analyze, and save to DB"""
    try:
        # Get portfolio for analysis context
        portfolio = portfolio_service.load_portfolio(user_id)
        
        # Fetch raw news (DuckDuckGo)
        raw_news = news_service.fetch_news()
        
        analyzed_news = []
        for item in raw_news:
            # Analyze with LLM
            analysis = llm_service.analyze_news(item, portfolio)
            
            # Create NewsItem model
            news_item = NewsItem(
                id=str(uuid.uuid4()), # Temporary ID, DB assigns real one but we need one for model
                headline=analysis.get('headline', item['title']),
                summary=analysis.get('summary', item['summary']),
                sentiment_score=analysis.get('sentiment_score', 50),
                category=analysis.get('category', 'General'),
                affected_tickers=analysis.get('affected_tickers', []),
                impact=analysis.get('impact', 'neutral'),
                impact_reason=analysis.get('impact_reason', ''),
                risk_level=analysis.get('risk_level', 'medium'),
                link=item['link'],
                published=item.get('published'),
                source=item.get('source', 'Unknown'),
                related_sources=analysis.get('related_sources', [])
            )
            
            # Save to Database (Upsert)
            news_service.save_analyzed_news(news_item)
            
            analyzed_news.append(news_item)
        
        # Return what was just processed
        return analyzed_news
    
    except Exception as e:
        logger.error(f"Error refreshing news: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to refresh news: {str(e)}")

@router.get("/{news_id}", response_model=NewsItem)
async def get_news_item(news_id: str):
    """Get a specific news item by ID"""
    # Just fetch list and filter for now as we don't have get_by_id in service yet
    # Optimization: Add get_by_id to service later
    news = news_service.get_latest_news()
    for item in news:
        if item.id == news_id:
            return item
    raise HTTPException(status_code=404, detail="News item not found")
