/**
 * Convert a string to a URL-safe slug
 * @param {string} str - The string to convert
 * @returns {string} - The slugified string
 * @example
 * slugify("Healing Era") // => "healing-era"
 * slugify("Poetry") // => "poetry"
 * slugify("Dark Academia") // => "dark-academia"
 */
export function slugify(str) {
    if (!str) return '';
    return str
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-'); // Replace multiple hyphens with single hyphen
}

export default slugify;
