from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
import uuid

from app.utils.database import get_db
from app.rag_system.rag_system import chatbot as rag_chatbot
from . import schemas
from . import guest_crud

router = APIRouter(
    prefix="/chat/guest",
    tags=["guest"],
)

@router.post("/message")
async def send_guest_message(
    message: schemas.AnonymousMessageCreate,
    db: Session = Depends(get_db)
):
    """Send a message and get bot response for guest users (logs to PostgreSQL)"""
    try:
        # Get bot response using RAG system
        bot_response = rag_chatbot(message.content)
        
        # Return bot response without creating conversation
        # Frontend will handle conversation creation separately
        return {
            "message": bot_response['message']
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing message: {str(e)}")

@router.post("/conversations", response_model=schemas.GuestConversation)
async def create_guest_conversation(
    conversation: schemas.GuestConversationCreate,
    db: Session = Depends(get_db)
):
    """Create a new guest conversation (logs to PostgreSQL)"""
    try:
        db_conversation = guest_crud.create_guest_conversation(db, conversation.title)
        return db_conversation
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating conversation: {str(e)}")

@router.get("/conversations/{conversation_id}", response_model=schemas.GuestConversation)
async def get_guest_conversation(
    conversation_id: str,
    db: Session = Depends(get_db)
):
    """Get a guest conversation by ID from PostgreSQL"""
    conversation = guest_crud.get_guest_conversation(db, conversation_id)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return conversation

@router.get("/conversations", response_model=List[schemas.GuestConversation])
async def get_all_guest_conversations(db: Session = Depends(get_db)):
    """Get all guest conversations from PostgreSQL"""
    try:
        conversations = guest_crud.get_all_guest_conversations(db)
        return conversations
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching conversations: {str(e)}")

@router.post("/conversations/{conversation_id}/messages")
async def add_message_to_guest_conversation(
    conversation_id: str, 
    message: schemas.AnonymousMessageCreate,
    db: Session = Depends(get_db)
):
    """Add a message to a guest conversation and get bot response (logs to PostgreSQL)"""
    # Check if conversation exists
    conversation = guest_crud.get_guest_conversation(db, conversation_id)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    try:
        # Log user message to database
        guest_crud.add_guest_message(
            db, 
            conversation_id, 
            "user", 
            message.content
        )
        
        # Get bot response
        bot_response = rag_chatbot(message.content)
        
        # Log bot response to database
        guest_crud.add_guest_message(
            db, 
            conversation_id, 
            "bot", 
            bot_response['message']
        )
        
        return {"message": bot_response['message']}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing message: {str(e)}")

@router.get("/conversations/{conversation_id}/messages", response_model=List[schemas.GuestMessage])
async def get_guest_messages(
    conversation_id: str,
    db: Session = Depends(get_db)
):
    """Get all messages for a guest conversation from PostgreSQL"""
    conversation = guest_crud.get_guest_conversation(db, conversation_id)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    try:
        messages = guest_crud.get_guest_messages(db, conversation_id)
        return messages
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching messages: {str(e)}")

@router.put("/conversations/{conversation_id}", response_model=schemas.GuestConversation)
async def update_guest_conversation_title(
    conversation_id: str,
    conversation_update: schemas.GuestConversationUpdate,
    db: Session = Depends(get_db)
):
    """Update the title of a guest conversation"""
    success = guest_crud.update_guest_conversation_title(
        db, 
        conversation_id, 
        conversation_update.title
    )
    if not success:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    return guest_crud.get_guest_conversation(db, conversation_id)

@router.delete("/conversations/{conversation_id}")
async def soft_delete_guest_conversation(
    conversation_id: str,
    db: Session = Depends(get_db)
):
    """Soft delete a guest conversation (marks as deleted but keeps in database)"""
    success = guest_crud.soft_delete_guest_conversation(db, conversation_id)
    if not success:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    return {"message": "Conversation marked as deleted (data preserved in database)"}

@router.get("/stats", response_model=schemas.GuestConversationStats)
async def get_guest_conversation_stats(db: Session = Depends(get_db)):
    """Get statistics about guest conversations"""
    try:
        stats = guest_crud.get_guest_conversation_stats(db)
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching stats: {str(e)}")

# Admin endpoints for managing guest conversations (read-only for admin)
@router.get("/admin/conversations/all", response_model=List[schemas.GuestConversation])
async def admin_get_all_guest_conversations_including_deleted(db: Session = Depends(get_db)):
    """Admin endpoint: Get all guest conversations including deleted ones"""
    try:
        # This would need admin authentication in production
        conversations = db.query(guest_crud.GuestConversation).order_by(
            guest_crud.GuestConversation.updated_at.desc()
        ).all()
        return conversations
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching conversations: {str(e)}")

@router.get("/admin/stats/detailed")
async def admin_get_detailed_guest_stats(db: Session = Depends(get_db)):
    """Admin endpoint: Get detailed statistics about guest conversations"""
    try:
        # This would need admin authentication in production
        total_conversations = db.query(guest_crud.GuestConversation).count()
        active_conversations = db.query(guest_crud.GuestConversation).filter(
            guest_crud.GuestConversation.is_deleted == False
        ).count()
        deleted_conversations = total_conversations - active_conversations
        
        total_messages = db.query(guest_crud.GuestMessage).count()
        
        return {
            "total_conversations": total_conversations,
            "active_conversations": active_conversations,
            "deleted_conversations": deleted_conversations,
            "total_messages": total_messages
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching detailed stats: {str(e)}") 