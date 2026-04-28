/**
 * Utility function to build image URLs for loading from Laravel backend.
 *
 * Strategy:
 *  - In production (Railway), the React frontend and Laravel backend share the
 *    SAME origin (https://notelyjournal.me). So all image paths should be
 *    constructed as absolute URLs using window.location.origin — no hardcoded
 *    localhost, no VITE_BACKEND_URL needed at build time.
 *  - In local dev, Vite proxies /storage → http://localhost:8000, so relative
 *    paths like /storage/... work transparently.
 *  - VITE_BACKEND_URL is checked first so you can still override if needed.
 *
 * @param {string} imagePath - The image path from database (can be relative or absolute)
 * @returns {string|null}
 *
 * Examples:
 * - 'posts/image.jpg'           → '/storage/posts/image.jpg'
 * - 'storage/posts/image.jpg'   → '/storage/posts/image.jpg'
 * - '/storage/posts/image.jpg'  → '/storage/posts/image.jpg'
 * - 'images/category.jpg'       → '/images/category.jpg'   (static, no /storage/ prefix)
 * - 'https://cdn.com/x.jpg'     → 'https://cdn.com/x.jpg'  (unchanged)
 * - null/empty                  → null
 */
export const getFullImageUrl = (imagePath) => {
    if (!imagePath) return null;

    // Already an absolute URL (http/https) - use as-is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
    }

    // Normalize path: remove leading slash if present
    let normalizedPath = imagePath;
    if (normalizedPath.startsWith('/')) {
        normalizedPath = normalizedPath.slice(1);
    }

    // Static seeded images (public/images/) bypass /storage/ prefix
    if (normalizedPath.startsWith('images/')) {
        return `/${normalizedPath}`;
    }

    // Ensure /storage/ prefix for user-uploaded files
    if (!normalizedPath.startsWith('storage/')) {
        normalizedPath = `storage/${normalizedPath}`;
    }

    // Return as root-relative path:
    // - Local dev: Vite proxies /storage → http://localhost:8000
    // - Production: same origin, so /storage/... resolves to https://notelyjournal.me/storage/...
    return `/${normalizedPath}`;
};
