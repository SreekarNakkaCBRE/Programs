from fastapi import APIRouter
from app.controllers.auth import router as auth_router
from app.controllers.user import router as user_router

router = APIRouter()

router.include_router(auth_router, prefix="/auth", tags=["auth"])
router.include_router(user_router, prefix="/users", tags=["users"])