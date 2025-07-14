# FastAPI
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Routers
from app.router.router import router

app = FastAPI(
    title="RMUTL Chatbot login System  API endpoint",
    description="API  RMUTL chatbot",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)
