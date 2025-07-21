from fastapi import FastAPI
from app.routers.base_router import router as base_router
from fastapi.middleware.cors import CORSMiddleware
from app.dbconfig.database import engine, Base
from app.models import item_model

Base.metadata.create_all(bind=engine)

app = FastAPI()

origin = "http://localhost:3000"

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(base_router)



@app.get("/")
def read_root():
    return {"message": "Welcome to Item Management API"}