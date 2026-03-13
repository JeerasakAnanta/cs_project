from fastapi import APIRouter, File, UploadFile, HTTPException, Depends
from fastapi.responses import JSONResponse
import os
import shutil
from typing import List

# ... other imports
from app.login_system.auth import is_admin

PDF_STORAGE_PATH = "pdfs"
os.makedirs(PDF_STORAGE_PATH, exist_ok=True)

router = APIRouter(prefix="/api/pdfs", tags=["PDF Management"])


@router.get("/", response_model=List[str])
async def list_pdfs(current_user: dict = Depends(is_admin)):
    """List all PDF files in the storage directory."""
    try:
        return [f for f in os.listdir(PDF_STORAGE_PATH) if f.endswith(".pdf")]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/upload/")
async def upload_pdf(
    file: UploadFile = File(...), current_user: dict = Depends(is_admin)
):
    """Upload a new PDF file."""
    if file.content_type != "application/pdf":
        raise HTTPException(
            status_code=400, detail="Invalid file type. Only PDFs are allowed."
        )

    # Sanitize filename to prevent path traversal attacks
    original_filename = file.filename or "unknown.pdf"
    safe_filename = os.path.basename(original_filename)
    if not safe_filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Invalid file extension")

    # Generate unique filename to prevent overwriting
    import uuid

    unique_filename = f"{uuid.uuid4()}_{safe_filename}"
    file_path = os.path.join(PDF_STORAGE_PATH, unique_filename)

    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        return JSONResponse(
            status_code=201,
            content={"message": f"Successfully uploaded {file.filename}"},
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not save file: {e}")


@router.delete("/{filename}")
async def delete_pdf(filename: str, current_user: dict = Depends(is_admin)):
    """Delete a PDF file."""
    # Sanitize filename to prevent path traversal
    safe_filename = os.path.basename(filename)
    if not safe_filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Invalid file name")

    file_path = os.path.join(PDF_STORAGE_PATH, safe_filename)

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found.")

    try:
        os.remove(file_path)
        return JSONResponse(content={"message": f"Successfully deleted {filename}"})
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not delete file: {e}")
