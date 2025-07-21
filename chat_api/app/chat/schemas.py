from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

class MessageBase(BaseModel):
    sender: str
    content: str

class MessageCreate(MessageBase):
    pass

class Message(MessageBase):
    id: int
    conversation_id: int

    class Config:
        from_attributes = True

class ConversationBase(BaseModel):
    title: Optional[str] = "New Conversation"

class ConversationCreate(ConversationBase):
    pass

class ConversationUpdate(BaseModel):
    title: str

class Conversation(ConversationBase):
    id: int
    user_id: int
    created_at: datetime
    messages: List[Message] = []

    class Config:
        from_attributes = True

# Anonymous schemas
class AnonymousMessageCreate(BaseModel):
    content: str

class AnonymousConversationCreate(BaseModel):
    title: str

class AnonymousConversation(BaseModel):
    id: str
    title: str
    messages: List[dict] = []
    created_at: str
    updated_at: str

# Guest conversation schemas for PostgreSQL logging
class GuestMessageBase(BaseModel):
    sender: str
    content: str

class GuestMessageCreate(GuestMessageBase):
    pass

class GuestMessage(GuestMessageBase):
    id: str
    conversation_id: str
    timestamp: datetime

    class Config:
        from_attributes = True

class GuestConversationBase(BaseModel):
    title: str = "Guest Conversation"

class GuestConversationCreate(GuestConversationBase):
    pass

class GuestConversationUpdate(BaseModel):
    title: str

class GuestConversation(GuestConversationBase):
    id: str
    created_at: datetime
    updated_at: datetime
    is_deleted: bool
    messages: List[GuestMessage] = []

    class Config:
        from_attributes = True

class GuestConversationStats(BaseModel):
    total_conversations: int
    total_messages: int 