#!/usr/bin/env python3
# -*- coding: utf-8 -*-


import glob
import os

from dotenv import load_dotenv
from langchain.document_loaders import PyMuPDFLoader
from langchain.text_splitter import CharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
from langchain_qdrant import QdrantVectorStore
from tqdm import tqdm

# setup environment variable
load_dotenv()

# Load environment variables
os.environ["OPENAI_API_KEY"] = os.getenv("OPENAI_API_KEY")
# Initialize embeddings

embeddings = OpenAIEmbeddings(
    model="text-embedding-3-large",
)

# Load PDF using PyMuPDFLoader
pdfs = glob.glob("./pdfs/*.pdf")

print("==================================================")
print(pdfs)
print("pwd: ", os.getcwd())
print("==================================================")
print("start loading documents...")

try:
    # Load documents
    for pdf_path in tqdm(pdfs):
        loader = PyMuPDFLoader(pdf_path)
        documents = loader.load()

        # Split the text into chunks
        text_splitter = CharacterTextSplitter(
            separator="\n", chunk_size=1000, chunk_overlap=200
        )
        chunks = text_splitter.split_documents(documents)

        # On-premise server deployment
        # Ensure the correct URL and port are used.
        # If running locally, use localhost or the actual IP address.
        url = "http://0.0.0.0:6333"  # Adjust this if necessary

        # Initialize QdrantVectorStore with the chunks
        qdrant = QdrantVectorStore.from_documents(
            chunks,
            embeddings,
            url=url,
            prefer_grpc=False,  # Disable gRPC in case it's not enabled on the server
            collection_name="my_documents",
        )

except Exception as e:
    print(f"Error: {e}")

# Wait for embeddings to finish
print("==================================================")
print("Embeddings complete :)")
print("Your documents have been loaded into Qdrant!")
print("==================================================")
