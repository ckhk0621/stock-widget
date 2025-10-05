/**
 * Vercel Serverless Function: Daily Stock Data API
 *
 * GET /api/stock/daily?symbol=AAPL&outputsize=compact
 *
 * Features:
 * - Redis cache (shared across all clients)
 * - Fallback to direct API call
 * - CORS enabled for WordPress embedding
 */

import axios from 'axios';
import { getFromCache, saveToCache, getCacheTTL } from './utils/redis.js';

/**
 * Fetch daily data from Alpha Vantage API and normalize the response
 */
const fetchFromAlphaVantage = async (symbol, outputsize = 'compact') => {
  const apiKey = process.env.VITE_ALPHA_VANTAGE_KEY;
  if (!apiKey) {
    throw new Error('Alpha Vantage API key not configured');
  }

  const response = await axios.get('https://www.alphavantage.co/query', {
    params: {
      function: 'TIME_SERIES_DAILY',
      symbol,
      outputsize,
      apikey: apiKey
    }
  });

  const timeSeries = response.data['Time Series (Daily)'];

  if (!timeSeries) {
    throw new Error('No daily data available - check symbol or API key');
  }

  // Transform to chart format (array of candles)
  const candles = Object.entries(timeSeries).map(([date, values]) => ({
    time: new Date(date).getTime() / 1000,
    open: parseFloat(values['1. open']),
    high: parseFloat(values['2. high']),
    low: parseFloat(values['3. low']),
    close: parseFloat(values['4. close']),
    volume: parseInt(values['5. volume'])
  })).reverse();

  return candles;
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
    const { symbol, outputsize = 'compact' } = req.query;

    if (!symbol) {
      return res.status(400).json({ error: 'Symbol parameter required' });
    }

    const provider = 'alphavantage';
    const cacheKey = `stock:daily:${symbol}:${outputsize}:${provider}`;

    // Try Redis cache first
    const cached = await getFromCache(cacheKey);
    if (cached) {
      return res.status(200).json({
        data: cached,
        source: 'redis-cache',
        symbol,
        outputsize,
        provider
      });
    }

    // Cache miss - fetch from API
    console.log(`[API] Fetching daily data for ${symbol} from ${provider}`);
    const data = await fetchFromAlphaVantage(symbol, outputsize);

    // Save to Redis cache
    const ttl = getCacheTTL();
    await saveToCache(cacheKey, data, ttl);

    return res.status(200).json({
      data,
      source: 'api',
      symbol,
      outputsize,
      provider,
      cached_for: `${ttl}s`
    });

  } catch (error) {
    console.error('[API] Daily data error:', error.message);

    // Return appropriate error response
    if (error.response?.status === 429) {
      return res.status(429).json({
        error: 'API rate limit exceeded',
        message: 'Please try again later'
      });
    }

    return res.status(500).json({
      error: 'Failed to fetch daily data',
      message: error.message
    });
  }
}
