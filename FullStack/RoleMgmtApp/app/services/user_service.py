from typing import List
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_
from fastapi import HTTPException, status
from app.models.user import User
from app.models.role import Role
from app.schemas.user_schema import UserCreate, UserUpdate, UserMinimal
from app.utils.auth import hash_password, verify_password, create_access_token
from app.utils.validators import validate_email, validate_password_strength, validate_role_permission
from app.logger.logger import logger

def create_user(user_data: UserCreate, db: Session):
    """Public user registration - creates standard_user only"""
    # Validate email format
    if not validate_email(user_data.email):
        raise HTTPException(status_code=400, detail="Invalid email format")
    
    # Validate password strength
    is_strong, password_msg = validate_password_strength(user_data.password)
    if not is_strong:
        raise HTTPException(status_code=400, detail=password_msg)
    
    # Check if email already exists
    if db.query(User).filter(User.email == user_data.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    # Force role to standard_user for public registration
    role = db.query(Role).filter(Role.name == "standard_user").first()
    if not role:
        raise HTTPException(status_code=500, detail="Standard user role not found")

    new_user = User(
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        email=user_data.email,
        hashed_password=hash_password(user_data.password),
        contact_number=user_data.contact_number,
        address=user_data.address,
        is_active=True,
        profile_pic=user_data.profile_pic,
        role_id=role.id
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    logger.info(f"User {new_user.email} created with role standard_user")
    
    return _create_user_response(new_user)

def authenticate_user(email: str, password: str, db: Session):
    user = db.query(User).options(joinedload(User.role)).filter(User.email == email).first()
    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not user.is_active:
        raise HTTPException(status_code=401, detail="User account is deactivated")

    token = create_access_token(data={"sub": str(user.id), "role": user.role.name})
    logger.info(f"User {user.email} authenticated successfully")
    return {"access_token": token, "token_type": "bearer"}

def get_user_profile(user: User):
    return _create_user_response(user)

def update_user_profile(current_user: User, user_update: UserUpdate, db: Session):
    # Validate email format if provided
    if user_update.email and not validate_email(user_update.email):
        raise HTTPException(status_code=400, detail="Invalid email format")
    
    # Check email uniqueness
    if user_update.email and db.query(User).filter(User.email == user_update.email, User.id != current_user.id).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    # Update user fields
    update_data = user_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(current_user, key, value)

    db.commit()
    db.refresh(current_user)
    logger.info(f"User {current_user.email} updated their profile")
    
    return _create_user_response(current_user)

def search_users(email: str, current_user: User, db: Session) -> List[UserMinimal]:
    query = db.query(User).options(joinedload(User.role))
    
    if email:
        query = query.filter(User.email.ilike(f"%{email}%"))

    # Role-based filtering
    user_role = current_user.role.name
    if user_role == "admin":
        query = query.filter(User.role.has(name="standard_user"))
    elif user_role == "standard_user":
        query = query.filter(User.id == current_user.id)
    # super_admin can see all users (no additional filter)

    users = query.all()
    return [
        UserMinimal(
            id=user.id,
            first_name=user.first_name,
            last_name=user.last_name,
            email=user.email,
            role=user.role.name
        )   
        for user in users
    ]

def create_user_by_admin(user_data: UserCreate, current_user: User, db: Session):
    """Create a new user by admin or super_admin with role-based restrictions"""
    
    # Validate email format
    if not validate_email(user_data.email):
        raise HTTPException(status_code=400, detail="Invalid email format")
    
    # Validate password strength
    is_strong, password_msg = validate_password_strength(user_data.password)
    if not is_strong:
        raise HTTPException(status_code=400, detail=password_msg)
    
    # Check if email already exists
    if db.query(User).filter(User.email == user_data.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    # Role-based restrictions
    current_role = current_user.role.name
    target_role = user_data.role or "standard_user"
    
    # Validate the target role exists
    role_obj = db.query(Role).filter(Role.name == target_role).first()
    if not role_obj:
        raise HTTPException(status_code=400, detail="Invalid role")
    
    # Apply role-based creation restrictions
    if current_role == "admin":
        if target_role != "standard_user":
            raise HTTPException(
                status_code=403, 
                detail="Admins can only create standard_user accounts"
            )
    elif current_role == "super_admin":
        if target_role == "super_admin":
            raise HTTPException(
                status_code=403,
                detail="Cannot create another super_admin account"
            )
    else:
        raise HTTPException(
            status_code=403,
            detail="Insufficient permissions to create users"
        )

    # Create the new user
    new_user = User(
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        email=user_data.email,
        hashed_password=hash_password(user_data.password),
        contact_number=user_data.contact_number,
        address=user_data.address,
        is_active=user_data.is_active,
        profile_pic=user_data.profile_pic,
        role_id=role_obj.id
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    logger.info(f"Admin {current_user.email} created user {new_user.email} with role {target_role}")
    return _create_user_response(new_user)

def update_user_by_admin(user_id: int, user_update: UserUpdate, current_user: User, db: Session):
    """Update any user by admin or super_admin with role-based restrictions"""
    
    target_user = db.query(User).options(joinedload(User.role)).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Role-based restrictions
    current_role = current_user.role.name
    target_role = target_user.role.name
    
    # Admin cannot update other admins or super_admins
    if current_role == "admin" and target_role in ["admin", "super_admin"]:
        raise HTTPException(status_code=403, detail="Cannot update admin or super_admin users")
    
    # Super admin cannot update other super_admins
    if current_role == "super_admin" and target_role == "super_admin" and target_user.id != current_user.id:
        raise HTTPException(status_code=403, detail="Cannot update other super_admin users")
    
    # Validate email if provided
    if user_update.email and not validate_email(user_update.email):
        raise HTTPException(status_code=400, detail="Invalid email format")
    
    # Check email uniqueness
    if user_update.email and db.query(User).filter(User.email == user_update.email, User.id != target_user.id).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Update user fields
    update_data = user_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(target_user, key, value)

    db.commit()
    db.refresh(target_user)
    logger.info(f"User {current_user.email} updated user {target_user.email}")
    
    return _create_user_response(target_user)

def change_user_role(user_id: int, new_role: str, current_user: User, db: Session):
    if current_user.role.name != "super_admin":
        raise HTTPException(status_code=403, detail="Only super admins can change roles")

    target_user = db.query(User).options(joinedload(User.role)).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")

    if target_user.id == current_user.id:
        raise HTTPException(status_code=400, detail="You cannot change your own role")

    if target_user.role.name == "super_admin":
        raise HTTPException(status_code=403, detail="Cannot change role of another super admin")

    role_obj = db.query(Role).filter(Role.name == new_role).first()
    if not role_obj:
        raise HTTPException(status_code=400, detail="Invalid role")

    target_user.role_id = role_obj.id
    db.commit()
    db.refresh(target_user)
    logger.info(f"User {current_user.email} changed role of user {target_user.email} to {new_role}")
    
    return _create_user_response(target_user)

def get_users_by_role(current_user: User, role_filter: str, db: Session):
    """Generic function to get users by role"""
    current_role = current_user.role.name
    
    if current_role == "super_admin":
        # Super admin can see all users or filter by role
        if role_filter == "all":
            users = db.query(User).options(joinedload(User.role)).all()
        else:
            users = db.query(User).options(joinedload(User.role)).filter(User.role.has(name=role_filter)).all()
    elif current_role == "admin":
        # Admin can only see standard users
        if role_filter != "standard_user":
            raise HTTPException(status_code=403, detail="Admins can only access standard users")
        users = db.query(User).options(joinedload(User.role)).filter(User.role.has(name="standard_user")).all()
    else:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    return [_create_user_response(user) for user in users]

def get_standard_users_for_admin(current_user: User, db: Session):
    """Get standard users - accessible by admin and super admin"""
    return get_users_by_role(current_user, "standard_user", db)

def get_all_users_for_super_admin(current_user: User, db: Session):
    """Get all users - only accessible by super admin"""
    return get_users_by_role(current_user, "all", db)

def get_admins_for_super_admin(current_user: User, db: Session):
    """Get all admin users - only accessible by super admin"""
    return get_users_by_role(current_user, "admin", db)

def deactivate_user(user_id: int, current_user: User, db: Session):
    """Deactivate a user"""
    user = db.query(User).options(joinedload(User.role)).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Role-based restrictions
    current_role = current_user.role.name
    target_role = user.role.name
    
    # Prevent self-deactivation
    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot deactivate yourself")
    
    # Admin cannot deactivate other admins or super_admins
    if current_role == "admin" and target_role in ["admin", "super_admin"]:
        raise HTTPException(status_code=403, detail="Cannot deactivate admin or super_admin users")
    
    # Super admin cannot deactivate other super_admins
    if current_role == "super_admin" and target_role == "super_admin":
        raise HTTPException(status_code=403, detail="Cannot deactivate other super_admin users")
    
    user.is_active = False
    db.commit()
    db.refresh(user)
    logger.info(f"User {current_user.email} deactivated user {user.email}")
    
    return _create_user_response(user)

def activate_user(user_id: int, current_user: User, db: Session):
    """Activate a user"""
    user = db.query(User).options(joinedload(User.role)).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Role-based restrictions (similar to deactivate)
    current_role = current_user.role.name
    target_role = user.role.name
    
    if current_role == "admin" and target_role in ["admin", "super_admin"]:
        raise HTTPException(status_code=403, detail="Cannot activate admin or super_admin users")
    
    user.is_active = True
    db.commit()
    db.refresh(user)
    logger.info(f"User {current_user.email} activated user {user.email}")
    
    return _create_user_response(user)

def reset_user_password(user_id: int, new_password: str, current_user: User, db: Session):
    """Reset user password"""
    user = db.query(User).options(joinedload(User.role)).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Validate password strength
    is_strong, password_msg = validate_password_strength(new_password)
    if not is_strong:
        raise HTTPException(status_code=400, detail=password_msg)
    
    # Role-based restrictions
    current_role = current_user.role.name
    target_role = user.role.name
    
    if current_role == "admin" and target_role in ["admin", "super_admin"]:
        raise HTTPException(status_code=403, detail="Cannot reset password for admin or super_admin users")
    
    user.hashed_password = hash_password(new_password)
    db.commit()
    db.refresh(user)
    logger.info(f"User {current_user.email} reset password for user {user.email}")
    
    return _create_user_response(user)

def bulk_user_action(user_ids: List[int], action: str, current_user: User, db: Session):
    """Perform bulk actions on users"""
    results = []
    
    for user_id in user_ids:
        try:
            if action == "activate":
                result = activate_user(user_id, current_user, db)
            elif action == "deactivate":
                result = deactivate_user(user_id, current_user, db)
            else:
                raise HTTPException(status_code=400, detail="Invalid action")
            
            results.append(result)
        except HTTPException as e:
            logger.error(f"Bulk action failed for user {user_id}: {e.detail}")
            continue
    
    return results

def get_admin_dashboard(current_user: User, db: Session):
    """Get dashboard statistics for admin"""
    current_role = current_user.role.name
    
    if current_role == "admin":
        # Admin can only see standard users
        total_users = db.query(User).join(Role).filter(Role.name == "standard_user").count()
        active_users = db.query(User).join(Role).filter(Role.name == "standard_user", User.is_active == True).count()
        inactive_users = total_users - active_users
        
        return {
            "total_users": total_users,
            "active_users": active_users,
            "inactive_users": inactive_users,
            "user_type": "standard_users_only"
        }
    
    elif current_role == "super_admin":
        # Super admin can see all users
        total_users = db.query(User).count()
        active_users = db.query(User).filter(User.is_active == True).count()
        inactive_users = total_users - active_users
        
        total_admins = db.query(User).join(Role).filter(Role.name == "admin").count()
        total_standard = db.query(User).join(Role).filter(Role.name == "standard_user").count()
        
        return {
            "total_users": total_users,
            "active_users": active_users,
            "inactive_users": inactive_users,
            "total_admins": total_admins,
            "total_standard_users": total_standard,
            "user_type": "all_users"
        }
    
    else:
        raise HTTPException(status_code=403, detail="Access denied")

def _create_user_response(user: User) -> dict:
    """Helper function to create consistent user response"""
    return {
        "id": user.id,
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "contact_number": user.contact_number,
        "address": user.address,
        "is_active": user.is_active,
        "profile_pic": user.profile_pic,
        "role": user.role.name if user.role else None
    }