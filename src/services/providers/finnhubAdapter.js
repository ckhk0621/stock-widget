/**
 * Finnhub API Adapter
 *
 * Free tier: 60 API calls per minute (~86,400/day)
 * Documentation: https://finnhub.io/docs/api
 */

import axios from 'axios';

const FINNHUB_API_KEY = import.meta.env.VITE_FINNHUB_API_KEY || '';
const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';

// Mask API key for security in logs
const maskApiKey = (key) => {
  if (!key) return 'NOT_SET';
  if (key.length < 8) return '***';
  return `${key.substring(0, 4)}...${key.substring(key.length - 4)}`;
};

console.log(`[Finnhub] Using API key: ${maskApiKey(FINNHUB_API_KEY)}`);

if (!FINNHUB_API_KEY) {
  console.warn('[Finnhub] ⚠️  No API key configured! Add VITE_FINNHUB_API_KEY to .env.local');
  console.warn('[Finnhub] Get your free API key at: https://finnhub.io/register');
}

/**
 * Make API request to Finnhub
 */
const makeRequest = async (endpoint, params = {}) => {
  if (!FINNHUB_API_KEY) {
    throw new Error('Finnhub API key not configured. Get your free key at https://finnhub.io/register');
  }

  try {
    const response = await axios.get(`${FINNHUB_BASE_URL}${endpoint}`, {
      params: {
        ...params,
        token: FINNHUB_API_KEY
      }
    });

    // Check for API errors
    if (response.data.error) {
      throw new Error(`Finnhub API Error: ${response.data.error}`);
    }

    return response.data;
  } catch (error) {
    if (error.response) {
      // API returned an error response
      if (error.response.status === 429) {
        throw new Error('Finnhub rate limit exceeded (60/min). Please try again in a moment.');
      }
      if (error.response.status === 401) {
        throw new Error('Invalid Finnhub API key. Check your configuration.');
      }
      throw new Error(`Finnhub API error (${error.response.status}): ${error.response.statusText}`);
    }
    throw error;
  }
};

/**
 * Get current stock quote
 * API: /quote?symbol=SYMBOL
 */
const getQuote = async (symbol) => {
  console.log(`[Finnhub] Fetching quote for ${symbol}...`);

  const data = await makeRequest('/quote', { symbol });

  // Finnhub response format:
  // { c: current_price, d: change, dp: change_percent, h: high, l: low, o: open, pc: previous_close, t: timestamp }

  if (data.c === 0 && data.pc === 0) {
    throw new Error(`No quote data available for symbol ${symbol}. Market may be closed or symbol invalid.`);
  }

  const currentPrice = data.c;
  const previousClose = data.pc;
  const change = data.d;
  const changePercent = data.dp;

  // Get current date for latestTradingDay (Finnhub doesn't provide this directly)
  const now = new Date();
  const latestTradingDay = now.toISOString().split('T')[0];

  return {
    symbol: symbol.toUpperCase(),
    price: currentPrice,
    change: change,
    changePercent: `${changePercent.toFixed(2)}%`,
    volume: 'N/A', // Finnhub quote endpoint doesn't include volume - not available
    latestTradingDay,
    previousClose: previousClose,
    open: data.o,
    high: data.h,
    low: data.l,
    // Additional comprehensive fields - not available in Finnhub quote endpoint
    marketCap: 'N/A',
    peRatio: '-',
    pbRatio: '-',
    eps: '-',
    sharesOutstanding: '0',
    week52High: null,
    week52Low: null,
    exchange: 'N/A',
    bid: 'N/A',
    ask: 'N/A',
    bidSize: 'N/A',
    askSize: 'N/A'
  };
};

/**
 * Get intraday candle data
 * API: /stock/candle?symbol=SYMBOL&resolution=5&from=TIMESTAMP&to=TIMESTAMP
 */
const getIntradayData = async (symbol, interval = '5min') => {
  console.log(`[Finnhub] Fetching intraday data for ${symbol} (${interval})...`);

  // Map interval to Finnhub resolution
  // Finnhub supports: 1, 5, 15, 30, 60 (minutes), D, W, M
  const resolutionMap = {
    '1min': '1',
    '5min': '5',
    '15min': '15',
    '30min': '30',
    '60min': '60'
  };
  const resolution = resolutionMap[interval] || '5';

  // Get data for last 10 days
  const to = Math.floor(Date.now() / 1000);
  const from = to - (10 * 24 * 60 * 60);

  const data = await makeRequest('/stock/candle', {
    symbol,
    resolution,
    from,
    to
  });

  // Finnhub response format:
  // { c: [closes], h: [highs], l: [lows], o: [opens], v: [volumes], t: [timestamps], s: "ok" }

  if (data.s === 'no_data') {
    throw new Error(`No intraday data available for symbol ${symbol}`);
  }

  // Transform to our format
  const candles = [];
  for (let i = 0; i < data.t.length; i++) {
    candles.push({
      time: data.t[i],
      open: data.o[i],
      high: data.h[i],
      low: data.l[i],
      close: data.c[i],
      volume: data.v[i]
    });
  }

  return candles;
};

/**
 * Get daily candle data
 * API: /stock/candle?symbol=SYMBOL&resolution=D&from=TIMESTAMP&to=TIMESTAMP
 */
const getDailyData = async (symbol, outputsize = 'compact') => {
  console.log(`[Finnhub] Fetching daily data for ${symbol} (${outputsize})...`);

  // Determine time range based on outputsize
  const to = Math.floor(Date.now() / 1000);
  const daysMap = {
    'compact': 100, // ~100 days (Alpha Vantage compact equivalent)
    'full': 5 * 365 // 5 years
  };
  const days = daysMap[outputsize] || daysMap['compact'];
  const from = to - (days * 24 * 60 * 60);

  const data = await makeRequest('/stock/candle', {
    symbol,
    resolution: 'D', // Daily resolution
    from,
    to
  });

  // Finnhub response format:
  // { c: [closes], h: [highs], l: [lows], o: [opens], v: [volumes], t: [timestamps], s: "ok" }

  if (data.s === 'no_data') {
    throw new Error(`No daily data available for symbol ${symbol}`);
  }

  // Transform to our format
  const candles = [];
  for (let i = 0; i < data.t.length; i++) {
    candles.push({
      time: data.t[i],
      open: data.o[i],
      high: data.h[i],
      low: data.l[i],
      close: data.c[i],
      volume: data.v[i]
    });
  }

  return candles;
};

/**
 * Create and export Finnhub adapter
 */
export const createFinnhubAdapter = () => {
  console.log('[Finnhub] Adapter initialized');
  console.log('[Finnhub] Free tier: 60 calls/minute (~86,400/day)');
  console.log('[Finnhub] Get your API key: https://finnhub.io/register');

  return {
    name: 'Finnhub',
    getQuote,
    getIntradayData,
    getDailyData
  };
};
