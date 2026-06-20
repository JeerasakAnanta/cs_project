from sqlalchemy.orm import Session
from app.logs_system.chat_log import ChatLog
from app.utils.timezone import now, localize_datetime


def log_chat_interaction(
    db: Session,
    user_id: str,
    query: str,
    response: str,
    start_timestamp: datetime = None,
    end_timestamp: datetime = None,
):
    # Use system time if timestamps are not provided
    if start_timestamp is None:
        start_timestamp = now()
    if end_timestamp is None:
        end_timestamp = now()
    
    # Ensure timestamps are timezone-aware
    start_timestamp = localize_datetime(start_timestamp)
    end_timestamp = localize_datetime(end_timestamp)
    
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
