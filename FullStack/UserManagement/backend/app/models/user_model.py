from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.dbconfig.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    contact_number = Column(String)
    address = Column(String)
    profile_pic = Column(String, default="default.png")
    role_id = Column(Integer, ForeignKey("roles.id"))

    role = relationship("Role", back_populates="users")
