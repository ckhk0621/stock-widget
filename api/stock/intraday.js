/**
 * Vercel Serverless Function: Intraday Stock Data API
 *
 * GET /api/stock/intraday?symbol=AAPL&interval=5min
 *
 * Features:
 * - Redis cache (shared across all clients)
 * - Fallback to direct API call
 * - CORS enabled for WordPress embedding
 */

import axios from 'axios';
import { getFromCache, saveToCache, getCacheTTL } from './utils/redis.js';

/**
 * Fetch intraday data from Alpha Vantage API
 */
const fetchFromAlphaVantage = async (symbol, interval = '5min') => {
  const apiKey = process.env.VITE_ALPHA_VANTAGE_KEY;
  if (!apiKey) {
    throw new Error('Alpha Vantage API key not configured');
  }

  const response = await axios.get('https://www.alphavantage.co/query', {
    params: {
      function: 'TIME_SERIES_INTRADAY',
      symbol,
      interval,
      apikey: apiKey
    }
  });

  return response.data;
};

/**
 * Main handler
 */
export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { symbol, interval = '5min' } = req.query;

    if (!symbol) {
      return res.status(400).json({ error: 'Symbol parameter required' });
    }

    const provider = 'alphavantage';
    const cacheKey = `stock:intraday:${symbol}:${interval}:${provider}`;

    // Try Redis cache first
    const cached = await getFromCache(cacheKey);
    if (cached) {
      return res.status(200).json({
        data: cached,
        source: 'redis-cache',
        symbol,
        interval,
        provider
      });
    }

    // Cache miss - fetch from API
    console.log(`[API] Fetching intraday data for ${symbol} from ${provider}`);
    const data = await fetchFromAlphaVantage(symbol, interval);

    // Save to Redis cache
    const ttl = getCacheTTL();
    await saveToCache(cacheKey, data, ttl);

    return res.status(200).json({
      data,
      source: 'api',
      symbol,
      interval,
      provider,
      cached_for: `${ttl}s`
    });

  } catch (error) {
    console.error('[API] Intraday error:', error.message);

    // Return appropriate error response
    if (error.response?.status === 429) {
      return res.status(429).json({
        error: 'API rate limit exceeded',
        message: 'Please try again later'
      });
    }

    return res.status(500).json({
      error: 'Failed to fetch intraday data',
      message: error.message
    });
  }
}
