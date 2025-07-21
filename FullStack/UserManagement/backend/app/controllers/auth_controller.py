from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.models.user_model import User
from app.models.role_model import Role
from app.schemas.user_schema import UserCreate
from app.services.user_service import hash_password, verify_password
from app.services.auth_service import create_access_token

def register_user(user_data: UserCreate, db: Session):
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Use fixed role ID=2 for standard_user
    standard_role = db.query(Role).filter(Role.id == 2).first()
    if not standard_role:
        # Create standard_user role with ID=2 if it doesn't exist
        standard_role = Role(id=2, name="standard_user")
        db.add(standard_role)
        db.commit()
        db.refresh(standard_role)

    new_user = User(
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        email=user_data.email,
        password_hash=hash_password(user_data.password),
        contact_number=user_data.contact_number,
        address=user_data.address,
        role_id=2  # Fixed ID for standard_user role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

def login_user(email: str, password: str, db: Session):
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    token_data = {
        "sub": user.email,
        "role": user.role.name if user.role else "standard_user"
    }
    access_token = create_access_token(data=token_data)
    return {"access_token": access_token, "token_type": "bearer"}
