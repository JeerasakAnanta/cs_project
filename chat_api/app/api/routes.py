# System imports
import os
import sys

# FastAPI
from fastapi import APIRouter
from fastapi import File
from fastapi import HTTPException
from fastapi import Request
from fastapi import UploadFile
from fastapi.responses import RedirectResponse
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates

# Local imports
from ..docs_process.process_pdf import process_pdf

# Local imports
import glob
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout),
    ],
)
logger = logging.getLogger(__name__)


# Create the APIRouter instance
router = APIRouter()

# Path for HTML templates
templates = Jinja2Templates(directory="app/templates")

# Directory to store uploaded PDFs
PDF_DIR = os.path.join("pdfs")
os.makedirs(PDF_DIR, exist_ok=True)

# Directory to store uploaded PDFs
UPLOAD_FOLDER = "./pdfs"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


@router.get("/", response_class=HTMLResponse)
async def index(request: Request):
    """
    Render the index page.

    This endpoint renders the index.html template in the templates directory
    and passes the request object to the template.
    """
    # Render the index.html template with the request object
    logging.info("index")
    return templates.TemplateResponse("index.html", {"request": request})


@router.get("/upload_page", response_class=HTMLResponse)
async def upload_page(request: Request):
    """
    Render the upload page.

    This endpoint renders the upload.html template in the templates directory.
    """
    return templates.TemplateResponse("upload.html", {"request": request})


@router.get("/list_page", response_class=HTMLResponse)
async def list_files(request: Request):
    """
    List all uploaded PDF files.

    This endpoint renders the list.html template in the templates directory
    and passes the list of uploaded PDF files to the template.
    """
    # Get the list of all PDF files in the upload directory
    pdfs = glob.glob(os.path.join(UPLOAD_FOLDER, "*.pdf"))

    # Extract the file names only for rendering
    pdf_names = [os.path.basename(p) for p in pdfs]

    # Render the list.html template with the list of PDF files
    return templates.TemplateResponse(
        "list.html", {"request": request, "pdfs": pdf_names}
    )


@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    """
    Handle PDF file upload.

    This endpoint allows users to upload PDF files, which are then processed and stored.
    """
    # Check if the uploaded file is a PDF
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="ไฟล์ที่อัปโหลดไม่ใช่ไฟล์ PDF")

    # Construct the file path for saving the uploaded PDF
    file_path = os.path.join(UPLOAD_FOLDER, file.filename)

    # Save the uploaded file to the local directory
    with open(file_path, "wb") as f:
        content = await file.read()  # Read the file content asynchronously
        f.write(content)  # Write the content to the file

    # Process the PDF after saving it
    process_pdf(file_path)

    # Redirect to the main page after successful upload
    return RedirectResponse(url="/", status_code=303)


@router.get("/delete/{filename:path}", response_class=HTMLResponse)
async def delete_file(filename: str):
    """
    Delete a specified PDF file from local storage.
    """
    file_path = os.path.join(UPLOAD_FOLDER, filename)
    if os.path.isfile(file_path):
        try:
            os.remove(file_path)  # Delete local file
            return RedirectResponse(url="/files", status_code=303)
        except Exception as e:
            raise HTTPException(
                status_code=500, detail=f"Error deleting file: {str(e)}"
            )
    else:
        raise HTTPException(status_code=404, detail="File not found")


@router.get("/list-pdfs/")
async def list_pdfs():
    """List all uploaded PDF files."""
    pdfs = os.listdir(PDF_DIR)
    return {"pdfs": pdfs}
