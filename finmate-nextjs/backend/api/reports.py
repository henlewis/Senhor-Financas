from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import Response
from typing import List
from models import NewsItem
from services import reporting_service, portfolio_service
from dependencies import get_current_user

router = APIRouter(prefix="/api/reports", tags=["reports"])

@router.post("/generate")
async def generate_report(news_items: List[NewsItem], user_id: str = Depends(get_current_user)):
    """Generate a PDF briefing report"""
    try:
        portfolio = portfolio_service.load_portfolio(user_id)
        
        # Convert NewsItem models to dicts for reporting service
        # Use model_dump() for Pydantic v2 compatibility
        news_dicts = [
            item.model_dump() if hasattr(item, 'model_dump') else item.dict() 
            for item in news_items
        ]
        
        # Generate PDF
        pdf_bytes = reporting_service.generate_briefing(news_dicts, portfolio)
        
        # Return PDF as response with date-stamped filename
        from datetime import datetime
        date_str = datetime.now().strftime("%Y-%m-%d")
        filename = f"senhor_financas_briefing_{date_str}.pdf"

        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename={filename}"
            }
        )
    
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"ERROR GENERATING REPORT: {e}") 
        raise HTTPException(status_code=500, detail=f"Failed to generate report: {str(e)}")
