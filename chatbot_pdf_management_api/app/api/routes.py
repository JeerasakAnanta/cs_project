# System imports
import os
import sys

# FastAPI 
from fastapi import APIRouter
from fastapi  import File
from fastapi import HTTPException
from fastapi import Request
from fastapi import UploadFile
from fastapi.responses  import RedirectResponse
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates

# Local imports 
from .process_pdf import process_pdf

# Local imports 
import glob
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
    ]
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
UPLOAD_FOLDER = './pdfs'
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
    pdfs = glob.glob(os.path.join(UPLOAD_FOLDER, '*.pdf'))
    
    # Extract the file names only for rendering
    pdf_names = [os.path.basename(p) for p in pdfs]
    
    # Render the list.html template with the list of PDF files
    return templates.TemplateResponse("list.html", {"request": request, "pdfs": pdf_names})


@router.get("/delete/{filename:path}", response_class=HTMLResponse)
async def delete_file(filename: str):
    """
    Delete a specified PDF file from local storage.

    This endpoint deletes a specified PDF file from the local storage.
    If the file does not exist, it returns a 404 error.
    If there is an error deleting the file, it returns a 500 error.
    If the file is successfully deleted, it redirects to the /files endpoint.
    """
    file_path = os.path.join(UPLOAD_FOLDER, filename)

    if os.path.isfile(file_path):
        try:
            os.remove(file_path)  # Delete local file
            return RedirectResponse(url='/files', status_code=303)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error deleting file: {str(e)}")
    else:
        raise HTTPException(status_code=404, detail="File not found")


@router.get("/list-pdfs/")
async def list_pdfs():
    """List all uploaded PDF files."""
    pdfs = os.listdir(PDF_DIR)
    return {"pdfs": pdfs}
