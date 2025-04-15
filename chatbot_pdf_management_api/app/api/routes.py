# System imports
import os

# FastAPI 
from fastapi import APIRouter, File, HTTPException, Request, UploadFile
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates

# Local imports 
import glob


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
    return templates.TemplateResponse("index.html", {"request": request})


@router.get("/upload_page", response_class=HTMLResponse)
async def upload_page(request: Request):
    """
    Render the upload page.

    This endpoint renders the upload.html template in the templates directory.
    """
    return templates.TemplateResponse("upload.html", {"request": request})


@router.get("/files", response_class=HTMLResponse)
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


@router.get("/list-pdfs/")
async def list_pdfs():
    """List all uploaded PDF files."""
    pdfs = os.listdir(PDF_DIR)
    return {"pdfs": pdfs}

