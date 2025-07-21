from pydantic import BaseModel, EmailStr, Field
from typing import Optional

class UserBase(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    contact_number: Optional[str] = None
    address: Optional[str] = None
    profile_pic: Optional[str] = None
    is_active: bool = True

class UserCreate(UserBase):
    password: str
    role_id: int = Field(default=2, description="Role ID for the user, default is 2 (User role)")

class UserUpdate(UserBase):
    id: int
    role_id: int

class AdminCreateUser(UserBase):
    password: str
    role_id: int = Field(..., description="Role ID for the user, must be provided by admin")

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