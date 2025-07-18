from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import database utils and models
from app.utils.database import engine, Base
from app.database import models

# Import routers
from app.chat.router import router as router_chat
from app.routers.router_login import router as router_login
from app.chat.feedback_router import router as router_feedback
from app.routers.router_pdfs import router as router_pdfs
from app.routers.router_admin import router as router_admin


# Create all tables in the database
models.Base.metadata.create_all(bind=engine)

# Initialize FastAPI
app = FastAPI(title="LannaFinChat API", description="API for LannaFinChat")

# Middleware for CORS
import os
from app.utils.config import DEBUG

# Configure CORS based on environment
if DEBUG:
    # Development: Allow all origins
    origins = ["*"]
else:
    # Production: Allow specific origins
    origins = [
        "http://localhost:8000",
        "http://localhost:3000",
        "https://your-production-domain.com"
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Root endpoint
app.get("/")(lambda: {"message": "LannaFinChat API is running..."})

# Include the router in the main FastAPI app
# Authentication routers    
app.include_router(router_login)

# Chat routers
app.include_router(router_chat)
app.include_router(router_feedback)

# PDF routers
app.include_router(router_pdfs)

# Admin routers
app.include_router(router_admin)



