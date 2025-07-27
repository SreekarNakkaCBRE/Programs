// Utility functions for profile picture management

// Function to save image data and return reference
export const saveImageToStatic = async (file, fileName) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                // Store image data in localStorage with filename reference
                const imageData = e.target.result;
                localStorage.setItem(`profile_pic_${fileName}`, imageData);
                
                // Store filename reference for the user
                const userId = fileName.split('_')[1]; // Extract user ID from filename
                localStorage.setItem(`user_profile_pic_${userId}`, fileName);
                
                // Return the reference path
                resolve(`/static/profile_pics/${fileName}`);
            } catch (error) {
                reject(error);
            }
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

// Function to load image from static reference
export const loadImageFromStatic = (imagePath) => {
    if (!imagePath || !imagePath.includes('/static/profile_pics/')) {
        return imagePath; // Return as-is if not a static reference
    }
    
    const fileName = imagePath.split('/').pop();
    const storedImage = localStorage.getItem(`profile_pic_${fileName}`);
    return storedImage || imagePath;
};

// Function to get profile picture for a specific user
export const getUserProfilePic = (userId) => {
    const fileName = localStorage.getItem(`user_profile_pic_${userId}`);
    if (fileName) {
        const imageData = localStorage.getItem(`profile_pic_${fileName}`);
        return imageData || `/static/profile_pics/${fileName}`;
    }
    return null;
};

// Function to ensure user's profile picture is available in localStorage
export const ensureProfilePicAvailable = (user) => {
    if (!user || !user.id) return user;
    
    // If user has a profile_pic path, check if we have it in localStorage
    if (user.profile_pic && user.profile_pic.includes('/static/profile_pics/')) {
        const fileName = user.profile_pic.split('/').pop();
        const storedImage = localStorage.getItem(`profile_pic_${fileName}`);
        
        // If we don't have the image data but we have a reference, that's fine
        // The loadImageFromStatic function will handle it gracefully
        if (!storedImage) {
            // Check if we have a stored filename for this user
            const userFileName = localStorage.getItem(`user_profile_pic_${user.id}`);
            if (userFileName && userFileName !== fileName) {
                // User might have an updated profile pic, update the reference
                user.profile_pic = `/static/profile_pics/${userFileName}`;
            }
        }
    } else {
        // User doesn't have a profile_pic set, check if we have one stored locally
        const storedFileName = localStorage.getItem(`user_profile_pic_${user.id}`);
        if (storedFileName) {
            user.profile_pic = `/static/profile_pics/${storedFileName}`;
        }
    }
    
    return user;
};

// Function to clean up old profile pictures for a user (optional)
export const cleanupOldProfilePics = (userId) => {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
        if (key.startsWith(`profile_pic_profile_${userId}_`)) {
            // This is an old profile pic for this user, we can remove it
            // But let's keep it for now to avoid losing data
        }
    });
};
