from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime, timedelta
import logging

from app.utils.database import get_db
from app.database.models import Feedback
from app.login_system.auth import get_current_user

router = APIRouter(prefix="/feedback", tags=["Feedback System"])
logger = logging.getLogger(__name__)

@router.post("/rate-response")
async def rate_response_quality(
    conversation_id: str,
    message_id: str,
    rating: int,
    feedback_text: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: Optional[dict] = Depends(get_current_user)
):
    """
    ให้คะแนนคุณภาพคำตอบ (UC30)
    """
    try:
        # ตรวจสอบ rating (1-5)
        if not 1 <= rating <= 5:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Rating must be between 1 and 5"
            )
        
        # สร้าง feedback record
        feedback_data = {
            "conversation_id": conversation_id,
            "message_id": message_id,
            "rating": rating,
            "feedback_text": feedback_text,
            "created_at": datetime.utcnow()
        }
        
        if current_user:
            feedback_data["user_id"] = current_user.get("id")
            feedback_data["user_type"] = "authenticated"
        else:
            feedback_data["user_type"] = "guest"
        
        # บันทึก feedback
        feedback = Feedback(**feedback_data)
        db.add(feedback)
        db.commit()
        db.refresh(feedback)
        
        logger.info(f"Feedback recorded: rating={rating}, conversation_id={conversation_id}")
        
        return JSONResponse(
            status_code=status.HTTP_201_CREATED,
            content={
                "message": "ขอบคุณสำหรับการให้คะแนน",
                "feedback_id": feedback.id,
                "rating": rating
            }
        )
        
    except Exception as e:
        logger.error(f"Error recording feedback: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="เกิดข้อผิดพลาดในการบันทึก feedback"
        )

@router.post("/submit-feedback")
async def submit_feedback(
    feedback_type: str,
    feedback_text: str,
    category: Optional[str] = None,
    priority: Optional[str] = "medium",
    db: Session = Depends(get_db),
    current_user: Optional[dict] = Depends(get_current_user)
):
    """
    ส่งข้อเสนอแนะ (UC31)
    """
    try:
        if not feedback_text.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Feedback text cannot be empty"
            )
        
        # สร้าง feedback record
        feedback_data = {
            "feedback_type": feedback_type,
            "feedback_text": feedback_text,
            "category": category,
            "priority": priority,
            "created_at": datetime.utcnow()
        }
        
        if current_user:
            feedback_data["user_id"] = current_user.get("id")
            feedback_data["user_type"] = "authenticated"
        else:
            feedback_data["user_type"] = "guest"
        
        # บันทึก feedback
        feedback = Feedback(**feedback_data)
        db.add(feedback)
        db.commit()
        db.refresh(feedback)
        
        logger.info(f"Feedback submitted: type={feedback_type}, category={category}")
        
        return JSONResponse(
            status_code=status.HTTP_201_CREATED,
            content={
                "message": "ขอบคุณสำหรับข้อเสนอแนะของคุณ",
                "feedback_id": feedback.id
            }
        )
        
    except Exception as e:
        logger.error(f"Error submitting feedback: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="เกิดข้อผิดพลาดในการส่งข้อเสนอแนะ"
        )

@router.get("/statistics")
async def get_feedback_statistics(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    ดูสถิติ feedback (UC32) - เฉพาะ admin
    """
    try:
        # ตรวจสอบสิทธิ์ admin
        if not current_user.get("is_admin"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied. Admin privileges required."
            )
        
        # ดึงสถิติ feedback
        total_feedback = db.query(Feedback).count()
        rating_feedback = db.query(Feedback).filter(Feedback.rating.isnot(None)).count()
        
        # คำนวณคะแนนเฉลี่ย
        avg_rating = db.query(Feedback.rating).filter(Feedback.rating.isnot(None)).all()
        if avg_rating:
            avg_rating = sum([r[0] for r in avg_rating]) / len(avg_rating)
        else:
            avg_rating = 0
        
        # สถิติตามประเภท
        feedback_by_type = db.query(
            Feedback.feedback_type,
            db.func.count(Feedback.id)
        ).group_by(Feedback.feedback_type).all()
        
        # สถิติตาม priority
        feedback_by_priority = db.query(
            Feedback.priority,
            db.func.count(Feedback.id)
        ).group_by(Feedback.priority).all()
        
        # สถิติตามช่วงเวลา (7 วันล่าสุด)
        recent_feedback = db.query(
            db.func.date(Feedback.created_at),
            db.func.count(Feedback.id)
        ).filter(
            Feedback.created_at >= datetime.utcnow() - timedelta(days=7)
        ).group_by(db.func.date(Feedback.created_at)).all()
        
        statistics = {
            "total_feedback": total_feedback,
            "rating_feedback": rating_feedback,
            "average_rating": round(avg_rating, 2),
            "feedback_by_type": dict(feedback_by_type),
            "feedback_by_priority": dict(feedback_by_priority),
            "recent_feedback": dict(recent_feedback)
        }
        
        logger.info(f"Feedback statistics retrieved by admin: {current_user.get('email')}")
        
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content=statistics
        )
        
    except Exception as e:
        logger.error(f"Error retrieving feedback statistics: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="เกิดข้อผิดพลาดในการดึงสถิติ feedback"
        )

@router.get("/user-feedback")
async def get_user_feedback(
    db: Session = Depends(get_db),
    current_user: Optional[dict] = Depends(get_current_user)
):
    """
    ดึง feedback ของผู้ใช้ปัจจุบัน
    """
    try:
        if current_user:
            # ผู้ใช้ที่เข้าสู่ระบบ
            feedback_list = db.query(Feedback).filter(
                Feedback.user_id == current_user.get("id")
            ).order_by(Feedback.created_at.desc()).all()
        else:
            # Guest user - ใช้ machine_id จาก request
            # ต้องส่ง machine_id ผ่าน header หรือ query parameter
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Machine ID required for guest users"
            )
        
        feedback_data = []
        for feedback in feedback_list:
            feedback_data.append({
                "id": feedback.id,
                "feedback_type": feedback.feedback_type,
                "feedback_text": feedback.feedback_text,
                "rating": feedback.rating,
                "category": feedback.category,
                "priority": feedback.priority,
                "created_at": feedback.created_at.isoformat()
            })
        
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={"feedback": feedback_data}
        )
        
    except Exception as e:
        logger.error(f"Error retrieving user feedback: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="เกิดข้อผิดพลาดในการดึง feedback"
        )

@router.delete("/delete-feedback/{feedback_id}")
async def delete_feedback(
    feedback_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    ลบ feedback (เฉพาะ admin หรือเจ้าของ feedback)
    """
    try:
        feedback = db.query(Feedback).filter(Feedback.id == feedback_id).first()
        
        if not feedback:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Feedback not found"
            )
        
        # ตรวจสอบสิทธิ์
        if not current_user.get("is_admin") and feedback.user_id != current_user.get("id"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
        
        db.delete(feedback)
        db.commit()
        
        logger.info(f"Feedback deleted: id={feedback_id} by user={current_user.get('email')}")
        
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={"message": "Feedback deleted successfully"}
        )
        
    except Exception as e:
        logger.error(f"Error deleting feedback: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="เกิดข้อผิดพลาดในการลบ feedback"
        )
