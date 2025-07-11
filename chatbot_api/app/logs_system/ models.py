# models.py
from sqlalchemy import Column, Integer, String, Text, DateTime, ARRAY
from datetime import datetime
from app.login_system.database import Base  # assume you already have this


class ChatLog(Base):
    __tablename__ = "chat_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    query = Column(Text)
    response = Column(Text)
    source_docs = Column(ARRAY(String))  # list of doc names or paths
    feedback = Column(Integer, nullable=True)  # optional rating 1-5
