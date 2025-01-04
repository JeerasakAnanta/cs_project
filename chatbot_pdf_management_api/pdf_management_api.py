#############################################################################
# Chat Bots Document PDF Manager API with FastAPI and Qdrant Vector Store
#############################################################################

import glob
import logging
import os

from dotenv import load_dotenv
from fastapi import APIRouter, FastAPI, File, HTTPException, Request, UploadFile
from fastapi.encoders import jsonable_encoder
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse, RedirectResponse
from fastapi.templating import Jinja2Templates
from langchain.document_loaders import PyMuPDFLoader
from langchain.text_splitter import CharacterTextSplitter
from langchain_openai import AzureOpenAIEmbeddings
from langchain_qdrant import QdrantVectorStore
from tqdm import tqdm


# Load environment variables from .env file
load_dotenv("../.env")


# QdrantVectorStore
QDRANT_VECTERDB_HOST = os.getenv('QDRANT_VECTERDB_HOST')

print('==================================')
print('Host Vecte DB ' , QDRANT_VECTERDB_HOST)
print('==================================')

# FastAPI application instance
app = FastAPI()

# Define a router for API endpoints
router = APIRouter(prefix="/pdf")


# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
) 

# Path for HTML templates
# Pdf
templates = Jinja2Templates(directory="templates")

# PDF upload directory

UPLOAD_FOLDER = './pdfs'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Qdrant connection details
QDRANT_URL =  QDRANT_VECTERDB_HOST   # Update this to your Qdrant endpoint
COLLECTION_NAME = "my_documents"

# Initialize embeddings 
# use model  text embdeding 3  large  
#  sizs about  3020
embeddings = OpenAIEmbeddings(model="text-embedding-3-large")


# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.get("/", response_class=HTMLResponse)
async def index(request: Request):
    """
    Render the main index page.

    This endpoint simply renders the index.html template in the templates directory.
    Feature 

    1. update pdf 
    2. list pdf  
    
    """

    return templates.TemplateResponse("index.html", {"request": request})

@app.get("/upload_page", response_class=HTMLResponse)
async def upload_page(request: Request):
    """
    Render the upload page.

    This endpoint renders the upload.html template in the templates directory.
    """
    return templates.TemplateResponse("upload.html", {"request": request})

@app.post("/upload")    
async def upload_file(file: UploadFile = File(...)):
    """
    Handle PDF file upload.

    This endpoint allows users to upload PDF files, which are then processed and stored.
    """
    # Check if the uploaded file is a PDF
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed.")
    
    # Construct the file path for saving the uploaded PDF
    file_path = os.path.join(UPLOAD_FOLDER, file.filename)

    # Save the uploaded file to the local directory
    with open(file_path, "wb") as f:
        content = await file.read()  # Read the file content asynchronously
        f.write(content)  # Write the content to the file

    # Process the PDF after saving it
    await process_pdf(file_path)

    # Redirect to the main page after successful upload
    return RedirectResponse(url='/', status_code=303)

async def process_pdf(file_path: str):
    """Process the uploaded PDF file for embeddings."""
    # Check for required environment variables
    azure_endpoint = os.getenv('AZURE_OPENAI_ENDPOINT')
    azure_api_key = os.getenv('AZURE_OPENAI_API_KEY')

    if not azure_endpoint or not azure_api_key:
        raise HTTPException(status_code=500, detail="Missing environment variables for Azure OpenAI.")

    # Initialize embeddings
    embeddings = AzureOpenAIEmbeddings(model="text-embedding-3-large")

    logger.info(f"Processing PDF for embeddings: {file_path}")

    try:
        # Load the document
        loader = PyMuPDFLoader(file_path)
        documents = loader.load()

        # Split the text into chunks
        text_splitter = CharacterTextSplitter(
            separator="\n",
            chunk_size=1000,
            chunk_overlap=200
        )
        chunks = text_splitter.split_documents(documents)

        # Qdrant server configuration
        url = QDRANT_VECTERDB_HOST  # Adjust this if necessary

        # Initialize QdrantVectorStore with the chunks
        qdrant = QdrantVectorStore.from_documents(
            chunks,
            embeddings,
            url=url,
            prefer_grpc=False,
            collection_name="my_documents",
        )

        logger.info("Embeddings processed and stored successfully.")

    except Exception as e:
        logger.error(f"Error processing PDF {file_path}: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    

@app.get("/delete/{filename:path}", response_class=HTMLResponse)
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

@app.get("/files", response_class=HTMLResponse)
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


@app.get("/pdflist")
async def list_files() -> dict:
    """
    List all uploaded PDF files.

    Returns a dictionary with a single key "pdfs" containing a list of
    all uploaded PDF files.
    """
    # Get the list of all PDF files in the upload directory
    pdfs = glob.glob(os.path.join(UPLOAD_FOLDER, '*.pdf'))
    
    # Extract the file names only for rendering
    pdf_names = [os.path.basename(p) for p in pdfs]
    
    # Return the list of PDF files as a dictionary
    return {"pdfs": pdf_names}



@app.on_event("startup")
def startup_event() -> None:
    """
    Load environment variables during startup.

    This function is called automatically by FastAPI when the application
    starts up. It loads the environment variables from the .env file in the
    root directory of the project using the load_dotenv() function from the
    python-dotenv library.
    """

@app.get("/reembedding")
async def reembedding() -> JSONResponse:
    """
    Reembedding all uploaded PDF files.

    This endpoint is used to re-embed all uploaded PDF files in the
    Qdrant vector store. It's useful for re-embedding the PDFs if the
    embeddings model has changed or if the PDFs have been updated.

    Returns a JSON response with a single key "message" containing a
    success message.
    """
    
    # Check for required environment variables
    azure_endpoint = os.getenv('AZURE_OPENAI_ENDPOINT')
    azure_api_key = os.getenv('AZURE_OPENAI_API_KEY')

    if not azure_endpoint or not azure_api_key:
        return JSONResponse(content={"error": "Missing environment variables for Azure OpenAI."}, status_code=400)

    # Initialize embeddings
    embeddings = AzureOpenAIEmbeddings(model="text-embedding-3-large")

    # Load PDF files
    pdfs = glob.glob(os.path.join(UPLOAD_FOLDER, '*.pdf'))

    logger.info("==================================================")  
    logger.info(f"Found PDFs: {pdfs}")
    logger.info('Current working directory: %s', os.getcwd())
    logger.info("==================================================")  
    logger.info("Start loading documents...")

    try:
        # Iterate over the PDFs and load them one by one
        for pdf_path in tqdm(pdfs):
            try:
                # Load the PDF using PyMuPDFLoader
                loader = PyMuPDFLoader(pdf_path)
                documents = loader.load()

                # Split the text into chunks using CharacterTextSplitter
                text_splitter = CharacterTextSplitter(
                    separator="\n",
                    chunk_size=1000,
                    chunk_overlap=200
                )
                chunks = text_splitter.split_documents(documents)

                # Initialize QdrantVectorStore with the chunks
                logger.info("Initializing Qdrant...")
                try:
                    qdrant = QdrantVectorStore.from_documents(
                        chunks,
                        embeddings,
                        url=QDRANT_VECTERDB_HOST,  # Adjust this if necessary
                        prefer_grpc=False,  # Disable gRPC in case it's not enabled on the server
                        collection_name="my_documents",
                    )
                except Exception as e:
                    logger.error(f"Error initializing Qdrant for PDF {pdf_path}: {e}")
                    continue  # Skip to the next PDF

            except Exception as e:
                logger.error(f"Error loading PDF {pdf_path}: {e}")
                continue  # Skip this file and proceed with the next one

    except Exception as e:
        logger.critical(f"Unexpected error: {e}")
        
    logger.info("==================================================")  
    logger.info("Embeddings complete :)")
    logger.info("Your documents have been loaded into Qdrant!")
    logger.info("==================================================")

    return JSONResponse(content={"message": "Reembedding complete!"})
