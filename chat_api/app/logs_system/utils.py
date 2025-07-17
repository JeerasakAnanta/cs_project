from sqlalchemy.orm import Session
from app.logs_system.chat_log import ChatLog
from datetime import datetime


def log_chat_interaction(
    db: Session,
    user_id: str,
    query: str,
    response: str,
    start_timestamp: datetime = None,
    end_timestamp: datetime = None,
):
    chat_log = ChatLog(
        user_id=user_id,
        query=query,
        response=response,
        start_timestamp=start_timestamp,
        end_timestamp=end_timestamp,
    )
    try:
        db.add(chat_log)
        db.commit()
    except Exception as e:
        db.rollback()
        raise e
