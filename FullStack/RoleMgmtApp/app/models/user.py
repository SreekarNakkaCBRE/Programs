from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.dbconfig.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    contact_number = Column(String, nullable=True)
    address = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    profile_pic = Column(String, nullable=True)

    role_id = Column(Integer, ForeignKey("roles.id"))
    role = relationship("Role")
