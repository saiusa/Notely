/**
 * Utility function to build image URLs for loading from Laravel backend.
 *
 * NUCLEAR OPTION: Forces all relative image paths to use the production URL.
 * Also intercepts any localhost/127.0.0.1 strings that may be stored in the DB.
 *
 * @param {string} imagePath - The image path from database (can be relative or absolute)
 * @returns {string|null}
 *
 * Examples:
 * - 'posts/image.jpg'                              → 'https://notelyjournal.me/storage/posts/image.jpg'
 * - 'storage/posts/image.jpg'                      → 'https://notelyjournal.me/storage/posts/image.jpg'
 * - 'images/category.jpg'                          → 'https://notelyjournal.me/images/category.jpg'
 * - 'http://127.0.0.1:8000/storage/posts/img.jpg' → 'https://notelyjournal.me/storage/posts/img.jpg'
 * - 'https://cdn.com/x.jpg'                        → 'https://cdn.com/x.jpg' (unchanged)
 * - null/empty                                      → null
 */
export const getFullImageUrl = (imagePath) => {
    if (!imagePath) return null;

    // Already an absolute URL (http/https) - use as-is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        // QUICK CHECK: Intercept localhost and force production
        if (imagePath.includes('127.0.0.1:8000') || imagePath.includes('localhost:8000')) {
            return imagePath.replace(/http:\/\/(127\.0\.0\.1|localhost):8000/g, 'https://notelyjournal.me');
        }
        return imagePath;
    }

    // NUCLEAR OPTION: Hardcode the exact production URL. Ignore Vite variables.
    const backendUrl = 'https://notelyjournal.me';

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

