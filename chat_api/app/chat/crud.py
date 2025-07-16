from sqlalchemy.orm import Session
from . import models, schemas


def create_chat_history(db: Session, chat: schemas.ChatHistoryCreate, user_id: int):
    db_chat = models.ChatHistory(**chat.dict(), user_id=user_id)
    db.add(db_chat)
    db.commit()
    db.refresh(db_chat)
    return db_chat


def get_chat_history_by_user(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.ChatHistory).filter(models.ChatHistory.user_id == user_id).offset(skip).limit(limit).all()


def get_all_chat_history(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.ChatHistory).offset(skip).limit(limit).all() 