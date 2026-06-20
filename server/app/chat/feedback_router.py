from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from . import feedback_crud, feedback_schemas, crud
from app.database.models import User
from app.utils.database import get_db
from app.login_system.auth import get_current_user

router = APIRouter(
    prefix="/chat",
    tags=["feedback"],
)

@router.post("/feedback/", response_model=feedback_schemas.Feedback)
def create_feedback_for_message(
    feedback: feedback_schemas.FeedbackCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Optional: Check if the message exists and belongs to the user
    db_message = crud.get_message(db, feedback.message_id) # You might need to create this function
    if db_message is None:
         raise HTTPException(status_code=404, detail="Message not found")
    
    # Check if the conversation belongs to the current user
    if db_message.conversation.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to give feedback for this message")

    return feedback_crud.create_feedback(db=db, feedback=feedback) 