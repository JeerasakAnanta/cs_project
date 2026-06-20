import os
import logging
from typing import Any, List
from dotenv import load_dotenv
from langchain.chat_models import init_chat_model
from langchain_core.messages import SystemMessage, HumanMessage
from langchain_core.tools import tool
from langgraph.graph import MessagesState, StateGraph, END
from langgraph.prebuilt import ToolNode, tools_condition
from langchain_qdrant import QdrantVectorStore
from qdrant_client import QdrantClient
from langchain_openai import OpenAIEmbeddings

# Load environment
from app.utils.config import OPENAI_API_KEY, COLLECTION_NAME, QDRANT_URL, EMBEDDINGS_MODEL, OPENAI_MODEL

# Initialize the embeddings
embeddings = OpenAIEmbeddings(
    model=EMBEDDINGS_MODEL,
)

# Setup Qdrant client and vector store
qdrant_client = QdrantClient(url=QDRANT_URL)
qdrant_store = QdrantVectorStore(
    client=qdrant_client,
    collection_name=COLLECTION_NAME,
    embedding=embeddings,
)

# Initialize LLM
llm = init_chat_model(OPENAI_MODEL, model_provider="openai")


@tool(response_format="content_and_artifact")
def retrieve(query: str):
    """Retrieve information related to a query from Thai documents."""
    try:
        # เพิ่มการค้นหาที่หลากหลายสำหรับภาษาไทย
        search_queries = [
            query,  # คำค้นเดิม
            query.replace(" ", ""),  # ลบช่องว่าง
            query.replace("การ", "").replace("ค่า", "").replace("ใน", ""),  # ลบคำฟังก์ชัน
        ]
        
        all_docs = []
        for search_query in search_queries:
            if search_query.strip():  # ตรวจสอบว่าไม่ใช่สตริงว่าง
                docs = qdrant_store.similarity_search_with_score(search_query, k=5)
                all_docs.extend(docs)
        
        # ลบเอกสารที่ซ้ำกันและเพิ่มข้อมูลความเชื่อมั่น
        seen_content = set()
        unique_docs = []
        for doc, score in all_docs:
            if doc.page_content not in seen_content:
                seen_content.add(doc.page_content)
                # เพิ่มข้อมูลความเชื่อมั่นใน metadata
                doc.metadata['confidence_score'] = float(score)
                unique_docs.append((doc, score))
        
        # เรียงลำดับตามความเกี่ยวข้อง (ใช้เฉพาะ 10 อันดับแรก)
        unique_docs = sorted(unique_docs, key=lambda x: x[1], reverse=True)[:10]
        
        # แยก docs และ scores
        docs_only = [doc for doc, score in unique_docs]
        
        serialized = "\n\n".join(
            f"Source: {doc.metadata.get('filename', 'Unknown')} (Page: {doc.metadata.get('page', 'N/A')}, Confidence: {doc.metadata.get('confidence_score', 0):.2f})\nContent: {doc.page_content}" 
            for doc in docs_only
        )
        
        logging.info(f"Retrieved {len(docs_only)} documents for query: {query}")
        return serialized, docs_only
        
    except Exception as e:
        logging.error(f"Error in retrieve function: {e}")
        return "ไม่สามารถค้นหาข้อมูลได้", []


def query_or_respond(state: MessagesState):
    llm_with_tools = llm.bind_tools([retrieve])
    response = llm_with_tools.invoke(state["messages"])
    return {"messages": [response]}


tools_node = ToolNode([retrieve])


def generate(state: MessagesState):
    recent_tool_messages = [
        msg for msg in reversed(state["messages"]) if msg.type == "tool"
    ][::-1]

    docs_content = "\n\n".join(doc.content for doc in recent_tool_messages)
    
    # ปรับปรุง system message สำหรับภาษาไทย
    system_message_content = f"""
คุณคือ LannaFinChat ผู้ช่วยอัจฉริยะทางการเงินของมหาวิทยาลัยเทคโนโลยีราชมงคลล้านนา น่าน

คุณมีความเชี่ยวชาญในการให้คำปรึกษาเกี่ยวกับ **"คู่มือปฏิบัติงานด้านการเงินและการเบิกจ่ายค่าใช้จ่ายในการดำเนินงาน"**

**กรุณาปฏิบัติตามเงื่อนไขในการตอบคำถาม:**
- ใช้ **ภาษาไทย** เท่านั้น  
- ตอบในรูปแบบ **Markdown**  
- ให้คำตอบที่ **ชัดเจน ละเอียด เป็นลำดับขั้นตอน**  
- หากจำเป็น สรุปเป็น **ตาราง Markdown**  
- หากข้อมูลไม่เพียงพอ ให้ตอบว่า: `"LannaFinChat ไม่สามารถหาคำตอบจากเอกสารได้ครับ"`  
- ลงท้ายว่า "**ครับ**" หรือ "**ไม่ครับ**"  
- คำตอบควรมี **ความสุภาพ อารมณ์ดี และเป็นมิตร**

**ข้อมูลที่เกี่ยวข้อง:**
{docs_content}

กรุณาตอบคำถามโดยใช้ข้อมูลข้างต้น หากไม่มีข้อมูลที่เกี่ยวข้อง ให้บอกว่าไม่สามารถหาคำตอบได้
"""

    conversation_messages = [
        msg
        for msg in state["messages"]
        if msg.type in ("human", "system") or (msg.type == "ai" and not msg.tool_calls)
    ]
    
    prompt = [SystemMessage(system_message_content)] + conversation_messages
    response = llm.invoke(prompt)
    return {"messages": [response]}


# Build graph
graph_builder = StateGraph(MessagesState)
graph_builder.add_node(query_or_respond)
graph_builder.add_node(tools_node)
graph_builder.add_node(generate)

graph_builder.set_entry_point("query_or_respond")
graph_builder.add_conditional_edges(
    "query_or_respond", tools_condition, {END: END, "tools": "tools"}
)
graph_builder.add_edge("tools", "generate")
graph_builder.add_edge("generate", END)

graph = graph_builder.compile()

# ฟังก์ชัน chatbot สำหรับใช้งานในระบบเดิม
def chatbot(user_message: str) -> dict[str, Any]:
    """
    API for chatbot interaction using LangGraph.
    Receives user query and responds with chatbot-generated answer.
    """
    try:
        # สร้าง messages สำหรับ LangGraph
        messages = [HumanMessage(content=user_message)]
        
        # เรียกใช้ graph
        result = graph.invoke({"messages": messages})
        
        # ดึงคำตอบจาก AI message ล่าสุด
        ai_messages = [msg for msg in result["messages"] if msg.type == "ai"]
        if ai_messages:
            answer = ai_messages[-1].content
        else:
            answer = "ขออภัยครับ ไม่สามารถประมวลผลคำถามได้"
        
        # ดึงข้อมูล source documents จาก tool messages
        tool_messages = [msg for msg in result["messages"] if msg.type == "tool"]
        source_documents = []
        
        if tool_messages:
            # ดึงข้อมูลจาก tool message ล่าสุด
            latest_tool_msg = tool_messages[-1]
            if hasattr(latest_tool_msg, 'artifact') and latest_tool_msg.artifact:
                docs = latest_tool_msg.artifact
                if docs and len(docs) > 0:
                    # สร้างรายการเอกสารอ้างอิงที่ครบถ้วน
                    for doc in docs:
                        source_documents.append({
                            'filename': doc.metadata.get('filename', 'Unknown'),
                            'page': doc.metadata.get('page', None),
                            'confidence_score': doc.metadata.get('confidence_score', 0.0),
                            'content_preview': doc.page_content[:200] + '...' if len(doc.page_content) > 200 else doc.page_content,
                            'full_content': doc.page_content
                        })
        
        # เก็บข้อมูลเดิมเพื่อ backward compatibility
        source_document = source_documents[0]['filename'] if source_documents else None
        source_document_page = source_documents[0]['page'] if source_documents else None
        
        logging.info(f"LangGraph chatbot response generated for query: {user_message}")
        
        return {
            "message": answer,
            "source_document": source_document,
            "source_document_page": source_document_page,
            "source_documents": source_documents
        }
        
    except Exception as e:
        logging.error(f"Error in LangGraph chatbot: {e}")
        return {
            "message": "ขออภัยครับ เกิดข้อผิดพลาดในการประมวลผลคำถาม",
            "source_document": None,
            "source_document_page": None,
            "source_documents": []
        }
