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

# loading environment variable
from app.utils.config import OPENAI_API_KEY, QDRANT_URL, COLLECTION_NAME 


def create_chatbot_chain() -> ConversationalRetrievalChain:
    """
    Create a ConversationalRetrievalChain with a custom prompt.
    """

    # Define the prompt template
    prompt = PromptTemplate(
        input_variables=["context", "question"],
        template="""
            คุณคือ LannaFinChat ผู้ช่วยอัจฉริยะของมหาวิทยาลัยเทคโนโลยีราชมงคลล้านนา  
            ความเชี่ยวชาญของคุณคือ **การให้คำปรึกษาเกี่ยวกับ "คู่มือปฏิบัติงานด้านการเงินและการเบิกจ่ายค่าใช้จ่ายในการดำเนินงาน"**  
            โดยครอบคลุมหัวข้อต่าง ๆ เช่น:  
            - การเบิกค่าใช้จ่ายในการเดินทางไปราชการ    

            กรุณาปฏิบัติตามเงื่อนไขต่อไปนี้ในการตอบคำถาม:

            - ใช้ **ภาษาไทย** เท่านั้น  
            - ตอบในรูปแบบ **Markdown**  
            - ให้คำตอบที่ **ชัดเจน ละเอียด และเป็นลำดับขั้นตอน**  
            - หากจำเป็นให้สรุปเป็น **ตาราง Markdown**  
            - หากข้อมูลในคำถามไม่เพียงพอ ให้ตอบว่า  
            > `"LannaFinChat ไม่สามารถหาคำตอบจากเอกสารได้ครับ"`  
            - ใช้คำลงท้าย "**ครับ**" หรือ "**ไม่ครับ**"  
            - ทุกคำตอบต้องมี **อารมณ์ ความเป็นมิตร และสุภาพ** เพื่อให้ผู้อ่านรู้สึกดีครับ  

            > ตัวอย่างการขึ้นต้นคำตอบ:  
            > สวัสดีครับ 😊 LannaFinChat ขออธิบายขั้นตอน ดังนี้ต่อไปครับ...

            Context:
            
        {context}
        คำถามต้นฉบับ: {question}
        """,
    )

    # Initialize the embeddings
    embeddings = OpenAIEmbeddings(
        model="text-embedding-3-large",
    )

    # Create the Qdrant client and vector store
    qdrant_client = QdrantClient(QDRANT_URL)
    qdrant_store = QdrantVectorStore(
        client=qdrant_client,
        collection_name=COLLECTION_NAME,
        embedding=embeddings,
    )

    # Create the ConversationalRetrievalChain
    return ConversationalRetrievalChain.from_llm(
        llm=ChatOpenAI(
            model="gpt-4o-mini",
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
        "message": result["answer"]
    }
