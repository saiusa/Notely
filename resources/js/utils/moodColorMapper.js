import { moodOptions } from '../components/layout/moodOptions';

/**
 * Maps mood names to their color palette (backgroundColor and textColor)
 * @param {string} moodName - The name of the mood (e.g., 'Happy', 'Sad')
 * @returns {Object} Object with backgroundColor and textColor, or defaults
 */
export const getMoodColorPalette = (moodName) => {
    if (!moodName) {
        return {
            backgroundColor: '#e8f5f3',
            textColor: '#1b5654',
        };
    }

    const mood = moodOptions.find(
        (m) => m.label.toLowerCase() === moodName.toLowerCase()
    );

    if (mood) {
        return {
            backgroundColor: mood.backgroundColor,
            textColor: mood.textColor,
            emoji: mood.emoji,
        };
    }

    // Fallback for unmapped moods
    return {
        backgroundColor: '#e8f5f3',
        textColor: '#1b5654',
    };
};

/**
 * Get all mood options with their color palettes
 * Useful for returning complete mood data with styling info
 */
export const getMoodWithColors = (moodName) => {
    const mood = moodOptions.find(
        (m) => m.label.toLowerCase() === moodName.toLowerCase()
    );
    return mood || null;
};
