import os
import glob
import logging as logger

# langchain
from langchain_openai import OpenAIEmbeddings
from langchain.text_splitter import MarkdownTextSplitter
from langchain_openai import OpenAIEmbeddings

# FastAPI
from fastapi import HTTPException

# vecter db
from langchain_qdrant import QdrantVectorStore
from qdrant_client import QdrantClient
from qdrant_client.http.models import Distance, VectorParams


# docling
from docling.document_converter import DocumentConverter

# env
from dotenv import load_dotenv

#  load  env
load_dotenv()

# Load environment variables
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
EMBEDDINGS_MODEL = os.getenv("EMBEDDINGS_MODEL")
QDRANT_VECTERDB_HOST = os.getenv("QDRANT_VECTERDB_HOST")
COLLECTION_NAME = os.getenv("COLLECTION_NAME")


# Initialize embeddings
embeddings = OpenAIEmbeddings(model=EMBEDDINGS_MODEL)


def process_pdf(file_path: str):
    """Process the uploaded PDF file for embeddings."""

    logger.info(f"Processing PDF for embeddings: {file_path}")
    try:

        converter = DocumentConverter()
        result = converter.convert(file_path)
        serup_text = result.document.export_to_markdown()
        logger.info("convert  txt to  markdown")

        # Split the text into chunks
        text_splitter = MarkdownTextSplitter(chunk_size=1000, chunk_overlap=0)

        logger.info("spliter data susscerfull")
        chunks = text_splitter.create_documents([serup_text])

        # Initialize QdrantVectorStore with the chunks
        qdrant = QdrantVectorStore.from_documents(
            chunks,
            embeddings,
            url=QDRANT_VECTERDB_HOST,
            collection_name=COLLECTION_NAME,
        )

        logger.info("Embeddings processed and stored successfully.")
    except Exception as e:
        logger.error(f"Error processing PDF {file_path}: {e}")
        raise HTTPException(status_code=500, detail=str(e))
