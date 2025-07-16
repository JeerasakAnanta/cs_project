from pydantic import BaseModel
from datetime import datetime


class ChatHistoryBase(BaseModel):
    question: str
    answer: str


class ChatHistoryCreate(ChatHistoryBase):
    pass


class ChatHistory(ChatHistoryBase):
    id: int
    user_id: int
    timestamp: datetime

    class Config:
        orm_mode = True 