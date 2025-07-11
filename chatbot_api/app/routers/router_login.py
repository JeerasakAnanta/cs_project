import os
import logging
from pydantic import BaseModel
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm
from app.login_system import auth
from app.login_system.login import register, get_db, login, logout, refresh
from app.login_system.schemas import UserCreate

# Create log folder if it doesn't exist
if not os.path.exists("./log"):
    os.makedirs("./log")

# Configure logging
logging.basicConfig(
    filename="./log/app.log",
    level=logging.INFO,
    format="%(asctime)s - %(levelname)-8s - %(message)s",
)

logger = logging.getLogger(__name__)

# Initialize FastAPI router
router = APIRouter(prefix="/api", tags=["Authentication"])


# Model for chat query
class QueryModel(BaseModel):
    query: str = "สวัสดีครับ"


@router.get("/login", tags=["Authentication"])
async def read_root():
    """Root endpoint of the API."""
    return {"message": "API endpoint for RMUTL chatbot login system is running..."}


@router.post("/login", tags=["Authentication"])
def login_user(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
) -> dict:
    """Endpoint to login to the system."""
    return login(form_data, db)


@router.post("/logout", tags=["Authentication"])
def logout_user(token: str = Depends(auth.oauth2_scheme)):
    """Endpoint to logout from the system."""
    return logout(token)


@router.post("/refresh", tags=["Authentication"])
def refresh_token(refresh_token: str):
    """Endpoint to refresh the access token using a refresh token."""
    return refresh(refresh_token)
