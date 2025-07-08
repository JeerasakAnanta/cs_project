# Import necessary libraries
from langchain_community.embeddings.openai import OpenAIEmbeddings
import logging

logger = logging.getLogger(__name__)


embeddings = OpenAIEmbeddings(model="text-embedding-3-large")

import os
from dotenv import load_dotenv

load_dotenv()
QDRANT_VECTERDB_HOST = os.getenv("QDRANT_VECTERDB_HOST", "http://localhost:6333")
COLLECTION_NAME = os.getenv("COLLECTION_NAME", "rmutl_chatbot")

from langchain_qdrant import QdrantVectorStore
from qdrant_client import QdrantClient

client = QdrantClient(QDRANT_VECTERDB_HOST, port=6333)

vector_store = QdrantVectorStore(
    client=client,
    collection_name=COLLECTION_NAME,
    embedding=embeddings,
)

from docling.document_converter import DocumentConverter

source = "https://arxiv.org/pdf/2408.09869"  # document per local path or URL
converter = DocumentConverter()
result = converter.convert(source)
print(
    result.document.export_to_markdown()
)  # output: "## Docling Technical Report[...]"
