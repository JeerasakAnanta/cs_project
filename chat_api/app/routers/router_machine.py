from fastapi import APIRouter, HTTPException, Depends, status, Request
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from typing import Optional, Dict, Any
from datetime import datetime
import json
import hashlib
import platform
import uuid
import os

from app.utils.database import get_db
from app.database.models import MachineData, Conversation, Message
from app.login_system.auth import get_current_user
from app.utils.logger import get_logger

router = APIRouter(prefix="/machine", tags=["Machine Management"])
logger = get_logger(__name__)

def generate_machine_id() -> str:
    """
    สร้าง Machine ID ที่ไม่ซ้ำกัน (UC25)
    """
    # รวมข้อมูลระบบเพื่อสร้าง unique identifier
    system_info = {
        "platform": platform.platform(),
        "machine": platform.machine(),
        "processor": platform.processor(),
        "node": platform.node(),
        "uuid": str(uuid.uuid4())
    }
    
    # สร้าง hash จากข้อมูลระบบ
    system_string = json.dumps(system_info, sort_keys=True)
    machine_id = hashlib.sha256(system_string.encode()).hexdigest()[:16]
    
    return machine_id

def get_system_info() -> Dict[str, Any]:
    """
    ดึงข้อมูลระบบ
    """
    return {
        "platform": platform.platform(),
        "machine": platform.machine(),
        "processor": platform.processor(),
        "node": platform.node(),
        "python_version": platform.python_version(),
        "timestamp": datetime.utcnow().isoformat()
    }

@router.post("/generate-id")
async def generate_machine_id_endpoint(
    request: Request,
    db: Session = Depends(get_db)
):
    """
    สร้าง Machine ID ใหม่ (UC25)
    """
    try:
        # สร้าง Machine ID
        machine_id = generate_machine_id()
        
        # ดึงข้อมูลระบบ
        system_info = get_system_info()
        
        # ตรวจสอบว่า Machine ID นี้มีอยู่แล้วหรือไม่
        existing_machine = db.query(MachineData).filter(
            MachineData.machine_id == machine_id
        ).first()
        
        if existing_machine:
            # อัปเดตข้อมูลระบบ
            existing_machine.system_info = json.dumps(system_info)
            existing_machine.updated_at = datetime.utcnow()
            db.commit()
            db.refresh(existing_machine)
            
            logger.info(f"Machine ID updated: {machine_id}")
            
            return JSONResponse(
                status_code=status.HTTP_200_OK,
                content={
                    "message": "Machine ID อัปเดตแล้ว",
                    "machine_id": machine_id,
                    "system_info": system_info,
                    "is_new": False
                }
            )
        else:
            # สร้าง Machine Data ใหม่
            machine_data = MachineData(
                machine_id=machine_id,
                system_info=json.dumps(system_info),
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            
            db.add(machine_data)
            db.commit()
            db.refresh(machine_data)
            
            logger.info(f"New Machine ID generated: {machine_id}")
            
            return JSONResponse(
                status_code=status.HTTP_201_CREATED,
                content={
                    "message": "Machine ID ใหม่ถูกสร้างแล้ว",
                    "machine_id": machine_id,
                    "system_info": system_info,
                    "is_new": True
                }
            )
            
    except Exception as e:
        logger.error(f"Error generating Machine ID: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="เกิดข้อผิดพลาดในการสร้าง Machine ID"
        )

@router.get("/info/{machine_id}")
async def view_machine_info(
    machine_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[dict] = Depends(get_current_user)
):
    """
    ดูข้อมูลเครื่อง (UC26)
    """
    try:
        # ดึงข้อมูลเครื่อง
        machine_data = db.query(MachineData).filter(
            MachineData.machine_id == machine_id
        ).first()
        
        if not machine_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Machine ID ไม่พบ"
            )
        
        # ตรวจสอบสิทธิ์ (เฉพาะเจ้าของหรือ admin)
        if current_user and not current_user.get("is_admin"):
            # ตรวจสอบว่าเป็นเจ้าของ machine_id หรือไม่
            # (ต้องมี logic เพิ่มเติมในการเชื่อมโยง user กับ machine_id)
            pass
        
        # ดึงข้อมูลเพิ่มเติม
        system_info = json.loads(machine_data.system_info) if machine_data.system_info else {}
        
        # นับจำนวน conversations และ messages
        conversation_count = db.query(Conversation).filter(
            Conversation.machine_id == machine_id
        ).count()
        
        message_count = db.query(Message).join(Conversation).filter(
            Conversation.machine_id == machine_id
        ).count()
        
        machine_info = {
            "machine_id": machine_data.machine_id,
            "system_info": system_info,
            "created_at": machine_data.created_at.isoformat(),
            "updated_at": machine_data.updated_at.isoformat(),
            "conversation_count": conversation_count,
            "message_count": message_count
        }
        
        logger.info(f"Machine info retrieved: {machine_id}")
        
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content=machine_info
        )
        
    except Exception as e:
        logger.error(f"Error retrieving machine info: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="เกิดข้อผิดพลาดในการดึงข้อมูลเครื่อง"
        )

@router.post("/reset/{machine_id}")
async def reset_machine_id(
    machine_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[dict] = Depends(get_current_user)
):
    """
    รีเซ็ต Machine ID (UC27)
    """
    try:
        # ดึงข้อมูลเครื่องปัจจุบัน
        current_machine = db.query(MachineData).filter(
            MachineData.machine_id == machine_id
        ).first()
        
        if not current_machine:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Machine ID ไม่พบ"
            )
        
        # สร้าง Machine ID ใหม่
        new_machine_id = generate_machine_id()
        system_info = get_system_info()
        
        # สร้าง Machine Data ใหม่
        new_machine_data = MachineData(
            machine_id=new_machine_id,
            system_info=json.dumps(system_info),
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        db.add(new_machine_data)
        
        # อัปเดต conversations และ messages ให้ใช้ machine_id ใหม่
        db.query(Conversation).filter(
            Conversation.machine_id == machine_id
        ).update({"machine_id": new_machine_id})
        
        # ลบ Machine Data เก่า
        db.delete(current_machine)
        
        db.commit()
        
        logger.info(f"Machine ID reset: {machine_id} -> {new_machine_id}")
        
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "message": "Machine ID ถูกรีเซ็ตแล้ว",
                "old_machine_id": machine_id,
                "new_machine_id": new_machine_id,
                "system_info": system_info
            }
        )
        
    except Exception as e:
        logger.error(f"Error resetting Machine ID: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="เกิดข้อผิดพลาดในการรีเซ็ต Machine ID"
        )

@router.post("/export-data/{machine_id}")
async def export_machine_data(
    machine_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[dict] = Depends(get_current_user)
):
    """
    ส่งออกข้อมูลเครื่อง (UC28)
    """
    try:
        # ดึงข้อมูลเครื่อง
        machine_data = db.query(MachineData).filter(
            MachineData.machine_id == machine_id
        ).first()
        
        if not machine_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Machine ID ไม่พบ"
            )
        
        # ดึงข้อมูล conversations
        conversations = db.query(Conversation).filter(
            Conversation.machine_id == machine_id
        ).all()
        
        # ดึงข้อมูล messages
        messages = db.query(Message).join(Conversation).filter(
            Conversation.machine_id == machine_id
        ).all()
        
        # สร้างข้อมูล export
        export_data = {
            "machine_id": machine_id,
            "export_timestamp": datetime.utcnow().isoformat(),
            "system_info": json.loads(machine_data.system_info) if machine_data.system_info else {},
            "conversations": [
                {
                    "id": conv.id,
                    "title": conv.title,
                    "created_at": conv.created_at.isoformat(),
                    "updated_at": conv.updated_at.isoformat(),
                    "messages": [
                        {
                            "id": msg.id,
                            "content": msg.content,
                            "role": msg.role,
                            "created_at": msg.created_at.isoformat()
                        }
                        for msg in messages if msg.conversation_id == conv.id
                    ]
                }
                for conv in conversations
            ]
        }
        
        logger.info(f"Machine data exported: {machine_id}")
        
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "message": "ข้อมูลเครื่องถูกส่งออกแล้ว",
                "export_data": export_data,
                "filename": f"machine_data_{machine_id}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.json"
            }
        )
        
    except Exception as e:
        logger.error(f"Error exporting machine data: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="เกิดข้อผิดพลาดในการส่งออกข้อมูลเครื่อง"
        )

@router.post("/import-data")
async def import_machine_data(
    machine_id: str,
    import_data: dict,
    db: Session = Depends(get_db),
    current_user: Optional[dict] = Depends(get_current_user)
):
    """
    นำเข้าข้อมูลเครื่อง (UC29)
    """
    try:
        # ตรวจสอบข้อมูล import
        if not import_data.get("conversations"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="ข้อมูล import ไม่ถูกต้อง"
            )
        
        # ตรวจสอบว่า Machine ID นี้มีอยู่แล้วหรือไม่
        existing_machine = db.query(MachineData).filter(
            MachineData.machine_id == machine_id
        ).first()
        
        if not existing_machine:
            # สร้าง Machine Data ใหม่
            system_info = get_system_info()
            machine_data = MachineData(
                machine_id=machine_id,
                system_info=json.dumps(system_info),
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            db.add(machine_data)
        else:
            # อัปเดตข้อมูลระบบ
            existing_machine.system_info = json.dumps(get_system_info())
            existing_machine.updated_at = datetime.utcnow()
        
        # นำเข้าข้อมูล conversations และ messages
        imported_conversations = []
        imported_messages = []
        
        for conv_data in import_data["conversations"]:
            # สร้าง conversation
            conversation = Conversation(
                id=conv_data["id"],
                machine_id=machine_id,
                title=conv_data.get("title", "Imported Conversation"),
                created_at=datetime.fromisoformat(conv_data["created_at"]),
                updated_at=datetime.fromisoformat(conv_data["updated_at"])
            )
            db.add(conversation)
            imported_conversations.append(conversation)
            
            # สร้าง messages
            for msg_data in conv_data.get("messages", []):
                message = Message(
                    id=msg_data["id"],
                    conversation_id=conv_data["id"],
                    content=msg_data["content"],
                    role=msg_data["role"],
                    created_at=datetime.fromisoformat(msg_data["created_at"])
                )
                db.add(message)
                imported_messages.append(message)
        
        db.commit()
        
        logger.info(f"Machine data imported: {machine_id}, conversations: {len(imported_conversations)}, messages: {len(imported_messages)}")
        
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "message": "ข้อมูลเครื่องถูกนำเข้าสำเร็จ",
                "imported_conversations": len(imported_conversations),
                "imported_messages": len(imported_messages),
                "machine_id": machine_id
            }
        )
        
    except Exception as e:
        logger.error(f"Error importing machine data: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="เกิดข้อผิดพลาดในการนำเข้าข้อมูลเครื่อง"
        )

@router.get("/list")
async def list_machines(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    รายการเครื่องทั้งหมด (เฉพาะ admin)
    """
    try:
        # ตรวจสอบสิทธิ์ admin
        if not current_user.get("is_admin"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied. Admin privileges required."
            )
        
        # ดึงข้อมูลเครื่องทั้งหมด
        machines = db.query(MachineData).all()
        
        machine_list = []
        for machine in machines:
            # นับจำนวน conversations และ messages
            conversation_count = db.query(Conversation).filter(
                Conversation.machine_id == machine.machine_id
            ).count()
            
            message_count = db.query(Message).join(Conversation).filter(
                Conversation.machine_id == machine.machine_id
            ).count()
            
            machine_list.append({
                "machine_id": machine.machine_id,
                "system_info": json.loads(machine.system_info) if machine.system_info else {},
                "created_at": machine.created_at.isoformat(),
                "updated_at": machine.updated_at.isoformat(),
                "conversation_count": conversation_count,
                "message_count": message_count
            })
        
        logger.info(f"Machine list retrieved by admin: {current_user.get('email')}")
        
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={"machines": machine_list}
        )
        
    except Exception as e:
        logger.error(f"Error listing machines: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="เกิดข้อผิดพลาดในการดึงรายการเครื่อง"
        )
