from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import routers


# Initialize FastAPI
app = FastAPI(
    title="RMUTL Chatbot LLM API endpoint",
    description="API for RMUTL chatbot interaction with LLM ",
)

# Add CORS middlewares
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the router into the FastAPI app
app.include_router(routers.router)
