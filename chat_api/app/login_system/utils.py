import jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta

# Load environment variables
from app.utils.config import ACCESS_SECRET, REFRESH_SECRET, ALGORITHM


# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Password Utils
def hash_password(password: str) -> str:
    """
    Hash a password using bcrypt
    """ 
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a password against a hashed password
    """
    return pwd_context.verify(plain_password, hashed_password)


# Token Utils
def create_token(data: dict, secret: str, expires_delta: timedelta) -> str:
    """
    Create a JWT token
    """
    to_encode = data.copy()
    to_encode.update({"exp": datetime.utcnow() + expires_delta})
    return jwt.encode(to_encode, secret, algorithm=ALGORITHM)


def decode_token(token: str, secret: str) -> dict:
    """
    Decode a JWT token and return the payload   
    """
    return jwt.decode(token, secret, algorithms=[ALGORITHM])


# Access Token
def create_access_token(data: dict, expires_minutes: int = 15) -> str:
    """
    Create an access token
    """
    return create_token(data, ACCESS_SECRET, timedelta(minutes=expires_minutes))


def decode_access_token(token: str) -> dict:
    """
    Decode an access token
    """
    
    return decode_token(token, ACCESS_SECRET)


# Refresh Token
def create_refresh_token(data: dict, expires_days: int = 7) -> str:
    """
    Create a refresh token
    """
    return create_token(data, REFRESH_SECRET, timedelta(days=expires_days))


def decode_refresh_token(token: str) -> dict:
    """
    Decode a refresh token
    """
    return decode_token(token, REFRESH_SECRET)
