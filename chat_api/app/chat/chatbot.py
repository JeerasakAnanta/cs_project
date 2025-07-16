from app.rag_system.rag_system import chatbot as rag_chatbot

def get_chatbot_response(user_message: str) -> str:
    """
    This function now calls the RAG system to get a response.
    """
    response = rag_chatbot(user_message)
    return response['message'] 