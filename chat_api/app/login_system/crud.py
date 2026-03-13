from sqlalchemy.orm import Session
from app.database import models
from . import schemas
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()


def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()


def get_users(db: Session, skip: int = 0, limit: int = 100):
    # Validate and constrain pagination parameters
    skip = max(0, skip)
    limit = min(max(1, limit), 100)  # Enforce min 1, max 100
    return db.query(models.User).offset(skip).limit(limit).all()


def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = pwd_context.hash(user.password)
    db_user = models.User(
        email=user.email,
        username=user.username,
        hashed_password=hashed_password,
        role=user.role,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def update_user(
    db: Session,
    user_id: int,
    user: schemas.UserUpdate,
    current_user: models.User = None,
):
    db_user = get_user(db, user_id)
    if db_user:
        update_data = user.model_dump(exclude_unset=True)

        # Prevent privilege escalation: non-admins cannot change roles
        if "role" in update_data:
            # Only admins can change roles
            if current_user is None or current_user.role != "admin":
                update_data.pop("role", None)

        if "password" in update_data:
            update_data["hashed_password"] = pwd_context.hash(
                update_data.pop("password")
            )
        for key, value in update_data.items():
            setattr(db_user, key, value)
        db.commit()
        db.refresh(db_user)
    return db_user


def delete_user(db: Session, user_id: int):
    db_user = get_user(db, user_id)
    if db_user:
        db.delete(db_user)
        db.commit()
    return db_user
