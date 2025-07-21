from fastapi import FastAPI
from app.dbconfig.init_db import init_db
from app.controllers import auth_controller, user_controller
from fastapi.staticfiles import StaticFiles

app = FastAPI()

init_db()

app.include_router(auth_controller.router)
app.include_router(user_controller.router)
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
def root():
    return {"message": "Role Management App is running"}

from fastapi.middleware.cors import CORSMiddleware

origins = [
    "http://localhost:3000",  # CRA default
    "http://localhost:8000",  # Vite default
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # or ["*"] for all
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
