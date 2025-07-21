from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from app.schemas.user_schema import UserResponse, UserUpdate, RoleUpdateRequest, UserCreate, BulkUserAction, PasswordResetRequest
from app.services import user_service
from app.utils.dependencies import get_current_user, get_db, require_role
from app.models.user import User
import os
from uuid import uuid4
from app.logger.logger import logger

router = APIRouter(prefix="/users", tags=["Users"])

# USER PROFILE MANAGEMENT (All roles)
@router.get("/me", response_model=UserResponse)
def read_my_profile(current_user: User = Depends(get_current_user)):
    logger.info(f"User {current_user.email} accessed their profile")
    return user_service.get_user_profile(current_user)

@router.put("/me", response_model=UserResponse)
def update_my_profile(
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    logger.info(f"User {current_user.email} updated their profile")
    return user_service.update_user_profile(current_user, user_update, db)

@router.post("/me/profile-pic", response_model=UserResponse)
def upload_profile_pic(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    logger.info(f"User {current_user.email} uploaded profile picture")
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Invalid image file")
    
    filename = f"{uuid4().hex}_{file.filename}"
    file_path = os.path.join("static/profile_pics", filename)
    
    with open(file_path, "wb") as f:
        f.write(file.file.read())
        
    # Save relative path or URL
    current_user.profile_pic = f"/static/profile_pics/{filename}"
    db.commit()
    db.refresh(current_user)
    
    # Create response with role information
    response_data = {
        "id": current_user.id,
        "email": current_user.email,
        "first_name": current_user.first_name,
        "last_name": current_user.last_name,
        "contact_number": current_user.contact_number,
        "address": current_user.address,
        "is_active": current_user.is_active,
        "profile_pic": current_user.profile_pic,
        "role": current_user.role.name if current_user.role else None
    }
    
    return response_data

# ADMIN & SUPER ADMIN FUNCTIONS
@router.post("/admin/create-user", response_model=UserResponse)
def create_user_by_admin(
    user_data: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "super_admin"]))
):
    """Create a new user - accessible by admin and super_admin"""
    logger.info(f"Admin {current_user.email} is creating a new user: {user_data.email}")
    return user_service.create_user_by_admin(user_data, current_user, db)

@router.put("/{user_id}", response_model=UserResponse)
def update_user_by_id(
    user_id: int,
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "super_admin"]))
):
    """Update any user - accessible by admin and super_admin"""
    logger.info(f"Admin {current_user.email} is updating user {user_id}")
    return user_service.update_user_by_admin(user_id, user_update, current_user, db)

@router.put("/{user_id}/role", response_model=UserResponse)
def change_user_role(
    user_id: int,
    role_update: RoleUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "super_admin"]))
):
    """Change user role - accessible by admin and super_admin"""
    logger.info(f"Admin {current_user.email} changed role for user {user_id} to {role_update.new_role}")
    return user_service.change_user_role(user_id, role_update.new_role, current_user, db)

@router.patch("/{user_id}/deactivate", response_model=UserResponse)
def deactivate_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "super_admin"]))
):
    """Deactivate a user - accessible by admin and super_admin"""
    logger.info(f"Admin {current_user.email} is deactivating user {user_id}")
    return user_service.deactivate_user(user_id, current_user, db)

@router.patch("/{user_id}/activate", response_model=UserResponse)
def activate_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "super_admin"]))
):
    """Activate a user - accessible by admin and super_admin"""
    logger.info(f"Admin {current_user.email} is activating user {user_id}")
    return user_service.activate_user(user_id, current_user, db)

@router.post("/{user_id}/reset-password", response_model=UserResponse)
def reset_user_password(
    user_id: int,
    password_data: PasswordResetRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "super_admin"]))
):
    """Reset user password - accessible by admin and super_admin"""
    logger.info(f"Admin {current_user.email} is resetting password for user {user_id}")
    return user_service.reset_user_password(user_id, password_data.new_password, current_user, db)

@router.post("/admin/bulk-action", response_model=List[UserResponse])
def bulk_user_action(
    action_data: BulkUserAction,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "super_admin"]))
):
    """Perform bulk actions on users - accessible by admin and super_admin"""
    logger.info(f"Admin {current_user.email} performing bulk action: {action_data.action}")
    return user_service.bulk_user_action(action_data.user_ids, action_data.action, current_user, db)

# ADMIN FUNCTIONS (Admin can see standard users they can manage)
@router.get("/admin/standard-users", response_model=List[UserResponse])
def get_all_standard_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "super_admin"]))
):
    """Get all standard users - accessible by admin and super_admin"""
    return user_service.get_standard_users_for_admin(current_user, db)

@router.get("/admin/dashboard", response_model=dict)
def get_admin_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "super_admin"]))
):
    """Get admin dashboard statistics"""
    return user_service.get_admin_dashboard(current_user, db)

# SUPER ADMIN ONLY FUNCTIONS
@router.get("/super-admin/all-users", response_model=List[UserResponse])
def get_all_users_super_admin(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["super_admin"]))
):
    """Get all users including admins - super_admin only"""
    return user_service.get_all_users_for_super_admin(current_user, db)

@router.get("/super-admin/admins", response_model=List[UserResponse])
def get_all_admins_super_admin(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["super_admin"]))
):
    """Get all admin users - super_admin only"""
    return user_service.get_admins_for_super_admin(current_user, db)

@router.post("/super-admin/create-admin", response_model=UserResponse)
def create_admin_by_super_admin(
    user_data: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["super_admin"]))
):
    """Create a new admin user - super_admin only"""
    logger.info(f"Super admin {current_user.email} is creating a new admin: {user_data.email}")
    return user_service.create_admin_by_super_admin(user_data, current_user, db)