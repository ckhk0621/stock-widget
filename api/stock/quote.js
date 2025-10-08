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
 * Fetch company overview data from Alpha Vantage
 */
const fetchOverview = async (symbol, apiKey) => {
  const response = await axios.get('https://www.alphavantage.co/query', {
    params: {
      function: 'OVERVIEW',
      symbol,
      apikey: apiKey
    }
  });

  const data = response.data;

  if (!data || !data.Symbol) {
    return null;
  }

  return {
    marketCap: data.MarketCapitalization || 'N/A',
    peRatio: data.PERatio || '-',
    pbRatio: data.PriceToBookRatio || '-',
    eps: data.EPS || '-',
    sharesOutstanding: data.SharesOutstanding || '0',
    week52High: data['52WeekHigh'] ? parseFloat(data['52WeekHigh']) : null,
    week52Low: data['52WeekLow'] ? parseFloat(data['52WeekLow']) : null,
    exchange: data.Exchange || 'N/A'
  };
};

/**
 * Fetch quote from Alpha Vantage API and normalize the response
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

  const quote = response.data['Global Quote'];

  if (!quote || Object.keys(quote).length === 0) {
    throw new Error('No quote data available - check symbol or API key');
  }

  // Check if OVERVIEW API call is enabled (additional API call)
  const enableOverview = process.env.VITE_ENABLE_OVERVIEW === 'true';
  let overview = null;

  if (enableOverview) {
    console.log('[API] OVERVIEW enabled - fetching comprehensive data (extra API call)');
    try {
      overview = await fetchOverview(symbol, apiKey);
    } catch (error) {
      console.warn('[API] Could not fetch overview data:', error.message);
    }
  }

  // Normalize the data to match alphaVantageAdapter format
  return {
    symbol: quote['01. symbol'],
    price: parseFloat(quote['05. price']),
    change: parseFloat(quote['09. change']),
    changePercent: quote['10. change percent'],
    volume: parseInt(quote['06. volume']),
    latestTradingDay: quote['07. latest trading day'],
    previousClose: parseFloat(quote['08. previous close']),
    open: parseFloat(quote['02. open']),
    high: parseFloat(quote['03. high']),
    low: parseFloat(quote['04. low']),
    // Additional fields from overview (if available)
    marketCap: overview?.marketCap || 'N/A',
    peRatio: overview?.peRatio || '-',
    pbRatio: overview?.pbRatio || '-',
    eps: overview?.eps || '-',
    sharesOutstanding: overview?.sharesOutstanding || '0',
    week52High: overview?.week52High || null,
    week52Low: overview?.week52Low || null,
    exchange: overview?.exchange || 'N/A'
  };
};

/**
 * Main handler
 */
export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Prevent browser/CDN caching - Redis is the ONLY cache layer
  // Without these headers, browsers use "heuristic caching" and cache responses
  // even after clearing Redis, causing stale data to persist
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache'); // HTTP/1.0 compatibility
  res.setHeader('Expires', '0'); // Prevent proxy caching

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
