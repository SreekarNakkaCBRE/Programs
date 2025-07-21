from fastapi import HTTPException, status
from app.utils.validators import validate_jwt_token

def verify_token_credentials(credentials) -> dict:
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing or invalid authorization header",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    token = credentials.credentials
    return validate_jwt_token(token)