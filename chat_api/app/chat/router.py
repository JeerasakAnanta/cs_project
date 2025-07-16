from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from . import crud, schemas
from app.utils.database import get_db
from app.login_system.auth import get_current_user, require_role
from app.login_system import models as user_models

router = APIRouter(
    prefix="/chat",
    tags=["chat"],
)

@router.post("/history/", response_model=schemas.ChatHistory)
def create_chat_history_for_user(
    chat: schemas.ChatHistoryCreate, 
    db: Session = Depends(get_db), 
    current_user: user_models.User = Depends(get_current_user)
):
    return crud.create_chat_history(db=db, chat=chat, user_id=current_user.id)

@router.get("/history/", response_model=List[schemas.ChatHistory])
def read_user_chat_history(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db), 
    current_user: user_models.User = Depends(get_current_user)
):
    history = crud.get_chat_history_by_user(db, user_id=current_user.id, skip=skip, limit=limit)
    return history

@router.get("/history/all", response_model=List[schemas.ChatHistory])
def read_all_chat_history(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db), 
    current_user: user_models.User = Depends(require_role("admin"))
):
    history = crud.get_all_chat_history(db, skip=skip, limit=limit)
    return history 