from typing import List, Dict, Optional
import uuid
import logging
from db.client import supabase
from datetime import datetime

logger = logging.getLogger(__name__)

class ChatService:
    def get_conversations(self, user_id: str) -> List[Dict]:
        """Fetch all conversations for a user ordered by last updated"""
        if not supabase:
            return []
        try:
            res = supabase.table("conversations").select("*").eq("user_id", user_id).order("updated_at", desc=True).execute()
            return res.data
        except Exception as e:
            logger.error(f"Error fetching conversations: {e}")
            return []

    def get_messages(self, conversation_id: str) -> List[Dict]:
        """Fetch messages for a specific conversation"""
        if not supabase:
            return []
        try:
            # RLS or simple ID match
            res = supabase.table("messages").select("*").eq("conversation_id", conversation_id).order("created_at", desc=False).execute()
            return res.data
        except Exception as e:
            logger.error(f"Error fetching messages: {e}")
            return []

    def create_conversation(self, user_id: str, title: str = "New Chat") -> Optional[str]:
        """Create a new conversation and return its ID"""
        if not supabase:
            return str(uuid.uuid4()) # Fallback for ephemeral
        try:
            data = {"title": title, "user_id": user_id}
            res = supabase.table("conversations").insert(data).execute()
            if res.data:
                return res.data[0]['id']
            return None
        except Exception as e:
            logger.error(f"Error creating conversation: {e}")
            return None

    def add_message(self, conversation_id: str, role: str, content: str):
        """Save a message to the conversation"""
        if not supabase or not conversation_id:
            return
        try:
            data = {
                "conversation_id": conversation_id,
                "role": role,
                "content": content
            }
            supabase.table("messages").insert(data).execute()
            
            # Update conversation timestamp
            supabase.table("conversations").update({"updated_at": datetime.utcnow().isoformat()}).eq("id", conversation_id).execute()
        except Exception as e:
            logger.error(f"Error adding message: {e}")

    def update_title(self, conversation_id: str, new_title: str):
        if not supabase: return
        try:
            supabase.table("conversations").update({"title": new_title}).eq("id", conversation_id).execute()
        except: pass

chat_service = ChatService()
