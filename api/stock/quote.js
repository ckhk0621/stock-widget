/**
 * Vercel Serverless Function: Stock Quote API
 *
 * GET /api/stock/quote?symbol=AAPL
 *
 * Features:
 * - Redis cache (shared across all clients)
 * - Fallback to direct API call
 * - CORS enabled for WordPress embedding
 */

import axios from 'axios';
import { getFromCache, saveToCache, getCacheTTL } from './utils/redis.js';

/**
 * Fetch quote from Alpha Vantage API
 */
const fetchFromAlphaVantage = async (symbol) => {
  const apiKey = process.env.VITE_ALPHA_VANTAGE_KEY;
  if (!apiKey) {
    throw new Error('Alpha Vantage API key not configured');
  }

  const response = await axios.get('https://www.alphavantage.co/query', {
    params: {
      function: 'GLOBAL_QUOTE',
      symbol,
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
    const { symbol } = req.query;

    if (!symbol) {
      return res.status(400).json({ error: 'Symbol parameter required' });
    }

    const provider = 'alphavantage';
    const cacheKey = `stock:quote:${symbol}:${provider}`;

    // Try Redis cache first
    const cached = await getFromCache(cacheKey);
    if (cached) {
      return res.status(200).json({
        data: cached,
        source: 'redis-cache',
        symbol,
        provider
      });
    }

    // Cache miss - fetch from API
    console.log(`[API] Fetching quote for ${symbol} from ${provider}`);
    const data = await fetchFromAlphaVantage(symbol);

    // Save to Redis cache
    const ttl = getCacheTTL();
    await saveToCache(cacheKey, data, ttl);

    return res.status(200).json({
      data,
      source: 'api',
      symbol,
      provider,
      cached_for: `${ttl}s`
    });

  } catch (error) {
    console.error('[API] Quote error:', error.message);

    // Return appropriate error response
    if (error.response?.status === 429) {
      return res.status(429).json({
        error: 'API rate limit exceeded',
        message: 'Please try again later'
      });
    }

    return res.status(500).json({
      error: 'Failed to fetch stock quote',
      message: error.message
    });
  }
}
