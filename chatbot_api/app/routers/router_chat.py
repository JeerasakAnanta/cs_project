import os

# logging
import logging

# pydantic
from pydantic import BaseModel


# fastapi
from fastapi import APIRouter, Depends

# RAG
from app.rag_system.rag_system import chatbot
from app.rag_system.new_rag import generation_answer
from app.rag_system.langgraph_rag_system import graph


from sqlalchemy.orm import Session

from fastapi.security import OAuth2PasswordRequestForm

from app.login_system import auth
from app.login_system.login import register, get_db, login, logout, refresh
from app.login_system.schemas import UserCreate


# Create log folder if it doesn't exist
if not os.path.exists("./log"):
    os.makedirs("./log")

# Create a logger
logger = logging.getLogger(__name__)

# Configure logging
logging.basicConfig(
    filename="./log/app.log",
    level=logging.INFO,
    format="%(asctime)s - %(levelname)-8s - %(message)s",
)

# Initialize FastAPI router /api
router = APIRouter(prefix="/api", tags=["Chatbot"])


# ====================================
#             Router api
# ====================================


# defal of  string
class QueryModel(BaseModel):
    """Model for chat query"""

    query: str = "สวัสดีครับ"


@router.get("/chat", tags=["Chatbot"])
async def read_root():
    """Return a simple greeting message."""
    logger.info("Root endpoint was accessed.")
    return {"response": "API endpoint for RMUTL chatbot LLM is running..."}


@router.post("/chat/chats")
async def chat(request: QueryModel):
    logger.info(f"Received user query: {request.query}")
    return chatbot(request.query)


@router.get("/chat/history")
async def get_history():
    """
    API to fetch chat history.
    """
    logger.info("Chat history requested.")
    return {"response": "not implemented yet"}


@router.post("/chat/clear-history")
async def clear_history():
    """
    API to clear chat history.
    """

    return {"response": "Chat history not implemented yet."}


@router.post("/chat/chat_agent_graph")
async def chat_agent_graph(request: QueryModel):

    logger.info(f"Received user query: {request.query}")
    results = []
    for step in graph.stream(
        {"messages": [{"role": "user", "content": request.query}]}, stream_mode="values"
    ):
        step["messages"][-1].pretty_print()  # optional, for logging
        results.append(step["messages"][-1].content)
    return {"response": results[-1]}  # return final step onlysdf


@router.post("/chat/new_rag")
async def new_rags(request: QueryModel):
    answer = generation_answer(request.query)
    return {"response": answer}
