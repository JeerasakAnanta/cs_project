from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers.router_chat import router as router_chat
from app.routers.router_login import router as router_login

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



