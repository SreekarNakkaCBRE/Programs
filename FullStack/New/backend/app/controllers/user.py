from fastapi import APIRouter, Depends
from app.dbconfig.database import SessionLocal, engine, Base, get_db
from sqlalchemy.orm import Session
from app.schemas.user import UserRead, UserCreate, UserPartialUpdate, UserProfileResponse, UserUpdateResponse, UsersListResponse, RoleUpdateResponse, RoleUpdateRequest
from app.models.user import User
from app.utils.dependencies import get_current_user, require_admin
from app.services.user_service import get_me, update_profile, list_all_users, update_user_role

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
