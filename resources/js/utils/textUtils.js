/**
 * Truncate text to a specific number of words
 * @param {string} text - The text to truncate
 * @param {number} wordLimit - Maximum number of words to keep
 * @returns {string} - Truncated text with "..." appended if truncated
 */
export function truncateToWords(text, wordLimit = 12) {
    if (!text || typeof text !== 'string') {
        return '';
    }

    const words = text.trim().split(/\s+/);
    
    if (words.length <= wordLimit) {
        return text;
    }

    return words.slice(0, wordLimit).join(' ') + '...';
}
