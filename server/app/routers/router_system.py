from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.responses import JSONResponse, FileResponse
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import json
import os
import shutil
import psutil
import platform
from pathlib import Path

from ..database.database import get_db, engine
from ..database.models import User, Conversation, Message, Document, Feedback, MachineData
from ..login_system.auth import get_current_user
from ..utils.logger import get_logger

router = APIRouter(prefix="/system", tags=["System Management"])
logger = get_logger(__name__)

@router.get("/users")
async def manage_users(
    page: int = 1,
    limit: int = 20,
    search: Optional[str] = None,
    role: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    จัดการผู้ใช้ (UC19) - เฉพาะ admin
    """
    try:
        # ตรวจสอบสิทธิ์ admin
        if not current_user.get("is_admin"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied. Admin privileges required."
            )
        
        # สร้าง query
        query = db.query(User)
        
        # ค้นหาตามชื่อหรืออีเมล
        if search:
            query = query.filter(
                (User.username.contains(search)) | 
                (User.email.contains(search))
            )
        
        # กรองตาม role
        if role:
            query = query.filter(User.role == role)
        
        # นับจำนวนทั้งหมด
        total_users = query.count()
        
        # แบ่งหน้า
        offset = (page - 1) * limit
        users = query.offset(offset).limit(limit).all()
        
        # สร้างข้อมูลผู้ใช้
        user_list = []
        for user in users:
            # นับจำนวน conversations
            conversation_count = db.query(Conversation).filter(
                Conversation.user_id == user.id
            ).count()
            
            user_list.append({
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "role": user.role,
                "is_active": user.is_active,
                "created_at": user.created_at.isoformat(),
                "last_login": user.last_login.isoformat() if user.last_login else None,
                "conversation_count": conversation_count
            })
        
        logger.info(f"Users list retrieved by admin: {current_user.get('email')}")
        
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "users": user_list,
                "pagination": {
                    "page": page,
                    "limit": limit,
                    "total": total_users,
                    "pages": (total_users + limit - 1) // limit
                }
            }
        )
        
    except Exception as e:
        logger.error(f"Error managing users: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="เกิดข้อผิดพลาดในการจัดการผู้ใช้"
        )

@router.put("/users/{user_id}")
async def update_user(
    user_id: int,
    user_data: dict,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    อัปเดตข้อมูลผู้ใช้
    """
    try:
        # ตรวจสอบสิทธิ์ admin
        if not current_user.get("is_admin"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied. Admin privileges required."
            )
        
        # ดึงข้อมูลผู้ใช้
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # อัปเดตข้อมูล
        for key, value in user_data.items():
            if hasattr(user, key) and key not in ["id", "created_at"]:
                setattr(user, key, value)
        
        user.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(user)
        
        logger.info(f"User updated by admin: {user_id} by {current_user.get('email')}")
        
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={"message": "User updated successfully", "user_id": user_id}
        )
        
    except Exception as e:
        logger.error(f"Error updating user: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="เกิดข้อผิดพลาดในการอัปเดตผู้ใช้"
        )

@router.delete("/users/{user_id}")
async def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    ลบผู้ใช้
    """
    try:
        # ตรวจสอบสิทธิ์ admin
        if not current_user.get("is_admin"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied. Admin privileges required."
            )
        
        # ไม่สามารถลบตัวเองได้
        if user_id == current_user.get("id"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot delete yourself"
            )
        
        # ดึงข้อมูลผู้ใช้
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # ลบข้อมูลที่เกี่ยวข้อง
        db.query(Conversation).filter(Conversation.user_id == user_id).delete()
        db.query(Message).join(Conversation).filter(Conversation.user_id == user_id).delete()
        db.query(Document).filter(Document.user_id == user_id).delete()
        db.query(Feedback).filter(Feedback.user_id == user_id).delete()
        
        # ลบผู้ใช้
        db.delete(user)
        db.commit()
        
        logger.info(f"User deleted by admin: {user_id} by {current_user.get('email')}")
        
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={"message": "User deleted successfully"}
        )
        
    except Exception as e:
        logger.error(f"Error deleting user: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="เกิดข้อผิดพลาดในการลบผู้ใช้"
        )

@router.get("/statistics")
async def view_system_statistics(
    period: str = "7d",
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    ดูสถิติระบบ (UC20) - เฉพาะ admin
    """
    try:
        # ตรวจสอบสิทธิ์ admin
        if not current_user.get("is_admin"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied. Admin privileges required."
            )
        
        # คำนวณช่วงเวลา
        if period == "1d":
            start_date = datetime.utcnow() - timedelta(days=1)
        elif period == "7d":
            start_date = datetime.utcnow() - timedelta(days=7)
        elif period == "30d":
            start_date = datetime.utcnow() - timedelta(days=30)
        else:
            start_date = datetime.utcnow() - timedelta(days=7)
        
        # สถิติผู้ใช้
        total_users = db.query(User).count()
        active_users = db.query(User).filter(User.is_active == True).count()
        new_users = db.query(User).filter(User.created_at >= start_date).count()
        
        # สถิติการสนทนา
        total_conversations = db.query(Conversation).count()
        recent_conversations = db.query(Conversation).filter(
            Conversation.created_at >= start_date
        ).count()
        
        # สถิติข้อความ
        total_messages = db.query(Message).count()
        recent_messages = db.query(Message).filter(
            Message.created_at >= start_date
        ).count()
        
        # สถิติเอกสาร
        total_documents = db.query(Document).count()
        recent_documents = db.query(Document).filter(
            Document.created_at >= start_date
        ).count()
        
        # สถิติ feedback
        total_feedback = db.query(Feedback).count()
        recent_feedback = db.query(Feedback).filter(
            Feedback.created_at >= start_date
        ).count()
        
        # สถิติตามวัน (7 วันล่าสุด)
        daily_stats = []
        for i in range(7):
            date = datetime.utcnow() - timedelta(days=i)
            start_of_day = date.replace(hour=0, minute=0, second=0, microsecond=0)
            end_of_day = start_of_day + timedelta(days=1)
            
            daily_conversations = db.query(Conversation).filter(
                Conversation.created_at >= start_of_day,
                Conversation.created_at < end_of_day
            ).count()
            
            daily_messages = db.query(Message).filter(
                Message.created_at >= start_of_day,
                Message.created_at < end_of_day
            ).count()
            
            daily_stats.append({
                "date": start_of_day.strftime("%Y-%m-%d"),
                "conversations": daily_conversations,
                "messages": daily_messages
            })
        
        # สถิติระบบ
        system_stats = {
            "cpu_percent": psutil.cpu_percent(interval=1),
            "memory_percent": psutil.virtual_memory().percent,
            "disk_percent": psutil.disk_usage('/').percent,
            "platform": platform.platform(),
            "python_version": platform.python_version()
        }
        
        statistics = {
            "period": period,
            "users": {
                "total": total_users,
                "active": active_users,
                "new": new_users
            },
            "conversations": {
                "total": total_conversations,
                "recent": recent_conversations
            },
            "messages": {
                "total": total_messages,
                "recent": recent_messages
            },
            "documents": {
                "total": total_documents,
                "recent": recent_documents
            },
            "feedback": {
                "total": total_feedback,
                "recent": recent_feedback
            },
            "daily_stats": daily_stats,
            "system_stats": system_stats
        }
        
        logger.info(f"System statistics retrieved by admin: {current_user.get('email')}")
        
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content=statistics
        )
        
    except Exception as e:
        logger.error(f"Error retrieving system statistics: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="เกิดข้อผิดพลาดในการดึงสถิติระบบ"
        )

@router.post("/backup")
async def backup_system_data(
    backup_type: str = "full",
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    สำรองข้อมูลระบบ (UC21) - เฉพาะ admin
    """
    try:
        # ตรวจสอบสิทธิ์ admin
        if not current_user.get("is_admin"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied. Admin privileges required."
            )
        
        # สร้างโฟลเดอร์ backup
        backup_dir = Path("backups")
        backup_dir.mkdir(exist_ok=True)
        
        timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
        backup_filename = f"system_backup_{backup_type}_{timestamp}.json"
        backup_path = backup_dir / backup_filename
        
        # ดึงข้อมูลระบบ
        backup_data = {
            "backup_type": backup_type,
            "timestamp": datetime.utcnow().isoformat(),
            "users": [],
            "conversations": [],
            "messages": [],
            "documents": [],
            "feedback": [],
            "machines": []
        }
        
        if backup_type in ["full", "users"]:
            users = db.query(User).all()
            for user in users:
                backup_data["users"].append({
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "role": user.role,
                    "is_active": user.is_active,
                    "created_at": user.created_at.isoformat(),
                    "updated_at": user.updated_at.isoformat() if user.updated_at else None
                })
        
        if backup_type in ["full", "conversations"]:
            conversations = db.query(Conversation).all()
            for conv in conversations:
                backup_data["conversations"].append({
                    "id": conv.id,
                    "user_id": conv.user_id,
                    "machine_id": conv.machine_id,
                    "title": conv.title,
                    "created_at": conv.created_at.isoformat(),
                    "updated_at": conv.updated_at.isoformat()
                })
        
        if backup_type in ["full", "messages"]:
            messages = db.query(Message).all()
            for msg in messages:
                backup_data["messages"].append({
                    "id": msg.id,
                    "conversation_id": msg.conversation_id,
                    "content": msg.content,
                    "role": msg.role,
                    "created_at": msg.created_at.isoformat()
                })
        
        if backup_type in ["full", "documents"]:
            documents = db.query(Document).all()
            for doc in documents:
                backup_data["documents"].append({
                    "id": doc.id,
                    "user_id": doc.user_id,
                    "filename": doc.filename,
                    "file_path": doc.file_path,
                    "file_size": doc.file_size,
                    "created_at": doc.created_at.isoformat()
                })
        
        if backup_type in ["full", "feedback"]:
            feedback = db.query(Feedback).all()
            for fb in feedback:
                backup_data["feedback"].append({
                    "id": fb.id,
                    "user_id": fb.user_id,
                    "feedback_type": fb.feedback_type,
                    "feedback_text": fb.feedback_text,
                    "rating": fb.rating,
                    "category": fb.category,
                    "priority": fb.priority,
                    "created_at": fb.created_at.isoformat()
                })
        
        if backup_type in ["full", "machines"]:
            machines = db.query(MachineData).all()
            for machine in machines:
                backup_data["machines"].append({
                    "machine_id": machine.machine_id,
                    "system_info": machine.system_info,
                    "created_at": machine.created_at.isoformat(),
                    "updated_at": machine.updated_at.isoformat()
                })
        
        # บันทึกไฟล์ backup
        with open(backup_path, 'w', encoding='utf-8') as f:
            json.dump(backup_data, f, ensure_ascii=False, indent=2)
        
        logger.info(f"System backup created: {backup_filename} by {current_user.get('email')}")
        
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "message": "System backup created successfully",
                "filename": backup_filename,
                "backup_type": backup_type,
                "file_size": backup_path.stat().st_size
            }
        )
        
    except Exception as e:
        logger.error(f"Error creating system backup: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="เกิดข้อผิดพลาดในการสร้าง backup"
        )

@router.post("/restore")
async def restore_system_data(
    backup_file: str,
    restore_type: str = "full",
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    กู้คืนข้อมูลระบบ (UC22) - เฉพาะ admin
    """
    try:
        # ตรวจสอบสิทธิ์ admin
        if not current_user.get("is_admin"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied. Admin privileges required."
            )
        
        # ตรวจสอบไฟล์ backup
        backup_path = Path("backups") / backup_file
        if not backup_path.exists():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Backup file not found"
            )
        
        # อ่านไฟล์ backup
        with open(backup_path, 'r', encoding='utf-8') as f:
            backup_data = json.load(f)
        
        # ตรวจสอบข้อมูล backup
        if not backup_data.get("timestamp"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid backup file format"
            )
        
        restored_count = 0
        
        # กู้คืนข้อมูลตามประเภท
        if restore_type in ["full", "users"] and backup_data.get("users"):
            for user_data in backup_data["users"]:
                # ตรวจสอบว่าผู้ใช้มีอยู่แล้วหรือไม่
                existing_user = db.query(User).filter(User.email == user_data["email"]).first()
                if not existing_user:
                    user = User(**user_data)
                    db.add(user)
                    restored_count += 1
        
        if restore_type in ["full", "conversations"] and backup_data.get("conversations"):
            for conv_data in backup_data["conversations"]:
                existing_conv = db.query(Conversation).filter(Conversation.id == conv_data["id"]).first()
                if not existing_conv:
                    conversation = Conversation(**conv_data)
                    db.add(conversation)
                    restored_count += 1
        
        if restore_type in ["full", "messages"] and backup_data.get("messages"):
            for msg_data in backup_data["messages"]:
                existing_msg = db.query(Message).filter(Message.id == msg_data["id"]).first()
                if not existing_msg:
                    message = Message(**msg_data)
                    db.add(message)
                    restored_count += 1
        
        if restore_type in ["full", "documents"] and backup_data.get("documents"):
            for doc_data in backup_data["documents"]:
                existing_doc = db.query(Document).filter(Document.id == doc_data["id"]).first()
                if not existing_doc:
                    document = Document(**doc_data)
                    db.add(document)
                    restored_count += 1
        
        if restore_type in ["full", "feedback"] and backup_data.get("feedback"):
            for fb_data in backup_data["feedback"]:
                existing_fb = db.query(Feedback).filter(Feedback.id == fb_data["id"]).first()
                if not existing_fb:
                    feedback = Feedback(**fb_data)
                    db.add(feedback)
                    restored_count += 1
        
        if restore_type in ["full", "machines"] and backup_data.get("machines"):
            for machine_data in backup_data["machines"]:
                existing_machine = db.query(MachineData).filter(
                    MachineData.machine_id == machine_data["machine_id"]
                ).first()
                if not existing_machine:
                    machine = MachineData(**machine_data)
                    db.add(machine)
                    restored_count += 1
        
        db.commit()
        
        logger.info(f"System data restored: {backup_file} by {current_user.get('email')}, restored: {restored_count}")
        
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "message": "System data restored successfully",
                "backup_file": backup_file,
                "restore_type": restore_type,
                "restored_count": restored_count
            }
        )
        
    except Exception as e:
        logger.error(f"Error restoring system data: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="เกิดข้อผิดพลาดในการกู้คืนข้อมูล"
        )

@router.get("/settings")
async def get_system_settings(
    current_user: dict = Depends(get_current_user)
):
    """
    ดึงการตั้งค่าระบบ (UC23)
    """
    try:
        # ตรวจสอบสิทธิ์ admin
        if not current_user.get("is_admin"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied. Admin privileges required."
            )
        
        # อ่านการตั้งค่าจากไฟล์ config
        config_path = Path("config/system_config.json")
        if config_path.exists():
            with open(config_path, 'r', encoding='utf-8') as f:
                settings = json.load(f)
        else:
            # การตั้งค่าเริ่มต้น
            settings = {
                "system": {
                    "name": "LannaFinChat",
                    "version": "1.0.0",
                    "maintenance_mode": False
                },
                "chat": {
                    "max_message_length": 1000,
                    "max_conversation_length": 100,
                    "auto_save_interval": 30
                },
                "document": {
                    "max_file_size": 10485760,  # 10MB
                    "allowed_extensions": [".pdf"],
                    "auto_process": True
                },
                "security": {
                    "session_timeout": 3600,
                    "max_login_attempts": 5,
                    "password_min_length": 8
                }
            }
        
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content=settings
        )
        
    except Exception as e:
        logger.error(f"Error retrieving system settings: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="เกิดข้อผิดพลาดในการดึงการตั้งค่าระบบ"
        )

@router.put("/settings")
async def update_system_settings(
    settings: dict,
    current_user: dict = Depends(get_current_user)
):
    """
    อัปเดตการตั้งค่าระบบ
    """
    try:
        # ตรวจสอบสิทธิ์ admin
        if not current_user.get("is_admin"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied. Admin privileges required."
            )
        
        # สร้างโฟลเดอร์ config
        config_dir = Path("config")
        config_dir.mkdir(exist_ok=True)
        
        config_path = config_dir / "system_config.json"
        
        # บันทึกการตั้งค่า
        with open(config_path, 'w', encoding='utf-8') as f:
            json.dump(settings, f, ensure_ascii=False, indent=2)
        
        logger.info(f"System settings updated by admin: {current_user.get('email')}")
        
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={"message": "System settings updated successfully"}
        )
        
    except Exception as e:
        logger.error(f"Error updating system settings: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="เกิดข้อผิดพลาดในการอัปเดตการตั้งค่าระบบ"
        )

@router.get("/performance")
async def monitor_system_performance(
    current_user: dict = Depends(get_current_user)
):
    """
    ติดตามประสิทธิภาพระบบ (UC24) - เฉพาะ admin
    """
    try:
        # ตรวจสอบสิทธิ์ admin
        if not current_user.get("is_admin"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied. Admin privileges required."
            )
        
        # ข้อมูลประสิทธิภาพระบบ
        cpu_percent = psutil.cpu_percent(interval=1)
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage('/')
        network = psutil.net_io_counters()
        
        # ข้อมูลการใช้งานฐานข้อมูล
        db_stats = {
            "total_connections": len(psutil.connections()),
            "active_connections": len([c for c in psutil.connections() if c.status == 'ESTABLISHED'])
        }
        
        # ข้อมูลการใช้งานไฟล์
        file_stats = {
            "total_files": len(list(Path(".").rglob("*"))),
            "total_size": sum(f.stat().st_size for f in Path(".").rglob("*") if f.is_file())
        }
        
        # สถานะระบบ
        system_status = "healthy"
        if cpu_percent > 80 or memory.percent > 80 or disk.percent > 90:
            system_status = "warning"
        if cpu_percent > 95 or memory.percent > 95 or disk.percent > 95:
            system_status = "critical"
        
        performance_data = {
            "timestamp": datetime.utcnow().isoformat(),
            "status": system_status,
            "cpu": {
                "percent": cpu_percent,
                "count": psutil.cpu_count(),
                "frequency": psutil.cpu_freq()._asdict() if psutil.cpu_freq() else None
            },
            "memory": {
                "total": memory.total,
                "available": memory.available,
                "percent": memory.percent,
                "used": memory.used
            },
            "disk": {
                "total": disk.total,
                "used": disk.used,
                "free": disk.free,
                "percent": disk.percent
            },
            "network": {
                "bytes_sent": network.bytes_sent,
                "bytes_recv": network.bytes_recv,
                "packets_sent": network.packets_sent,
                "packets_recv": network.packets_recv
            },
            "database": db_stats,
            "files": file_stats,
            "platform": {
                "system": platform.system(),
                "release": platform.release(),
                "version": platform.version(),
                "machine": platform.machine(),
                "processor": platform.processor()
            }
        }
        
        logger.info(f"System performance monitored by admin: {current_user.get('email')}")
        
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content=performance_data
        )
        
    except Exception as e:
        logger.error(f"Error monitoring system performance: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="เกิดข้อผิดพลาดในการติดตามประสิทธิภาพระบบ"
        )
