from pydantic import BaseModel, EmailStr
from typing import Optional

class UserBase(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    contact_number: Optional[str] = None
    address: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    first_name: Optional[str]
    last_name: Optional[str]
    contact_number: Optional[str]
    address: Optional[str]
    profile_pic: Optional[str]

class UserOut(UserBase):
    id: int
    role: str
    profile_pic: Optional[str]

    class Config:
        orm_mode = True
