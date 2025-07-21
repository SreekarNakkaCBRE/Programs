from fastapi import FastAPI
from . import controllers
from .database import init_db

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Welcome to the Employee Management API"}

init_db()

app.include_router(controllers.router, prefix="/api", tags=["employees"])