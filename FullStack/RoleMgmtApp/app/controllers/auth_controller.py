from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.schemas.user_schema import UserCreate, UserResponse, UserLogin
from app.schemas.token_schema import Token
from app.services import user_service
from app.utils.dependencies import get_db
from app.logger.logger import logger

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/signup", response_model=UserResponse)
def signup(user: UserCreate, db: Session = Depends(get_db)):
    logger.info(f"User {user.email} is signing up")
    return user_service.create_user(user, db)

@router.post("/login", response_model=Token)
def login(user_login: UserLogin, db: Session = Depends(get_db)):
    logger.info(f"User {user_login.email} is attempting to log in")
    return user_service.authenticate_user(user_login.email, user_login.password, db)
