/**
 * Upstash Redis Client Utility
 *
 * Provides shared Redis cache for all API routes
 * TTL: 12 hours for development, 24 hours for production
 */

import { Redis } from '@upstash/redis';

// Initialize Redis client (lazy loaded)
let redisClient = null;

/**
 * Get or create Redis client instance
 */
export const getRedisClient = () => {
  if (!redisClient) {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!url || !token) {
      console.warn('[Redis] Configuration missing - Redis caching disabled');
      return null;
    }

    try {
      redisClient = new Redis({
        url,
        token,
        retry: {
          retries: 2,
          backoff: (retryCount) => Math.min(1000 * Math.pow(2, retryCount), 3000)
        }
      });
      console.log('[Redis] Client initialized successfully');
    } catch (error) {
      console.error('[Redis] Initialization failed:', error.message);
      return null;
    }
  }

  return redisClient;
};

/**
 * Get data from Redis cache
 */
export const getFromCache = async (key) => {
  const redis = getRedisClient();
  if (!redis) return null;

  try {
    const data = await redis.get(key);
    if (data) {
      console.log(`[Redis] ✅ Cache hit: ${key}`);
      return data;
    }
    console.log(`[Redis] ❌ Cache miss: ${key}`);
    return null;
  } catch (error) {
    console.error(`[Redis] Get error for ${key}:`, error.message);
    return null;
  }
};

/**
 * Save data to Redis cache with TTL
 * @param {string} key - Cache key
 * @param {any} data - Data to cache
 * @param {number} ttlSeconds - Time to live in seconds
 */
export const saveToCache = async (key, data, ttlSeconds = 43200) => {
  const redis = getRedisClient();
  if (!redis) return false;

  try {
    await redis.setex(key, ttlSeconds, JSON.stringify(data));
    console.log(`[Redis] 💾 Cached: ${key} (TTL: ${ttlSeconds}s)`);
    return true;
  } catch (error) {
    console.error(`[Redis] Set error for ${key}:`, error.message);
    return false;
  }
};

/**
 * Delete cache entry
 */
export const deleteFromCache = async (key) => {
  const redis = getRedisClient();
  if (!redis) return false;

  try {
    await redis.del(key);
    console.log(`[Redis] 🗑️  Deleted: ${key}`);
    return true;
  } catch (error) {
    console.error(`[Redis] Delete error for ${key}:`, error.message);
    return false;
  }
};

/**
 * Get cache TTL optimized for Alpha Vantage free tier
 *
 * Alpha Vantage Limits:
 * - 25 API calls per day
 * - 5 API calls per minute
 * - FREE TIER: End-of-day data only (updates ~4:30 PM ET)
 *
 * Widget makes 3 API calls per symbol (quote, intraday, daily)
 *
 * TTL Strategy (24 hours):
 * - 1 cache refresh per day (24h ÷ 24h)
 * - 3 API calls per day (1 × 3 calls)
 * - 12% quota utilization
 * - 22-call safety buffer for errors/retries/other symbols
 *
 * Rationale:
 * - Free tier data updates ONCE per day (end-of-day only)
 * - No benefit to refreshing cache more frequently
 * - Aligns cache expiration with Alpha Vantage data update schedule
 * - Maximizes API quota efficiency (83% reduction vs 4-hour TTL)
 *
 * Refresh time: Once daily after 4:30 PM ET market data update
 */
export const getCacheTTL = () => {
  return 86400; // 24 hours (in seconds)
};
