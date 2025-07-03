import os
from dotenv import load_dotenv
from langchain.chat_models import init_chat_model
from langchain_core.messages import SystemMessage
from langchain_core.tools import tool
from langgraph.graph import MessagesState, StateGraph, END
from langgraph.prebuilt import ToolNode, tools_condition
from langchain_qdrant import QdrantVectorStore
from qdrant_client import QdrantClient
from langchain_openai import OpenAIEmbeddings


# Load environment variables
load_dotenv()

# Initialize the embeddings
embeddings = OpenAIEmbeddings(
    model="text-embedding-3-large",
)

# Setup Qdrant client and vector store
QDRANT_URL = os.getenv("QDRANT_VECTERDB_HOST", "http://localhost:6333")
COLLECTION_NAME = os.getenv("COLLECTION_NAME", "01_docs")

qdrant_client = QdrantClient(url=QDRANT_URL)
qdrant_store = QdrantVectorStore(
    client=qdrant_client,
    collection_name=COLLECTION_NAME,
    embedding=embeddings,
)

# Initialize LLM
llm = init_chat_model("gpt-4o-mini", model_provider="openai")


@tool(response_format="content_and_artifact")
def retrieve(query: str):
    """Retrieve information related to a query."""
    docs = qdrant_store.similarity_search(query, k=5)
    serialized = "\n\n".join(
        f"Source: {doc.metadata}\nContent: {doc.page_content}" for doc in docs
    )
    return serialized, docs


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
    system_message_content = (
        "You are a Thai assistant for question-answering tasks. "
        "Use the following retrieved context to answer the question. "
        "If you don't know the answer, say you don't know. "
        "Use three sentences maximum. Be concise.\n\n"
        f"{docs_content}"
    )

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
