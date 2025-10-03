import { useState, useEffect, lazy, Suspense } from 'react';
import StockQuote from './StockQuote';
import HistoricalData from './HistoricalData';
import { getStockQuote, getStockData, getMockQuote, getMockStockData } from '../services/stockApi';
import './StockWidget.css';

// Lazy load the chart component (reduces initial bundle size)
const StockChart = lazy(() => import('./StockChart'));

const StockWidget = ({ symbol = 'MIMI', useMock = false, theme = 'light' }) => {
  const [quote, setQuote] = useState(null);
  const [dailyData, setDailyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('[StockWidget] useMock prop:', useMock, typeof useMock);

        // Fetch data based on useMock flag
        if (useMock) {
          console.log('[StockWidget] Using MOCK data');
          // Mock data - no API calls
          const mockQuote = getMockQuote(symbol);
          const mockDaily = getMockStockData(symbol, '1M');

          setQuote(mockQuote);
          setDailyData(mockDaily);
        } else {
          console.log('[StockWidget] Using REAL API data');
          // Real API - fetch both in parallel to be efficient
          // But note: with 24-hour cache, this still only makes 2 API calls total
          // (quote + daily data) instead of 3 separate calls
          const [quoteData, dailyDataResult] = await Promise.all([
            getStockQuote(symbol),
            getStockData(symbol, '1M')
          ]);

          setQuote(quoteData);
          setDailyData(dailyDataResult);
        }
      } catch (err) {
        setError(err.message);
        console.error('[StockWidget] Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [symbol, useMock]);

  if (loading) {
    return (
      <div className="stock-widget-container theme-{theme}">
        <div className="widget-header">
          <h1>NASDAQ:{symbol}</h1>
        </div>
        <div className="widget-content">
          <div className="loading-spinner"></div>
          <p>Loading widget data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="stock-widget-container theme-{theme}">
        <div className="widget-header">
          <h1>NASDAQ:{symbol}</h1>
        </div>
        <div className="widget-content error">
          <p>Error loading widget: {error}</p>
          <p style={{ fontSize: '0.9em', marginTop: '10px' }}>
            Try using mock mode: add <code>?mock=true</code> to the URL
          </p>
        </div>
      </div>
    );
  }

  // Get exchange from quote data (dynamic)
  const exchange = quote?.exchange && quote.exchange !== 'N/A' ? quote.exchange : '';
  const headerTitle = exchange ? `${exchange}: ${symbol}` : `NASDAQ: ${symbol}`;

  return (
    <div className={`stock-widget-container theme-${theme}`}>
      <div className="widget-header">
        <h1>{headerTitle}</h1>
      </div>

      <div className="widget-content">
        {/* Pass pre-fetched data to child components */}
        <StockQuote symbol={symbol} quote={quote} loading={false} />

        {/* Lazy load chart component with suspense fallback */}
        <Suspense fallback={
          <div className="stock-chart loading">
            <div className="loading-spinner"></div>
            <p>Loading chart...</p>
          </div>
        }>
          <StockChart symbol={symbol} dailyData={dailyData} loading={false} />
        </Suspense>

        <HistoricalData symbol={symbol} dailyData={dailyData} loading={false} />
      </div>

      {/* <div className="widget-footer">
        <p className="disclaimer">
          Data is delayed. For informational purposes only. Not financial advice.
        </p>
      </div> */}
    </div>
  );
};

export default StockWidget;
