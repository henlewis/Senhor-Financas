from fastapi import APIRouter, HTTPException, Depends
from models import Portfolio, AddTickerRequest
from services import portfolio_service
from dependencies import get_current_user

router = APIRouter(prefix="/api/portfolio", tags=["portfolio"])

@router.get("", response_model=Portfolio)
async def get_portfolio(user_id: str = Depends(get_current_user)):
    """Get all tickers and profiles in the portfolio"""
    tickers = portfolio_service.load_portfolio(user_id)
    profiles = portfolio_service.load_profiles(tickers) # Optimization: Only load profiles for tickers we have
    return Portfolio(tickers=tickers, profiles=profiles)

@router.post("", response_model=Portfolio)
async def add_ticker(request: AddTickerRequest, user_id: str = Depends(get_current_user)):
    """Add a ticker to the portfolio"""
    try:
        tickers, new_profile = portfolio_service.add_ticker(request.ticker, user_id)
        
        # Load filtered profiles
        profiles = portfolio_service.load_profiles(tickers)
        
        return Portfolio(tickers=tickers, profiles=profiles)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{ticker}", response_model=Portfolio)
async def remove_ticker(ticker: str, user_id: str = Depends(get_current_user)):
    """Remove a ticker from the portfolio"""
    try:
        portfolio_service.remove_ticker(ticker, user_id)
        # Reload full state
        tickers = portfolio_service.load_portfolio(user_id)
        profiles = portfolio_service.load_profiles(tickers)
        return Portfolio(tickers=tickers, profiles=profiles)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
