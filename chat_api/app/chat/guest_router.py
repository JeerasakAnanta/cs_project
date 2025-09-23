from fastapi import APIRouter, HTTPException, Depends, Header
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import uuid
import logging

from app.utils.database import get_db
from app.rag_system.rag_system import chatbot as rag_chatbot
from . import schemas
from . import guest_crud
from app.database.models import AdminConversation

# Set up logging
logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/chat/guest",
    tags=["guest"],
)

def generate_machine_id() -> str:
    """Generate a unique machine identifier"""
    return str(uuid.uuid4())

async def sync_guest_to_admin_conversation(
    conversation_id: str,
    question: str,
    bot_response: str,
    machine_id: str,
    response_time_ms: int,
    db: Session
):
    """
    Auto-sync guest conversation data to AdminConversation table
    """
    try:
        # ตรวจสอบว่ามีข้อมูลใน AdminConversation หรือไม่
        existing = db.query(AdminConversation).filter(
            AdminConversation.conversation_id == conversation_id
        ).first()
        
        if not existing:
            # สร้างใหม่
            admin_conv = AdminConversation(
                conversation_id=conversation_id,
                user_id=None,
                username=f"guest_{machine_id}",
                question=question,
                bot_response=bot_response,
                satisfaction_rating=None,
                response_time_ms=response_time_ms,
                conversation_type="guest",
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            db.add(admin_conv)
            db.commit()
            print(f"New guest conversation synced to AdminConversation: {conversation_id}")
        else:
            # อัปเดตข้อมูลที่มีอยู่
            existing.question = question
            existing.bot_response = bot_response
            existing.response_time_ms = response_time_ms
            existing.updated_at = datetime.utcnow()
            db.commit()
            print(f"Existing guest conversation updated in AdminConversation: {conversation_id}")
            
    except Exception as e:
        print(f"Error syncing guest to AdminConversation: {str(e)}")
        # ไม่ต้อง raise error เพื่อไม่ให้กระทบการทำงานหลัก

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
        
        # Convert document references to schema format
        source_documents = []
        if 'source_documents' in bot_response and bot_response['source_documents']:
            for doc_ref in bot_response['source_documents']:
                source_documents.append(schemas.DocumentReference(
                    filename=doc_ref['filename'],
                    page=doc_ref['page'],
                    confidence_score=doc_ref['confidence_score'],
                    content_preview=doc_ref['content_preview'],
                    full_content=doc_ref['full_content']
                ))
        
        # Return bot response without creating conversation
        # Frontend will handle conversation creation separately
        return {
            "message": bot_response['message'],
            "machine_id": machine_id,
            "source_documents": source_documents
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
        logger.info(f"Creating guest conversation: title={conversation.title}, machine_id={x_machine_id}")
        
        # Use provided machine_id or generate new one
        machine_id = x_machine_id or conversation.machine_id or generate_machine_id()
        
        db_conversation = guest_crud.create_guest_conversation(
            db, 
            title=conversation.title,
            machine_id=machine_id
        )
        
        logger.info(f"Successfully created conversation: {db_conversation.id}")
        
        # Use conversation_to_response instead of from_orm to ensure proper formatting
        return conversation_to_response(db_conversation)
    except Exception as e:
        logger.error(f"Error creating conversation: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error creating conversation: {str(e)}")


def conversation_to_response(conv):
    return {
        "id": conv.id,
        "machine_id": getattr(conv, "machine_id", None),
        "title": conv.title,
        "created_at": conv.created_at,
        "updated_at": conv.updated_at,
        "messages": [
            {
                "id": m.id,
                "content": m.content,
                "sender": m.sender if m.sender else "unknown",
                "timestamp": m.timestamp,
            }
            for m in getattr(conv, "messages", [])
        ],
    }

@router.get("/conversations", response_model=List[schemas.GuestConversationResponse])
async def get_guest_conversations(
    db: Session = Depends(get_db),
    x_machine_id: Optional[str] = Header(None)
):
    try:
        logger.info(f"Fetching guest conversations for machine_id: {x_machine_id}")
        
        conversations = guest_crud.get_guest_conversations(db, machine_id=x_machine_id)
        
        logger.info(f"Found {len(conversations)} conversations")
        
        # Load messages for each conversation to ensure they're available
        for conv in conversations:
            if not hasattr(conv, 'messages') or conv.messages is None:
                conv.messages = guest_crud.get_guest_messages(db, conv.id)
        
        result = [conversation_to_response(conv) for conv in conversations]
        logger.info(f"Successfully processed {len(result)} conversations")
        
        return result
    except Exception as e:
        logger.error(f"Error fetching conversations: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error fetching conversations: {str(e)}")

@router.get("/conversations/{conversation_id}", response_model=schemas.GuestConversationResponse)
async def get_guest_conversation(
    conversation_id: str,
    db: Session = Depends(get_db),
    x_machine_id: Optional[str] = Header(None)
):
    try:
        conversation = guest_crud.get_guest_conversation(db, conversation_id)
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")
        if x_machine_id and conversation.machine_id != x_machine_id:
            raise HTTPException(status_code=403, detail="Access denied to this conversation")
        
        # Load messages if not already loaded
        if not hasattr(conversation, 'messages') or conversation.messages is None:
            conversation.messages = guest_crud.get_guest_messages(db, conversation_id)
            
        return conversation_to_response(conversation)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching conversation: {str(e)}")


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
        
        # Convert document references to schema format
        source_documents = []
        if 'source_documents' in bot_response and bot_response['source_documents']:
            for doc_ref in bot_response['source_documents']:
                source_documents.append(schemas.DocumentReference(
                    filename=doc_ref['filename'],
                    page=doc_ref['page'],
                    confidence_score=doc_ref['confidence_score'],
                    content_preview=doc_ref['content_preview'],
                    full_content=doc_ref['full_content']
                ))
        
        # Log bot response to database
        guest_crud.add_guest_message(
            db, 
            conversation_id, 
            "bot", 
            bot_response['message']
        )
        
        # คำนวณเวลาตอบสนอง (ประมาณการ)
        response_time_ms = 1000  # Default 1 second
        
        # Auto-sync ไปยัง AdminConversation
        await sync_guest_to_admin_conversation(
            conversation_id=conversation_id,
            question=message.content,
            bot_response=bot_response['message'],
            machine_id=conversation.machine_id,
            response_time_ms=response_time_ms,
            db=db
        )
        
        return {
            "message": bot_response['message'],
            "source_documents": source_documents
        }
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