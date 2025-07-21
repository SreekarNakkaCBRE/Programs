from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List

class UserCreate(BaseModel):
    email: EmailStr
    first_name: str = Field(..., max_length=50)
    last_name: str = Field(..., max_length=50)
    password: str = Field(..., min_length=8)
    contact_number: Optional[str] = Field(None, max_length=15)
    address: Optional[str] = Field(None, max_length=255)
    is_active: bool = True
    profile_pic: Optional[str] = None
    role: Optional[str] = Field("standard_user", max_length=50)

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    first_name: Optional[str] = Field(None, max_length=50)
    last_name: Optional[str] = Field(None, max_length=50)
    contact_number: Optional[str] = Field(None, max_length=15)
    address: Optional[str] = Field(None, max_length=255)
    is_active: Optional[bool] = None
    profile_pic: Optional[str] = None

class UserResponse(BaseModel):
    id: int
    email: EmailStr
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    contact_number: Optional[str] = None
    address: Optional[str] = None
    is_active: bool = True
    profile_pic: Optional[str] = None
    role: Optional[str] = None

    class Config:
        from_attributes = True

class UserMinimal(BaseModel):
    id: int
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: EmailStr
    role: Optional[str] = None

    class Config:
        from_attributes = True

class RoleUpdateRequest(BaseModel):
    new_role: str = Field(..., pattern="^(super_admin|admin|standard_user)$")

class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=1)

class PasswordResetRequest(BaseModel):
    new_password: str = Field(..., min_length=8)

class BulkUserAction(BaseModel):
    user_ids: List[int]
    action: str = Field(..., pattern="^(activate|deactivate|delete)$")