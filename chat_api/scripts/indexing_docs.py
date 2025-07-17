import os
import logging as logger
from dotenv import load_dotenv

# LangChain
from langchain_openai import OpenAIEmbeddings
from langchain.text_splitter import MarkdownTextSplitter
from langchain_qdrant import QdrantVectorStore

# FastAPI
from fastapi import HTTPException

# Docling
from docling.document_converter import DocumentConverter

# Load environment variables
load_dotenv()
EMBEDDINGS_MODEL = os.getenv("EMBEDDINGS_MODEL", "text-embedding-3-large")
QDRANT_VECTERDB_HOST = os.getenv("QDRANT_VECTERDB_HOST")
COLLECTION_NAME = os.getenv("COLLECTION_NAME")

# Setup logger
logger.basicConfig(level=logger.INFO)

# Initialize embeddings
try:
    embeddings = OpenAIEmbeddings(model=EMBEDDINGS_MODEL)
except Exception as e:
    logger.error(f"Failed to initialize OpenAI embeddings: {e}")
    raise

def process_pdf(file_path: str):
    """
    Process a PDF file:
    - Convert to Markdown using Docling
    - Split into chunks with LangChain
    - Store in Qdrant using LangChain Vector Store
    """
    logger.info(f"Processing PDF for embeddings: {file_path}")
    try:
        # Step 1: Convert PDF to markdown
        converter = DocumentConverter()
        result = converter.convert(file_path)
        markdown_text = result.document.export_to_markdown()
        logger.info("✅ Converted PDF to markdown")

        # Step 2: Split into chunks
        text_splitter = MarkdownTextSplitter(chunk_size=500, chunk_overlap=200)
        chunks = text_splitter.create_documents([markdown_text])
        logger.info(f"✅ Split into {len(chunks)} chunks")

        # Step 3: Store in Qdrant
        QdrantVectorStore.from_documents(
            chunks,
            embeddings,
            url=QDRANT_VECTERDB_HOST,
            collection_name=COLLECTION_NAME,
        )
        logger.info("✅ Embeddings stored in Qdrant successfully")

    except Exception as e:
        logger.error(f"❌ Error processing PDF {file_path}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    file_path = "pdfs/01_ค่าใช้จ่ายในการเดินทางไปราชการ.pdf"
    process_pdf(file_path)
