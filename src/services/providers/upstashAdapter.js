/**
 * Upstash Redis Adapter
 *
 * Connects frontend to Vercel serverless API routes with Redis caching
 * Uses server-side shared cache instead of client-side localStorage
 *
 * Benefits:
 * - All clients share same Redis cache
 * - 100 visitors = 3 API calls (vs 300 with localStorage)
 * - Instant load for all users after first request
 * - Consistent behavior in development and production
 *
 * DEVELOPMENT TESTING:
 * - Use `npm run build && npm run preview` to test Redis caching locally
 * - Vite dev server (npm run dev) doesn't support serverless functions
 * - See REDIS_TESTING_GUIDE.md for detailed testing instructions
 */

import axios from 'axios';

// Detect API base URL
const getApiBaseUrl = () => {
  // Use current origin (works for both localhost and production)
  return window.location.origin;
};

const API_BASE_URL = getApiBaseUrl();

/**
 * Create Upstash adapter instance
 */
export const createUpstashAdapter = () => {
  console.log('[Upstash Adapter] Initializing with API base:', API_BASE_URL);

  return {
    /**
     * Fetch stock quote via Vercel API (Redis cached)
     * Always uses serverless API routes for consistent Redis caching
     */
    getQuote: async (symbol) => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/stock/quote`, {
          params: { symbol },
          timeout: 10000
        });

        console.log(`[Upstash] Quote source: ${response.data.source} | Symbol: ${symbol}`);
        return response.data.data;
      } catch (error) {
        console.error('[Upstash] Quote error:', error.message);
        throw new Error(`Failed to fetch quote for ${symbol}: ${error.message}`);
      }
    },

    /**
     * Fetch intraday data via Vercel API (Redis cached)
     * Always uses serverless API routes for consistent Redis caching
     */
    getIntradayData: async (symbol, interval = '5min') => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/stock/intraday`, {
          params: { symbol, interval },
          timeout: 10000
        });

        console.log(`[Upstash] Intraday source: ${response.data.source} | Symbol: ${symbol}`);
        return response.data.data;
      } catch (error) {
        console.error('[Upstash] Intraday error:', error.message);
        throw new Error(`Failed to fetch intraday data for ${symbol}: ${error.message}`);
      }
    },

    /**
     * Fetch daily data via Vercel API (Redis cached)
     * Always uses serverless API routes for consistent Redis caching
     */
    getDailyData: async (symbol, outputsize = 'compact') => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/stock/daily`, {
          params: { symbol, outputsize },
          timeout: 10000
        });

        console.log(`[Upstash] Daily data source: ${response.data.source} | Symbol: ${symbol}`);
        return response.data.data;
      } catch (error) {
        console.error('[Upstash] Daily data error:', error.message);
        throw new Error(`Failed to fetch daily data for ${symbol}: ${error.message}`);
      }
    }
  };
};
