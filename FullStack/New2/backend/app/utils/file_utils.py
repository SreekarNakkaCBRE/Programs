import os
import base64
import uuid
from typing import Optional
from fastapi import HTTPException

def save_base64_image(base64_data: str, user_id: int) -> Optional[str]:
    """
    Save base64 image data to static folder and return the file path.
    
    Args:
        base64_data: Base64 encoded image data (with data:image/... prefix)
        user_id: User ID for generating unique filename
        
    Returns:
        Relative file path for database storage
    """
    if not base64_data:
        return None
        
    try:
        # Extract the base64 data and file extension
        if ',' in base64_data:
            header, base64_content = base64_data.split(',', 1)
            # Extract file extension from header (e.g., "data:image/png;base64" -> "png")
            if 'image/' in header:
                file_ext = header.split('image/')[1].split(';')[0]
            else:
                file_ext = 'jpg'  # default
        else:
            base64_content = base64_data
            file_ext = 'jpg'  # default
            
        # Generate unique filename
        filename = f"profile_{user_id}_{uuid.uuid4().hex[:8]}.{file_ext}"
        
        # Create static directory if it doesn't exist
        static_dir = os.path.join("static", "profile_pics")
        os.makedirs(static_dir, exist_ok=True)
        
        # Full file path
        file_path = os.path.join(static_dir, filename)
        
        # Decode and save the image
        image_data = base64.b64decode(base64_content)
        with open(file_path, 'wb') as f:
            f.write(image_data)
            
        # Return relative path for database storage
        return f"/static/profile_pics/{filename}"
        
    except Exception as e:
        print(f"Error saving image: {e}")
        raise HTTPException(status_code=400, detail="Invalid image data")

def delete_profile_image(file_path: str) -> bool:
    """
    Delete a profile image file.
    
    Args:
        file_path: Relative file path from database
        
    Returns:
        True if deleted successfully, False otherwise
    """
    if not file_path:
        return False
        
    try:
        # Convert relative path to absolute path
        if file_path.startswith('/static/'):
            file_path = file_path[1:]  # Remove leading slash
            
        if os.path.exists(file_path):
            os.remove(file_path)
            return True
        return False
    except Exception as e:
        print(f"Error deleting image: {e}")
        return False