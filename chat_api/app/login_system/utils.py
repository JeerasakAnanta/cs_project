import jwt
import os
from passlib.context import CryptContext
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv(".env")

# Constants
ACCESS_SECRET = os.getenv("ACCESS_SECRET")
REFRESH_SECRET = os.getenv("REFRESH_SECRET")
ALGORITHM = os.getenv("ALGORITHM")

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

print(f" DEBUG : ACCESS_SECRET: {ACCESS_SECRET}, ALGORITHM: {ALGORITHM}")


# Password Utils
def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


# Token Utils
def create_token(data: dict, secret: str, expires_delta: timedelta) -> str:
    to_encode = data.copy()
    to_encode.update({"exp": datetime.utcnow() + expires_delta})
    return jwt.encode(to_encode, secret, algorithm=ALGORITHM)


def decode_token(token: str, secret: str) -> dict:
    return jwt.decode(token, secret, algorithms=[ALGORITHM])


# Access Token
def create_access_token(data: dict, expires_minutes: int = 15) -> str:
    return create_token(data, ACCESS_SECRET, timedelta(minutes=expires_minutes))


def decode_access_token(token: str) -> dict:
    return decode_token(token, ACCESS_SECRET)


# Refresh Token
def create_refresh_token(data: dict, expires_days: int = 7) -> str:
    return create_token(data, REFRESH_SECRET, timedelta(days=expires_days))


def decode_refresh_token(token: str) -> dict:
    return decode_token(token, REFRESH_SECRET)
