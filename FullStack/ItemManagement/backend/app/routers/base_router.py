from fastapi import APIRouter
from app.controllers.items_controller import router as items_router

router = APIRouter()

router.include_router(items_router, prefix="/items", tags=["items"])
