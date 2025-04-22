import os
import logging

# loding environment variable
from dotenv import load_dotenv

# FastAPI
from fastapi import FastAPI
from fastapi import APIRouter
from fastapi.middleware.cors import CORSMiddleware

# langchain
from langchain.chains import ConversationalRetrievalChain
from langchain.prompts import PromptTemplate
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_openai import OpenAIEmbeddings

# vecter database
from langchain_qdrant import QdrantVectorStore
from pydantic import BaseModel
from qdrant_client import QdrantClient

# fastapi
from fastapi import APIRouter

#
router = APIRouter(prefix="/api")


# Create log folder if it doesn't exist
if not os.path.exists("./log"):
    os.makedirs("./log")

# Configure logging
logging.basicConfig(
    filename="./log/app.log",
    level=logging.INFO,
    format="%(asctime)s - %(levelname)-8s - %(message)s",
)

# Create a logger
logger = logging.getLogger(__name__)

# Load environment variables from .env file
load_dotenv("../.env")


# defal of  string
class QueryModel(BaseModel):
    """Model for chat query"""

    query: str = "สวัสดีครับ"


@router.get("/")
async def read_root():
    """Return a simple greeting message."""
    logger.info("Root endpoint was accessed.")
    return {"message": "Hello World"}
