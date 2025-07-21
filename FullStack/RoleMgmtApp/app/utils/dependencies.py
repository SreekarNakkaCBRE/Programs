from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session, joinedload
from app.dbconfig.database import SessionLocal
from app.models.user import User
from app.utils.validate_token import verify_token_credentials
from app.utils.validators import validate_user_id
from app.logger.logger import logger

security = HTTPBearer()

def get_db():
    db = SessionLocal()
    try:
        yield db
    except Exception as e:
        logger.error(f"An error occurred while Yielding the database: {e}")
    finally:
        db.close()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)) -> User:
    decoded_token = verify_token_credentials(credentials)

    user_id_str = decoded_token.get("sub")
    user_id = validate_user_id(user_id_str)
    
    user = db.query(User).options(joinedload(User.role)).filter(User.id == user_id).first()
        
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"}
        )
        
    return user

def require_role(allowed_roles: list[str]):
    def role_checker(current_user: User = Depends(get_current_user)):
        if current_user.role.name not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to access this resource"
            )
        return current_user
    return role_checker


    