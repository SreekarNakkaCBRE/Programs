from fastapi import APIRouter, Depends
from app.dbconfig.database import SessionLocal, engine, Base, get_db
from sqlalchemy.orm import Session
from app.schemas.user import UserRead, UserCreate, UserPartialUpdate, UserProfileResponse, UserUpdateResponse, UsersListResponse, RoleUpdateResponse, RoleUpdateRequest
from app.models.user import User
from app.utils.dependencies import get_current_user, require_admin
from app.services.user_service import create_user, get_me, update_profile, list_all_users, update_user_role, update_user
from app.logger.logger import logger

router = APIRouter()

@router.get("/my_profile", response_model=UserProfileResponse)
def get_my_profile(current_user: User = Depends(get_current_user)):
    return get_me(current_user)

@router.put("/Update_my_profile", response_model=UserUpdateResponse)
def update_my_profile(
    user_update: UserPartialUpdate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    return update_profile(db, current_user, user_update)

@router.get("/list", response_model=UsersListResponse)
def get_all_users(db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    return list_all_users(db)

@router.put("/{user_id}/role", response_model=RoleUpdateResponse)
def update_user_role_endpoint(
    user_id: int,
    role_data: RoleUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    return update_user_role(db, user_id, role_data.role_id)

@router.post("/create", response_model=UserProfileResponse)
def create_user_endpoint(
    user_create: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    return create_user(db, user_create)

@router.put("/{user_id}", response_model=UserUpdateResponse)
def update_user_endpoint(
    user_id: int,
    user_update: UserPartialUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    return update_user(db, user_id, user_update)

@router.put("/{user_id}/status", response_model=UserUpdateResponse)
def update_user_status_endpoint(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    # Get the user to toggle
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        from fastapi import HTTPException, status
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    # Toggle the status
    status_update = UserPartialUpdate(is_active=not user.is_active)
    return update_profile(db, user, status_update)
