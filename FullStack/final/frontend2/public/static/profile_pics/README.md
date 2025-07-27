# Profile Pictures Storage

This folder is designated for storing user profile pictures.

## How it works:

1. **Frontend Storage**: Profile pictures are stored in browser's localStorage with filename references
2. **Reference System**: Each image gets a unique filename like `profile_{userId}_{timestamp}.{extension}`
3. **Static Path**: Images are referenced as `/static/profile_pics/{filename}`
4. **Loading**: The `loadImageFromStatic()` function retrieves images from localStorage using the filename

## File Structure:
```
/static/profile_pics/
├── README.md (this file)
└── [Profile pictures would be stored here in a real backend implementation]
```

## Note:
Since browsers cannot directly write files to the static folder, the current implementation uses localStorage as a fallback. In a production environment, you would implement a proper backend upload endpoint to save files to this directory.

## Usage:
- Users can upload profile pictures through the Profile page
- Pictures are automatically resized and validated (max 5MB, image files only)
- Images persist across browser sessions via localStorage
- Images appear in the header profile dropdown and profile page
