from sqlalchemy import create_engine, Column, Integer, String, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

DATABASE_URL = "sqlite:///./users.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False}) #connects to users.db file

session_local = sessionmaker(autocommit=False, autoflush=False, bind=engine) 

Base = declarative_base()

