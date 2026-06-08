import feedparser
import logging
from typing import List, Dict, Any
from datetime import datetime
import time

logger = logging.getLogger(__name__)

# Selected High-Quality/Fast Financial RSS Feeds
RSS_FEEDS = {
    # Yahoo Latest Market News (often faster than generic 'rssindex')
    "Yahoo Finance": "https://finance.yahoo.com/news/rssindex", 
    # CNBC Market News (Breaking)
    "CNBC Markets": "https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=10000664",
    # Investing.com Latest
    "Investing.com": "https://www.investing.com/rss/news.rss"
}

def parse_date_safely(entry):
    """Attempt to parse published date from RSS entry, return datetime obj"""
    try:
        if hasattr(entry, 'published_parsed') and entry.published_parsed:
            return datetime.fromtimestamp(time.mktime(entry.published_parsed))
    except:
        pass
    return datetime.now()

def fetch_rss_news() -> List[Dict[str, Any]]:
    """Fetch and aggregate news from defined RSS feeds, filtering out old news"""
    news_items = []
    # 48 Hour Cutoff
    cutoff_time = datetime.now().timestamp() - (48 * 3600)
    
    for source_name, url in RSS_FEEDS.items():
        try:
            logger.info(f"Fetching RSS feed: {source_name}")
            feed = feedparser.parse(url)
            
            # Take top 10 from each to scan enough candidates
            count = 0
            for entry in feed.entries:
                if count >= 5: break

                # Check Age
                dt = parse_date_safely(entry)
                if dt.timestamp() < cutoff_time:
                    logger.debug(f"Skipping old news: {entry.get('title')} ({dt})")
                    continue
                
                # Standardize
                item = {
                    "title": entry.get('title', 'No Title'),
                    "link": entry.get('link', ''),
                    "summary": entry.get('summary', '') or entry.get('description', ''),
                    "published": dt.isoformat(),
                    "source": source_name
                }
                news_items.append(item)
                count += 1
                
        except Exception as e:
            logger.error(f"Error fetching RSS {source_name}: {e}")
            
    # Sort by published date (newest first)
    news_items.sort(key=lambda x: x['published'], reverse=True)
    
    return news_items
