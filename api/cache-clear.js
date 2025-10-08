/**
 * Vercel Serverless Function: Clear Redis Cache
 *
 * GET /api/cache-clear?symbol=MIMI&provider=alphavantage
 *
 * Quick utility to clear stale Redis cache entries.
 * Useful after API format changes or data structure updates.
 */

import { deleteFromCache } from './stock/utils/redis.js';

/**
 * Main handler
 */
export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Prevent browser/CDN caching
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  // Handle OPTIONS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { symbol, provider = 'alphavantage' } = req.query;

    if (!symbol) {
      return res.status(400).json({ error: 'Symbol parameter required' });
    }

    // Clear all cache entries for this symbol
    const quoteKey = `stock:quote:${symbol}:${provider}`;
    const intradayKey = `stock:intraday:${symbol}:5min:${provider}`;
    const dailyKey = `stock:daily:${symbol}:compact:${provider}`;

    const results = await Promise.all([
      deleteFromCache(quoteKey),
      deleteFromCache(intradayKey),
      deleteFromCache(dailyKey)
    ]);

    const cleared = results.filter(Boolean).length;

    return res.status(200).json({
      success: true,
      symbol,
      provider,
      cleared,
      keys: [quoteKey, intradayKey, dailyKey],
      message: `Cleared ${cleared} cache entries for ${symbol}`
    });

  } catch (error) {
    console.error('[Cache Clear] Error:', error.message);

    return res.status(500).json({
      error: 'Failed to clear cache',
      message: error.message
    });
  }
}
