from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from app.dbconfig.database import engine, Base
from app.models.user import User
from app.models.role import Role  # Import Role model
from app.routers.base_router import router
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI()

Base.metadata.create_all(bind=engine)

# Seed roles after creating tables
from app.dbconfig.init_db import seed_roles
seed_roles()

# Create static directory if it doesn't exist
static_dir = "static"
os.makedirs(static_dir, exist_ok=True)
os.makedirs(os.path.join(static_dir, "profile_pics"), exist_ok=True)

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

app.include_router(router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Role Management API"}

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)