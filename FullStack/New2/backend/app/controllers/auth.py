from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.dbconfig.database import get_db
from app.schemas.auth import SignupRequest, LoginRequest, TokenResponse, SignupResponse, ApiResponse
from app.services.auth_service import signup_user, login_user
from app.logger.logger import logger

router = APIRouter()

@router.post("/signup", response_model=SignupResponse)
def signup(user_data: SignupRequest, db: Session = Depends(get_db)):
    try:
        return signup_user(db, user_data)
    except HTTPException as he:
        logger.error(f"Signup failed: {he.detail}")
        raise he
    except Exception as e:
        logger.error(f"Unexpected error during signup: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error during signup"
        )

@router.post("/login", response_model=TokenResponse)
def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    try:
        return login_user(db, login_data)
    except HTTPException as he:
        logger.error(f"Login failed: {he.detail}")
        raise he
    except Exception as e:
        logger.error(f"Unexpected error during login: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error during login"
        )
