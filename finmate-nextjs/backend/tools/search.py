from duckduckgo_search import DDGS
import logging
from typing import List, Dict

logger = logging.getLogger(__name__)

def perform_web_search(query: str, max_results: int = 3) -> str:
    """
    Executes a web search using DuckDuckGo and returns formatted results.
    """
    logger.info(f"Executing web search for: {query}")
    try:
        results = DDGS().text(query, max_results=max_results)
        
        if not results:
            return "No results found."
            
        formatted_results = []
        for r in results:
            title = r.get('title', 'No Title')
            link = r.get('href', 'No Link')
            snippet = r.get('body', 'No Content')
            formatted_results.append(f"Title: {title}\nLink: {link}\nSnippet: {snippet}\n")
            
        return "\n---\n".join(formatted_results)
        
    except Exception as e:
        logger.error(f"Web search failed: {e}")
        return f"Error executing search: {str(e)}"
