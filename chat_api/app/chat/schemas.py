from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional


# Existing schemas for authenticated users
class MessageCreate(BaseModel):
    content: str
    sender: Optional[str] = None


class MessageResponse(BaseModel):
    id: int
    content: str
    sender: str

    class Config:
        from_attributes = True


# Alias for backward compatibility
Message = MessageResponse


class ConversationCreate(BaseModel):
    title: str


class ConversationResponse(BaseModel):
    id: int
    title: str
    created_at: datetime
    messages: List[MessageResponse] = []

    class Config:
        from_attributes = True


# Alias for backward compatibility
Conversation = ConversationResponse


class ConversationUpdate(BaseModel):
    title: str


# Schemas for anonymous users
class AnonymousMessageCreate(BaseModel):
    content: str


class AnonymousConversationCreate(BaseModel):
    title: str
    machine_id: Optional[str] = None


class AnonymousMessageResponse(BaseModel):
    id: str
    content: str
    sender: str
    timestamp: datetime

    class Config:
        from_attributes = True


class AnonymousConversation(BaseModel):
    id: str
    machine_id: Optional[str] = None
    title: str
    created_at: datetime
    updated_at: datetime
    messages: List[AnonymousMessageResponse] = []

    class Config:
        from_attributes = True


# Guest mode schemas with machine_id support
class GuestMessageCreate(BaseModel):
    content: str
    machine_id: Optional[str] = None


class GuestConversationCreate(BaseModel):
    title: str
    machine_id: Optional[str] = None


class GuestMessageResponse(BaseModel):
    id: str
    content: str
    sender: str
    timestamp: datetime

    class Config:
        from_attributes = True


class GuestConversationResponse(BaseModel):
    id: str
    machine_id: Optional[str] = None
    title: str
    created_at: datetime
    updated_at: datetime
    messages: List[GuestMessageResponse] = []

    class Config:
        from_attributes = True


class GuestStatsResponse(BaseModel):
    total_conversations: int
    total_messages: int
    machine_id: Optional[str] = None

    class Config:
        from_attributes = True 