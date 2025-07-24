from sqlalchemy import Column, Enum, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.dbconfig.database import Base

class properties(Base):
    __tablename__ = "properties"

    property_id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    property_type = Column(String, nullable=False)
    description = Column(String, nullable=True)
    price = Column(Integer, nullable=False)
    address = Column(String, nullable=False)
    city = Column(String, nullable=False)
    state = Column(String, nullable=False)
    zip_code = Column(String, nullable=False)
    images = Column(String, nullable=True)  # Assuming images are stored as a comma-separated string or JSON
    status = Column(String, nullable=False) # e.g., "available", "sold", etc.
    
    owner_id = Column(Integer, ForeignKey("users.user_id"))
    owner = relationship("User", back_populates="properties")