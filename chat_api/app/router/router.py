from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from fastapi.security import OAuth2PasswordRequestForm

from app.login_system import auth
from app.login_system.login import register, get_db, login, logout, refresh
from app.login_system.schemas import UserCreate


class QueryModel(BaseModel):
    query: str = "สวัสดีครับ"
router = APIRouter(prefix="/api")


@router.get("/")
async def read_root():
    """
    Root endpoint of the API.
    Returns a simple message to indicate that the API is running.
    """
    return {"message": "API endpoint for RMUTL chatbot login system is running..."}


@router.post("/register")
def register_user(
    user: UserCreate,  # User data from request body
    db: Session = Depends(get_db),  # Database session
) -> dict:
    """
    Endpoint to register a new user.
    Returns a success message upon creating the user.
    """
    return register(user, db)


@router.post("/login")
def login_user(
    form_data: OAuth2PasswordRequestForm = Depends(),  # Form data of username and password
    db: Session = Depends(get_db),  # Database session
) -> dict:
    """
    Endpoint to login to the system.
    Returns a JSON object with access and refresh tokens.
    """
    return login(form_data, db)


@router.post("/logout")
def logout_user(token: str = Depends(auth.oauth2_scheme)):
    """
    Endpoint to logout from the system.
    Revokes the given access token and returns a success message.
    """
    # Revoke the access token
    return logout(token)


@router.post("/refresh")
def refresh_token(refresh_token: str):
    """
    Endpoint to refresh the access token using a refresh token.

    Args:
        refresh_token (str): The refresh token provided by the client.

    Returns:
        dict: A JSON object containing the new access token.
    """
    # Call the refresh function to obtain a new access token
    return refresh(refresh_token)
