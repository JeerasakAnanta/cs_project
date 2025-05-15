#!/usr/bin/env python3
# development by Jeerasak Ananta
# Date 12/12/2024

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


# Initialize FastAPI
app = FastAPI(
    title="RMUTL Chatbot LLM API endpoint",
    description="API for RMUTL chatbot interaction with LLM ",
)

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

# Set environmental variables
os.environ["OPENAI_API_KEY"] = os.getenv("OPENAI_API_KEY")
QDRANT_VECTERDB_HOST = os.getenv("QDRANT_VECTERDB_HOST")

print("------------------------------------------------------------")
print("Checking environment variable")
print(f"QDRANT_VECTERDB_HOST: {os.getenv('QDRANT_VECTERDB_HOST')}")
print("------------------------------------------------------------")


# Add CORS middlewares
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define a router for API endpoints
router = APIRouter(prefix="/api")


# defal of  string
class QueryModel(BaseModel):
    """Model for chat query"""

    query: str = "สวัสดี ครับน้องน้ำหวาน"


# Store for chat history
chat_history: list[tuple[str, str]] = []


def create_chatbot_chain() -> ConversationalRetrievalChain:
    """
    Create a ConversationalRetrievalChain with a custom prompt.

    The ConversationalRetrievalChain is a langchain component that enables the
    chatbot to generate responses based on a given context and question. The
    chain is comprised of a retriever, a combiner, and an LLM. The retriever
    fetches relevant documents from a vector store, the combiner combines the
    retrieved documents with the input context and question, and the LLM
    generates a response based on the combined input.

    The prompt template is used to define the format of the input to the
    combiner. The template includes variables for the context and question,
    which are populated by the input to the endpoint.

    The Qdrant vector store is used to store the documents that the chatbot
    uses to generate responses. The Qdrant client is configured with the URL
    of the Qdrant server, which is set as an environment variable.
    """

    # Define the prompt template
    prompt = PromptTemplate(
        input_variables=["context", "question"],
        template="""
            คุณคือผู้ช่วยอัจฉริยะชื่อ น้องน้ำหวาน ความเชี่ยวชาญของคุณคือการให้คำปรึกษาด้านคู่มือปฏิบัติงาน
            การเบิกจ่ายค่าใช้จ่ายในการดำเนินงาน มหาวิทยาลัยเทคโนโลยีราชมงคลล้านนา 
            กรุณาตอบคำถามในรูปแบบ Markdown และ ใช้ภาษาไทยเท่านั้น 
            โปรดให้คำตอบที่ชัดเจนและละเอียด พร้อมอธิบายขั้นตอนอย่างเป็นลำดับ 
            หากข้อมูลไม่เพียงพอที่จะตอบคำถาม โปรดระบุว่า "น้องน้ำหวานไม่สามารถหาคำตอบจากเอกสารได้ค่ะ"
            คุณสามารถใช้คำลงท้าย "ค่ะ" หรือ "ไม่ค่ะ" ในคำตอบเพื่อเพิ่มความรู้สึก 
            ขอให้คำตอบมีอารมณ์ และ ความเป็นมิตรในทุกคำตอบค่ะ 
                    
        {context}

        คำถามต้นฉบับ: {question}
        """,
    )

    # Initialize the embeddings
    embeddings = OpenAIEmbeddings(
        model="text-embedding-3-large",
    )

    # Setup Qdrant client and vector store
    url = QDRANT_VECTERDB_HOST

    print("------------------------------------------------------------")
    print(f"Qdrant URL: {url}")
    print("------------------------------------------------------------")

    # Create the Qdrant client and vector store
    qdrant_client = QdrantClient(url)
    qdrant_store = QdrantVectorStore(
        client=qdrant_client, collection_name="my_documents", embedding=embeddings
    )

    # Create the ConversationalRetrievalChain
    return ConversationalRetrievalChain.from_llm(
        llm=ChatOpenAI(
            model="gpt-4o-mini",
            temperature=0.7,
            max_tokens=3000,
            timeout=30,
            max_retries=5,
        ),
        retriever=qdrant_store.as_retriever(
            search_type="similarity", search_kwargs={"k": 10, "score_threshold": 0.5}
        ),
        combine_docs_chain_kwargs={"prompt": prompt},
        return_source_documents=False,
    )


@router.get("/")
async def root():
    """
    Root endpoint to welcome users to the chatbot API.
    """
    logger.info("Root endpoint was accessed.")
    return {"message": "Welcome to the RMUTL chatbot API!"}


@router.post("/chat")
async def chat(request: QueryModel):
    """
    API for chatbot interaction.
    Receives user query and responds with chatbot-generated answer.
    """
    logger.info(f"Received user query: {request.query}")

    chain = create_chatbot_chain()

    result = chain.invoke({"question": request.query, "chat_history": chat_history})

    chat_history.append((request.query, result["answer"]))

    logger.info(f"Response sent to user: {result['answer']}")

    # Source document handling
    source_document = (
        result["source_documents"][0].metadata.get("source", None)
        if "source_documents" in result and len(result["source_documents"]) > 0
        else None
    )
    source_document_page = (
        result["source_documents"][0].metadata.get("page", None)
        if source_document
        else None
    )

    return {
        "message": result["answer"],
        "source": source_document,
        "page": source_document_page,
    }


@router.post("/chat_streaming")
async def chat_streaming(request: QueryModel):
    """
    API for chatbot interaction.
    Receives user query and responds with chatbot-generated answer.
    """
    logger.info(f"Received user query: {request.query}")

    chain = create_chatbot_chain()

    result = chain.invoke({"question": request.query, "chat_history": chat_history})

    chat_history.append((request.query, result["answer"]))

    logger.info(f"Response sent to user: {result['answer']}")

    # Source document handling
    source_document = (
        result["source_documents"][0].metadata.get("source", None)
        if "source_documents" in result and len(result["source_documents"]) > 0
        else None
    )
    source_document_page = (
        result["source_documents"][0].metadata.get("page", None)
        if source_document
        else None
    )

    return {
        "message": result["answer"],
        "source": source_document,
        "page": source_document_page,
    }


@router.get("/history")
async def get_history():
    """
    API to fetch chat history.
    """
    logger.info("Chat history requested.")
    return chat_history


@router.post("/clear-history")
async def clear_history():
    """
    API to clear chat history.
    """
    global chat_history
    chat_history.clear()
    logger.info("Chat history cleared.")
    return {"message": "Chat history cleared."}


# Include the router into the FastAPI app
app.include_router(router)
