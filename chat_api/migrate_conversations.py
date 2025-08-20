#!/usr/bin/env python3
"""
Migration script to populate AdminConversation table with existing conversation data
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import sessionmaker
from app.utils.database import engine
from app.database.models import (
    AdminConversation, User, Message, Conversation,
    GuestConversation, GuestMessage
)
from datetime import datetime


def migrate_conversations():
    """Migrate existing conversation data to AdminConversation table"""
    
    # Create session
    Session = sessionmaker(bind=engine)
    session = Session()
    
    try:
        # Check if migration has already been done
        existing_count = session.query(AdminConversation).count()
        if existing_count > 0:
            print(f"Migration already completed. Found {existing_count} existing records.")
            return
        
        print("Starting migration of existing conversation data...")
        
        # Migrate from regular conversations
        conversations = session.query(Conversation).all()
        migrated_count = 0
        
        print(f"Found {len(conversations)} regular conversations to migrate...")
        
        for conv in conversations:
            try:
                # Get user info
                user = session.query(User).filter(User.id == conv.user_id).first()
                username = user.username if user else "unknown_user"
                
                # Get messages
                messages = session.query(Message).filter(
                    Message.conversation_id == conv.id
                ).order_by(Message.created_at).all()
                
                if len(messages) >= 2:  # Need at least user question and bot response
                    user_message = None
                    bot_message = None
                    
                    for msg in messages:
                        if msg.sender == "user":
                            user_message = msg
                        elif msg.sender == "bot":
                            bot_message = msg
                            break
                    
                    if user_message and bot_message:
                        # Calculate response time
                        response_time = None
                        if user_message.created_at and bot_message.created_at:
                            time_diff = bot_message.created_at - user_message.created_at
                            response_time = int(time_diff.total_seconds() * 1000)
                        
                        # Create admin conversation record
                        admin_conv = AdminConversation(
                            user_id=conv.user_id,
                            username=username,
                            question=user_message.content,
                            bot_response=bot_message.content,
                            satisfaction_rating=bot_message.satisfaction_rating,
                            response_time_ms=response_time,
                            conversation_type="regular",
                            created_at=conv.created_at
                        )
                        
                        session.add(admin_conv)
                        migrated_count += 1
                        
                        if migrated_count % 100 == 0:
                            print(f"Migrated {migrated_count} conversations...")
                            
            except Exception as e:
                print(f"Error migrating conversation {conv.id}: {e}")
                continue
        
        print(f"Migrated {migrated_count} regular conversations")
        
        # Migrate from guest conversations
        guest_conversations = session.query(GuestConversation).filter(
            GuestConversation.is_deleted == False
        ).all()
        
        print(f"Found {len(guest_conversations)} guest conversations to migrate...")
        
        guest_migrated_count = 0
        
        for conv in guest_conversations:
            try:
                messages = session.query(GuestMessage).filter(
                    GuestMessage.conversation_id == conv.id
                ).order_by(GuestMessage.timestamp).all()
                
                if len(messages) >= 2:
                    user_message = None
                    bot_message = None
                    
                    for msg in messages:
                        if msg.sender == "user":
                            user_message = msg
                        elif msg.sender == "bot":
                            bot_message = msg
                            break
                    
                    if user_message and bot_message:
                        # Calculate response time
                        response_time = None
                        if user_message.timestamp and bot_message.timestamp:
                            time_diff = bot_message.timestamp - user_message.timestamp
                            response_time = int(time_diff.total_seconds() * 1000)
                        
                        # Create admin conversation record
                        admin_conv = AdminConversation(
                            username=f"guest_{conv.machine_id[:8] if conv.machine_id else 'unknown'}",
                            question=user_message.content,
                            bot_response=bot_message.content,
                            satisfaction_rating=bot_message.satisfaction_rating,
                            response_time_ms=response_time,
                            conversation_type="guest",
                            created_at=conv.created_at
                        )
                        
                        session.add(admin_conv)
                        guest_migrated_count += 1
                        
                        if guest_migrated_count % 100 == 0:
                            print(f"Migrated {guest_migrated_count} guest conversations...")
                            
            except Exception as e:
                print(f"Error migrating guest conversation {conv.id}: {e}")
                continue
        
        print(f"Migrated {guest_migrated_count} guest conversations")
        
        # Commit all changes
        session.commit()
        
        total_migrated = migrated_count + guest_migrated_count
        total_count = session.query(AdminConversation).count()
        
        print(f"\nMigration completed successfully!")
        print(f"Total conversations migrated: {total_migrated}")
        print(f"Total records in AdminConversation table: {total_count}")
        
        # Print some statistics
        if total_count > 0:
            print("\nMigration Statistics:")
            
            # Satisfaction distribution
            positive = session.query(AdminConversation).filter(
                AdminConversation.satisfaction_rating >= 4
            ).count()
            neutral = session.query(AdminConversation).filter(
                AdminConversation.satisfaction_rating == 3
            ).count()
            negative = session.query(AdminConversation).filter(
                AdminConversation.satisfaction_rating <= 2
            ).count()
            
            print(f"Positive ratings (4-5): {positive}")
            print(f"Neutral ratings (3): {neutral}")
            print(f"Negative ratings (1-2): {negative}")
            
            # Response time distribution
            fast = session.query(AdminConversation).filter(
                AdminConversation.response_time_ms < 1000
            ).count()
            medium = session.query(AdminConversation).filter(
                AdminConversation.response_time_ms >= 1000,
                AdminConversation.response_time_ms < 2000
            ).count()
            slow = session.query(AdminConversation).filter(
                AdminConversation.response_time_ms >= 2000
            ).count()
            
            print(f"Fast responses (<1s): {fast}")
            print(f"Medium responses (1-2s): {medium}")
            print(f"Slow responses (>2s): {slow}")
            
            # Conversation types
            regular = session.query(AdminConversation).filter(
                AdminConversation.conversation_type == "regular"
            ).count()
            guest = session.query(AdminConversation).filter(
                AdminConversation.conversation_type == "guest"
            ).count()
            
            print(f"Regular conversations: {regular}")
            print(f"Guest conversations: {guest}")
        
    except Exception as e:
        print(f"Error during migration: {e}")
        session.rollback()
        raise
    finally:
        session.close()


def create_sample_data():
    """Create sample conversation data for testing"""
    
    Session = sessionmaker(bind=engine)
    session = Session()
    
    try:
        # Check if sample data already exists
        existing_count = session.query(AdminConversation).count()
        if existing_count > 0:
            print(f"Sample data already exists. Found {existing_count} records.")
            return
        
        print("Creating sample conversation data...")
        
        # Sample conversations
        sample_conversations = [
            {
                "username": "john_doe",
                "question": "วิธีการใช้งานระบบ PDF อย่างไร?",
                "bot_response": "คุณสามารถอัปโหลดไฟล์ PDF และถามคำถามเกี่ยวกับเนื้อหาได้เลยครับ",
                "satisfaction_rating": 5,
                "response_time_ms": 1200,
                "conversation_type": "regular"
            },
            {
                "username": "jane_smith",
                "question": "ระบบรองรับไฟล์อะไรบ้าง?",
                "bot_response": "ระบบรองรับไฟล์ PDF เท่านั้นครับ กรุณาแปลงไฟล์อื่นเป็น PDF ก่อน",
                "satisfaction_rating": 4,
                "response_time_ms": 800,
                "conversation_type": "regular"
            },
            {
                "username": "bob_wilson",
                "question": "ทำไมไม่สามารถอัปโหลดไฟล์ได้?",
                "bot_response": "กรุณาตรวจสอบขนาดไฟล์ไม่เกิน 10MB และเป็นไฟล์ PDF เท่านั้น",
                "satisfaction_rating": 3,
                "response_time_ms": 1500,
                "conversation_type": "regular"
            },
            {
                "username": "guest_12345",
                "question": "ระบบทำงานอย่างไร?",
                "bot_response": "ระบบใช้ AI เพื่อวิเคราะห์เอกสาร PDF และตอบคำถามของคุณครับ",
                "satisfaction_rating": 5,
                "response_time_ms": 900,
                "conversation_type": "guest"
            },
            {
                "username": "guest_67890",
                "question": "สามารถถามอะไรได้บ้าง?",
                "bot_response": "คุณสามารถถามเกี่ยวกับเนื้อหาในเอกสาร PDF ที่อัปโหลดได้ทุกอย่างครับ",
                "satisfaction_rating": 4,
                "response_time_ms": 1100,
                "conversation_type": "guest"
            }
        ]
        
        for sample in sample_conversations:
            admin_conv = AdminConversation(
                username=sample["username"],
                question=sample["question"],
                bot_response=sample["bot_response"],
                satisfaction_rating=sample["satisfaction_rating"],
                response_time_ms=sample["response_time_ms"],
                conversation_type=sample["conversation_type"],
                created_at=datetime.now()
            )
            session.add(admin_conv)
        
        session.commit()
        print(f"Created {len(sample_conversations)} sample conversations")
        
    except Exception as e:
        print(f"Error creating sample data: {e}")
        session.rollback()
        raise
    finally:
        session.close()


if __name__ == "__main__":
    print("Conversation Migration Script")
    print("=" * 40)
    
    try:
        # First try to migrate existing data
        migrate_conversations()
        
        # If no existing data, create sample data
        total_count = session.query(AdminConversation).count()
        if total_count == 0:
            print("\nNo existing data found. Creating sample data...")
            create_sample_data()
        
        print("\nMigration script completed successfully!")
        
    except Exception as e:
        print(f"\nMigration failed: {e}")
        sys.exit(1)
