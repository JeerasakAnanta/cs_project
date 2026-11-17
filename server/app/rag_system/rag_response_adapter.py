"""
RAG Response Adapter

Single interface for converting raw chatbot responses into normalized Pydantic models.
Eliminates duplicate conversion logic across all chat routers.
"""

from typing import Any
from app.chat.schemas import DocumentReference, MessageCreate


def adapt_chatbot_response(bot_response: dict[str, Any]) -> tuple[str, list[DocumentReference]]:
    """
    Convert raw chatbot response to (message_text, source_documents).

    Args:
        bot_response: Raw dict from chatbot with keys 'message' and 'source_documents'.

    Returns:
        Tuple of (bot_message_text, list_of_DocumentReference).
    """
    message_text = bot_response.get("message", "ขออภัยครับ ไม่สามารถประมวลผลคำถามได้")

    source_documents: list[DocumentReference] = []
    raw_docs = bot_response.get("source_documents", [])
    if raw_docs:
        for doc_ref in raw_docs:
            source_documents.append(
                DocumentReference(
                    filename=doc_ref.get("filename", "Unknown"),
                    page=doc_ref.get("page"),
                    confidence_score=doc_ref.get("confidence_score", 0.0),
                    content_preview=doc_ref.get("content_preview", ""),
                    full_content=doc_ref.get("full_content", ""),
                )
            )

    return message_text, source_documents


def adapt_bot_message_create(message_text: str) -> MessageCreate:
    """Create a bot MessageCreate schema from plain text."""
    return MessageCreate(sender="bot", content=message_text)