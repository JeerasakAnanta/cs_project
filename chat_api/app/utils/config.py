import os
from dotenv import load_dotenv

load_dotenv()

# Environment validation
def validate_environment():
    """Validate that all required environment variables are set."""
    required_vars = [
        "OPENAI_API_KEY",
        "QDRANT_VECTERDB_HOST", 
        "COLLECTION_NAME",
        "DB_USER",
        "DB_PASSWORD",
        "DB_HOST",
        "DB_NAME",
        "SECRET_KEY",
        "REFRESH_SECRET",
        "ALGORITHM"
    ]
    
    missing_vars = []
    for var in required_vars:
        if not os.getenv(var):
            missing_vars.append(var)
    
    if missing_vars:
        raise ValueError(f"Missing required environment variables: {', '.join(missing_vars)}")

# Validate environment on import
try:
    validate_environment()
except ValueError as e:
    print(f"⚠️  Environment validation failed: {e}")
    print("Please check your .env file and ensure all required variables are set.")

# Environment variables
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
QDRANT_VECTERDB_HOST = os.getenv("QDRANT_VECTERDB_HOST")
COLLECTION_NAME = os.getenv("COLLECTION_NAME")
QDRANT_URL = os.getenv("QDRANT_VECTERDB_HOST")

# Database
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_HOST = os.getenv("DB_HOST")
DB_NAME = os.getenv("DB_NAME")

# JWT Configuration
ACCESS_SECRET = os.getenv("SECRET_KEY")
REFRESH_SECRET = os.getenv("REFRESH_SECRET")
ALGORITHM = os.getenv("ALGORITHM")

# OpenAI Configuration
EMBEDDINGS_MODEL = os.getenv("EMBEDDINGS_MODEL", "text-embedding-3-large")

# Development settings
DEBUG = os.getenv("DEBUG", "false").lower() == "true"
