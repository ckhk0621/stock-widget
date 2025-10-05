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
 * - Falls back to direct API if serverless routes unavailable
 *
 * DEV MODE: API routes don't exist in Vite dev server.
 * Solution: Use environment variable to switch to fallback provider in dev.
 */

import axios from 'axios';
import { createFinnhubAdapter } from './finnhubAdapter.js';
import { createAlphaVantageAdapter } from './alphaVantageAdapter.js';

// Detect API base URL
const getApiBaseUrl = () => {
  // Production: Use Vercel deployment URL
  if (import.meta.env.PROD) {
    return window.location.origin;
  }
  // Development: Use localhost (port determined by Vite)
  return window.location.origin;
};

const API_BASE_URL = getApiBaseUrl();
const IS_DEV = import.meta.env.DEV;

// Fallback provider for development mode
let fallbackProvider = null;
const getFallbackProvider = () => {
  if (!fallbackProvider) {
    // Check which API provider to use as fallback
    const fallbackType = import.meta.env.VITE_STOCK_API_PROVIDER_FALLBACK || 'finnhub';
    console.warn(`[Upstash] DEV MODE: API routes not available. Using fallback: ${fallbackType}`);

    if (fallbackType === 'alphavantage') {
      fallbackProvider = createAlphaVantageAdapter();
    } else {
      fallbackProvider = createFinnhubAdapter();
    }
  }
  return fallbackProvider;
};

/**
 * Create Upstash adapter instance
 */
export const createUpstashAdapter = () => {
  console.log('[Upstash Adapter] Initializing with API base:', API_BASE_URL);

  return {
    /**
     * Fetch stock quote via Vercel API (Redis cached)
     * In DEV mode: Falls back to direct API call
     */
    getQuote: async (symbol) => {
      // Development mode: Use fallback provider
      if (IS_DEV) {
        console.log('[Upstash] Using fallback provider in dev mode');
        const provider = getFallbackProvider();
        return await provider.getQuote(symbol);
      }

      // Production mode: Use Vercel API routes with Redis
      try {
        const response = await axios.get(`${API_BASE_URL}/api/stock/quote`, {
          params: { symbol },
          timeout: 10000
        });

        console.log(`[Upstash] Quote source: ${response.data.source}`);
        return response.data.data;
      } catch (error) {
        console.error('[Upstash] Quote error:', error.message);
        throw new Error(`Failed to fetch quote for ${symbol}: ${error.message}`);
      }
    },

    /**
     * Fetch intraday data via Vercel API (Redis cached)
     * In DEV mode: Falls back to direct API call
     */
    getIntradayData: async (symbol, interval = '5min') => {
      // Development mode: Use fallback provider
      if (IS_DEV) {
        console.log('[Upstash] Using fallback provider in dev mode');
        const provider = getFallbackProvider();
        return await provider.getIntradayData(symbol, interval);
      }

      // Production mode: Use Vercel API routes with Redis
      try {
        const response = await axios.get(`${API_BASE_URL}/api/stock/intraday`, {
          params: { symbol, interval },
          timeout: 10000
        });

        console.log(`[Upstash] Intraday source: ${response.data.source}`);
        return response.data.data;
      } catch (error) {
        console.error('[Upstash] Intraday error:', error.message);
        throw new Error(`Failed to fetch intraday data for ${symbol}: ${error.message}`);
      }
    },

    /**
     * Fetch daily data via Vercel API (Redis cached)
     * In DEV mode: Falls back to direct API call
     */
    getDailyData: async (symbol, outputsize = 'compact') => {
      // Development mode: Use fallback provider
      if (IS_DEV) {
        console.log('[Upstash] Using fallback provider in dev mode');
        const provider = getFallbackProvider();
        return await provider.getDailyData(symbol, outputsize);
      }

      // Production mode: Use Vercel API routes with Redis
      try {
        const response = await axios.get(`${API_BASE_URL}/api/stock/daily`, {
          params: { symbol, outputsize },
          timeout: 10000
        });

        console.log(`[Upstash] Daily data source: ${response.data.source}`);
        return response.data.data;
      } catch (error) {
        console.error('[Upstash] Daily data error:', error.message);
        throw new Error(`Failed to fetch daily data for ${symbol}: ${error.message}`);
      }
    }
  };
};
