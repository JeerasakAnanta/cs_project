from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_
from typing import List, Optional
from datetime import datetime, timedelta
import csv
from io import StringIO

from app.utils.database import get_db
from app.login_system.auth import is_admin
from app.database.models import AdminConversation, User, Message, Conversation
from app.schemas.admin_conversation import (
    AdminConversationResponse,
    AdminConversationStats,
    ConversationFilters
)

router = APIRouter(prefix="/admin/conversations", tags=["Admin Conversations"])


@router.get("/", response_model=List[AdminConversationResponse])
async def get_conversations(
    search: Optional[str] = Query(None, description="Search in question, response, or username"),
    satisfaction: Optional[str] = Query(None, description="Filter by satisfaction: positive, neutral, negative"),
    response_time: Optional[str] = Query(None, description="Filter by response time: fast, medium, slow"),
    date_from: Optional[str] = Query(None, description="Filter from date (YYYY-MM-DD)"),
    date_to: Optional[str] = Query(None, description="Filter to date (YYYY-MM-DD)"),
    username: Optional[str] = Query(None, description="Filter by specific username"),
    limit: int = Query(100, description="Limit number of results"),
    offset: int = Query(0, description="Offset for pagination"),
    db: Session = Depends(get_db),
    current_user: User = Depends(is_admin)
):
    """
    Get conversations with filtering and pagination
    """
    try:
        # Build query
        query = db.query(AdminConversation)
        
        # Apply filters
        if search:
            search_filter = or_(
                AdminConversation.question.ilike(f"%{search}%"),
                AdminConversation.bot_response.ilike(f"%{search}%"),
                AdminConversation.username.ilike(f"%{search}%")
            )
            query = query.filter(search_filter)
        
        if satisfaction:
            if satisfaction == "positive":
                query = query.filter(AdminConversation.satisfaction_rating >= 4)
            elif satisfaction == "neutral":
                query = query.filter(AdminConversation.satisfaction_rating == 3)
            elif satisfaction == "negative":
                query = query.filter(AdminConversation.satisfaction_rating <= 2)
        
        if response_time:
            if response_time == "fast":
                query = query.filter(AdminConversation.response_time_ms < 1000)
            elif response_time == "medium":
                query = query.filter(
                    and_(
                        AdminConversation.response_time_ms >= 1000,
                        AdminConversation.response_time_ms < 2000
                    )
                )
            elif response_time == "slow":
                query = query.filter(AdminConversation.response_time_ms >= 2000)
        
        if date_from:
            try:
                date_from_obj = datetime.strptime(date_from, "%Y-%m-%d")
                query = query.filter(AdminConversation.created_at >= date_from_obj)
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid date_from format. Use YYYY-MM-DD")
        
        if date_to:
            try:
                date_to_obj = datetime.strptime(date_to, "%Y-%m-%d") + timedelta(days=1)
                query = query.filter(AdminConversation.created_at < date_to_obj)
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid date_to format. Use YYYY-MM-DD")
        
        if username:
            query = query.filter(AdminConversation.username.ilike(f"%{username}%"))
        
        # Apply pagination and ordering
        total = query.count()
        conversations = query.order_by(AdminConversation.created_at.desc()).offset(offset).limit(limit).all()
        
        return conversations
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching conversations: {str(e)}")


@router.get("/{conversation_id}", response_model=AdminConversationResponse)
async def get_conversation_by_id(
    conversation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(is_admin)
):
    """
    Get a specific conversation by ID
    """
    try:
        conversation = db.query(AdminConversation).filter(AdminConversation.id == conversation_id).first()
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")
        
        return conversation
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching conversation: {str(e)}")


@router.get("/stats/overview", response_model=AdminConversationStats)
async def get_conversation_stats(
    date_from: Optional[str] = Query(None, description="Filter from date (YYYY-MM-DD)"),
    date_to: Optional[str] = Query(None, description="Filter to date (YYYY-MM-DD)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(is_admin)
):
    """
    Get conversation statistics overview
    """
    try:
        # Build base query
        query = db.query(AdminConversation)
        
        # Apply date filters
        if date_from:
            try:
                date_from_obj = datetime.strptime(date_from, "%Y-%m-%d")
                query = query.filter(AdminConversation.created_at >= date_from_obj)
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid date_from format. Use YYYY-MM-DD")
        
        if date_to:
            try:
                date_to_obj = datetime.strptime(date_to, "%Y-%m-%d") + timedelta(days=1)
                query = query.filter(AdminConversation.created_at < date_to_obj)
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid date_to format. Use YYYY-MM-DD")
        
        # Get total conversations
        total_conversations = query.count()
        
        if total_conversations == 0:
            return AdminConversationStats(
                total_conversations=0,
                average_satisfaction=0.0,
                average_response_time=0,
                satisfaction_distribution={"positive": 0, "neutral": 0, "negative": 0},
                response_time_distribution={"fast": 0, "medium": 0, "slow": 0},
                top_users=[],
                top_questions=[],
                daily_stats=[]
            )
        
        # Calculate satisfaction stats
        satisfaction_stats = query.with_entities(
            func.avg(AdminConversation.satisfaction_rating).label("avg_satisfaction"),
            func.count(AdminConversation.satisfaction_rating).label("total_rated")
        ).filter(AdminConversation.satisfaction_rating.isnot(None)).first()
        
        avg_satisfaction = float(satisfaction_stats.avg_satisfaction) if satisfaction_stats.avg_satisfaction else 0.0
        
        # Calculate response time stats
        response_time_stats = query.with_entities(
            func.avg(AdminConversation.response_time_ms).label("avg_response_time")
        ).filter(AdminConversation.response_time_ms.isnot(None)).first()
        
        avg_response_time = int(response_time_stats.avg_response_time) if response_time_stats.avg_response_time else 0
        
        # Satisfaction distribution
        satisfaction_distribution = {
            "positive": query.filter(AdminConversation.satisfaction_rating >= 4).count(),
            "neutral": query.filter(AdminConversation.satisfaction_rating == 3).count(),
            "negative": query.filter(AdminConversation.satisfaction_rating <= 2).count()
        }
        
        # Response time distribution
        response_time_distribution = {
            "fast": query.filter(AdminConversation.response_time_ms < 1000).count(),
            "medium": query.filter(
                and_(
                    AdminConversation.response_time_ms >= 1000,
                    AdminConversation.response_time_ms < 2000
                )
            ).count(),
            "slow": query.filter(AdminConversation.response_time_ms >= 2000).count()
        }
        
        # Top users
        top_users = db.query(
            AdminConversation.username,
            func.count(AdminConversation.id).label("total_questions"),
            func.avg(AdminConversation.satisfaction_rating).label("avg_satisfaction"),
            func.avg(AdminConversation.response_time_ms).label("avg_response_time")
        ).filter(
            AdminConversation.username.isnot(None)
        ).group_by(
            AdminConversation.username
        ).order_by(
            func.count(AdminConversation.id).desc()
        ).limit(10).all()
        
        top_users_list = [
            {
                "username": user.username,
                "total_questions": user.total_questions,
                "avg_satisfaction": round(float(user.avg_satisfaction), 2) if user.avg_satisfaction else 0.0,
                "avg_response_time": int(user.avg_response_time) if user.avg_response_time else 0
            }
            for user in top_users
        ]
        
        # Top questions
        top_questions = db.query(
            AdminConversation.question,
            func.count(AdminConversation.id).label("count"),
            func.avg(AdminConversation.satisfaction_rating).label("avg_satisfaction")
        ).group_by(
            AdminConversation.question
        ).order_by(
            func.count(AdminConversation.id).desc()
        ).limit(5).all()
        
        top_questions_list = [
            {
                "question": q.question[:100] + "..." if len(q.question) > 100 else q.question,
                "count": q.count,
                "avg_satisfaction": round(float(q.avg_satisfaction), 2) if q.avg_satisfaction else 0.0
            }
            for q in top_questions
        ]
        
        # Daily stats for the last 7 days
        daily_stats = []
        for i in range(7):
            date = datetime.now() - timedelta(days=i)
            date_start = date.replace(hour=0, minute=0, second=0, microsecond=0)
            date_end = date_start + timedelta(days=1)
            
            daily_count = query.filter(
                and_(
                    AdminConversation.created_at >= date_start,
                    AdminConversation.created_at < date_end
                )
            ).count()
            
            daily_satisfaction = query.filter(
                and_(
                    AdminConversation.created_at >= date_start,
                    AdminConversation.created_at < date_end,
                    AdminConversation.satisfaction_rating.isnot(None)
                )
            ).with_entities(
                func.avg(AdminConversation.satisfaction_rating).label("avg_satisfaction")
            ).first()
            
            daily_stats.append({
                "date": date.strftime("%Y-%m-%d"),
                "count": daily_count,
                "avg_satisfaction": round(float(daily_satisfaction.avg_satisfaction), 2) if daily_satisfaction.avg_satisfaction else 0.0
            })
        
        daily_stats.reverse()  # Oldest first
        
        return AdminConversationStats(
            total_conversations=total_conversations,
            average_satisfaction=avg_satisfaction,
            average_response_time=avg_response_time,
            satisfaction_distribution=satisfaction_distribution,
            response_time_distribution=response_time_distribution,
            top_users=top_users_list,
            top_questions=top_questions_list,
            daily_stats=daily_stats
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculating statistics: {str(e)}")


@router.patch("/{conversation_id}/satisfaction")
async def update_conversation_satisfaction(
    conversation_id: int,
    satisfaction_rating: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(is_admin)
):
    """
    Update satisfaction rating for a conversation
    """
    try:
        if not 1 <= satisfaction_rating <= 5:
            raise HTTPException(status_code=400, detail="Satisfaction rating must be between 1 and 5")
        
        conversation = db.query(AdminConversation).filter(AdminConversation.id == conversation_id).first()
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")
        
        conversation.satisfaction_rating = satisfaction_rating
        conversation.updated_at = datetime.now()
        db.commit()
        
        return {"message": "Satisfaction rating updated successfully", "conversation_id": conversation_id}
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error updating satisfaction rating: {str(e)}")


@router.delete("/{conversation_id}")
async def delete_conversation(
    conversation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(is_admin)
):
    """
    Delete a conversation
    """
    try:
        conversation = db.query(AdminConversation).filter(AdminConversation.id == conversation_id).first()
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")
        
        db.delete(conversation)
        db.commit()
        
        return {"message": "Conversation deleted successfully", "conversation_id": conversation_id}
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error deleting conversation: {str(e)}")


@router.get("/export/csv")
async def export_conversations_csv(
    search: Optional[str] = Query(None, description="Search in question, response, or username"),
    satisfaction: Optional[str] = Query(None, description="Filter by satisfaction: positive, neutral, negative"),
    response_time: Optional[str] = Query(None, description="Filter by response time: fast, medium, slow"),
    date_from: Optional[str] = Query(None, description="Filter from date (YYYY-MM-DD)"),
    date_to: Optional[str] = Query(None, description="Filter to date (YYYY-MM-DD)"),
    username: Optional[str] = Query(None, description="Filter by specific username"),
    db: Session = Depends(get_db),
    current_user: User = Depends(is_admin)
):
    """
    Export conversations to CSV format
    """
    try:
        # Build query (same as get_conversations but without pagination)
        query = db.query(AdminConversation)
        
        # Apply filters (same logic as get_conversations)
        if search:
            search_filter = or_(
                AdminConversation.question.ilike(f"%{search}%"),
                AdminConversation.bot_response.ilike(f"%{search}%"),
                AdminConversation.username.ilike(f"%{search}%")
            )
            query = query.filter(search_filter)
        
        if satisfaction:
            if satisfaction == "positive":
                query = query.filter(AdminConversation.satisfaction_rating >= 4)
            elif satisfaction == "neutral":
                query = query.filter(AdminConversation.satisfaction_rating == 3)
            elif satisfaction == "negative":
                query = query.filter(AdminConversation.satisfaction_rating <= 2)
        
        if response_time:
            if response_time == "fast":
                query = query.filter(AdminConversation.response_time_ms < 1000)
            elif response_time == "medium":
                query = query.filter(
                    and_(
                        AdminConversation.response_time_ms >= 1000,
                        AdminConversation.response_time_ms < 2000
                    )
                )
            elif response_time == "slow":
                query = query.filter(AdminConversation.response_time_ms >= 2000)
        
        if date_from:
            try:
                date_from_obj = datetime.strptime(date_from, "%Y-%m-%d")
                query = query.filter(AdminConversation.created_at >= date_from_obj)
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid date_from format. Use YYYY-MM-DD")
        
        if date_to:
            try:
                date_to_obj = datetime.strptime(date_to, "%Y-%m-%d") + timedelta(days=1)
                query = query.filter(AdminConversation.created_at < date_to_obj)
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid date_to format. Use YYYY-MM-DD")
        
        if username:
            query = query.filter(AdminConversation.username.ilike(f"%{username}%"))
        
        # Get all conversations
        conversations = query.order_by(AdminConversation.created_at.desc()).all()
        
        # Create CSV
        output = StringIO()
        writer = csv.writer(output)
        
        # Write header
        writer.writerow([
            "ID", "Username", "Question", "Bot Response", "Satisfaction Rating",
            "Response Time (ms)", "Created At", "Updated At"
        ])
        
        # Write data
        for conv in conversations:
            writer.writerow([
                conv.id,
                conv.username,
                conv.question,
                conv.bot_response,
                conv.satisfaction_rating or "",
                conv.response_time_ms or "",
                conv.created_at.strftime("%Y-%m-%d %H:%M:%S") if conv.created_at else "",
                conv.updated_at.strftime("%Y-%m-%d %H:%M:%S") if conv.updated_at else ""
            ])
        
        # Prepare response
        csv_content = output.getvalue()
        output.close()
        
        # Generate filename
        filename = f"conversations_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
        
        return Response(
            content=csv_content,
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error exporting conversations: {str(e)}")


# Migration endpoint to populate AdminConversation table from existing data
@router.post("/migrate-existing-data")
async def migrate_existing_conversations(
    db: Session = Depends(get_db),
    current_user: User = Depends(is_admin)
):
    """
    Migrate existing conversation data to AdminConversation table
    """
    try:
        # Check if migration has already been done
        existing_count = db.query(AdminConversation).count()
        if existing_count > 0:
            return {"message": "Migration already completed", "existing_count": existing_count}
        
        # Migrate from regular conversations
        conversations = db.query(Conversation).all()
        migrated_count = 0
        
        for conv in conversations:
            # Get user info
            user = db.query(User).filter(User.id == conv.user_id).first()
            username = user.username if user else "unknown_user"
            
            # Get messages
            messages = db.query(Message).filter(Message.conversation_id == conv.id).order_by(Message.created_at).all()
            
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
                    
                    db.add(admin_conv)
                    migrated_count += 1
        
        # Migrate from guest conversations
        guest_conversations = db.query(GuestConversation).filter(GuestConversation.is_deleted == False).all()
        
        for conv in guest_conversations:
            messages = db.query(GuestMessage).filter(GuestMessage.conversation_id == conv.id).order_by(GuestMessage.timestamp).all()
            
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
                        username=f"guest_{conv.machine_id[:8]}",
                        question=user_message.content,
                        bot_response=bot_message.content,
                        satisfaction_rating=bot_message.satisfaction_rating,
                        response_time_ms=response_time,
                        conversation_type="guest",
                        created_at=conv.created_at
                    )
                    
                    db.add(admin_conv)
                    migrated_count += 1
        
        db.commit()
        
        return {
            "message": "Migration completed successfully",
            "migrated_count": migrated_count,
            "total_count": db.query(AdminConversation).count()
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error during migration: {str(e)}")
