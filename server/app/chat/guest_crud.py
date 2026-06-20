from sqlalchemy.orm import Session
from sqlalchemy import and_
from datetime import datetime
from typing import List, Optional
import uuid

from app.database.models import GuestConversation, GuestMessage


def create_guest_conversation(db: Session, title: str = "Guest Conversation", machine_id: str = None) -> GuestConversation:
    """Create a new guest conversation with machine identifier"""
    conversation_id = str(uuid.uuid4())
    db_conversation = GuestConversation(
        id=conversation_id,
        machine_id=machine_id,
        title=title,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db.add(db_conversation)
    db.commit()
    db.refresh(db_conversation)
    return db_conversation


def get_guest_conversation(db: Session, conversation_id: str) -> Optional[GuestConversation]:
    """Get a guest conversation by ID"""
    from sqlalchemy.orm import joinedload
    
    return db.query(GuestConversation).filter(
        and_(
            GuestConversation.id == conversation_id,
            GuestConversation.is_deleted == False
        )
    ).options(joinedload(GuestConversation.messages)).first()


def get_guest_conversations(db: Session, machine_id: str = None) -> List[GuestConversation]:
    """Get all guest conversations for a specific machine"""
    from sqlalchemy.orm import joinedload
    
    query = db.query(GuestConversation).filter(GuestConversation.is_deleted == False)
    
    if machine_id:
        query = query.filter(GuestConversation.machine_id == machine_id)
    
    # Load messages relationship to avoid N+1 queries
    query = query.options(joinedload(GuestConversation.messages))
    
    return query.order_by(GuestConversation.updated_at.desc()).all()


def delete_guest_conversation(db: Session, conversation_id: str) -> bool:
    """Soft delete a guest conversation"""
    conversation = get_guest_conversation(db, conversation_id)
    if conversation:
        conversation.is_deleted = True
        db.commit()
        return True
    return False


def add_guest_message(
    db: Session, 
    conversation_id: str, 
    sender: str, 
    content: str
) -> Optional[GuestMessage]:
    """Add a message to a guest conversation"""
    # Check if conversation exists and is not deleted
    conversation = get_guest_conversation(db, conversation_id)
    if not conversation:
        return None
    
    message_id = str(uuid.uuid4())
    db_message = GuestMessage(
        id=message_id,
        conversation_id=conversation_id,
        sender=sender,
        content=content,
        timestamp=datetime.utcnow()
    )
    
    # Update conversation's updated_at timestamp
    conversation.updated_at = datetime.utcnow()
    
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    return db_message


def get_guest_messages(db: Session, conversation_id: str) -> List[GuestMessage]:
    """Get all messages for a guest conversation"""
    conversation = get_guest_conversation(db, conversation_id)
    if not conversation:
        return []
    
    return db.query(GuestMessage).filter(
        GuestMessage.conversation_id == conversation_id
    ).order_by(GuestMessage.timestamp.asc()).all()


def get_guest_conversation_stats(db: Session, machine_id: str = None) -> dict:
    """Get statistics for guest conversations"""
    query = db.query(GuestConversation).filter(GuestConversation.is_deleted == False)
    
    if machine_id:
        query = query.filter(GuestConversation.machine_id == machine_id)
    
    total_conversations = query.count()
    
    # Get total messages
    message_query = db.query(GuestMessage).join(GuestConversation).filter(
        GuestConversation.is_deleted == False
    )
    
    if machine_id:
        message_query = message_query.filter(GuestConversation.machine_id == machine_id)
    
    total_messages = message_query.count()
    
    return {
        "total_conversations": total_conversations,
        "total_messages": total_messages,
        "machine_id": machine_id
    } 