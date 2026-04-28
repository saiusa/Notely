/**
 * Utility function to build complete image URLs for loading from Laravel backend
 *
 * @param {string} imagePath - The image path from database (can be relative or absolute)
 * @returns {string|null} - Complete URL to load from backend or null if path is empty
 *
 * Examples:
 * - 'posts/image.jpg'           → 'https://notelyjournal.me/storage/posts/image.jpg'
 * - 'storage/posts/image.jpg'   → 'https://notelyjournal.me/storage/posts/image.jpg'
 * - '/storage/posts/image.jpg'  → 'https://notelyjournal.me/storage/posts/image.jpg'
 * - 'images/category.jpg'       → 'https://notelyjournal.me/images/category.jpg'  (static, no /storage/)
 * - 'https://cdn.com/x.jpg'     → 'https://cdn.com/x.jpg' (unchanged)
 * - null/empty                  → null
 */
export const getFullImageUrl = (imagePath) => {
    if (!imagePath) return null;

    // Already an absolute URL (http/https) - use as-is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
    }

    // Get backend URL from environment, strip any trailing slashes to prevent //
    const backendUrl = (import.meta.env.VITE_BACKEND_URL || 'https://notelyjournal.me').replace(/\/$/, '');

    // Normalize path: remove leading slash if present
    let normalizedPath = imagePath;
    if (normalizedPath.startsWith('/')) {
        normalizedPath = normalizedPath.slice(1);
    }

    // Add /storage/ prefix ONLY if it's not already there AND it's not a static seeded image
    if (!normalizedPath.startsWith('storage/') && !normalizedPath.startsWith('images/')) {
        normalizedPath = `storage/${normalizedPath}`;
    }

    // Combine backend URL with image path
    return `${backendUrl}/${normalizedPath}`;
};
