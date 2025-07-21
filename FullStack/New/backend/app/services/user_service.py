from sqlalchemy.orm import Session, joinedload
from app.schemas.user import UserPartialUpdate, UserProfileResponse, UserUpdateResponse, UsersListResponse, UserListResponse, RoleUpdateResponse
from app.models.user import User
from fastapi import HTTPException, status

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
    
    return UserUpdateResponse(
        message="Profile updated successfully",
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
    
    return RoleUpdateResponse(
        message="User role updated successfully",
        user=user
    )