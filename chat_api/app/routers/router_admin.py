from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from typing import List, Dict, Any

from app.database import models
from app.utils.database import get_db
from app.login_system import crud, schemas
from app.login_system.auth import is_admin

router = APIRouter(
    prefix="/admin",
    tags=["admin"],
    dependencies=[Depends(is_admin)],
    responses={404: {"description": "Not found"}},
)

@router.post("/users/", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return crud.create_user(db=db, user=user)

@router.get("/users/", response_model=List[schemas.User])
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    users = crud.get_users(db, skip=skip, limit=limit)
    return users

@router.get("/users/{user_id}", response_model=schemas.User)
def read_user(user_id: int, db: Session = Depends(get_db)):
    db_user = crud.get_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

@router.put("/users/{user_id}", response_model=schemas.User)
def update_user(user_id: int, user: schemas.UserUpdate, db: Session = Depends(get_db)):
    db_user = crud.update_user(db, user_id=user_id, user=user)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

@router.delete("/users/{user_id}", response_model=schemas.User)
def delete_user(user_id: int, db: Session = Depends(get_db)):
    db_user = crud.delete_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

@router.get("/statistics/", response_model=Dict[str, Any])
def get_system_statistics(db: Session = Depends(get_db)):
    """
    Get comprehensive system statistics for admin dashboard
    """
    try:
        # User statistics
        total_users = db.query(models.User).count()
        active_users = db.query(models.User).filter(models.User.is_active == True).count()
        inactive_users = db.query(models.User).filter(models.User.is_active == False).count()
        
        # Role distribution
        role_stats = db.query(
            models.User.role,
            func.count(models.User.id).label('count')
        ).group_by(models.User.role).all()
        role_distribution = {role: count for role, count in role_stats}
        
        # Conversation statistics
        total_conversations = db.query(models.Conversation).count()
        total_guest_conversations = db.query(models.GuestConversation).filter(
            models.GuestConversation.is_deleted == False
        ).count()
        
        # Message statistics
        total_messages = db.query(models.Message).count()
        total_guest_messages = db.query(models.GuestMessage).count()
        
        # User vs Bot message distribution
        user_messages = db.query(models.Message).filter(models.Message.sender == "user").count()
        bot_messages = db.query(models.Message).filter(models.Message.sender == "bot").count()
        
        user_guest_messages = db.query(models.GuestMessage).filter(models.GuestMessage.sender == "user").count()
        bot_guest_messages = db.query(models.GuestMessage).filter(models.GuestMessage.sender == "bot").count()
        
        # Feedback statistics
        total_feedbacks = db.query(models.Feedback).count()
        like_feedbacks = db.query(models.Feedback).filter(models.Feedback.feedback_type == "like").count()
        dislike_feedbacks = db.query(models.Feedback).filter(models.Feedback.feedback_type == "dislike").count()
        
        # Recent activity (last 7 days)
        from datetime import datetime, timedelta
        seven_days_ago = datetime.utcnow() - timedelta(days=7)
        
        recent_conversations = db.query(models.Conversation).filter(
            models.Conversation.created_at >= seven_days_ago
        ).count()
        
        recent_guest_conversations = db.query(models.GuestConversation).filter(
            and_(
                models.GuestConversation.created_at >= seven_days_ago,
                models.GuestConversation.is_deleted == False
            )
        ).count()
        
        recent_messages = db.query(models.Message).filter(
            models.Message.conversation_id.in_(
                db.query(models.Conversation.id).filter(
                    models.Conversation.created_at >= seven_days_ago
                )
            )
        ).count()
        
        recent_guest_messages = db.query(models.GuestMessage).filter(
            models.GuestMessage.timestamp >= seven_days_ago
        ).count()
        
        # Machine separation statistics
        unique_machines = db.query(models.GuestConversation.machine_id).distinct().count()
        
        statistics = {
            "users": {
                "total": total_users,
                "active": active_users,
                "inactive": inactive_users,
                "role_distribution": role_distribution
            },
            "conversations": {
                "total_registered": total_conversations,
                "total_guest": total_guest_conversations,
                "total_all": total_conversations + total_guest_conversations,
                "recent_registered": recent_conversations,
                "recent_guest": recent_guest_conversations,
                "recent_total": recent_conversations + recent_guest_conversations
            },
            "messages": {
                "total_registered": total_messages,
                "total_guest": total_guest_messages,
                "total_all": total_messages + total_guest_messages,
                "user_messages_registered": user_messages,
                "bot_messages_registered": bot_messages,
                "user_messages_guest": user_guest_messages,
                "bot_messages_guest": bot_guest_messages,
                "recent_registered": recent_messages,
                "recent_guest": recent_guest_messages,
                "recent_total": recent_messages + recent_guest_messages
            },
            "feedbacks": {
                "total": total_feedbacks,
                "likes": like_feedbacks,
                "dislikes": dislike_feedbacks,
                "satisfaction_rate": round((like_feedbacks / total_feedbacks * 100) if total_feedbacks > 0 else 0, 2)
            },
            "system": {
                "unique_machines": unique_machines,
                "last_updated": datetime.utcnow().isoformat()
            }
        }
        
        return statistics
        
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Error retrieving system statistics: {str(e)}"
        )

@router.get("/statistics/users/", response_model=Dict[str, Any])
def get_user_statistics(db: Session = Depends(get_db)):
    """
    Get detailed user statistics
    """
    try:
        # User count by status
        total_users = db.query(models.User).count()
        active_users = db.query(models.User).filter(models.User.is_active == True).count()
        inactive_users = db.query(models.User).filter(models.User.is_active == False).count()
        
        # Role distribution
        role_stats = db.query(
            models.User.role,
            func.count(models.User.id).label('count')
        ).group_by(models.User.role).all()
        
        # Users with most conversations
        top_users = db.query(
            models.User.username,
            func.count(models.Conversation.id).label('conversation_count')
        ).join(models.Conversation).group_by(models.User.id, models.User.username).order_by(
            func.count(models.Conversation.id).desc()
        ).limit(10).all()
        
        return {
            "total_users": total_users,
            "active_users": active_users,
            "inactive_users": inactive_users,
            "role_distribution": {role: count for role, count in role_stats},
            "top_users_by_conversations": [
                {"username": username, "conversation_count": count} 
                for username, count in top_users
            ]
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Error retrieving user statistics: {str(e)}"
        )

@router.get("/statistics/conversations/", response_model=Dict[str, Any])
def get_conversation_statistics(db: Session = Depends(get_db)):
    """
    Get detailed conversation statistics
    """
    try:
        # Registered conversations
        total_registered = db.query(models.Conversation).count()
        
        # Guest conversations
        total_guest = db.query(models.GuestConversation).filter(
            models.GuestConversation.is_deleted == False
        ).count()
        
        # Recent activity (last 30 days)
        from datetime import datetime, timedelta
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        
        recent_registered = db.query(models.Conversation).filter(
            models.Conversation.created_at >= thirty_days_ago
        ).count()
        
        recent_guest = db.query(models.GuestConversation).filter(
            and_(
                models.GuestConversation.created_at >= thirty_days_ago,
                models.GuestConversation.is_deleted == False
            )
        ).count()
        
        # Daily conversation count for the last 7 days
        daily_stats = []
        for i in range(7):
            date = datetime.utcnow() - timedelta(days=i)
            start_of_day = date.replace(hour=0, minute=0, second=0, microsecond=0)
            end_of_day = start_of_day + timedelta(days=1)
            
            daily_registered = db.query(models.Conversation).filter(
                and_(
                    models.Conversation.created_at >= start_of_day,
                    models.Conversation.created_at < end_of_day
                )
            ).count()
            
            daily_guest = db.query(models.GuestConversation).filter(
                and_(
                    models.GuestConversation.created_at >= start_of_day,
                    models.GuestConversation.created_at < end_of_day,
                    models.GuestConversation.is_deleted == False
                )
            ).count()
            
            daily_stats.append({
                "date": start_of_day.strftime("%Y-%m-%d"),
                "registered": daily_registered,
                "guest": daily_guest,
                "total": daily_registered + daily_guest
            })
        
        return {
            "total_registered": total_registered,
            "total_guest": total_guest,
            "total_all": total_registered + total_guest,
            "recent_30_days": {
                "registered": recent_registered,
                "guest": recent_guest,
                "total": recent_registered + recent_guest
            },
            "daily_stats_last_7_days": daily_stats
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Error retrieving conversation statistics: {str(e)}"
        ) 