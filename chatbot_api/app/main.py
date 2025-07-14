# FastAPI
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Routers
from app.routers import router_chat
from app.routers import router_login


# Initialize FastAPI
app = FastAPI(
    title="RMUTL Chatbot LLM API endpoint",
    description="API  RMUTL chatbot",
)

# Add CORS middlewares
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Health Check Endpoint
@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}


# Include the router into the FastAPI app
app.include_router(router_chat.router)
app.include_router(router_login.router)
