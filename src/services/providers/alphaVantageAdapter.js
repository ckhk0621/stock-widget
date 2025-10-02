/**
 * Alpha Vantage API Adapter
 *
 * Free tier: 25 API calls per day, 5 calls per minute
 * Documentation: https://www.alphavantage.co/documentation/
 */

import axios from 'axios';

const ALPHA_VANTAGE_KEY = import.meta.env.VITE_ALPHA_VANTAGE_KEY || 'demo';
const ALPHA_VANTAGE_BASE = 'https://www.alphavantage.co/query';

// Mask API key for security in logs
const maskApiKey = (key) => {
  if (!key || key === 'demo') return 'demo';
  return `${key.substring(0, 4)}...${key.substring(key.length - 4)}`;
};

console.log(`[Alpha Vantage] Using API key: ${maskApiKey(ALPHA_VANTAGE_KEY)}`);

if (ALPHA_VANTAGE_KEY === 'demo') {
  console.warn('[Alpha Vantage] ⚠️  Using demo API key - rate limited! Create .env.local with your API key');
}

/**
 * Make API request to Alpha Vantage
 */
const makeRequest = async (params) => {
  try {
    const response = await axios.get(ALPHA_VANTAGE_BASE, {
      params: {
        ...params,
        apikey: ALPHA_VANTAGE_KEY
      }
    });

    // Check for API error messages
    if (response.data['Error Message']) {
      throw new Error(`Alpha Vantage API Error: ${response.data['Error Message']}`);
    }

    if (response.data['Note']) {
      throw new Error(`Alpha Vantage Rate Limit: ${response.data['Note']}`);
    }

    if (response.data['Information']) {
      throw new Error(`Alpha Vantage Info: ${response.data['Information']}`);
    }

    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(`Alpha Vantage API error (${error.response.status}): ${error.response.statusText}`);
    }
    throw error;
  }
};

/**
 * Get company overview data
 * API: OVERVIEW
 * Contains: Market Cap, PE Ratio, PB Ratio, EPS, Shares, 52Week High/Low, Exchange
 */
const getOverview = async (symbol) => {
  console.log(`[Alpha Vantage] Fetching overview for ${symbol}...`);

  const data = await makeRequest({
    function: 'OVERVIEW',
    symbol
  });

  if (!data || !data.Symbol) {
    console.warn('[Alpha Vantage] No overview data available');
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
 * Get current stock quote
 * API: GLOBAL_QUOTE
 */
const getQuote = async (symbol) => {
  console.log(`[Alpha Vantage] Fetching quote for ${symbol}...`);

  const data = await makeRequest({
    function: 'GLOBAL_QUOTE',
    symbol
  });

  const quote = data['Global Quote'];

  if (!quote || Object.keys(quote).length === 0) {
    throw new Error('No quote data available - check symbol or API key');
  }

  // Try to get overview data (this is an additional API call)
  let overview = null;
  try {
    overview = await getOverview(symbol);
  } catch (error) {
    console.warn('[Alpha Vantage] Could not fetch overview data:', error.message);
  }

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
    exchange: overview?.exchange || 'N/A',
    // Bid/Ask are not available in Alpha Vantage free tier
    bid: 'N/A',
    ask: 'N/A',
    bidSize: 'N/A',
    askSize: 'N/A'
  };
};

/**
 * Get intraday stock data
 * API: TIME_SERIES_INTRADAY
 */
const getIntradayData = async (symbol, interval = '5min') => {
  console.log(`[Alpha Vantage] Fetching intraday data for ${symbol} (${interval})...`);

  const data = await makeRequest({
    function: 'TIME_SERIES_INTRADAY',
    symbol,
    interval,
    outputsize: 'compact'
  });

  const timeSeries = data[`Time Series (${interval})`];

  if (!timeSeries) {
    throw new Error('No intraday data available');
  }

  // Transform to our format
  const candles = Object.entries(timeSeries).map(([timestamp, values]) => ({
    time: new Date(timestamp).getTime() / 1000,
    open: parseFloat(values['1. open']),
    high: parseFloat(values['2. high']),
    low: parseFloat(values['3. low']),
    close: parseFloat(values['4. close']),
    volume: parseInt(values['5. volume'])
  })).reverse();

  return candles;
};

/**
 * Get daily stock data
 * API: TIME_SERIES_DAILY
 */
const getDailyData = async (symbol, outputsize = 'compact') => {
  console.log(`[Alpha Vantage] Fetching daily data for ${symbol} (${outputsize})...`);

  const data = await makeRequest({
    function: 'TIME_SERIES_DAILY',
    symbol,
    outputsize
  });

  const timeSeries = data['Time Series (Daily)'];

  if (!timeSeries) {
    throw new Error('No daily data available - check symbol or API key');
  }

  // Transform to our format
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
 * Create and export Alpha Vantage adapter
 */
export const createAlphaVantageAdapter = () => {
  console.log('[Alpha Vantage] Adapter initialized');
  console.log('[Alpha Vantage] Free tier: 25 calls/day, 5 calls/minute');
  console.log('[Alpha Vantage] Get your API key: https://www.alphavantage.co/support/#api-key');

  return {
    name: 'Alpha Vantage',
    getQuote,
    getIntradayData,
    getDailyData
  };
};
