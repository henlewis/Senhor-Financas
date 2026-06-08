from fastapi import APIRouter, HTTPException, UploadFile, File, Depends
from models import ChatRequest, ChatMessage
from services import llm_service, portfolio_service, chat_service
from dependencies import get_current_user
from PyPDF2 import PdfReader
from io import BytesIO
from typing import List
import uuid

router = APIRouter(prefix="/api/chat", tags=["chat"])

@router.get("/history", response_model=List[dict])
async def get_history(user_id: str = Depends(get_current_user)):
    """Get all conversation history"""
    return chat_service.chat_service.get_conversations(user_id)

@router.get("/{conversation_id}/messages", response_model=List[ChatMessage])
async def get_messages(conversation_id: str, user_id: str = Depends(get_current_user)):
    """Get messages for a conversation"""
    messages = chat_service.chat_service.get_messages(conversation_id)
    return messages

@router.post("", response_model=ChatMessage)
async def chat(request: ChatRequest, user_id: str = Depends(get_current_user)):
    """Chat with the AI assistant"""
    try:
        # 1. Manage Conversation ID
        conversation_id = request.conversation_id
        if not conversation_id:
            # Generate title from query (first 30 chars for now)
            title = request.query[:30] + "..."
            conversation_id = chat_service.chat_service.create_conversation(user_id, title)
        
        # 2. Save User Message
        chat_service.chat_service.add_message(conversation_id, "user", request.query)

        # 3. Build Context
        context = ""
        # ... (Context building logic remains similar, maybe optimized to use DB history if needed)
        
        # Add portfolio context
        if request.portfolio:
            context += f"Portfolio: {', '.join(request.portfolio)}\n\n"
        else:
            portfolio = portfolio_service.load_portfolio(user_id)
            if portfolio:
                context += f"Portfolio: {', '.join(portfolio)}\n\n"
        
        # Add news context
        if request.news_context:
            context += "Latest News Analysis:\n"
            for news in request.news_context:
                context += f"- {news.headline} (Impact: {news.impact}, Reason: {news.impact_reason})\n"
            context += "\n"
        
        # Add document context
        if request.document_context:
            context += f"Uploaded Document Context:\n{request.document_context}\n\n"
            
        # 4. Get LLM Response
        response_text = llm_service.chat_with_data(request.query, context)
        
        # 5. Save Assistant Message
        chat_service.chat_service.add_message(conversation_id, "assistant", response_text)
        
        return ChatMessage(
            id=str(uuid.uuid4()), 
            conversation_id=conversation_id,
            role="assistant",
            content=response_text
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat failed: {str(e)}")

@router.post("/upload-document")
async def upload_document(file: UploadFile = File(...), user_id: str = Depends(get_current_user)):
    """Upload and extract text from a PDF document"""
    try:
        if not file.filename.endswith('.pdf'):
            raise HTTPException(status_code=400, detail="Only PDF files are supported")
        
        # Read PDF
        contents = await file.read()
        pdf_reader = PdfReader(BytesIO(contents))
        
        # Extract text
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text()
        
        # Limit context size
        limited_text = text[:10000]
        
        return {
            "filename": file.filename,
            "text": limited_text,
            "message": f"Successfully extracted {len(text)} characters from {file.filename}"
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process document: {str(e)}")
