from sqlalchemy.orm import Session
from sqlalchemy import and_
from datetime import datetime
from typing import List, Optional
import uuid

from app.database.models import GuestConversation, GuestMessage


def create_guest_conversation(db: Session, title: str = "Guest Conversation") -> GuestConversation:
    """Create a new guest conversation"""
    conversation_id = str(uuid.uuid4())
    db_conversation = GuestConversation(
        id=conversation_id,
        title=title,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db.add(db_conversation)
    db.commit()
    db.refresh(db_conversation)
    return db_conversation


def get_guest_conversation(db: Session, conversation_id: str) -> Optional[GuestConversation]:
    """Get a guest conversation by ID (only non-deleted conversations)"""
    return db.query(GuestConversation).filter(
        and_(
            GuestConversation.id == conversation_id,
            GuestConversation.is_deleted == False
        )
    ).first()


def get_all_guest_conversations(db: Session) -> List[GuestConversation]:
    """Get all non-deleted guest conversations ordered by updated_at desc"""
    return db.query(GuestConversation).filter(
        GuestConversation.is_deleted == False
    ).order_by(GuestConversation.updated_at.desc()).all()


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


def soft_delete_guest_conversation(db: Session, conversation_id: str) -> bool:
    """Soft delete a guest conversation (mark as deleted but keep in database)"""
    conversation = get_guest_conversation(db, conversation_id)
    if not conversation:
        return False
    
    conversation.is_deleted = True
    conversation.updated_at = datetime.utcnow()
    db.commit()
    return True


def update_guest_conversation_title(db: Session, conversation_id: str, title: str) -> bool:
    """Update the title of a guest conversation"""
    conversation = get_guest_conversation(db, conversation_id)
    if not conversation:
        return False
    
    conversation.title = title
    conversation.updated_at = datetime.utcnow()
    db.commit()
    return True


def get_guest_conversation_stats(db: Session) -> dict:
    """Get statistics about guest conversations"""
    total_conversations = db.query(GuestConversation).filter(
        GuestConversation.is_deleted == False
    ).count()
    
    total_messages = db.query(GuestMessage).join(
        GuestConversation
    ).filter(
        GuestConversation.is_deleted == False
    ).count()
    
    return {
        "total_conversations": total_conversations,
        "total_messages": total_messages
    } 