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
app = FastAPI()

# Middleware for CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this to your needs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Include the router in the main FastAPI app
app.include_router(router_login)
app.include_router(router_chat)
app.include_router(router_feedback)
app.include_router(router_pdfs)
app.include_router(router_admin)



