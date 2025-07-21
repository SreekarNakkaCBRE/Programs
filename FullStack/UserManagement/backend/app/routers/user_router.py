from fastapi import APIRouter, Depends, Security, HTTPException
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session
from app.dbconfig.database import get_db
from app.controllers import user_controller
from app.services.auth_service import get_current_user
from app.schemas.user_schema import UserOut
from pydantic import BaseModel

class RoleAssignRequest(BaseModel):
    role_name: str

router = APIRouter(prefix="/users", tags=["Users"])
security = HTTPBearer()

@router.get("/", response_model=list[UserOut])
def list_users(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
    token: str = Security(security)
):
    # Admin-only check
    if not current_user.role or current_user.role.name != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user_controller.get_all_users(db)

@router.put("/{user_id}/role", response_model=UserOut)
def update_user_role(
    user_id: int,
    role_data: RoleAssignRequest,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
    token: str = Security(security)
):
    # Admin-only check
    if not current_user.role or current_user.role.name != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user_controller.assign_user_role(user_id, role_data.role_name, db)
