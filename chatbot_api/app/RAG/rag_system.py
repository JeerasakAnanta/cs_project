import os
import logging

# loding environment variable
from dotenv import load_dotenv

# langchain
from langchain.chains import ConversationalRetrievalChain
from langchain.prompts import PromptTemplate
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_openai import OpenAIEmbeddings

# vecter database
from langchain_qdrant import QdrantVectorStore
from pydantic import BaseModel
from qdrant_client import QdrantClient

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
from qdrant_client import QdrantClient


# Load environment variables from .env file
load_dotenv(".env")

# Setup Qdrant client and vector store
url = os.getenv("QDRANT_VECTERDB_HOST")
COLLECTION = os.getenv("COLLECTION_NAME")

# print  qdrant  url
print("------------------------------------------------------------")
print(f"Qdrant URL: {url}")
print(f"COLLECTION_NAME: {os.getenv("COLLECTION_NAME")}")
print("------------------------------------------------------------")


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
            คุณคือผู้ช่วยอัจฉริยะ มีความเชี่ยวชาญของคุณคือการให้คำปรึกษาด้านคู่มือปฏิบัติงาน
            การเบิกจ่ายค่าใช้จ่ายในการดำเนินงาน มหาวิทยาลัยเทคโนโลยีราชมงคลล้านนา 
            กรุณาตอบคำถามในรูปแบบ Markdown และ ใช้ภาษาไทยเท่านั้น 
            โปรดให้คำตอบที่ชัดเจนและละเอียด พร้อมอธิบายขั้นตอนอย่างเป็นลำดับ 
            หากข้อมูลไม่เพียงพอที่จะตอบคำถาม โปรดระบุว่า "น้องน้ำหวานไม่สามารถหาคำตอบจากเอกสารได้ค่ะ"
            คุณสามารถใช้คำลงท้าย "ค่ะ" หรือ "ไม่ค่ะ" ในคำตอบเพื่อเพิ่มความรู้สึก 
            ขอให้คำตอบมีอารมณ์ และ ความเป็นมิตรในทุกคำตอบค่ะ  ถ้าสรุปเป็นตารางให้สรุป
                
        {context}
        
        
        คำถามต้นฉบับ: {question}
        
    
        
        """,
    )

    # Initialize the embeddings
    embeddings = OpenAIEmbeddings(
        model="text-embedding-3-large",
    )

    # Setup Qdrant client and vector store
    url = os.getenv("QDRANT_VECTERDB_HOST")
    COLLECTION = os.getenv("COLLECTION_NAME")

    # print  qdrant  url
    print("------------------------------------------------------------")
    print(f"Qdrant URL: {url}")
    print(f"COLLECTION_NAME : {os.getenv("COLLECTION_NAME")}")
    print("------------------------------------------------------------")

    # Create the Qdrant client and vector store
    qdrant_client = QdrantClient(url)
    qdrant_store = QdrantVectorStore(
        client=qdrant_client,
        collection_name=os.getenv("COLLECTION_NAME"),
        embedding=embeddings,
    )

    # Create the ConversationalRetrievalChain
    return ConversationalRetrievalChain.from_llm(
        llm=ChatOpenAI(
            model="gpt-4o-mini",
            temperature=0.3,
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


# Store for chat history
chat_history: list[tuple[str, str]] = []


def chatbot(user_massage: str) -> str:
    """
    API for chatbot interaction.
    Receives user query and responds with chatbot-generated answer.
    """

    chain = create_chatbot_chain()

    result = chain.invoke({"question": user_massage, "chat_history": chat_history})

    chat_history.append((user_massage, result["answer"]))

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
