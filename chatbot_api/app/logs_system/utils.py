from sqlalchemy.orm import Session
from app.models import ChatLog
from datetime import datetime


def log_chat_interaction(
    db: Session,
    user_id: str,
    query: str,
    response: str,
    source_docs: list[str] = [],
    feedback: int = None,
    timestamp: datetime = None,
):
    chat_log = ChatLog(
        user_id=user_id,
        query=query,
        response=response,
        source_docs=source_docs,
        feedback=feedback,
        timestamp=timestamp or datetime.utcnow(),
    )
    db.add(chat_log)
    db.commit()
