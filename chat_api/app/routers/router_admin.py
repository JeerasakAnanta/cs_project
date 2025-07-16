from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import models
from app.utils.database import get_db
from app.login_system.auth import is_admin, get_current_user
from app.login_system.schemas import User

router = APIRouter(
    prefix="/admin",
    tags=["admin"],
    dependencies=[Depends(is_admin)],
    responses={404: {"description": "Not found"}},
)

@router.get("/users/", response_model=List[User])
def read_users(db: Session = Depends(get_db)):
    users = db.query(models.User).all()
    return users

@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Optional: Add a check to prevent admin from deleting themselves
    # current_user: models.User = Depends(get_current_active_user)
    # if user.id == current_user.id:
    #     raise HTTPException(status_code=400, detail="Cannot delete your own account")

    db.delete(user)
    db.commit()
    return 