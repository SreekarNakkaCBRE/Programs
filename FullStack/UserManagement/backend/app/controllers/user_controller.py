from sqlalchemy.orm import Session
from app.models.user_model import User
from app.models.role_model import Role
from app.schemas.user_schema import UserUpdate
from fastapi import HTTPException

def get_all_users(db: Session):
    return db.query(User).all()

def update_user_profile(user_id: int, update_data: UserUpdate, db: Session):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    for field, value in update_data.dict(exclude_unset=True).items():
        setattr(user, field, value)

    db.commit()
    db.refresh(user)
    return user

def assign_user_role(user_id: int, role_name: str, db: Session):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Only allow assignment of valid roles with fixed IDs
    if role_name == "admin":
        role_id = 1
    elif role_name == "standard_user":
        role_id = 2
    else:
        raise HTTPException(status_code=400, detail="Invalid role. Only 'admin' or 'standard_user' allowed")

    # Verify the role exists in the database
    role = db.query(Role).filter(Role.id == role_id).first()
    if not role:
        raise HTTPException(status_code=500, detail=f"Role {role_name} not found in database. Please initialize the database.")

    user.role_id = role_id
    db.commit()
    db.refresh(user)
    return user
