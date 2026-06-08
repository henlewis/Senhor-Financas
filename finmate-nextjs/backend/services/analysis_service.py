import yfinance as yf
import pandas as pd
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

def get_fundamentals(ticker: str) -> dict:
    """
    Fetch key fundamental metrics for a company.
    """
    try:
        ticker = ticker.upper()
        stock = yf.Ticker(ticker)
        info = stock.info
        
        return {
            "ticker": ticker,
            "company_name": info.get("longName"),
            "sector": info.get("sector"),
            "market_cap": info.get("marketCap"),
            "pe_ratio": info.get("trailingPE"),
            "forward_pe": info.get("forwardPE"),
            "dividend_yield": info.get("dividendYield"),
            "fifty_two_week_high": info.get("fiftyTwoWeekHigh"),
            "fifty_two_week_low": info.get("fiftyTwoWeekLow"),
            "currency": info.get("currency", "USD")
        }
    except Exception as e:
        logger.error(f"Error fetching fundamentals for {ticker}: {e}")
        return None

def get_technical_indicators(ticker: str) -> dict:
    """
    Calculate simple technical indicators (RSI, SMA).
    """
    try:
        ticker = ticker.upper()
        stock = yf.Ticker(ticker)
        
        # Get 6 months of history to ensure enough data for EMA/RSI
        hist = stock.history(period="6mo")
        if hist.empty:
            return None
            
        # 1. Close Price Series
        close = hist['Close']
        current_price = close.iloc[-1]
        
        # 2. SMA 50
        sma_50 = close.rolling(window=50).mean().iloc[-1]
        
        # 3. RSI 14
        delta = close.diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
        rs = gain / loss
        rsi_14 = 100 - (100 / (1 + rs)).iloc[-1]
        
        return {
            "ticker": ticker,
            "current_price": current_price,
            "rsi_14": round(rsi_14, 2),
            "sma_50": round(sma_50, 2),
            "signal": "Overbought" if rsi_14 > 70 else "Oversold" if rsi_14 < 30 else "Neutral"
        }
    except Exception as e:
        logger.error(f"Error calculating technicals for {ticker}: {e}")
        return None
