from fastapi import APIRouter, HTTPException, Depends, status, WebSocket, WebSocketDisconnect
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime
import json
import uuid
import asyncio
import logging

from app.utils.database import get_db
from app.database.models import Conversation, Message, Document, DocumentChunk
from app.login_system.auth import get_current_user
from app.rag_system.rag_engine import RAGEngine

router = APIRouter(prefix="/chat-enhanced", tags=["Enhanced Chat System"])
logger = logging.getLogger(__name__)

# สร้าง RAG Engine
rag_engine = RAGEngine()

@router.post("/conversations/create")
async def create_conversation(
    title: Optional[str] = None,
    machine_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: Optional[dict] = Depends(get_current_user)
):
    """
    สร้างการสนทนาใหม่ (UC8)
    """
    try:
        # สร้าง conversation ID
        conversation_id = str(uuid.uuid4())
        
        # กำหนดชื่อการสนทนา
        if not title:
            title = f"การสนทนาใหม่ {datetime.utcnow().strftime('%Y-%m-%d %H:%M')}"
        
        # สร้าง conversation
        conversation_data = {
            "id": conversation_id,
            "title": title,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        if current_user:
            conversation_data["user_id"] = current_user.get("id")
            conversation_data["user_type"] = "authenticated"
        else:
            conversation_data["machine_id"] = machine_id
            conversation_data["user_type"] = "guest"
        
        conversation = Conversation(**conversation_data)
        db.add(conversation)
        db.commit()
        db.refresh(conversation)
        
        logger.info(f"New conversation created: {conversation_id} by {current_user.get('email') if current_user else f'guest:{machine_id}'}")
        
        return JSONResponse(
            status_code=status.HTTP_201_CREATED,
            content={
                "message": "การสนทนาใหม่ถูกสร้างแล้ว",
                "conversation": {
                    "id": conversation.id,
                    "title": conversation.title,
                    "created_at": conversation.created_at.isoformat(),
                    "user_type": conversation.user_type
                }
            }
        )
        
    except Exception as e:
        logger.error(f"Error creating conversation: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="เกิดข้อผิดพลาดในการสร้างการสนทนา"
        )

@router.get("/conversations")
async def get_conversations(
    page: int = 1,
    limit: int = 20,
    machine_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: Optional[dict] = Depends(get_current_user)
):
    """
    ดึงรายการการสนทนา (UC9)
    """
    try:
        # สร้าง query
        query = db.query(Conversation)
        
        if current_user:
            query = query.filter(Conversation.user_id == current_user.get("id"))
        else:
            if not machine_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Machine ID required for guest users"
                )
            query = query.filter(Conversation.machine_id == machine_id)
        
        # นับจำนวนทั้งหมด
        total_conversations = query.count()
        
        # แบ่งหน้า
        offset = (page - 1) * limit
        conversations = query.order_by(Conversation.updated_at.desc()).offset(offset).limit(limit).all()
        
        # สร้างข้อมูลการสนทนา
        conversation_list = []
        for conv in conversations:
            # นับจำนวนข้อความ
            message_count = db.query(Message).filter(Message.conversation_id == conv.id).count()
            
            conversation_list.append({
                "id": conv.id,
                "title": conv.title,
                "created_at": conv.created_at.isoformat(),
                "updated_at": conv.updated_at.isoformat(),
                "message_count": message_count,
                "user_type": conv.user_type
            })
        
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "conversations": conversation_list,
                "pagination": {
                    "page": page,
                    "limit": limit,
                    "total": total_conversations,
                    "pages": (total_conversations + limit - 1) // limit
                }
            }
        )
        
    except Exception as e:
        logger.error(f"Error retrieving conversations: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="เกิดข้อผิดพลาดในการดึงรายการการสนทนา"
        )

@router.get("/conversations/{conversation_id}")
async def get_conversation_detail(
    conversation_id: str,
    machine_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: Optional[dict] = Depends(get_current_user)
):
    """
    ดึงรายละเอียดการสนทนา
    """
    try:
        # ดึงข้อมูลการสนทนา
        query = db.query(Conversation).filter(Conversation.id == conversation_id)
        
        if current_user:
            query = query.filter(Conversation.user_id == current_user.get("id"))
        else:
            if not machine_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Machine ID required for guest users"
                )
            query = query.filter(Conversation.machine_id == machine_id)
        
        conversation = query.first()
        
        if not conversation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="การสนทนาไม่พบ"
            )
        
        # ดึงข้อความทั้งหมด
        messages = db.query(Message).filter(
            Message.conversation_id == conversation_id
        ).order_by(Message.created_at.asc()).all()
        
        # สร้างข้อมูลการสนทนา
        conversation_data = {
            "id": conversation.id,
            "title": conversation.title,
            "created_at": conversation.created_at.isoformat(),
            "updated_at": conversation.updated_at.isoformat(),
            "user_type": conversation.user_type,
            "messages": [
                {
                    "id": msg.id,
                    "content": msg.content,
                    "role": msg.role,
                    "created_at": msg.created_at.isoformat()
                }
                for msg in messages
            ]
        }
        
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content=conversation_data
        )
        
    except Exception as e:
        logger.error(f"Error retrieving conversation detail: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="เกิดข้อผิดพลาดในการดึงรายละเอียดการสนทนา"
        )

@router.post("/conversations/{conversation_id}/messages")
async def send_message(
    conversation_id: str,
    content: str,
    machine_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: Optional[dict] = Depends(get_current_user)
):
    """
    ส่งข้อความ (UC6)
    """
    try:
        if not content.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="ข้อความไม่สามารถว่างได้"
            )
        
        # ตรวจสอบการสนทนา
        query = db.query(Conversation).filter(Conversation.id == conversation_id)
        
        if current_user:
            query = query.filter(Conversation.user_id == current_user.get("id"))
        else:
            if not machine_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Machine ID required for guest users"
                )
            query = query.filter(Conversation.machine_id == machine_id)
        
        conversation = query.first()
        
        if not conversation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="การสนทนาไม่พบ"
            )
        
        # บันทึกข้อความของผู้ใช้
        user_message = Message(
            conversation_id=conversation_id,
            content=content,
            role="user",
            created_at=datetime.utcnow()
        )
        db.add(user_message)
        db.commit()
        db.refresh(user_message)
        
        # อัปเดตเวลาการสนทนา
        conversation.updated_at = datetime.utcnow()
        db.commit()
        
        # สร้างคำตอบด้วย RAG
        try:
            # ค้นหาข้อมูลที่เกี่ยวข้อง
            relevant_docs = await rag_engine.search_relevant_documents(content)
            
            # สร้างคำตอบ
            response = await rag_engine.generate_response(content, relevant_docs)
            
            # บันทึกคำตอบ
            assistant_message = Message(
                conversation_id=conversation_id,
                content=response,
                role="assistant",
                created_at=datetime.utcnow()
            )
            db.add(assistant_message)
            db.commit()
            db.refresh(assistant_message)
            
            logger.info(f"Message sent and response generated: conversation_id={conversation_id}")
            
            return JSONResponse(
                status_code=status.HTTP_200_OK,
                content={
                    "message": "ข้อความถูกส่งและได้รับคำตอบแล้ว",
                    "user_message": {
                        "id": user_message.id,
                        "content": user_message.content,
                        "role": user_message.role,
                        "created_at": user_message.created_at.isoformat()
                    },
                    "assistant_message": {
                        "id": assistant_message.id,
                        "content": assistant_message.content,
                        "role": assistant_message.role,
                        "created_at": assistant_message.created_at.isoformat()
                    },
                    "relevant_documents": relevant_docs
                }
            )
            
        except Exception as e:
            logger.error(f"Error generating response: {str(e)}")
            
            # บันทึกข้อความแจ้งข้อผิดพลาด
            error_message = Message(
                conversation_id=conversation_id,
                content="ขออภัย เกิดข้อผิดพลาดในการสร้างคำตอบ กรุณาลองใหม่อีกครั้ง",
                role="assistant",
                created_at=datetime.utcnow()
            )
            db.add(error_message)
            db.commit()
            
            return JSONResponse(
                status_code=status.HTTP_200_OK,
                content={
                    "message": "ข้อความถูกส่งแล้ว แต่เกิดข้อผิดพลาดในการสร้างคำตอบ",
                    "user_message": {
                        "id": user_message.id,
                        "content": user_message.content,
                        "role": user_message.role,
                        "created_at": user_message.created_at.isoformat()
                    },
                    "error": "เกิดข้อผิดพลาดในการสร้างคำตอบ"
                }
            )
        
    except Exception as e:
        logger.error(f"Error sending message: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="เกิดข้อผิดพลาดในการส่งข้อความ"
        )

@router.delete("/conversations/{conversation_id}")
async def delete_conversation(
    conversation_id: str,
    machine_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: Optional[dict] = Depends(get_current_user)
):
    """
    ลบการสนทนา
    """
    try:
        # ตรวจสอบการสนทนา
        query = db.query(Conversation).filter(Conversation.id == conversation_id)
        
        if current_user:
            query = query.filter(Conversation.user_id == current_user.get("id"))
        else:
            if not machine_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Machine ID required for guest users"
                )
            query = query.filter(Conversation.machine_id == machine_id)
        
        conversation = query.first()
        
        if not conversation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="การสนทนาไม่พบ"
            )
        
        # ลบข้อความทั้งหมด
        db.query(Message).filter(Message.conversation_id == conversation_id).delete()
        
        # ลบการสนทนา
        db.delete(conversation)
        db.commit()
        
        logger.info(f"Conversation deleted: {conversation_id}")
        
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={"message": "การสนทนาถูกลบแล้ว"}
        )
        
    except Exception as e:
        logger.error(f"Error deleting conversation: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="เกิดข้อผิดพลาดในการลบการสนทนา"
        )

@router.delete("/conversations")
async def clear_conversation_history(
    machine_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: Optional[dict] = Depends(get_current_user)
):
    """
    ล้างประวัติการสนทนาทั้งหมด (UC10)
    """
    try:
        # สร้าง query
        query = db.query(Conversation)
        
        if current_user:
            query = query.filter(Conversation.user_id == current_user.get("id"))
        else:
            if not machine_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Machine ID required for guest users"
                )
            query = query.filter(Conversation.machine_id == machine_id)
        
        conversations = query.all()
        
        if not conversations:
            return JSONResponse(
                status_code=status.HTTP_200_OK,
                content={"message": "ไม่มีประวัติการสนทนาให้ลบ"}
            )
        
        deleted_count = 0
        
        for conversation in conversations:
            # ลบข้อความทั้งหมด
            message_count = db.query(Message).filter(
                Message.conversation_id == conversation.id
            ).delete()
            
            # ลบการสนทนา
            db.delete(conversation)
            deleted_count += 1
        
        db.commit()
        
        logger.info(f"Conversation history cleared: {deleted_count} conversations")
        
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "message": f"ล้างประวัติการสนทนาแล้ว {deleted_count} การสนทนา",
                "deleted_count": deleted_count
            }
        )
        
    except Exception as e:
        logger.error(f"Error clearing conversation history: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="เกิดข้อผิดพลาดในการล้างประวัติการสนทนา"
        )

@router.post("/conversations/export")
async def export_conversation_data(
    conversation_ids: List[str],
    format: str = "json",
    machine_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: Optional[dict] = Depends(get_current_user)
):
    """
    ส่งออกข้อมูลการสนทนา (UC11)
    """
    try:
        # ตรวจสอบสิทธิ์
        query = db.query(Conversation)
        
        if current_user:
            query = query.filter(Conversation.user_id == current_user.get("id"))
        else:
            if not machine_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Machine ID required for guest users"
                )
            query = query.filter(Conversation.machine_id == machine_id)
        
        # ดึงการสนทนาที่ต้องการ
        conversations = query.filter(Conversation.id.in_(conversation_ids)).all()
        
        if not conversations:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="ไม่พบการสนทนาที่ต้องการส่งออก"
            )
        
        # รวบรวมข้อมูล
        export_data = {
            "export_timestamp": datetime.utcnow().isoformat(),
            "format": format,
            "conversations": []
        }
        
        for conversation in conversations:
            # ดึงข้อความทั้งหมด
            messages = db.query(Message).filter(
                Message.conversation_id == conversation.id
            ).order_by(Message.created_at.asc()).all()
            
            conversation_data = {
                "id": conversation.id,
                "title": conversation.title,
                "created_at": conversation.created_at.isoformat(),
                "updated_at": conversation.updated_at.isoformat(),
                "messages": [
                    {
                        "id": msg.id,
                        "content": msg.content,
                        "role": msg.role,
                        "created_at": msg.created_at.isoformat()
                    }
                    for msg in messages
                ]
            }
            
            export_data["conversations"].append(conversation_data)
        
        # สร้างไฟล์ export
        if format == "json":
            filename = f"conversations_export_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.json"
            content = json.dumps(export_data, ensure_ascii=False, indent=2)
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Format not supported. Use 'json'"
            )
        
        logger.info(f"Conversation data exported: {len(conversations)} conversations")
        
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "message": "ข้อมูลการสนทนาถูกส่งออกแล้ว",
                "filename": filename,
                "format": format,
                "conversation_count": len(conversations),
                "export_data": export_data
            }
        )
        
    except Exception as e:
        logger.error(f"Error exporting conversation data: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="เกิดข้อผิดพลาดในการส่งออกข้อมูลการสนทนา"
        )

@router.post("/conversations/import")
async def import_conversation_data(
    import_data: dict,
    machine_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: Optional[dict] = Depends(get_current_user)
):
    """
    นำเข้าข้อมูลการสนทนา (UC12)
    """
    try:
        # ตรวจสอบข้อมูล import
        if not import_data.get("conversations"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="ข้อมูล import ไม่ถูกต้อง"
            )
        
        imported_count = 0
        
        for conv_data in import_data["conversations"]:
            try:
                # สร้างการสนทนาใหม่
                conversation_data = {
                    "id": str(uuid.uuid4()),  # สร้าง ID ใหม่
                    "title": conv_data.get("title", "Imported Conversation"),
                    "created_at": datetime.fromisoformat(conv_data["created_at"]),
                    "updated_at": datetime.fromisoformat(conv_data["updated_at"])
                }
                
                if current_user:
                    conversation_data["user_id"] = current_user.get("id")
                    conversation_data["user_type"] = "authenticated"
                else:
                    conversation_data["machine_id"] = machine_id
                    conversation_data["user_type"] = "guest"
                
                conversation = Conversation(**conversation_data)
                db.add(conversation)
                db.commit()
                db.refresh(conversation)
                
                # นำเข้าข้อความ
                for msg_data in conv_data.get("messages", []):
                    message = Message(
                        id=str(uuid.uuid4()),  # สร้าง ID ใหม่
                        conversation_id=conversation.id,
                        content=msg_data["content"],
                        role=msg_data["role"],
                        created_at=datetime.fromisoformat(msg_data["created_at"])
                    )
                    db.add(message)
                
                imported_count += 1
                
            except Exception as e:
                logger.error(f"Error importing conversation: {str(e)}")
                continue
        
        db.commit()
        
        logger.info(f"Conversation data imported: {imported_count} conversations")
        
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "message": f"นำเข้าข้อมูลการสนทนาแล้ว {imported_count} การสนทนา",
                "imported_count": imported_count
            }
        )
        
    except Exception as e:
        logger.error(f"Error importing conversation data: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="เกิดข้อผิดพลาดในการนำเข้าข้อมูลการสนทนา"
        )

@router.websocket("/ws/{conversation_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    conversation_id: str,
    machine_id: Optional[str] = None
):
    """
    WebSocket endpoint สำหรับการแชตแบบ real-time
    """
    await websocket.accept()
    
    try:
        while True:
            # รับข้อความจาก WebSocket
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            # ประมวลผลข้อความ
            if message_data.get("type") == "message":
                content = message_data.get("content", "")
                
                # ส่งข้อความกลับ
                response = {
                    "type": "response",
                    "content": f"ได้รับข้อความ: {content}",
                    "timestamp": datetime.utcnow().isoformat()
                }
                
                await websocket.send_text(json.dumps(response))
                
    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected: {conversation_id}")
    except Exception as e:
        logger.error(f"WebSocket error: {str(e)}")
        await websocket.close()
