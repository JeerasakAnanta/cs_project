from sqlalchemy import (
    Boolean,
    Column,
    ForeignKey,
    Integer,
    String,
    DateTime,
    Text,
    Float,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.utils.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String, default="user")
    is_active = Column(Boolean, default=True)

    conversations = relationship("Conversation", back_populates="user")


class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String, default="New Conversation")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="conversations")
    messages = relationship(
        "Message", back_populates="conversation", cascade="all, delete-orphan"
    )


class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id"))
    sender = Column(String)  # "user" or "bot"
    content = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    satisfaction_rating = Column(Integer, nullable=True)  # 1-5 rating
    response_time_ms = Column(Integer, nullable=True)  # Response time in milliseconds

    conversation = relationship("Conversation", back_populates="messages")
    feedbacks = relationship("Feedback", back_populates="message", cascade="all, delete-orphan")


class Feedback(Base):
    __tablename__ = "feedbacks"

    id = Column(Integer, primary_key=True, index=True)
    message_id = Column(Integer, ForeignKey("messages.id"))
    feedback_type = Column(String)  # 'like' or 'dislike'
    comment = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    message = relationship("Message", back_populates="feedbacks")


class GuestConversation(Base):
    __tablename__ = "guest_conversations"

    id = Column(String, primary_key=True, index=True)  # UUID string
    machine_id = Column(String, index=True)  # Machine identifier for device separation
    title = Column(String, default="Guest Conversation")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    is_deleted = Column(Boolean, default=False)  # Soft delete flag

    messages = relationship("GuestMessage", back_populates="conversation", cascade="all, delete-orphan")


class GuestMessage(Base):
    __tablename__ = "guest_messages"

    id = Column(String, primary_key=True, index=True)  # UUID string
    conversation_id = Column(String, ForeignKey("guest_conversations.id"))
    sender = Column(String)  # "user" or "bot"
    content = Column(Text)  # Use Text for longer messages
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    satisfaction_rating = Column(Integer, nullable=True)  # 1-5 rating
    response_time_ms = Column(Integer, nullable=True)  # Response time in milliseconds

    conversation = relationship("GuestConversation", back_populates="messages")


# New model for admin conversation analytics
class AdminConversation(Base):
    __tablename__ = "admin_conversations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # Can be null for guest users
    username = Column(String, index=True)  # Store username for easier querying
    question = Column(Text)  # User's question
    bot_response = Column(Text)  # Bot's response
    satisfaction_rating = Column(Integer, nullable=True)  # 1-5 rating
    response_time_ms = Column(Integer, nullable=True)  # Response time in milliseconds
    conversation_type = Column(String, default="regular")  # "regular", "guest", "admin"
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User", foreign_keys=[user_id]) 