import os

# logging
import logging

# pydantic
from pydantic import BaseModel

# fastapi
from fastapi import APIRouter

# RAG
from app.RAG.rag_system import chatbot
from app.RAG.langgraph_rag_system import graph


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
router = APIRouter(prefix="/api")

# ====================================
#             Router api
# ====================================


# defal of  string
class QueryModel(BaseModel):
    """Model for chat query"""

    query: str = "สวัสดีครับ"


@router.get("/")
async def read_root():
    """Return a simple greeting message."""
    logger.info("Root endpoint was accessed.")
    return {"message": "API endpoint for RMUTL chatbot LLM is running..."}


@router.post("/chat")
async def chat(request: QueryModel):
    logger.info(f"Received user query: {request.query}")
    return chatbot(request)


@router.get("/history")
async def get_history():
    """
    API to fetch chat history.
    """
    logger.info("Chat history requested.")
    return {"history": "not implemented yet"}


@router.post("/clear-history")
async def clear_history():
    """
    API to clear chat history.
    """
    global chat_history
    chat_history.clear()
    logger.info("Chat history cleared.")
    return {"message": "Chat history cleared."}


@router.post("/chat_agent_graph")
async def chat_agent_graph(request: QueryModel):

    logger.info(f"Received user query: {request.query}")
    results = []
    for step in graph.stream(
        {"messages": [{"role": "user", "content": request.query}]}, stream_mode="values"
    ):
        step["messages"][-1].pretty_print()  # optional, for logging
        results.append(step["messages"][-1].content)
    return {"message": results[-1]}  # return final step onlysdf
