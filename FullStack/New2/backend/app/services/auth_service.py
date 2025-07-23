from sqlalchemy.orm import Session
from app.models.user import User
from app.utils.auth import hash_password, verify_password, create_access_token
from app.schemas.auth import SignupRequest, LoginRequest, TokenResponse, SignupResponse
from fastapi import HTTPException, status
from app.logger.logger import logger


def signup_user(db: Session, user_data: SignupRequest):
    user_exists = db.query(User).filter(User.email == user_data.email).first()
    if user_exists:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    hashed_password = hash_password(user_data.password)
    new_user = User(
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        email=user_data.email,
        password_hash=hashed_password,
        contact_number=user_data.contact_number,
        address=user_data.address,
        profile_pic=user_data.profile_pic,
        role_id=user_data.role_id,
        is_active=True
    )
    logger.info(f"Registering new user: {new_user.email}")
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return SignupResponse(
        message="User registered successfully",
        user_id=new_user.id,
        email=new_user.email,
        full_name=f"{new_user.first_name} {new_user.last_name}"
    )

def login_user(db: Session, login_data: LoginRequest):
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user or not verify_password(login_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User is inactive"
        )
    logger.info(f"User {user.email} logged in successfully")
    access_token = create_access_token(data={"sub":user.email, "role_id": user.role_id})
    return TokenResponse(access_token=access_token, token_type="bearer")