from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.dbconfig.database import get_db
from app.schemas.user_schema import UserCreate
from app.schemas.token_schema import Token
from app.controllers import auth_controller
from pydantic import BaseModel

class LoginRequest(BaseModel):
    email: str
    password: str

router = APIRouter(tags=["Authentication"])

@router.post("/signup", status_code=status.HTTP_201_CREATED)
def signup(user: UserCreate, db: Session = Depends(get_db)):
    return auth_controller.register_user(user, db)

@router.post("/login", response_model=Token)
def login(form_data: LoginRequest, db: Session = Depends(get_db)):
    return auth_controller.login_user(form_data.email, form_data.password, db)
