import os

from qdrant_client import QdrantClient
from qdrant_client.http.models import Distance, VectorParams
from dotenv import load_dotenv

load_dotenv(".env")

QDRANT_VECTERDB_HOST = os.getenv("QDRANT_VECTERDB_HOST")
COLLECTION_NAME = os.getenv("COLLECTION_NAME")

client = QdrantClient(QDRANT_VECTERDB_HOST, port=6333)


def create_collection():
    """
    Creates a collection in Qdrant vector store if it does not exist.
    The collection is created with a vector size of 3072 and a cosine distance.
    """
    try:
        client.get_collection(collection_name=COLLECTION_NAME)
        print("Collection already exists")
    except:
        client.create_collection(
            collection_name=COLLECTION_NAME,
            vectors_config=VectorParams(size=3072, distance=Distance.COSINE),
        )
        print("Collection created")


if __name__ == "__main__":
    create_collection()
