from sqlalchemy.orm import Session, joinedload
from app.schemas.user import UserBase, UserCreate, UserPartialUpdate, UserProfileResponse, UserUpdateResponse, UsersListResponse, UserListResponse, RoleUpdateResponse
from app.models.user import User
from app.models.role import Role
from app.utils.auth import hash_password
from app.utils.file_utils import save_base64_image, delete_profile_image
from fastapi import HTTPException, status
import app.logger.logger as logger

def get_me(user: User):
    return UserProfileResponse(
        message="User profile retrieved successfully",
        user=user
    )

def check_email_availability(db: Session, email: str) -> bool:
    """
    Check if an email address is available for registration.
    Returns True if email is available, False if already taken.
    """
    if not email or not email.strip():
        return False
    
    # Normalize email (lowercase and trim)
    normalized_email = email.strip().lower()
    
    # Check if email already exists in database
    existing_user = db.query(User).filter(User.email == normalized_email).first()
    
    # Return True if no user found (email is available)
    return existing_user is None

def update_profile(db: Session, user: User, user_update: UserPartialUpdate):
    # Handle profile picture update if provided
    if hasattr(user_update, 'profile_pic') and user_update.profile_pic is not None:
        # If it's base64 data, save it as a file
        if user_update.profile_pic.startswith('data:image/'):
            # Delete old profile picture if it exists
            if user.profile_pic:
                delete_profile_image(user.profile_pic)
            
            # Save new profile picture
            try:
                new_profile_pic_path = save_base64_image(user_update.profile_pic, user.id)
                user_update.profile_pic = new_profile_pic_path
            except Exception as e:
                logger.warning(f"Failed to save profile picture for user {user.email}: {e}")
                user_update.profile_pic = None
    
    # Update other fields
    for key, value in user_update.model_dump(exclude_unset=True).items():
        setattr(user, key, value)
    
    db.commit()
    db.refresh(user)

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
    profile_pic_data = user_data.pop('profile_pic', None)  # Extract profile pic data
    
    # Create user first to get user ID
    new_user = User(**user_data, profile_pic=None)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Handle profile picture if provided
    if profile_pic_data and profile_pic_data.startswith('data:image/'):
        try:
            profile_pic_path = save_base64_image(profile_pic_data, new_user.id)
            if profile_pic_path:
                new_user.profile_pic = profile_pic_path
                db.commit()
                db.refresh(new_user)
        except Exception as e:
            logger.warning(f"Failed to save profile picture for user {new_user.email}: {e}")

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