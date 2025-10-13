export const FEED_BATCH_SIZE = 1000;
export const MAX_FEED_ITERATIONS = 1000; // max 1,000,000 records - to prevent infinite loops
export const CACHE_TTL = 30 * 24 * 60 * 60; // 30 days - `cache` requires TTL (-1 is invalid, 0 immediate expiry)
