from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime
import json
import asyncio
import qdrant_client
from qdrant_client.models import (
    Distance, VectorParams, CreateCollection, 
    PointStruct, Filter, FieldCondition, MatchValue
)

from app.utils.database import get_db
from app.database.models import Document, DocumentChunk
from app.login_system.auth import get_current_user
from app.utils.logger import get_logger
from app.config.settings import get_settings

router = APIRouter(prefix="/vector", tags=["Vector Database Management"])
logger = get_logger(__name__)

# สร้าง Qdrant client
def get_qdrant_client():
    settings = get_settings()
    return qdrant_client.QdrantClient(
        host=settings.qdrant_host,
        port=settings.qdrant_port
    )

@router.post("/collections/create")
async def create_vector_collection(
    collection_name: str,
    vector_size: int = 1536,  # OpenAI embedding size
    distance: str = "cosine",
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    สร้าง collection ในฐานข้อมูลเวกเตอร์ (UC33)
    """
    try:
        # ตรวจสอบสิทธิ์ admin
        if not current_user.get("is_admin"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied. Admin privileges required."
            )
        
        # สร้าง Qdrant client
        client = get_qdrant_client()
        
        # ตรวจสอบว่า collection มีอยู่แล้วหรือไม่
        collections = client.get_collections()
        existing_collections = [col.name for col in collections.collections]
        
        if collection_name in existing_collections:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Collection '{collection_name}' already exists"
            )
        
        # เลือก distance metric
        if distance == "cosine":
            distance_metric = Distance.COSINE
        elif distance == "euclidean":
            distance_metric = Distance.EUCLID
        elif distance == "dot":
            distance_metric = Distance.DOT
        else:
            distance_metric = Distance.COSINE
        
        # สร้าง collection
        client.create_collection(
            collection_name=collection_name,
            vectors_config=VectorParams(
                size=vector_size,
                distance=distance_metric
            )
        )
        
        # บันทึกข้อมูล collection ในฐานข้อมูล
        collection_info = {
            "name": collection_name,
            "vector_size": vector_size,
            "distance_metric": distance,
            "created_at": datetime.utcnow().isoformat(),
            "created_by": current_user.get("email")
        }
        
        logger.info(f"Vector collection created: {collection_name} by {current_user.get('email')}")
        
        return JSONResponse(
            status_code=status.HTTP_201_CREATED,
            content={
                "message": f"Collection '{collection_name}' created successfully",
                "collection_info": collection_info
            }
        )
        
    except Exception as e:
        logger.error(f"Error creating vector collection: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="เกิดข้อผิดพลาดในการสร้าง vector collection"
        )

@router.get("/collections/list")
async def list_vector_collections(
    current_user: dict = Depends(get_current_user)
):
    """
    รายการ collections ทั้งหมด
    """
    try:
        # ตรวจสอบสิทธิ์ admin
        if not current_user.get("is_admin"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied. Admin privileges required."
            )
        
        # สร้าง Qdrant client
        client = get_qdrant_client()
        
        # ดึงรายการ collections
        collections = client.get_collections()
        
        collection_list = []
        for collection in collections.collections:
            # ดึงข้อมูล collection
            collection_info = client.get_collection(collection.name)
            
            collection_list.append({
                "name": collection.name,
                "vector_count": collection_info.vectors_count,
                "points_count": collection_info.points_count,
                "segments_count": collection_info.segments_count,
                "status": collection_info.status,
                "optimizer_status": collection_info.optimizer_status
            })
        
        logger.info(f"Vector collections listed by admin: {current_user.get('email')}")
        
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={"collections": collection_list}
        )
        
    except Exception as e:
        logger.error(f"Error listing vector collections: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="เกิดข้อผิดพลาดในการดึงรายการ collections"
        )

@router.delete("/collections/{collection_name}")
async def delete_vector_collection(
    collection_name: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    ลบ vector collection
    """
    try:
        # ตรวจสอบสิทธิ์ admin
        if not current_user.get("is_admin"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied. Admin privileges required."
            )
        
        # สร้าง Qdrant client
        client = get_qdrant_client()
        
        # ตรวจสอบว่า collection มีอยู่หรือไม่
        collections = client.get_collections()
        existing_collections = [col.name for col in collections.collections]
        
        if collection_name not in existing_collections:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Collection '{collection_name}' not found"
            )
        
        # ลบ collection
        client.delete_collection(collection_name)
        
        # ลบข้อมูล chunks ที่เกี่ยวข้อง
        db.query(DocumentChunk).filter(
            DocumentChunk.collection_name == collection_name
        ).delete()
        db.commit()
        
        logger.info(f"Vector collection deleted: {collection_name} by {current_user.get('email')}")
        
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={"message": f"Collection '{collection_name}' deleted successfully"}
        )
        
    except Exception as e:
        logger.error(f"Error deleting vector collection: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="เกิดข้อผิดพลาดในการลบ vector collection"
        )

@router.post("/embeddings/update")
async def update_embeddings(
    document_id: Optional[int] = None,
    collection_name: str = "default",
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    อัปเดต embeddings ในฐานข้อมูลเวกเตอร์ (UC34)
    """
    try:
        # ตรวจสอบสิทธิ์ admin
        if not current_user.get("is_admin"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied. Admin privileges required."
            )
        
        # สร้าง Qdrant client
        client = get_qdrant_client()
        
        # ตรวจสอบว่า collection มีอยู่หรือไม่
        collections = client.get_collections()
        existing_collections = [col.name for col in collections.collections]
        
        if collection_name not in existing_collections:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Collection '{collection_name}' not found"
            )
        
        # ดึงเอกสารที่ต้องอัปเดต
        if document_id:
            documents = db.query(Document).filter(Document.id == document_id).all()
        else:
            documents = db.query(Document).all()
        
        updated_count = 0
        
        for document in documents:
            # ดึง chunks ของเอกสาร
            chunks = db.query(DocumentChunk).filter(
                DocumentChunk.document_id == document.id
            ).all()
            
            for chunk in chunks:
                # สร้าง embedding ใหม่ (ต้องใช้ OpenAI API หรือ embedding service)
                # ตัวอย่างการสร้าง embedding (ต้องปรับตามระบบจริง)
                embedding = await generate_embedding(chunk.content)
                
                # อัปเดตใน Qdrant
                point = PointStruct(
                    id=chunk.id,
                    vector=embedding,
                    payload={
                        "document_id": document.id,
                        "chunk_id": chunk.id,
                        "content": chunk.content,
                        "filename": document.filename,
                        "created_at": chunk.created_at.isoformat()
                    }
                )
                
                # ลบ point เก่า (ถ้ามี)
                try:
                    client.delete(
                        collection_name=collection_name,
                        points_selector=[chunk.id]
                    )
                except:
                    pass
                
                # เพิ่ม point ใหม่
                client.upsert(
                    collection_name=collection_name,
                    points=[point]
                )
                
                # อัปเดต collection_name ใน chunk
                chunk.collection_name = collection_name
                chunk.updated_at = datetime.utcnow()
                
                updated_count += 1
        
        db.commit()
        
        logger.info(f"Embeddings updated: {updated_count} chunks by {current_user.get('email')}")
        
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "message": f"Updated {updated_count} embeddings successfully",
                "updated_count": updated_count,
                "collection_name": collection_name
            }
        )
        
    except Exception as e:
        logger.error(f"Error updating embeddings: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="เกิดข้อผิดพลาดในการอัปเดต embeddings"
        )

@router.post("/search")
async def search_similar_documents(
    query: str,
    collection_name: str = "default",
    limit: int = 10,
    threshold: float = 0.7,
    db: Session = Depends(get_db),
    current_user: Optional[dict] = Depends(get_current_user)
):
    """
    ค้นหาเอกสารที่คล้ายกัน (UC35)
    """
    try:
        # สร้าง Qdrant client
        client = get_qdrant_client()
        
        # ตรวจสอบว่า collection มีอยู่หรือไม่
        collections = client.get_collections()
        existing_collections = [col.name for col in collections.collections]
        
        if collection_name not in existing_collections:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Collection '{collection_name}' not found"
            )
        
        # สร้าง embedding สำหรับคำค้นหา
        query_embedding = await generate_embedding(query)
        
        # ค้นหาใน Qdrant
        search_results = client.search(
            collection_name=collection_name,
            query_vector=query_embedding,
            limit=limit,
            score_threshold=threshold
        )
        
        # รวบรวมผลการค้นหา
        results = []
        for result in search_results:
            results.append({
                "score": result.score,
                "document_id": result.payload.get("document_id"),
                "chunk_id": result.payload.get("chunk_id"),
                "content": result.payload.get("content"),
                "filename": result.payload.get("filename"),
                "created_at": result.payload.get("created_at")
            })
        
        logger.info(f"Vector search performed: query='{query}', results={len(results)}")
        
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "query": query,
                "collection_name": collection_name,
                "results": results,
                "total_results": len(results)
            }
        )
        
    except Exception as e:
        logger.error(f"Error searching similar documents: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="เกิดข้อผิดพลาดในการค้นหาเอกสาร"
        )

@router.get("/manage")
async def manage_vector_database(
    action: str,
    collection_name: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """
    จัดการฐานข้อมูลเวกเตอร์ (UC36)
    """
    try:
        # ตรวจสอบสิทธิ์ admin
        if not current_user.get("is_admin"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied. Admin privileges required."
            )
        
        # สร้าง Qdrant client
        client = get_qdrant_client()
        
        if action == "status":
            # ตรวจสอบสถานะ collections
            collections = client.get_collections()
            status_info = []
            
            for collection in collections.collections:
                collection_info = client.get_collection(collection.name)
                status_info.append({
                    "name": collection.name,
                    "status": collection_info.status,
                    "vectors_count": collection_info.vectors_count,
                    "points_count": collection_info.points_count,
                    "segments_count": collection_info.segments_count,
                    "optimizer_status": collection_info.optimizer_status
                })
            
            return JSONResponse(
                status_code=status.HTTP_200_OK,
                content={"collections_status": status_info}
            )
        
        elif action == "optimize":
            # Optimize collection
            if not collection_name:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Collection name required for optimization"
                )
            
            # ตรวจสอบว่า collection มีอยู่หรือไม่
            collections = client.get_collections()
            existing_collections = [col.name for col in collections.collections]
            
            if collection_name not in existing_collections:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Collection '{collection_name}' not found"
                )
            
            # Optimize collection
            client.optimize_collection(collection_name)
            
            return JSONResponse(
                status_code=status.HTTP_200_OK,
                content={"message": f"Collection '{collection_name}' optimization started"}
            )
        
        elif action == "cleanup":
            # Cleanup unused vectors
            if not collection_name:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Collection name required for cleanup"
                )
            
            # ตรวจสอบว่า collection มีอยู่หรือไม่
            collections = client.get_collections()
            existing_collections = [col.name for col in collections.collections]
            
            if collection_name not in existing_collections:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Collection '{collection_name}' not found"
                )
            
            # Cleanup collection
            client.cleanup_collection(collection_name)
            
            return JSONResponse(
                status_code=status.HTTP_200_OK,
                content={"message": f"Collection '{collection_name}' cleanup completed"}
            )
        
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid action. Use 'status', 'optimize', or 'cleanup'"
            )
        
    except Exception as e:
        logger.error(f"Error managing vector database: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="เกิดข้อผิดพลาดในการจัดการฐานข้อมูลเวกเตอร์"
        )

@router.post("/embeddings/batch")
async def batch_process_embeddings(
    collection_name: str = "default",
    batch_size: int = 100,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    ประมวลผล embeddings แบบ batch
    """
    try:
        # ตรวจสอบสิทธิ์ admin
        if not current_user.get("is_admin"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied. Admin privileges required."
            )
        
        # สร้าง Qdrant client
        client = get_qdrant_client()
        
        # ตรวจสอบว่า collection มีอยู่หรือไม่
        collections = client.get_collections()
        existing_collections = [col.name for col in collections.collections]
        
        if collection_name not in existing_collections:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Collection '{collection_name}' not found"
            )
        
        # ดึง chunks ที่ยังไม่มี embedding
        chunks = db.query(DocumentChunk).filter(
            DocumentChunk.embedding.is_(None)
        ).limit(batch_size).all()
        
        processed_count = 0
        
        for chunk in chunks:
            try:
                # สร้าง embedding
                embedding = await generate_embedding(chunk.content)
                
                # สร้าง point
                point = PointStruct(
                    id=chunk.id,
                    vector=embedding,
                    payload={
                        "document_id": chunk.document_id,
                        "chunk_id": chunk.id,
                        "content": chunk.content,
                        "filename": chunk.document.filename if chunk.document else "Unknown",
                        "created_at": chunk.created_at.isoformat()
                    }
                )
                
                # เพิ่มใน Qdrant
                client.upsert(
                    collection_name=collection_name,
                    points=[point]
                )
                
                # อัปเดต chunk
                chunk.embedding = json.dumps(embedding)
                chunk.collection_name = collection_name
                chunk.updated_at = datetime.utcnow()
                
                processed_count += 1
                
            except Exception as e:
                logger.error(f"Error processing chunk {chunk.id}: {str(e)}")
                continue
        
        db.commit()
        
        logger.info(f"Batch embeddings processed: {processed_count} chunks by {current_user.get('email')}")
        
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "message": f"Processed {processed_count} embeddings successfully",
                "processed_count": processed_count,
                "collection_name": collection_name
            }
        )
        
    except Exception as e:
        logger.error(f"Error in batch processing embeddings: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="เกิดข้อผิดพลาดในการประมวลผล embeddings แบบ batch"
        )

# Helper function สำหรับสร้าง embedding (ต้องปรับตามระบบจริง)
async def generate_embedding(text: str) -> List[float]:
    """
    สร้าง embedding สำหรับข้อความ (ต้องปรับตามระบบจริง)
    """
    # ตัวอย่างการสร้าง embedding แบบ dummy
    # ในระบบจริงต้องใช้ OpenAI API หรือ embedding service อื่นๆ
    
    import hashlib
    import random
    
    # สร้าง hash จากข้อความ
    text_hash = hashlib.md5(text.encode()).hexdigest()
    
    # สร้าง embedding แบบ deterministic จาก hash
    random.seed(int(text_hash[:8], 16))
    embedding = [random.uniform(-1, 1) for _ in range(1536)]
    
    # Normalize vector
    magnitude = sum(x**2 for x in embedding) ** 0.5
    embedding = [x / magnitude for x in embedding]
    
    return embedding
