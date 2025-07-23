from sqlalchemy.orm import Session, joinedload
from app.schemas.user import UserBase, UserCreate, UserPartialUpdate, UserProfileResponse, UserUpdateResponse, UsersListResponse, UserListResponse, RoleUpdateResponse
from app.models.user import User
from app.models.role import Role
from app.utils.auth import hash_password
from fastapi import HTTPException, status
import app.logger.logger as logger

def get_me(user: User):
    return UserProfileResponse(
        message="User profile retrieved successfully",
        user=user
    )

def update_profile(db: Session, user: User, user_update: UserPartialUpdate):
    # UserPartialUpdate doesn't have email field, so we don't need to check for it
    
    for key, value in user_update.model_dump(exclude_unset=True).items():
        setattr(user, key, value)
    
    db.commit()
    db.refresh(user)

    logger.info(f"User {user.email} profile updated successfully")
    return UserUpdateResponse(
        message="Profile updated successfully",
        user=user
    )

def create_user(db: Session, user_create: UserCreate):
    # Validate role exists
    role = db.query(Role).filter(Role.id == user_create.role_id).first()
    if not role:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Role with id {user_create.role_id} does not exist"
        )
    
    # Check if email already exists
    existing_user = db.query(User).filter(User.email == user_create.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Hash the password before storing
    user_data = user_create.model_dump()
    password = user_data.pop('password')  # Remove plain password
    user_data['password_hash'] = hash_password(password)  # Add hashed password
    
    new_user = User(**user_data)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    logger.info(f"User {new_user.email} created successfully")
    return UserProfileResponse(
        message="User created successfully",
        user=new_user
    )

def update_user(db: Session, user_id: int, user_update: UserPartialUpdate):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    for key, value in user_update.model_dump(exclude_unset=True).items():
        setattr(user, key, value)
    
    db.commit()
    db.refresh(user)

    logger.info(f"User {user.email} updated successfully")
    return UserUpdateResponse(
        message="User updated successfully",
        user=user
    )   

def list_all_users(db: Session):
    users = db.query(User).options(joinedload(User.role)).all()
    return UsersListResponse(
        message="Users retrieved successfully",
        users=[UserListResponse.model_validate(user) for user in users],
        total_count=len(users)
    )

def update_user_role(db: Session, user_id: int, role_id: int):
    user = db.query(User).options(joinedload(User.role)).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    user.role_id = role_id
    db.commit()
    db.refresh(user)

    logger.info(f"User {user.email} role updated successfully")
    return RoleUpdateResponse(
        message="User role updated successfully",
        user=user
    )