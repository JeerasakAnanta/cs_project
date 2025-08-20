from pydantic import BaseModel
from typing import Optional, List, Dict
from datetime import datetime


class AdminConversationResponse(BaseModel):
    id: int
    user_id: Optional[int] = None
    username: str
    question: str
    bot_response: str
    satisfaction_rating: Optional[int] = None
    response_time_ms: Optional[int] = None
    conversation_type: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ConversationFilters(BaseModel):
    search: Optional[str] = None
    satisfaction: Optional[str] = None  # "positive", "neutral", "negative"
    response_time: Optional[str] = None  # "fast", "medium", "slow"
    date_from: Optional[str] = None  # YYYY-MM-DD
    date_to: Optional[str] = None  # YYYY-MM-DD
    username: Optional[str] = None


class TopUser(BaseModel):
    username: str
    total_questions: int
    avg_satisfaction: float
    avg_response_time: int


class TopQuestion(BaseModel):
    question: str
    count: int
    avg_satisfaction: float


class DailyStats(BaseModel):
    date: str  # YYYY-MM-DD
    count: int
    avg_satisfaction: float


class AdminConversationStats(BaseModel):
    total_conversations: int
    average_satisfaction: float
    average_response_time: int
    satisfaction_distribution: Dict[str, int]  # positive, neutral, negative
    response_time_distribution: Dict[str, int]  # fast, medium, slow
    top_users: List[TopUser]
    top_questions: List[TopQuestion]
    daily_stats: List[DailyStats]


class SatisfactionUpdate(BaseModel):
    satisfaction_rating: int  # 1-5


class ConversationExport(BaseModel):
    search: Optional[str] = None
    satisfaction: Optional[str] = None
    response_time: Optional[str] = None
    date_from: Optional[str] = None
    date_to: Optional[str] = None
    username: Optional[str] = None
    format: str = "csv"  # Only CSV supported for now
