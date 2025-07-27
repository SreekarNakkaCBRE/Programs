from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional
import re

class UserBase(BaseModel):
    first_name: str = Field(..., min_length=2, max_length=50, description="First name must be between 2 and 50 characters")
    last_name: str = Field(..., min_length=2, max_length=50, description="Last name must be between 2 and 50 characters")
    email: EmailStr = Field(..., description="Valid email address required")
    contact_number: Optional[str] = Field(None, description="Exactly 10-digit Indian mobile number starting with 6, 7, 8, or 9")
    address: Optional[str] = Field(None, max_length=500, description="Address must not exceed 500 characters")
    profile_pic: Optional[str] = None
    is_active: bool = True

    @field_validator('first_name', 'last_name')
    @classmethod
    def validate_names(cls, v):
        if not v.strip():
            raise ValueError('Name cannot be empty or just whitespace')
        if not re.match(r"^[a-zA-Z\s'-]+$", v.strip()):
            raise ValueError('Name can only contain letters, spaces, hyphens, and apostrophes')
        return v.strip().title()

    @field_validator('contact_number')
    @classmethod
    def validate_contact_number(cls, v):
        if v is not None:
            # Remove all non-digit characters
            digits_only = re.sub(r'\D', '', v)
            
            # Only accept exactly 10 digits starting with 6, 7, 8, or 9
            if len(digits_only) != 10:
                raise ValueError('Contact number must be exactly 10 digits')
            
            if not re.match(r'^[6-9]\d{9}$', digits_only):
                raise ValueError('Indian mobile number must start with 6, 7, 8, or 9')
            
            return digits_only
        return v

    @field_validator('address')
    @classmethod
    def validate_address(cls, v):
        if v is not None:
            v = v.strip()
            if len(v) == 0:
                return None
            if len(v) > 500:
                raise ValueError('Address must not exceed 500 characters')
        return v

class UserCreate(UserBase):
    password: str = Field(..., min_length=8, max_length=128, description="Password must be between 8-128 characters")
    role_id: int = Field(default=2, ge=1, le=2, description="Role ID must be 1 (Admin) or 2 (User)")

    @field_validator('password')
    @classmethod
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if len(v) > 128:
            raise ValueError('Password must not exceed 128 characters')
        
        # Check password strength
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not re.search(r'[a-z]', v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not re.search(r'\d', v):
            raise ValueError('Password must contain at least one number')
        if not re.search(r'[!@#$%^&*()_+\-=\[\]{};\':"\\|,.<>\/?]', v):
            raise ValueError('Password must contain at least one special character')
        
        # Check for common patterns
        if v.lower() in ['password', '12345678', 'qwerty123', 'admin123']:
            raise ValueError('Password is too common, please choose a stronger password')
        
        return v

class UserUpdate(UserBase):
    id: int
    role_id: int

class AdminCreateUser(UserBase):
    password: str
    role_id: int = Field(..., description="Role ID for the user, must be provided by admin")

class AdminUpdateUser(UserBase):
    id: int
    role_id: Optional[int] = None  # Admin can change role, but it's optional in this context

class UserPartialUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    contact_number: Optional[str] = None
    address: Optional[str] = None
    profile_pic: Optional[str] = None
    is_active: Optional[bool] = None

class RoleRead(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True

class UserRead(UserBase):
    id: int
    role: Optional[RoleRead] = None

    class Config:
        from_attributes = True

class UserListResponse(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: EmailStr
    contact_number: Optional[str] = None
    address: Optional[str] = None
    profile_pic: Optional[str] = None
    is_active: bool
    role: Optional[RoleRead] = None

    class Config:
        from_attributes = True

class UserProfileResponse(BaseModel):
    message: str
    user: UserRead

class UserUpdateResponse(BaseModel):
    message: str
    user: UserRead

class UsersListResponse(BaseModel):
    message: str
    users: list[UserListResponse]
    total_count: int

class RoleUpdateResponse(BaseModel):
    message: str
    user: UserRead

class RoleUpdateRequest(BaseModel):
    role_id: int = Field(..., description="New role ID for the user")