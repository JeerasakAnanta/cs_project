from fastapi import APIRouter, HTTPException
from typing import List
from datetime import datetime
import uuid

from app.rag_system.rag_system import chatbot as rag_chatbot
from . import schemas

router = APIRouter(
    prefix="/chat/anonymous",
    tags=["anonymous"],
)

# In-memory storage for anonymous conversations (in production, you might want to use Redis or similar)
anonymous_conversations = {}

@router.post("/message")
async def send_anonymous_message(message: schemas.AnonymousMessageCreate):
    """Send a message and get bot response without authentication"""
    try:
        # Get bot response using RAG system
        bot_response = rag_chatbot(message.content)
        return {"message": bot_response['message']}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing message: {str(e)}")

@router.post("/conversations", response_model=schemas.AnonymousConversation)
async def create_anonymous_conversation(conversation: schemas.AnonymousConversationCreate):
    """Create a new anonymous conversation"""
    conversation_id = str(uuid.uuid4())
    new_conversation = {
        "id": conversation_id,
        "title": conversation.title,
        "messages": [],
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat()
    }
    anonymous_conversations[conversation_id] = new_conversation
    return new_conversation

@router.get("/conversations/{conversation_id}", response_model=schemas.AnonymousConversation)
async def get_anonymous_conversation(conversation_id: str):
    """Get an anonymous conversation by ID"""
    if conversation_id not in anonymous_conversations:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return anonymous_conversations[conversation_id]

@router.post("/conversations/{conversation_id}/messages")
async def add_message_to_anonymous_conversation(
    conversation_id: str, 
    message: schemas.AnonymousMessageCreate
):
    """Add a message to an anonymous conversation and get bot response"""
    if conversation_id not in anonymous_conversations:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    conversation = anonymous_conversations[conversation_id]
    
    # Add user message
    user_message = {
        "id": str(uuid.uuid4()),
        "content": message.content,
        "sender": "user",
        "timestamp": datetime.utcnow().isoformat()
    }
    conversation["messages"].append(user_message)
    
    # Get bot response
    try:
        bot_response = rag_chatbot(message.content)
        bot_message = {
            "id": str(uuid.uuid4()),
            "content": bot_response['message'],
            "sender": "bot",
            "timestamp": datetime.utcnow().isoformat()
        }
        conversation["messages"].append(bot_message)
        conversation["updated_at"] = datetime.utcnow().isoformat()
        
        return {"message": bot_response['message']}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing message: {str(e)}")

@router.delete("/conversations/{conversation_id}")
async def delete_anonymous_conversation(conversation_id: str):
    """Delete an anonymous conversation"""
    if conversation_id not in anonymous_conversations:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    del anonymous_conversations[conversation_id]
    return {"message": "Conversation deleted successfully"} 