import logging
from typing import Any

# ใช้ LangGraph RAG System แทนระบบเดิม
from app.rag_system.langgraph_rag_system import chatbot as langgraph_chatbot

def chatbot(user_message: str) -> dict[str, Any]:
    """
    API for chatbot interaction using LangGraph RAG System.
    Receives user query and responds with chatbot-generated answer.
    """
    return langgraph_chatbot(user_message)
