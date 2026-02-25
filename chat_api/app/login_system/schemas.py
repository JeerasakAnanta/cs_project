from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional
import re


class UserBase(BaseModel):
    email: EmailStr
    username: str
    role: Optional[str] = "user"


class UserCreate(UserBase):
    password: str

    @field_validator("username")
    def validate_username(cls, v):
        if len(v) < 3 or len(v) > 50:
            raise ValueError("Username must be between 3 and 50 characters")
        if not re.match(r"^[a-zA-Z0-9_-]+$", v):
            raise ValueError(
                "Username can only contain letters, numbers, underscores, and hyphens"
            )
        return v

    @field_validator("password")
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not re.search(r"[a-z]", v):
            raise ValueError("Password must contain at least one lowercase letter")
        if not re.search(r"\d", v):
            raise ValueError("Password must contain at least one digit")
        return v


class UserUpdate(BaseModel):
    email: Optional[str] = None
    username: Optional[str] = None
    role: Optional[str] = None
    password: Optional[str] = None


class User(UserBase):
    id: int
    is_active: bool

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: Optional[str] = None


class LoginRequest(BaseModel):
    username: str
    password: str

    @field_validator("username")
    def validate_username(cls, v):
        if not v or len(v.strip()) == 0:
            raise ValueError("Username cannot be empty")
        return v.strip()

    @field_validator("password")
    def validate_password(cls, v):
        if not v or len(v) == 0:
            raise ValueError("Password cannot be empty")
        return v
