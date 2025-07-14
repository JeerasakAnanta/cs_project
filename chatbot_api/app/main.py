from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Routers
from app.routers import router_chat
from app.routers import router_login

# ระบบตรวจสอบก่อนรัน
from app.utils.startup_check import run_all_checks
#
run_all_checks()

# Initialize FastAPI
app = FastAPI(
    title="RMUTL Chatbot LLM API endpoint",
    description="API  RMUTL chatbot",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Health Check
@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "healthy"}


# Routers
app.include_router(router_chat.router)
app.include_router(router_login.router)
