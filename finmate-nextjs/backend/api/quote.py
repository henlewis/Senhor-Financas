from fastapi import APIRouter, HTTPException
import yfinance as yf
import logging

from services.quote_service import get_quote_data

router = APIRouter(prefix="/api/quote", tags=["quote"])
logger = logging.getLogger(__name__)

@router.get("/{ticker}")
async def get_quote(ticker: str):
    """Get real-time quote for a ticker"""
    data = get_quote_data(ticker)
    if not data:
        raise HTTPException(status_code=404, detail="Price not found")
    return data
