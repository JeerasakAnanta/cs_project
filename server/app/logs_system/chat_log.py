# app/models/chat_log.py
from sqlalchemy import Column, Integer, String, Text, DateTime, ARRAY
from app.utils.database import Base
from app.utils.timezone import now

class ChatLog(Base):
    __tablename__ = "chat_logs"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True)
    query = Column(Text)
    response = Column(Text)
    start_timestamp = Column(DateTime(timezone=True), default=now)
    end_timestamp = Column(DateTime(timezone=True), default=now)
