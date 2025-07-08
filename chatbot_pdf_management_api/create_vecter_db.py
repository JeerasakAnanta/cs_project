#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import glob
import os

from dotenv import load_dotenv

from langchain.text_splitter import CharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
from langchain_qdrant import QdrantVectorStore
from qdrant_client.http.models import Distance, VectorParams
from qdrant_client import QdrantClient

from tqdm import tqdm

# setup environment variable
load_dotenv()

# Load environment variables
os.environ["OPENAI_API_KEY"] = os.getenv("OPENAI_API_KEY")

# Initialize embeddings
embeddings = OpenAIEmbeddings(
    model="text-embedding-3-large",
)

print("===========================")
print("Creating vector database...")
print("===========================")

# Initialize Qdrant client
client = QdrantClient(url=os.getenv("QDRANT_URL", "http://localhost:6333"))

client.create_collection(
    collection_name="docs_collection",
    vectors_config=VectorParams(
        size=embeddings.embedding_dim, distance=Distance.COSINE
    ),
)
# Wait for embeddings to finish
print("==================================================")
print("creating vecter db  :)")
print("Your documents have been loaded into Qdrant!")
print("==================================================")
