from fastapi import APIRouter, File, UploadFile, HTTPException, Depends, BackgroundTasks
from fastapi.responses import JSONResponse
import os
import shutil
import logging
from typing import List, Dict, Any
from datetime import datetime

# Import our PDF processing and RAG modules
from app.docs_process.process_pdf import process_pdf
from app.login_system.auth import is_admin
from app.utils.config import QDRANT_VECTERDB_HOST, COLLECTION_NAME
from qdrant_client import QdrantClient
from qdrant_client.http.models import Filter, FieldCondition, MatchValue

# Setup logging
logger = logging.getLogger(__name__)

# PDF storage configuration
PDF_STORAGE_PATH = "pdfs"
os.makedirs(PDF_STORAGE_PATH, exist_ok=True)

router = APIRouter(prefix="/api/pdfs", tags=["PDF Management"])

# Initialize Qdrant client
qdrant_client = QdrantClient(url=QDRANT_VECTERDB_HOST)


def get_pdf_info(filename: str) -> Dict[str, Any]:
    """Get information about a PDF file including indexing status"""
    file_path = os.path.join(PDF_STORAGE_PATH, filename)
    
    if not os.path.exists(file_path):
        return None
    
    # Get file stats
    stat = os.stat(file_path)
    
    # Check if file is indexed in Qdrant
    is_indexed = check_if_indexed(filename)
    
    return {
        "filename": filename,
        "size_bytes": stat.st_size,
        "size_mb": round(stat.st_size / (1024 * 1024), 2),
        "created_at": datetime.fromtimestamp(stat.st_ctime).isoformat(),
        "modified_at": datetime.fromtimestamp(stat.st_mtime).isoformat(),
        "is_indexed": is_indexed,
        "indexed_at": get_indexed_timestamp(filename) if is_indexed else None
    }


def check_if_indexed(filename: str) -> bool:
    """Check if a PDF file is indexed in Qdrant"""
    try:
        # Search for documents with this filename in metadata
        results = qdrant_client.scroll(
            collection_name=COLLECTION_NAME,
            scroll_filter=Filter(
                must=[
                    FieldCondition(
                        key="metadata.filename",
                        match=MatchValue(value=filename)
                    )
                ]
            ),
            limit=1
        )
        return len(results[0]) > 0
    except Exception as e:
        logger.error(f"Error checking indexing status for {filename}: {e}")
        return False


def get_indexed_timestamp(filename: str) -> str:
    """Get the timestamp when the file was indexed"""
    try:
        results = qdrant_client.scroll(
            collection_name=COLLECTION_NAME,
            scroll_filter=Filter(
                must=[
                    FieldCondition(
                        key="metadata.filename",
                        match=MatchValue(value=filename)
                    )
                ]
            ),
            limit=1,
            with_payload=True
        )
        if results[0]:
            payload = results[0][0].payload
            return payload.get("indexed_at", "Unknown")
    except Exception as e:
        logger.error(f"Error getting indexed timestamp for {filename}: {e}")
    return "Unknown"


def delete_from_qdrant(filename: str) -> bool:
    """Delete all vectors associated with a PDF file from Qdrant"""
    try:
        # Find all points with this filename
        results = qdrant_client.scroll(
            collection_name=COLLECTION_NAME,
            scroll_filter=Filter(
                must=[
                    FieldCondition(
                        key="metadata.filename",
                        match=MatchValue(value=filename)
                    )
                ]
            ),
            limit=10000,  # Large limit to get all points
            with_payload=False
        )
        
        if results[0]:
            point_ids = [point.id for point in results[0]]
            qdrant_client.delete(
                collection_name=COLLECTION_NAME,
                points_selector=point_ids
            )
            logger.info(f"Deleted {len(point_ids)} vectors for {filename}")
            return True
        return True  # No vectors to delete
    except Exception as e:
        logger.error(f"Error deleting vectors for {filename}: {e}")
        return False


@router.get("/", response_model=List[Dict[str, Any]])
async def list_pdfs(current_user: dict = Depends(is_admin)):
    """List all PDF files with detailed information including indexing status."""
    try:
        pdf_files = [f for f in os.listdir(PDF_STORAGE_PATH) if f.endswith('.pdf')]
        pdf_info = []
        
        for filename in pdf_files:
            info = get_pdf_info(filename)
            if info:
                pdf_info.append(info)
        
        # Sort by modification date (newest first)
        pdf_info.sort(key=lambda x: x['modified_at'], reverse=True)
        
        return pdf_info
    except Exception as e:
        logger.error(f"Error listing PDFs: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/upload/")
async def upload_pdf(
    file: UploadFile = File(...), 
    background_tasks: BackgroundTasks = BackgroundTasks(),
    current_user: dict = Depends(is_admin)
):
    """Upload a new PDF file and optionally index it."""
    if file.content_type != 'application/pdf':
        raise HTTPException(status_code=400, detail="Invalid file type. Only PDFs are allowed.")
    
    file_path = os.path.join(PDF_STORAGE_PATH, file.filename)
    
    if os.path.exists(file_path):
        raise HTTPException(status_code=400, detail="File with this name already exists.")

    try:
        # Save the file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        logger.info(f"Successfully uploaded {file.filename}")
        
        return JSONResponse(
            status_code=201, 
            content={
                "message": f"Successfully uploaded {file.filename}",
                "filename": file.filename,
                "next_step": "Use /api/pdfs/index/{filename} to index the file for RAG"
            }
        )
    except Exception as e:
        logger.error(f"Error uploading file {file.filename}: {e}")
        raise HTTPException(status_code=500, detail=f"Could not save file: {e}")


@router.post("/index/{filename}")
async def index_pdf(
    filename: str, 
    background_tasks: BackgroundTasks = BackgroundTasks(),
    current_user: dict = Depends(is_admin)
):
    """Index a PDF file for RAG (Retrieval Augmented Generation)."""
    file_path = os.path.join(PDF_STORAGE_PATH, filename)
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found.")
    
    if not filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="File is not a PDF.")
    
    try:
        # Check if already indexed
        if check_if_indexed(filename):
            return JSONResponse(
                content={
                    "message": f"File {filename} is already indexed",
                    "filename": filename,
                    "status": "already_indexed"
                }
            )
        
        # Process the PDF in background
        background_tasks.add_task(process_pdf_with_metadata, file_path, filename)
        
        return JSONResponse(
            content={
                "message": f"Started indexing {filename}. This may take a few minutes.",
                "filename": filename,
                "status": "indexing_started"
            }
        )
    except Exception as e:
        logger.error(f"Error starting indexing for {filename}: {e}")
        raise HTTPException(status_code=500, detail=f"Could not start indexing: {e}")


def process_pdf_with_metadata(file_path: str, filename: str):
    """Process PDF with metadata including filename and timestamp."""
    try:
        logger.info(f"Starting indexing process for {filename}")
        
        # Import here to avoid circular imports
        from docling.document_converter import DocumentConverter
        from langchain.text_splitter import MarkdownTextSplitter
        from langchain_qdrant import QdrantVectorStore
        from langchain_openai import OpenAIEmbeddings
        from app.utils.config import EMBEDDINGS_MODEL, QDRANT_VECTERDB_HOST, COLLECTION_NAME
        
        # Initialize embeddings
        embeddings = OpenAIEmbeddings(model=EMBEDDINGS_MODEL)
        
        # Convert PDF to markdown
        converter = DocumentConverter()
        result = converter.convert(file_path)
        markdown_text = result.document.export_to_markdown()
        logger.info(f"Converted {filename} to markdown")
        
        # Split the text into chunks
        text_splitter = MarkdownTextSplitter(chunk_size=300, chunk_overlap=30)
        chunks = text_splitter.create_documents([markdown_text])
        
        # Add metadata to each chunk
        indexed_at = datetime.now().isoformat()
        for chunk in chunks:
            chunk.metadata.update({
                "filename": filename,
                "indexed_at": indexed_at,
                "source": "pdf_upload"
            })
        
        # Store in Qdrant
        qdrant = QdrantVectorStore.from_documents(
            chunks,
            embeddings,
            url=QDRANT_VECTERDB_HOST,
            collection_name=COLLECTION_NAME,
        )
        
        logger.info(f"Successfully indexed {filename} with {len(chunks)} chunks")
        
    except Exception as e:
        logger.error(f"Error processing PDF {filename}: {e}")


@router.delete("/{filename}")
async def delete_pdf(filename: str, current_user: dict = Depends(is_admin)):
    """Delete a PDF file and remove it from Qdrant vector database."""
    file_path = os.path.join(PDF_STORAGE_PATH, filename)
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found.")
    
    try:
        # Delete from Qdrant first
        qdrant_deleted = delete_from_qdrant(filename)
        
        # Delete the file
        os.remove(file_path)
        
        message = f"Successfully deleted {filename}"
        if qdrant_deleted:
            message += " and removed from vector database"
        
        logger.info(message)
        
        return JSONResponse(content={
            "message": message,
            "filename": filename,
            "qdrant_deleted": qdrant_deleted
        })
    except Exception as e:
        logger.error(f"Error deleting {filename}: {e}")
        raise HTTPException(status_code=500, detail=f"Could not delete file: {e}")


@router.post("/reindex/{filename}")
async def reindex_pdf(
    filename: str, 
    background_tasks: BackgroundTasks = BackgroundTasks(),
    current_user: dict = Depends(is_admin)
):
    """Re-index a PDF file (delete old vectors and create new ones)."""
    file_path = os.path.join(PDF_STORAGE_PATH, filename)
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found.")
    
    try:
        # Delete existing vectors first
        qdrant_deleted = delete_from_qdrant(filename)
        
        # Process the PDF in background
        background_tasks.add_task(process_pdf_with_metadata, file_path, filename)
        
        return JSONResponse(
            content={
                "message": f"Started re-indexing {filename}. Old vectors deleted, creating new ones.",
                "filename": filename,
                "status": "reindexing_started",
                "old_vectors_deleted": qdrant_deleted
            }
        )
    except Exception as e:
        logger.error(f"Error starting re-indexing for {filename}: {e}")
        raise HTTPException(status_code=500, detail=f"Could not start re-indexing: {e}")


@router.get("/stats/")
async def get_pdf_stats(current_user: dict = Depends(is_admin)):
    """Get statistics about PDF files and indexing status."""
    try:
        pdf_files = [f for f in os.listdir(PDF_STORAGE_PATH) if f.endswith('.pdf')]
        
        total_files = len(pdf_files)
        indexed_files = 0
        total_size_bytes = 0
        
        for filename in pdf_files:
            info = get_pdf_info(filename)
            if info:
                total_size_bytes += info['size_bytes']
                if info['is_indexed']:
                    indexed_files += 1
        
        # Get Qdrant collection info
        try:
            collection_info = qdrant_client.get_collection(COLLECTION_NAME)
            total_vectors = collection_info.points_count
        except Exception:
            total_vectors = 0
        
        return {
            "total_files": total_files,
            "indexed_files": indexed_files,
            "not_indexed_files": total_files - indexed_files,
            "total_size_mb": round(total_size_bytes / (1024 * 1024), 2),
            "total_vectors_in_qdrant": total_vectors,
            "indexing_percentage": round((indexed_files / total_files * 100), 2) if total_files > 0 else 0
        }
    except Exception as e:
        logger.error(f"Error getting PDF stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))
