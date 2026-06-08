from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import logging

# Load environment variables
import os
from pathlib import Path

env_path = Path(__file__).parent / ".env"
success = load_dotenv(dotenv_path=env_path)

print(f"DEBUG: .env path: {env_path}")
print(f"DEBUG: .env loaded: {success}")
print(f"DEBUG: OPENAI_API_KEY present: {'OPENAI_API_KEY' in os.environ}")

from api import portfolio, news, chat, reports, quote

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

# Create FastAPI app
app = FastAPI(
    title="Senhor Finanças API",
    description="AI-Powered Portfolio News Intelligence API",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(portfolio.router)
app.include_router(news.router)
app.include_router(chat.router)
app.include_router(reports.router)
app.include_router(quote.router)

@app.get("/")
async def root():
    return {
        "message": "Senhor Finanças API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
