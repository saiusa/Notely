/**
 * Format a date as relative time (e.g., "2 hours ago", "just now")
 * When over a month, includes the date: "2 months ago • March"
 * @param {string|Date} dateString - ISO date string or Date object
 * @returns {string} Relative time string
 */
export function formatRelativeTime(dateString) {
    if (!dateString) return '';

    const date = new Date(dateString);
    const now = new Date();
    const secondsAgo = Math.floor((now - date) / 1000);

    // Less than a minute
    if (secondsAgo < 60) {
        return secondsAgo === 1 ? 'just now' : `${secondsAgo} seconds ago`;
    }

    // Minutes
    const minutesAgo = Math.floor(secondsAgo / 60);
    if (minutesAgo < 60) {
        return minutesAgo === 1 ? '1 minute ago' : `${minutesAgo} minutes ago`;
    }

    // Hours
    const hoursAgo = Math.floor(minutesAgo / 60);
    if (hoursAgo < 24) {
        return hoursAgo === 1 ? '1 hour ago' : `${hoursAgo} hours ago`;
    }

    // Days
    const daysAgo = Math.floor(hoursAgo / 24);
    if (daysAgo < 7) {
        return daysAgo === 1 ? '1 day ago' : `${daysAgo} days ago`;
    }

    // Weeks
    const weeksAgo = Math.floor(daysAgo / 7);
    if (weeksAgo < 4) {
        return weeksAgo === 1 ? '1 week ago' : `${weeksAgo} weeks ago`;
    }

    // Months (with date)
    const monthsAgo = Math.floor(daysAgo / 30);
    if (monthsAgo < 12) {
        const monthName = date.toLocaleDateString('en-US', { month: 'long' });
        const day = date.getDate();
        const timeStr = monthsAgo === 1 ? '1 month ago' : `${monthsAgo} months ago`;
        return `${timeStr} • ${monthName} ${day}`;
    }

    // Years (with date)
    const yearsAgo = Math.floor(monthsAgo / 12);
    const monthName = date.toLocaleDateString('en-US', { month: 'long' });
    const day = date.getDate();
    const timeStr = yearsAgo === 1 ? '1 year ago' : `${yearsAgo} years ago`;
    return `${timeStr} • ${monthName} ${day}`;
}
