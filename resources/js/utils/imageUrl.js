/**
 * Utility function to build complete image URLs for loading from Laravel backend
 * 
 * @param {string} imagePath - The image path from database (can be relative or absolute)
 * @returns {string|null} - Complete URL to load from backend or null if path is empty
 * 
 * Examples:
 * - 'posts/image.jpg' → 'http://localhost:8000/storage/posts/image.jpg'
 * - 'storage/posts/image.jpg' → 'http://localhost:8000/storage/posts/image.jpg'
 * - '/storage/posts/image.jpg' → 'http://localhost:8000/storage/posts/image.jpg'
 * - 'https://external.com/image.jpg' → 'https://external.com/image.jpg' (unchanged)
 * - null/empty → null
 */
export const getFullImageUrl = (imagePath) => {
    if (!imagePath) return null;

    // Already an absolute URL (http/https) - use as-is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
    }

    // Get backend URL from environment, fallback to localhost:8000
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

    // Normalize path: ensure it starts with /storage/
    let normalizedPath = imagePath;
    
    // Remove leading slash if present
    if (normalizedPath.startsWith('/')) {
        normalizedPath = normalizedPath.slice(1);
    }
    
    // Add /storage/ prefix if not already present
    if (!normalizedPath.startsWith('storage/')) {
        normalizedPath = `storage/${normalizedPath}`;
    }
    
    // Ensure path starts with /
    normalizedPath = `/${normalizedPath}`;

    // Combine backend URL with image path
    const fullUrl = `${backendUrl}${normalizedPath}`;
    
    // Debug logging
    console.log('📸 Image URL Debug:', {
        imagePath,
        backendUrl,
        normalizedPath,
        fullUrl,
        envVarSet: !!import.meta.env.VITE_BACKEND_URL
    });
    
    return fullUrl;
};
