import yfinance as yf
import logging

logger = logging.getLogger(__name__)

def get_quote_data(ticker: str) -> dict:
    """
    Get real-time quote for a ticker.
    Returns dict with price, change, change_percent, currency.
    Returns None if failed.
    """
    try:
        ticker = ticker.upper()
        # Ensure yfinance doesn't print to stdout
        stock = yf.Ticker(ticker)
        
        # Helper to get value from fast_info safely
        def get_fast_val(key_attr, key_dict=None):
            val = None
            try:
                val = getattr(stock.fast_info, key_attr, None)
            except:
                pass
            if val is None and key_dict:
                val = stock.fast_info.get(key_dict)
            return val

        # 1. Get Price
        price = get_fast_val('last_price', 'last_price')
        
        # Fallback to regular info
        if not price:
            try:
                info = stock.info
                price = info.get('currentPrice') or info.get('regularMarketPrice')
            except: 
                pass

        if not price:
             return None

        change = 0.0
        change_percent = 0.0
        
        # 2. Get Previous Close
        prev_close = get_fast_val('previous_close', 'previous_close')
        if not prev_close:
             prev_close = get_fast_val('previousClose', 'previousClose')
        
        if not prev_close:
             try:
                info = stock.info
                prev_close = info.get('regularMarketPreviousClose') or info.get('previousClose')
             except:
                pass

        if prev_close:
            change = price - prev_close
            change_percent = (change / prev_close) * 100

        return {
            "ticker": ticker,
            "price": price,
            "change": change,
            "change_percent": change_percent,
            "currency": stock.fast_info.get('currency', 'USD')
        }
    except Exception as e:
        logger.error(f"Error fetching quote for {ticker}: {e}")
        return None
