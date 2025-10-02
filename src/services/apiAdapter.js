/**
 * Stock API Adapter
 *
 * Provides abstraction layer for multiple stock data providers.
 * Supports switching between providers via environment configuration.
 */

import { createAlphaVantageAdapter } from './providers/alphaVantageAdapter.js';
import { createFinnhubAdapter } from './providers/finnhubAdapter.js';

// Get configured provider from environment
const PROVIDER = import.meta.env.VITE_STOCK_API_PROVIDER || 'finnhub';

// Cache configuration
// 24 hours = 24 * 60 * 60 * 1000 ms
// With Alpha Vantage free tier (25 calls/day), 24-hour cache allows:
// - 3 API calls per page load (quote, chart, historical)
// - 25 calls/day ÷ 3 = ~8 unique page loads per day
// - Subsequent visitors within 24h use cached data (0 API calls)
const CACHE_DURATION = 86400000; // 24 hours
const cache = new Map();

/**
 * Get cached data or fetch new data
 */
const getCachedData = async (key, fetchFn) => {
  const cached = cache.get(key);
  const now = Date.now();

  if (cached && (now - cached.timestamp) < CACHE_DURATION) {
    console.log(`[API Adapter] Cache hit for ${key}`);
    return cached.data;
  }

  console.log(`[API Adapter] Cache miss for ${key}, fetching...`);
  const data = await fetchFn();
  cache.set(key, { data, timestamp: now });
  return data;
};

/**
 * Create provider instance based on configuration
 */
const createProvider = () => {
  console.log(`[API Adapter] Initializing provider: ${PROVIDER}`);

  switch (PROVIDER.toLowerCase()) {
    case 'alphavantage':
    case 'alpha-vantage':
      return createAlphaVantageAdapter();

    case 'finnhub':
      return createFinnhubAdapter();

    default:
      console.warn(`[API Adapter] Unknown provider "${PROVIDER}", falling back to Finnhub`);
      return createFinnhubAdapter();
  }
};

// Initialize provider
const provider = createProvider();

/**
 * Fetch current stock quote
 */
export const getStockQuote = async (symbol) => {
  const cacheKey = `quote_${symbol}_${PROVIDER}`;

  return getCachedData(cacheKey, async () => {
    try {
      console.log(`[API Adapter] Fetching quote for ${symbol} via ${PROVIDER}...`);
      const quote = await provider.getQuote(symbol);
      console.log(`[API Adapter] ✅ Successfully fetched quote for ${symbol}`);
      return quote;
    } catch (error) {
      console.error(`[API Adapter] ❌ Error fetching quote:`, error.message);
      throw error;
    }
  });
};

/**
 * Fetch intraday stock data
 */
export const getIntradayData = async (symbol, interval = '5min') => {
  const cacheKey = `intraday_${symbol}_${interval}_${PROVIDER}`;

  return getCachedData(cacheKey, async () => {
    try {
      console.log(`[API Adapter] Fetching intraday data for ${symbol} via ${PROVIDER}...`);
      const data = await provider.getIntradayData(symbol, interval);
      console.log(`[API Adapter] ✅ Successfully fetched ${data.length} intraday data points`);
      return data;
    } catch (error) {
      console.error(`[API Adapter] ❌ Error fetching intraday data:`, error.message);
      throw error;
    }
  });
};

/**
 * Fetch daily stock data
 */
export const getDailyData = async (symbol, outputsize = 'compact') => {
  const cacheKey = `daily_${symbol}_${outputsize}_${PROVIDER}`;

  return getCachedData(cacheKey, async () => {
    try {
      console.log(`[API Adapter] Fetching daily data for ${symbol} via ${PROVIDER}...`);
      const data = await provider.getDailyData(symbol, outputsize);
      console.log(`[API Adapter] ✅ Successfully fetched ${data.length} daily data points`);
      return data;
    } catch (error) {
      console.error(`[API Adapter] ❌ Error fetching daily data:`, error.message);
      throw error;
    }
  });
};

/**
 * Get stock data based on time period
 */
export const getStockData = async (symbol, period = '1M') => {
  const periodMap = {
    '10D': { fn: getIntradayData, params: ['5min'] },
    '1M': { fn: getDailyData, params: ['compact'] },
    '3M': { fn: getDailyData, params: ['compact'] },
    '6M': { fn: getDailyData, params: ['compact'] },
    '1Y': { fn: getDailyData, params: ['full'] },
    '5Y': { fn: getDailyData, params: ['full'] },
    'ALL': { fn: getDailyData, params: ['full'] }
  };

  const config = periodMap[period] || periodMap['1M'];
  const data = await config.fn(symbol, ...config.params);

  // Filter data based on period
  const now = Date.now() / 1000;
  const periodSeconds = {
    '10D': 10 * 24 * 60 * 60,
    '1M': 30 * 24 * 60 * 60,
    '3M': 90 * 24 * 60 * 60,
    '6M': 180 * 24 * 60 * 60,
    '1Y': 365 * 24 * 60 * 60,
    '5Y': 5 * 365 * 24 * 60 * 60,
    'ALL': Infinity
  };

  const cutoff = now - periodSeconds[period];
  return data.filter(item => item.time >= cutoff);
};

/**
 * Generate deterministic seed from symbol for consistent mock data
 * Same symbol always gets same base values
 */
const getSymbolSeed = (symbol) => {
  let hash = 0;
  for (let i = 0; i < symbol.length; i++) {
    hash = ((hash << 5) - hash) + symbol.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

/**
 * Seeded random number generator for consistent results per symbol
 */
const seededRandom = (seed) => {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
};

/**
 * Mock data generator for development/demo - NO HARDCODED VALUES
 * All data generated dynamically based on symbol
 */
export const getMockQuote = (symbol) => {
  const seed = getSymbolSeed(symbol);

  // Generate base price from symbol (range: $1 - $500)
  const basePrice = 1 + seededRandom(seed) * 499;

  // Generate daily change (-5% to +5%)
  const changePercent = (seededRandom(seed + 1) - 0.5) * 10;
  const change = basePrice * (changePercent / 100);
  const price = basePrice;
  const previousClose = price - change;

  // Generate OHLC values
  const dayVolatility = basePrice * 0.02; // 2% intraday range
  const open = previousClose + (seededRandom(seed + 2) - 0.5) * dayVolatility;
  const high = Math.max(open, price) + seededRandom(seed + 3) * dayVolatility;
  const low = Math.min(open, price) - seededRandom(seed + 4) * dayVolatility;

  // Generate volume (1M - 10M shares)
  const volume = Math.floor(1000000 + seededRandom(seed + 5) * 9000000);

  // Generate 52-week range
  const yearHigh = price + (seededRandom(seed + 6) * basePrice * 0.5);
  const yearLow = price - (seededRandom(seed + 7) * basePrice * 0.3);

  // Generate fundamental ratios (or leave blank)
  const pbRatio = seededRandom(seed + 8) < 0.7 ? (0.5 + seededRandom(seed + 9) * 5).toFixed(2) : '-';
  const peRatio = seededRandom(seed + 10) < 0.6 ? Math.floor(5 + seededRandom(seed + 11) * 50) : '-';
  const eps = seededRandom(seed + 12) < 0.6 ? (seededRandom(seed + 13) * 10).toFixed(2) : '-';

  return {
    symbol,
    price,
    change,
    changePercent: `${changePercent.toFixed(2)}%`,
    volume,
    latestTradingDay: new Date().toISOString().split('T')[0],
    previousClose,
    open,
    high,
    low,
    // Additional comprehensive fields - dynamically generated or blank
    marketCap: 'N/A', // Not available in mock mode
    peRatio,
    pbRatio,
    eps,
    sharesOutstanding: '0', // Not available in mock mode
    week52High: yearHigh,
    week52Low: yearLow,
    exchange: 'N/A', // Exchange not available in mock mode
    bid: 'N/A', // Real-time bid not available in mock
    ask: 'N/A', // Real-time ask not available in mock
    bidSize: 'N/A',
    askSize: 'N/A'
  };
};

/**
 * Mock historical data generator - matches current price from getMockQuote
 * NO HARDCODED VALUES - all dynamic
 */
export const getMockStockData = (symbol, period = '1M') => {
  const seed = getSymbolSeed(symbol);
  const mockQuote = getMockQuote(symbol);
  const currentPrice = mockQuote.price;

  const dataPoints = {
    '10D': 48,
    '1M': 30,
    '3M': 90,
    '6M': 180,
    '1Y': 365,
    '5Y': 1825,
    'ALL': 1825
  }[period] || 30;

  const now = Date.now() / 1000;
  const interval = {
    '10D': 5 * 60,
    '1M': 24 * 60 * 60,
    '3M': 24 * 60 * 60,
    '6M': 24 * 60 * 60,
    '1Y': 24 * 60 * 60,
    '5Y': 24 * 60 * 60,
    'ALL': 24 * 60 * 60
  }[period] || 24 * 60 * 60;

  const data = [];

  // Start from a historical price and trend toward current price
  const historicalStartPrice = currentPrice * (0.7 + seededRandom(seed + 100) * 0.6);
  const pricePerDay = (currentPrice - historicalStartPrice) / dataPoints;

  let price = historicalStartPrice;

  for (let i = dataPoints; i >= 0; i--) {
    // Add trend toward current price plus random walk
    const randomWalk = (seededRandom(seed + i) - 0.5) * (currentPrice * 0.02);
    price += pricePerDay + randomWalk;

    // Ensure we end at approximately current price
    if (i === 0) {
      price = currentPrice;
    }

    const time = now - (i * interval);
    const dailyVolatility = price * 0.02;

    data.push({
      time,
      open: price + (seededRandom(seed + i + 1000) - 0.5) * dailyVolatility,
      high: price + seededRandom(seed + i + 2000) * dailyVolatility,
      low: price - seededRandom(seed + i + 3000) * dailyVolatility,
      close: price,
      volume: Math.floor(1000000 + seededRandom(seed + i + 4000) * 5000000)
    });
  }

  return data;
};
