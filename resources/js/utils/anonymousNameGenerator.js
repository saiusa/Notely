/**
 * Generates a random anonymous name with adjective + noun pattern
 * Examples: "Quiet Observer", "Midnight Thinker", "Wandering Soul"
 */

const adjectives = [
  'Quiet', 'Bold', 'Gentle', 'Keen', 'Wise', 'Swift', 'Bright',
  'Deep', 'Wild', 'Calm', 'Serene', 'Eager', 'Humble', 'Noble',
  'Silent', 'Clever', 'Radiant', 'Tender', 'Curious', 'Mystic',
  'Dreamy', 'Wandering', 'Hopeful', 'Truthful', 'Peaceful', 'Vivid',
  'Sleek', 'Steadfast', 'Nimble', 'Thoughtful', 'Twilight', 'Midnight',
  'Crystal', 'Golden', 'Silver', 'Eternal', 'Distant', 'Lost',
  'Found', 'Sudden', 'Hidden', 'Brave', 'Shy', 'Witty', 'Stellar',
  'Misty', 'Bright', 'Starry', 'Ethereal', 'Majestic', 'Timeless'
];

const nouns = [
  'Observer', 'Thinker', 'Soul', 'Dreamer', 'Wanderer', 'Seeker',
  'Voyager', 'Explorer', 'Painter', 'Writer', 'Listener', 'Watcher',
  'Keeper', 'Guardian', 'Mystic', 'Sage', 'Prophet', 'Poet',
  'Artist', 'Musician', 'Scholar', 'Philosopher', 'Visionary', 'Creator',
  'Storyteller', 'Sage', 'Wanderer', 'Nomad', 'Pilgrim', 'Traveler',
  'Stargazer', 'Moonlight', 'Sunset', 'Dawn', 'Echo', 'Whisper',
  'Shadow', 'Flame', 'Wind', 'River', 'Mountain', 'Ocean',
  'Phoenix', 'Raven', 'Wolf', 'Eagle', 'Lion', 'Dove',
  'Butterfly', 'Firefly', 'Knight', 'Warrior', 'Sentinel', 'Guardian'
];

/**
 * Generate a random anonymous name
 * @returns {string} A random anonymous name like "Quiet Observer"
 */
export function generateAnonymousName() {
  const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
  return `${randomAdjective} ${randomNoun}`;
}
