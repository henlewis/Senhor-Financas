import logging
import yfinance as yf
from typing import List, Dict, Any
from db.client import supabase

logger = logging.getLogger(__name__)

# Constants (Kept for fallback logic if needed, but primary is DB)
DEFAULT_PORTFOLIO_NAME = "My Portfolio"

import logging
import yfinance as yf
from typing import List, Dict, Any, Tuple
from db.client import supabase

logger = logging.getLogger(__name__)

DEFAULT_PORTFOLIO_NAME = "My Portfolio"

def get_user_portfolio_id(user_id: str) -> str:
    """Get the ID of the portfolio for a specific user. Auto-creates if missing."""
    if not supabase:
        raise Exception("Database connection failed")
        
    res = supabase.table("portfolios").select("id").eq("user_id", user_id).execute()
    if res.data:
        return res.data[0]['id']
    
    # Create if not exists
    res = supabase.table("portfolios").insert({
        "name": DEFAULT_PORTFOLIO_NAME,
        "user_id": user_id
    }).execute()
    return res.data[0]['id']

# --- Portfolio Tickers ---

def load_portfolio(user_id: str) -> List[str]:
    """Fetch tickers from Supabase for a specific user"""
    if not supabase:
        logger.error("Supabase not available")
        return []
        
    try:
        pid = get_user_portfolio_id(user_id)
        res = supabase.table("portfolio_items").select("ticker").eq("portfolio_id", pid).execute()
        # Ensure only strings are returned
        return [str(item['ticker']) for item in res.data if item.get('ticker')]
    except Exception as e:
        logger.error(f"Failed to load portfolio for user {user_id}: {e}")
        return []

def save_portfolio(tickers: List[str]):
    """Deprecated: DB updates happen individually via add/remove"""
    pass 

# --- Company Profiles ---

def load_profiles(filter_tickers: List[str] = None) -> Dict[str, Any]:
    """Fetch cached profiles from DB, optionally filtered by tickers"""
    if not supabase:
        return {}
    try:
        query = supabase.table("company_profiles").select("*")
        if filter_tickers and len(filter_tickers) > 0:
            query = query.in_("ticker", filter_tickers)
            
        res = query.execute()
        profiles = {}
        for row in res.data:
            profiles[row['ticker']] = {
                "name": row['name'],
                "sector": row['sector'],
                "industry": row['industry'],
                "summary": row['summary'],
                "website": row['website'],
                "currency": row['currency']
            }
        return profiles
    except Exception as e:
        logger.error(f"Failed to load profiles: {e}")
        return {}

def fetch_company_profile(ticker: str) -> Dict[str, Any]:
    """Fetch company details using yfinance and cache to DB"""
    try:
        logger.info(f"Fetching profile for {ticker}...")
        stock = yf.Ticker(ticker)
        info = stock.info
        
        # Extract relevant fields
        profile = {
            "name": info.get("longName", ticker),
            "sector": info.get("sector", "Unknown"),
            "industry": info.get("industry", "Unknown"),
            "summary": info.get("longBusinessSummary", "No summary available."),
            "currency": info.get("currency", "USD"),
            "website": info.get("website", "")
        }
        
        # Cache to DB if available
        if supabase:
            try:
                db_row = {
                    "ticker": ticker,
                    **profile
                }
                supabase.table("company_profiles").upsert(db_row).execute()
            except Exception as db_e:
                logger.error(f"Failed to cache profile to DB: {db_e}")
                
        return profile
    except Exception as e:
        logger.error(f"Failed to fetch profile for {ticker}: {e}")
        return {
            "name": ticker,
            "sector": "Unknown",
            "industry": "Unknown",
            "summary": "Could not fetch profile data."
        }

# --- Actions ---

def add_ticker(ticker: str, user_id: str) -> Tuple[List[str], Dict[str, Any]]:
    ticker = ticker.upper()
    
    if not supabase:
        logger.error("Database unavailable")
        return [], {}

    try:
        pid = get_user_portfolio_id(user_id)
        
        # 1. Add to portfolio_items
        # Check if exists first
        existing = supabase.table("portfolio_items").select("*").eq("portfolio_id", pid).eq("ticker", ticker).execute()
        if not existing.data:
            supabase.table("portfolio_items").insert({
                "portfolio_id": pid, 
                "ticker": ticker
            }).execute()
        
        # 2. Add/Update Profile (Global)
        profile = fetch_company_profile(ticker)
        
    except Exception as e:
        logger.error(f"Error adding ticker {ticker}: {e}")
        profile = {}
        
    # Return updated list AND the profile
    return load_portfolio(user_id), profile

def remove_ticker(ticker: str, user_id: str) -> List[str]:
    ticker = ticker.upper()
    
    if not supabase:
        return []
        
    try:
        pid = get_user_portfolio_id(user_id)
        supabase.table("portfolio_items").delete().eq("portfolio_id", pid).eq("ticker", ticker).execute()
    except Exception as e:
        logger.error(f"Error removing ticker {ticker}: {e}")
        
    return load_portfolio(user_id)
