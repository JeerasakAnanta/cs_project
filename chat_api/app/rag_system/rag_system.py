import logging
from typing import Any

# Environment Variables
from app.utils.config import OPENAI_API_KEY, QDRANT_URL, COLLECTION_NAME, OPENAI_MODEL , EMBEDDINGS_MODEL 

# LangChain framework
from langchain.chains import ConversationalRetrievalChain
from langchain.prompts import PromptTemplate
from langchain_openai import ChatOpenAI, OpenAIEmbeddings

# Vector Database
from langchain_qdrant import QdrantVectorStore
from qdrant_client import QdrantClient

def create_chatbot_chain() -> ConversationalRetrievalChain:
    """
    Create a ConversationalRetrievalChain with a custom prompt.
    """

    prompt = PromptTemplate(
        input_variables=["context", "question"],
        template="""
คุณคือ LannaFinChat ผู้ช่วยอัจฉริยะทางการเงินของมหาวิทยาลัยเทคโนโลยีราชมงคลล้านนา น่าน  
คุณมีความเชี่ยวชาญในการให้คำปรึกษาเกี่ยวกับ **"คู่มือปฏิบัติงานด้านการเงินและการเบิกจ่ายค่าใช้จ่ายในการดำเนินงาน"**  
ครอบคลุมหัวข้อต่าง ๆ เช่น:
- การเบิกค่าใช้จ่ายในการเดินทางไปราชการ    

**กรุณาปฏิบัติตามเงื่อนไขในการตอบคำถาม:**
- ใช้ **ภาษาไทย** เท่านั้น  
- ตอบในรูปแบบ **Markdown**  
- ให้คำตอบที่ **ชัดเจน ละเอียด เป็นลำดับขั้นตอน**  
- หากจำเป็น สรุปเป็น **ตาราง Markdown**  
- หากข้อมูลไม่เพียงพอ ให้ตอบว่า:
  > `"LannaFinChat ไม่สามารถหาคำตอบจากเอกสารได้ครับ"`  
- ลงท้ายว่า "**ครับ**" หรือ "**ไม่ครับ**"  
- คำตอบควรมี **ความสุภาพ อารมณ์ดี และเป็นมิตร**

> ตัวอย่างคำตอบ:  
> LannaFinChat ขออธิบายขั้นตอน ดังนี้ต่อไปครับ...  
> จากข้อมูลที่คุณให้มา ขออธิบายขั้นตอน ดังนี้ต่อไปครับ

Context:
{context}

คำถามต้นฉบับ: {question}
        """,
    )

    # Qdrant Client and Vector Store
    qdrant_client = QdrantClient(QDRANT_URL)
    qdrant_store = QdrantVectorStore(
        client=qdrant_client,
        collection_name=str(COLLECTION_NAME),
        embedding=OpenAIEmbeddings(model=str(EMBEDDINGS_MODEL))
    )

    # ConversationalRetrievalChain
    return ConversationalRetrievalChain.from_llm(
        # LLM 
        llm=ChatOpenAI(model=str(OPENAI_MODEL)),
        
        # Retriever 
        retriever=qdrant_store.as_retriever(
            search_type="similarity", 
            search_kwargs={"k": 10, "score_threshold": 0.5}
        ),
        # Prompt Template  
        combine_docs_chain_kwargs={"prompt": prompt},
        # Return Source Documents
        return_source_documents=False,
    )


chat_history: list[tuple[str, str]] = []

def chatbot(user_message: str) -> dict[str, Any]:
    """
    API for chatbot interaction.
    Receives user query and responds with chatbot-generated answer.
    """
     
    # Create Chatbot Chain 
    chain = create_chatbot_chain()


    # Invoke Chatbot Chain 
    result = chain.invoke({
        "question": user_message,
        "chat_history": chat_history
    })

    # Update Chat History  
    chat_history.append((user_message, result["answer"]))

    # Optional: handle source documents 
    # Source Document Metadata  
    source_document = (
        result["source_documents"][0].metadata.get("source")
        if "source_documents" in result and len(result["source_documents"]) > 0
        else None
    )
    source_document_page = (
        result["source_documents"][0].metadata.get("page")
        if source_document else None
    )

    # Return Response 
    return {
        "message": result["answer"],
        "source_document": source_document,
        "source_document_page": source_document_page
    }
