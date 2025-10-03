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
  const [selectedPeriod, setSelectedPeriod] = useState('1M');
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch quote data on initial load
  useEffect(() => {
    const fetchQuote = async () => {
      try {
        setLoading(true);
        setError(null);

        if (useMock) {
          const mockQuote = getMockQuote(symbol);
          setQuote(mockQuote);
        } else {
          const quoteData = await getStockQuote(symbol);
          setQuote(quoteData);
        }
      } catch (err) {
        setError(err.message);
        console.error('[StockWidget] Error fetching quote:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuote();
  }, [symbol, useMock]);

  // Fetch chart data when period changes
  useEffect(() => {
    const fetchChartData = async () => {
      try {
        setChartLoading(true);

        if (useMock) {
          const mockDaily = getMockStockData(symbol, selectedPeriod);
          setDailyData(mockDaily);
        } else {
          const dailyDataResult = await getStockData(symbol, selectedPeriod);
          setDailyData(dailyDataResult);
        }
      } catch (err) {
        console.error(`[StockWidget] Error fetching ${selectedPeriod} data:`, err);
      } finally {
        setChartLoading(false);
      }
    };

    // Only fetch if quote is loaded
    if (quote) {
      fetchChartData();
    }
  }, [symbol, selectedPeriod, useMock, quote]);

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
          <StockChart
            symbol={symbol}
            dailyData={dailyData}
            loading={chartLoading}
            selectedPeriod={selectedPeriod}
            onPeriodChange={setSelectedPeriod}
          />
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
