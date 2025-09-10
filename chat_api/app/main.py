from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

# Import database utils and models
from app.utils.database import engine, Base
from app.database import models
from app.utils.logging_config import setup_logging

# Import routers
from app.chat.router import router as router_chat
from app.chat.anonymous_router import router as router_anonymous
from app.chat.guest_router import router as router_guest
from app.routers.router_login import router as router_login
from app.chat.feedback_router import router as router_feedback
from app.routers.router_pdfs import router as router_pdfs
from app.routers.router_admin import router as router_admin
from app.routers.router_admin_conversations import router as router_admin_conversations


# Setup logging with system timezone
setup_logging(
    log_level="INFO",
    log_file="log/app.log"
)

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
        "https://chat.jeerasakananta.dev",
        "https://apichat.jeerasakananta.dev",
    ]

# For development, always allow localhost:8000
if "http://localhost:8000" not in origins:
    origins.append("http://localhost:8000")

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
app.include_router(router_anonymous)
app.include_router(router_guest)
app.include_router(router_feedback)

# PDF routers
app.include_router(router_pdfs)

# Admin routers
app.include_router(router_admin)
app.include_router(router_admin_conversations)

@app.on_event("startup")
async def startup_event():
    """Log application startup with system time"""
    from app.utils.timezone import now, format_datetime
    logging.info(f"LannaFinChat API started at {format_datetime(now())}")



