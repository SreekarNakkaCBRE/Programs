from fastapi import HTTPException, status
from jose import JWTError, jwt
import time
from app.utils.auth import SECRET_KEY, ALGORITHM


def validate_email(email: str) -> bool:
    import re
    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(email_pattern, email) is not None


def validate_password_strength(password: str) -> tuple[bool, str]:
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"
    
    if not any(c.isupper() for c in password):
        return False, "Password must contain at least one uppercase letter"
    
    if not any(c.islower() for c in password):
        return False, "Password must contain at least one lowercase letter"
    
    if not any(c.isdigit() for c in password):
        return False, "Password must contain at least one number"
    
    return True, "Password is valid"


def validate_jwt_token(token: str) -> dict:
    if not token or not token.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token is required",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    try:
        # Decode and validate the token
        decoded_token = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        
        # Check if token has expired (if exp claim exists)
        if decoded_token.get('exp') and decoded_token['exp'] < time.time():
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has expired",
                headers={"WWW-Authenticate": "Bearer"}
            )
        
        # Validate required fields
        if not decoded_token.get('sub'):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid token: missing user ID",
                headers={"WWW-Authenticate": "Bearer"}
            )
        
        return decoded_token
        
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"JWT validation failed: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Token validation error",
            headers={"WWW-Authenticate": "Bearer"}
        )


def validate_role_permission(user_role: str, required_roles: list[str]) -> bool:
    return user_role in required_roles


def validate_user_id(user_id: str) -> int:
    try:
        return int(user_id)
    except (ValueError, TypeError):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID format",
            headers={"WWW-Authenticate": "Bearer"}
        )