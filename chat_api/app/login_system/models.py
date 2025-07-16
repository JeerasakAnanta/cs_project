from sqlalchemy import Column, Integer, String
from app.login_system.database import Base
from sqlalchemy.orm import relationship


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String, default="user")  # <-- ADD THIS

    chat_history = relationship("ChatHistory", back_populates="user")
