from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm

from app.database import models
from app.login_system import schemas, utils, auth
from app.login_system.database import get_db
from app.utils.database import engine
import jwt
from datetime import datetime


def register(user: schemas.UserCreate, db: Session) -> models.User:
    """
    Register a new user in the database.
    """
    # Check if a user with the given email already exists
    db_user_by_email = (
        db.query(models.User).filter(models.User.email == user.email).first()
    )
    if db_user_by_email:
        raise HTTPException(status_code=400, detail="อีเมลนี้มีผู้ใช้งานแล้ว")

    # Check if a user with the given username already exists
    db_user_by_username = (
        db.query(models.User).filter(models.User.username == user.username).first()
    )
    if db_user_by_username:
        raise HTTPException(status_code=400, detail="ชื่อผู้ใช้นี้มีผู้ใช้งานแล้ว")

    # Hash the user's password for security
    hashed_password = utils.hash_password(user.password)

    # Create a new user instance
    db_user = models.User(
        email=user.email,
        username=user.username,
        hashed_password=hashed_password,
        role=user.role or "user",
    )

    # Add the new user to the session and commit to the database
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    # Return the newly created user
    return db_user


async def login(
    form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)
) -> dict:
    user = db.query(models.User).filter(models.User.username == form.username).first()
    if not user or not utils.verify_password(form.password, str(user.hashed_password)):
        raise HTTPException(status_code=401, detail="Wrong credentials")
    data = {"sub": user.username, "role": user.role, "email": user.email}
    access_token = utils.create_access_token(data)
    refresh_token = utils.create_refresh_token(data)
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
    }


async def logout(
    token: str = Depends(auth.oauth2_scheme), db: Session = Depends(get_db)
):
    try:
        # Decode token to get JWT ID and expiration
        payload = utils.decode_access_token(token)
        jti = payload.get("jti")
        exp = payload.get("exp")

        if jti and exp:
            # Convert timestamp to datetime
            expires_at = datetime.fromtimestamp(exp)

            # Add to blacklist database
            blacklisted_token = models.TokenBlacklist(
                token_jti=jti,
                expires_at=expires_at,
                user_id=payload.get("sub"),  # Using username as user identifier
            )
            db.add(blacklisted_token)
            db.commit()

        return {"message": "Logged out successfully"}
    except Exception as e:
        # Even if we can't decode the token, we should still logout
        return {"message": "Logged out successfully"}


async def refresh(refresh_token: str) -> dict:
    try:
        payload = utils.decode_refresh_token(refresh_token)
        new_access_token = utils.create_access_token(
            {"sub": payload["sub"], "role": payload["role"]}
        )
        return {"access_token": new_access_token}
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
