from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from . import crud, schemas
from app.database import models
from app.utils.database import get_db
from app.login_system.auth import get_current_user
from app.rag_system.new_rag import generation_answer

router = APIRouter(
    prefix="/chat",
    tags=["chat"],
)

@router.post("/conversations/", response_model=schemas.Conversation)
def create_conversation_for_user(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return crud.create_conversation(db=db, user_id=current_user.id)

@router.get("/conversations/", response_model=List[schemas.Conversation])
def read_conversations_for_user(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return crud.get_conversations_by_user(db=db, user_id=current_user.id)

@router.get("/conversations/{conversation_id}", response_model=schemas.Conversation)
def read_conversation(
    conversation_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    db_conversation = crud.get_conversation(db=db, conversation_id=conversation_id)
    if db_conversation is None or db_conversation.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return db_conversation

@router.put("/conversations/{conversation_id}", response_model=schemas.Conversation)
def update_conversation_title(
    conversation_id: int,
    conversation_update: schemas.ConversationUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    db_conversation = crud.get_conversation(db=db, conversation_id=conversation_id)
    if db_conversation is None or db_conversation.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return crud.update_conversation_title(db=db, conversation_id=conversation_id, title=conversation_update.title)

@router.post("/conversations/{conversation_id}/messages/", response_model=schemas.Message)
def create_message_for_conversation(
    conversation_id: int,
    message: schemas.MessageCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    db_conversation = crud.get_conversation(db=db, conversation_id=conversation_id)
    if db_conversation is None or db_conversation.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    # Create user message
    crud.create_message(db=db, message=message, conversation_id=conversation_id)

    # Generate bot response
    bot_response_content = generation_answer(message.content)
    bot_message = schemas.MessageCreate(sender="bot", content=bot_response_content)
    
    return crud.create_message(db=db, message=bot_message, conversation_id=conversation_id)


@router.delete("/conversations/{conversation_id}", response_model=schemas.Conversation)
def delete_conversation(
    conversation_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    db_conversation = crud.get_conversation(db=db, conversation_id=conversation_id)
    if db_conversation is None or db_conversation.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return crud.delete_conversation(db=db, conversation_id=conversation_id) 