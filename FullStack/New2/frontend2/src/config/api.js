// API configuration
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

// Helper function to construct image URLs
export const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    if (imagePath.startsWith('/static/')) {
        return `${API_BASE_URL}${imagePath}`;
    }
    
    return imagePath;
};
