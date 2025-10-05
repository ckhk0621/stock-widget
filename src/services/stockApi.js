/**
 * Stock API Service
 *
 * This file now uses the adapter pattern to support multiple API providers.
 * All functionality is delegated to src/services/apiAdapter.js
 *
 * Supported providers:
 * - Upstash (recommended, server-side Redis caching for 99% API call reduction)
 * - Alpha Vantage (direct API, free tier: 25 calls/day)
 *
 * Configure provider via VITE_STOCK_API_PROVIDER environment variable
 */

export {
  getStockQuote,
  getIntradayData,
  getDailyData,
  getStockData,
  getMockStockData,
  getMockQuote
} from './apiAdapter.js';
