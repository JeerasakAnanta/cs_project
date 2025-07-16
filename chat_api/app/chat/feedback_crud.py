from sqlalchemy.orm import Session
from app.database import models
from . import feedback_schemas

def create_feedback(db: Session, feedback: feedback_schemas.FeedbackCreate):
    db_feedback = models.Feedback(
        message_id=feedback.message_id,
        feedback_type=feedback.feedback_type,
        comment=feedback.comment
    )
    db.add(db_feedback)
    db.commit()
    db.refresh(db_feedback)
    return db_feedback 