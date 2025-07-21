from fastapi import Depends, HTTPException, FastAPI, Header, status
from sqlalchemy.orm import Session
from database import session_local, engine, Base
from models import User
from auth_utils import create_access_token, verify_password, hash_password, decode_access_token
from pydantic import BaseModel
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional


Base.metadata.create_all(bind=engine)

app = FastAPI()

security = HTTPBearer()

def get_db():
    db = session_local()
    try:
        yield db
    finally:
        db.close()

class UserCreate(BaseModel):
    username: str
    password: str

@app.post("/signup")
def signup(user: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.username == user.username).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username already exists") #check statuscode
    hashed_password = hash_password(user.password)
    new_user = User(username=user.username, hashed_password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "User created successfully", "id": new_user.id}

@app.post("/login")
def login(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.username == user.username).first()
    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid credentials")
    access_token = create_access_token(data={"sub": db_user.username})
    return {"access_token": access_token, "token_type": "bearer", "user": db_user}

@app.get("/protected")
def protected_route(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    token = credentials.credentials  # Gets the actual token string
    payload = decode_access_token(token)  # ← HERE'S WHERE IT'S USED!
    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    return {"message": "This is a protected route", "user": payload.get("sub")}


    