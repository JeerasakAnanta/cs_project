from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm

from ..utils import database

from . import models, schemas, utils, auth

models.Base.metadata.create_all(bind=database.engine)

blacklisted_tokens = set()


def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()


def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    if db.query(models.User).filter(models.User.username == user.username).first():
        raise HTTPException(status_code=400, detail="Username taken")
    new_user = models.User(
        username=user.username,
        hashed_password=utils.hash_password(user.password),
        role="user",
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "User created"}


def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == form.username).first()
    if not user or not utils.verify_password(form.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Wrong credentials")
    data = {"sub": user.username, "role": user.role}
    access_token = utils.create_access_token(data)
    refresh_token = utils.create_refresh_token(data)
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
    }


def logout(token: str = Depends(auth.oauth2_scheme)):
    blacklisted_tokens.add(token)
    return {"message": "Logged out"}


def refresh(refresh_token: str):
    try:
        payload = utils.decode_refresh_token(refresh_token)
        new_access_token = utils.create_access_token(
            {"sub": payload["sub"], "role": payload["role"]}
        )
        return {"access_token": new_access_token}
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid refresh token")


def admin_only(payload=Depends(auth.require_role("admin"))):
    return {"message": f"Hello Admin {payload['sub']}"}


def user(payload=Depends(auth.get_current_user)):
    return {"message": f"Hello {payload['sub']} with role {payload['role']}"}
