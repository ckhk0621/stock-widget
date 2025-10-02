import axios from 'axios';

// API Configuration
const ALPHA_VANTAGE_KEY = import.meta.env.VITE_ALPHA_VANTAGE_KEY || 'demo';
const ALPHA_VANTAGE_BASE = 'https://www.alphavantage.co/query';

// Cache configuration
const CACHE_DURATION = 60000; // 1 minute
const cache = new Map();

/**
 * Get cached data or fetch new data
 */
const getCachedData = async (key, fetchFn) => {
  const cached = cache.get(key);
  const now = Date.now();

  if (cached && (now - cached.timestamp) < CACHE_DURATION) {
    return cached.data;
  }

  const data = await fetchFn();
  cache.set(key, { data, timestamp: now });
  return data;
};

/**
 * Fetch current stock quote
 */
export const getStockQuote = async (symbol) => {
  const cacheKey = `quote_${symbol}`;

  return getCachedData(cacheKey, async () => {
    try {
      const response = await axios.get(ALPHA_VANTAGE_BASE, {
        params: {
          function: 'GLOBAL_QUOTE',
          symbol,
          apikey: ALPHA_VANTAGE_KEY
        }
      });

      const quote = response.data['Global Quote'];

      if (!quote || Object.keys(quote).length === 0) {
        throw new Error('No quote data available');
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
        low: parseFloat(quote['04. low'])
      };
    } catch (error) {
      console.error('Error fetching stock quote:', error);
      throw error;
    }
  });
};

/**
 * Fetch intraday stock data
 */
export const getIntradayData = async (symbol, interval = '5min') => {
  const cacheKey = `intraday_${symbol}_${interval}`;

  return getCachedData(cacheKey, async () => {
    try {
      const response = await axios.get(ALPHA_VANTAGE_BASE, {
        params: {
          function: 'TIME_SERIES_INTRADAY',
          symbol,
          interval,
          apikey: ALPHA_VANTAGE_KEY,
          outputsize: 'compact'
        }
      });

      const timeSeries = response.data[`Time Series (${interval})`];

      if (!timeSeries) {
        throw new Error('No intraday data available');
      }

      const data = Object.entries(timeSeries).map(([timestamp, values]) => ({
        time: new Date(timestamp).getTime() / 1000,
        open: parseFloat(values['1. open']),
        high: parseFloat(values['2. high']),
        low: parseFloat(values['3. low']),
        close: parseFloat(values['4. close']),
        volume: parseInt(values['5. volume'])
      })).reverse();

      return data;
    } catch (error) {
      console.error('Error fetching intraday data:', error);
      throw error;
    }
  });
};

/**
 * Fetch daily stock data
 */
export const getDailyData = async (symbol, outputsize = 'compact') => {
  const cacheKey = `daily_${symbol}_${outputsize}`;

  return getCachedData(cacheKey, async () => {
    try {
      const response = await axios.get(ALPHA_VANTAGE_BASE, {
        params: {
          function: 'TIME_SERIES_DAILY',
          symbol,
          apikey: ALPHA_VANTAGE_KEY,
          outputsize
        }
      });

      const timeSeries = response.data['Time Series (Daily)'];

      if (!timeSeries) {
        throw new Error('No daily data available');
      }

      const data = Object.entries(timeSeries).map(([date, values]) => ({
        time: new Date(date).getTime() / 1000,
        open: parseFloat(values['1. open']),
        high: parseFloat(values['2. high']),
        low: parseFloat(values['3. low']),
        close: parseFloat(values['4. close']),
        volume: parseInt(values['5. volume'])
      })).reverse();

      return data;
    } catch (error) {
      console.error('Error fetching daily data:', error);
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
 * Mock data generator for development/demo
 */
export const getMockStockData = (symbol, period = '1M') => {
  const basePrice = 150;
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
  let price = basePrice;

  for (let i = dataPoints; i >= 0; i--) {
    const change = (Math.random() - 0.5) * 5;
    price += change;
    const time = now - (i * interval);

    data.push({
      time,
      open: price,
      high: price + Math.random() * 2,
      low: price - Math.random() * 2,
      close: price,
      volume: Math.floor(1000000 + Math.random() * 500000)
    });
  }

  return data;
};

export const getMockQuote = (symbol) => {
  const price = 150 + (Math.random() - 0.5) * 10;
  const change = (Math.random() - 0.5) * 5;

  return {
    symbol,
    price,
    change,
    changePercent: `${((change / price) * 100).toFixed(2)}%`,
    volume: Math.floor(1000000 + Math.random() * 500000),
    latestTradingDay: new Date().toISOString().split('T')[0],
    previousClose: price - change,
    open: price - 1,
    high: price + 2,
    low: price - 3
  };
};
