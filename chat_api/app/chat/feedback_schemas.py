from pydantic import BaseModel
from typing import Optional

class FeedbackBase(BaseModel):
    feedback_type: str # 'like' or 'dislike'
    comment: Optional[str] = None

class FeedbackCreate(FeedbackBase):
    message_id: int

class Feedback(FeedbackBase):
    id: int
    message_id: int

    class Config:
        from_attributes = True 