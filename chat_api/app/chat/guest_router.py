from fastapi import APIRouter, HTTPException, Depends, Header
from sqlalchemy.orm import Session
from typing import List, Optional
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

def generate_machine_id() -> str:
    """Generate a unique machine identifier"""
    return str(uuid.uuid4())

@router.post("/message")
async def send_guest_message(
    message: schemas.GuestMessageCreate,
    db: Session = Depends(get_db),
    x_machine_id: Optional[str] = Header(None)
):
    """Send a message and get bot response for guest users (logs to PostgreSQL)"""
    try:
        # Use provided machine_id or generate new one
        machine_id = x_machine_id or message.machine_id or generate_machine_id()
        
        # Get bot response using RAG system
        bot_response = rag_chatbot(message.content)
        
        # Return bot response without creating conversation
        # Frontend will handle conversation creation separately
        return {
            "message": bot_response['message'],
            "machine_id": machine_id
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing message: {str(e)}")


@router.post("/conversations")
async def create_guest_conversation(
    conversation: schemas.GuestConversationCreate,
    db: Session = Depends(get_db),
    x_machine_id: Optional[str] = Header(None)
):
    """Create a new guest conversation with machine identifier"""
    try:
        # Use provided machine_id or generate new one
        machine_id = x_machine_id or conversation.machine_id or generate_machine_id()
        
        db_conversation = guest_crud.create_guest_conversation(
            db, 
            title=conversation.title,
            machine_id=machine_id
        )
        
        return schemas.GuestConversationResponse.from_orm(db_conversation)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating conversation: {str(e)}")


def conversation_to_response(conv):
    # ดึงเฉพาะ field ที่ schema ต้องการ
    conv_dict = {
        "id": conv.id,
        "machine_id": getattr(conv, "machine_id", None),
        "title": conv.title,
        "created_at": conv.created_at,
        "updated_at": conv.updated_at,
        "messages": [
            {
                "id": m.id,
                "content": m.content,
                "sender": m.sender if m.sender is not None else "unknown",
                "timestamp": m.timestamp,
            }
            for m in conv.messages
        ],
    }
    return conv_dict

@router.get("/conversations", response_model=List[schemas.GuestConversationResponse])
async def get_guest_conversations(
    db: Session = Depends(get_db),
    x_machine_id: Optional[str] = Header(None)
):
    try:
        conversations = guest_crud.get_guest_conversations(db, machine_id=x_machine_id)
        return [conversation_to_response(conv) for conv in conversations]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching conversations: {str(e)}")

@router.get("/conversations/{conversation_id}", response_model=schemas.GuestConversationResponse)
async def get_guest_conversation(
    conversation_id: str,
    db: Session = Depends(get_db),
    x_machine_id: Optional[str] = Header(None)
):
    conversation = guest_crud.get_guest_conversation(db, conversation_id)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    if x_machine_id and conversation.machine_id != x_machine_id:
        raise HTTPException(status_code=403, detail="Access denied to this conversation")
    return conversation_to_response(conversation)


@router.post("/conversations/{conversation_id}/messages")
async def add_message_to_guest_conversation(
    conversation_id: str, 
    message: schemas.GuestMessageCreate,
    db: Session = Depends(get_db),
    x_machine_id: Optional[str] = Header(None)
):
    """Add a message to a guest conversation and get bot response (logs to PostgreSQL)"""
    # Check if conversation exists
    conversation = guest_crud.get_guest_conversation(db, conversation_id)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    # Optional: Check if conversation belongs to the machine (for security)
    if x_machine_id and conversation.machine_id != x_machine_id:
        raise HTTPException(status_code=403, detail="Access denied to this conversation")
    
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


@router.delete("/conversations/{conversation_id}")
async def delete_guest_conversation(
    conversation_id: str,
    db: Session = Depends(get_db),
    x_machine_id: Optional[str] = Header(None)
):
    """Soft delete a guest conversation"""
    conversation = guest_crud.get_guest_conversation(db, conversation_id)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    # Optional: Check if conversation belongs to the machine (for security)
    if x_machine_id and conversation.machine_id != x_machine_id:
        raise HTTPException(status_code=403, detail="Access denied to this conversation")
    
    try:
        success = guest_crud.delete_guest_conversation(db, conversation_id)
        if success:
            return {"message": "Conversation deleted successfully"}
        else:
            raise HTTPException(status_code=500, detail="Failed to delete conversation")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting conversation: {str(e)}")


@router.get("/stats")
async def get_guest_stats(
    db: Session = Depends(get_db),
    x_machine_id: Optional[str] = Header(None)
):
    """Get statistics for guest conversations of a specific machine"""
    try:
        stats = guest_crud.get_guest_conversation_stats(db, machine_id=x_machine_id)
        return schemas.GuestStatsResponse(**stats)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching stats: {str(e)}")


@router.post("/machine-id")
async def generate_new_machine_id():
    """Generate a new machine identifier for the client"""
    return {"machine_id": generate_machine_id()} 