from pydantic import BaseModel, Field, EmailStr
from typing import Optional

class SignupRequest(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    password: str
    contact_number: Optional[str] = None
    address: Optional[str] = None   
    profile_pic: Optional[str] = None
    role_id : int = Field(default=2, description="Role ID for the user, default is 2 (User role)")

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class SignupResponse(BaseModel):
    message: str
    user_id: int
    email: str
    full_name: str
    
    class Config:
        from_attributes = True

class ApiResponse(BaseModel):
    message: str
    success: bool = True
    data: Optional[dict] = None