from fastapi import FastAPI, Depends, Security
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer

from app.routers import auth_router, user_router
from app.dbconfig.database import engine, Base, get_db
from app.models import user_model, role_model  # Import models to register them
from app.services.auth_service import get_current_user
from app.schemas.user_schema import UserOut, UserUpdate
from app.controllers import user_controller
from sqlalchemy.orm import Session

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Role Management API",
    description="A role-based authentication system with JWT and FastAPI",
    version="1.0.0"
)

# CORS configuration (adjust origins as needed)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root-level endpoints
security = HTTPBearer()

@app.get("/me", response_model=UserOut)
def get_current_user_profile(
    current_user = Depends(get_current_user),
    token: str = Security(security)
):
    return {
        "id": current_user.id,
        "first_name": current_user.first_name,
        "last_name": current_user.last_name,
        "email": current_user.email,
        "contact_number": current_user.contact_number,
        "address": current_user.address,
        "profile_pic": current_user.profile_pic,
        "role": current_user.role.name if current_user.role else "standard_user"
    }

@app.put("/profile", response_model=UserOut)
def update_user_profile(
    update_data: UserUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
    token: str = Security(security)
):
    return user_controller.update_user_profile(current_user.id, update_data, db)

# Include routers
app.include_router(auth_router.router)
app.include_router(user_router.router)
