from fastapi import FastAPI, Depends, APIRouter
from app.dbconfig.database import SessionLocal, engine, Base, get_db
from sqlalchemy.orm import Session
from app.schemas.auth import SignupRequest, LoginRequest, TokenResponse, SignupResponse
from app.services.auth_service import signup_user, login_user

router = APIRouter()

@router.post("/signup", status_code=201, response_model=SignupResponse)
def signup(user_data: SignupRequest, db: Session = Depends(get_db)):
    return signup_user(db, user_data)


@router.post("/login", response_model=TokenResponse)
def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    return login_user(db, login_data)