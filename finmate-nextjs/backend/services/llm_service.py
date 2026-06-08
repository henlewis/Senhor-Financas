import os
import json
import logging
from typing import List, Dict, Any
from langfuse.openai import OpenAI
from duckduckgo_search import DDGS

logger = logging.getLogger(__name__)

# Configure OpenAI
client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

MODEL_NAME = "gpt-4o" 

def search_web(query: str, max_results: int = 3) -> str:
    """Perform a web search to verify news or get context"""
    try:
        logger.info(f"Searching web for: {query}")
        # Use simple text search which is often more robust for verification queries
        with DDGS() as ddgs:
            # Try/except specific to DDG library quirk
            try:
                results = list(ddgs.news(query, max_results=max_results))
            except Exception as inner_e:
                logger.warning(f"DDGS News search error: {inner_e}. Retrying with text search.")
                results = list(ddgs.text(query, max_results=max_results))

        if not results:
            return "No search results found to verify this news."
            
        formatted_results = "Search Results for Verification:\n"
        for i, r in enumerate(results, 1):
            # Handle different key names between news/text results
            link = r.get('url') or r.get('href', 'No link')
            snippet = r.get('body') or r.get('snippet', '')
            formatted_results += f"{i}. {r.get('title')} ({link})\n   {snippet}\n"
        return formatted_results
    except Exception as e:
        logger.warning(f"Web search failed: {e}")
        return "Web search verification unavailable due to technical error."

def analyze_news(news_item: Dict, portfolio: List[str]) -> Dict[str, Any]:
    """
    Analyzes a news item against the user's portfolio using OpenAI.
    Performs a real-time web search to cross-reference and verify the news.
    """
    logger.info(f"Analyzing news: {news_item.get('title')}")

    # 1. Cross-Reference / Verify with Web Search
    # Search for the specific title to find other sources
    search_context = search_web(news_item.get('title', ''), max_results=3)

    prompt = f"""
    You are a financial analyst. Analyze the following news article and determine its impact on the user's portfolio.
    
    Portfolio Tickers: {', '.join(portfolio)}
    
    Target News Item:
    Title: {news_item.get('title')}
    Summary: {news_item.get('summary')}
    Source: {news_item.get('source')}
    Link: {news_item.get('link')}
    
    {search_context}
    
    CRITICAL INSTRUCTION:
    - Use the 'Search Results' to verify the news and find 'related_sources'.
    - If the search results show this is old news, note that (though we try to fetch fresh).
    - Infer impact on portfolio tickers even if not explicitly named.
    
    Return a JSON object with the following schema:
    {{
        "headline": "Short, punchy headline",
        "summary": "Concise summary of the event (incorporating verification details if useful)",
        "sentiment_score": 0-10 (integer, 0=catastrophic, 5=neutral, 10=euphoric),
        "category": "Markets | Macro | Equities | Energy | Tech",
        "affected_tickers": ["TICKER1", "TICKER2"],
        "impact": "positive | neutral | negative",
        "impact_reason": "Explanation of why it impacts the portfolio or specific tickers",
        "risk_level": "low | medium | high",
        "related_sources": ["url1", "url2"] (URLs found in search results that corroborate the story)
    }}
    """

    try:
        response = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[
                {"role": "system", "content": "You are a helpful financial analyst. Responds in valid JSON."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.2
        )
        content = response.choices[0].message.content
        return json.loads(content)
        
    except Exception as e:
        logger.error(f"LLM Analysis failed: {e}")
        # Fallback
        found_tickers = []
        text_content = (news_item.get('title', '') + " " + news_item.get('summary', '')).upper()
        for ticker in portfolio:
            if ticker.upper() in text_content: found_tickers.append(ticker)
        
        return {
            "headline": news_item.get('title'),
            "summary": f"AI Analysis Unavailable. Content: {news_item.get('summary')[:100]}...",
            "sentiment_score": 5, "category": "General", "affected_tickers": found_tickers,
            "impact": "neutral", "impact_reason": "AI analysis failed.", "risk_level": "low", 
            "related_sources": []
        }

from services.quote_service import get_quote_data
from services.analysis_service import get_fundamentals, get_technical_indicators

# ... existing imports ...

TOOLS_SCHEMA = [
    {
        "type": "function",
        "function": {
            "name": "search_web",
            "description": "Search the internet for current news, events, or verify facts. Use this for questions about 'latest', 'recent', 'today', or specific news verification.",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "The search query (e.g. 'Tesla earnings report Q3 2024')"
                    }
                },
                "required": ["query"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_stock_price",
            "description": "Get the current live stock price for a ticker symbol.",
            "parameters": {
                "type": "object",
                "properties": {
                    "ticker": {
                        "type": "string",
                        "description": "The stock ticker symbol (e.g. AAPL, TSLA)"
                    }
                },
                "required": ["ticker"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_fundamentals",
            "description": "Get fundamental data (P/E ratio, Market Cap, Dividend Yield, High/Low) for a company.",
            "parameters": {
                "type": "object",
                "properties": {
                    "ticker": {
                        "type": "string",
                        "description": "The stock ticker symbol (e.g. MSFT)"
                    }
                },
                "required": ["ticker"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_technical_indicators",
            "description": "Get technical indicators (RSI, 50-day SMA, Overbought/Oversold signal) for a stock.",
            "parameters": {
                "type": "object",
                "properties": {
                    "ticker": {
                        "type": "string",
                        "description": "The stock ticker symbol (e.g. BTC-USD)"
                    }
                },
                "required": ["ticker"]
            }
        }
    }
]

def get_stock_price_tool(ticker: str) -> str:
    """Tool wrapper for stock price"""
    data = get_quote_data(ticker)
    if data:
        return json.dumps(data)
    return f"Could not find price for {ticker}"

def get_fundamentals_tool(ticker: str) -> str:
    """Tool wrapper for fundamentals"""
    data = get_fundamentals(ticker)
    if data:
        return json.dumps(data)
    return f"Could not find fundamentals for {ticker}"

def get_technicals_tool(ticker: str) -> str:
    """Tool wrapper for technicals"""
    data = get_technical_indicators(ticker)
    if data:
        return json.dumps(data)
    return f"Could not calculate technicals for {ticker}"

def chat_with_data(query: str, context: str, history: List[Dict] = []) -> str:
    """
    Agentic Chat Loop with Tool execution.
    """
    
    # System Prompt
    system_prompt = f"""You are Senhor Finanças, an expert financial AI assistant.
    
    Context Information:
    {context}
    
    Instructions:
    1. You have access to tools: 
       - 'search_web' (news/events)
       - 'get_stock_price' (live price)
       - 'get_fundamentals' (valuation, market cap)
       - 'get_technical_indicators' (RSI, trends)
    2. USE TOOLS FREQUENTLY. 
       - If asked "Is Tesla overvalued?", call 'get_fundamentals'.
       - If asked "Should I buy Bitcoin now?", call 'get_technical_indicators' to check RSI.
    3. Do not rely on your internal training data for recent events or prices.
    4. Provide data-driven answers citing the specific metrics (e.g., "RSI is 72, which suggests...").
    5. Be concise and professional.
    """
    
    messages = [{"role": "system", "content": system_prompt}]
    
    # Add history (simple format for now, limited to last few)
    # history comes in as [{"role": "user", "content": ...}]
    messages.extend(history[-6:]) 
    
    messages.append({"role": "user", "content": query})
    
    # Tool execution loop (limit 3 turns)
    for _ in range(3):
        try:
            response = client.chat.completions.create(
                model=MODEL_NAME,
                messages=messages,
                tools=TOOLS_SCHEMA,
                tool_choice="auto",
                temperature=0.3
            )
            
            message = response.choices[0].message
            messages.append(message) # Add assistant response to history
            
            # Check for tool calls
            if message.tool_calls:
                for tool_call in message.tool_calls:
                    fn_name = tool_call.function.name
                    args = json.loads(tool_call.function.arguments)
                    
                    logger.info(f"Agent calling tool: {fn_name} with {args}")
                    
                    result_content = ""
                    if fn_name == "search_web":
                        result_content = search_web(args["query"])
                    elif fn_name == "get_stock_price":
                        result_content = get_stock_price_tool(args["ticker"])
                    elif fn_name == "get_fundamentals":
                        result_content = get_fundamentals_tool(args["ticker"])
                    elif fn_name == "get_technical_indicators":
                        result_content = get_technicals_tool(args["ticker"])
                    else:
                        result_content = "Unknown tool"
                        
                    # Feed tool result back
                    messages.append({
                        "role": "tool",
                        "tool_call_id": tool_call.id,
                        "content": result_content
                    })
                # Loop continues to let LLM process the tool result
            else:
                # No tool calls, we have the final answer
                return message.content
                
        except Exception as e:
            logger.error(f"Agent Loop Error: {e}")
            return f"I encountered a technical issue: {str(e)}"
            
    return messages[-1].content or "I'm thinking..."
