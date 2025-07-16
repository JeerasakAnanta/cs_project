import bcrypt
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.database import models
from app.utils.database import get_db
from . import utils


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/login")


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = utils.decode_access_token(token)
        username: str = payload.get("sub")
        if username is None:    
            raise credentials_exception
    except Exception:
        raise credentials_exception
    
    user = db.query(models.User).filter(models.User.username == username).first()
    if user is None:
        raise credentials_exception
    return user

def is_admin(current_user: models.User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="The user doesn't have enough privileges")
    return current_user

