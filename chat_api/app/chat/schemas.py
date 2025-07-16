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
    timestamp: datetime

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