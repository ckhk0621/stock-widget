import { useState, useEffect } from 'react';
import { getStockQuote, getMockQuote } from '../services/stockApi';
import './StockQuote.css';

const StockQuote = ({ symbol, useMock = false }) => {
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuote = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = useMock
          ? getMockQuote(symbol)
          : await getStockQuote(symbol);

        setQuote(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchQuote();

    // Refresh every 60 seconds
    const interval = setInterval(fetchQuote, 60000);
    return () => clearInterval(interval);
  }, [symbol, useMock]);

  if (loading) {
    return (
      <div className="stock-quote loading">
        <div className="loading-spinner"></div>
        <p>Loading quote...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="stock-quote error">
        <p>Error loading quote: {error}</p>
      </div>
    );
  }

  if (!quote) return null;

  const isPositive = quote.change >= 0;
  const priceChangeClass = isPositive ? 'positive' : 'negative';

  return (
    <div className="stock-quote">
      <div className="quote-header">
        <h2 className="symbol">{quote.symbol}</h2>
        <span className="trading-day">{quote.latestTradingDay}</span>
      </div>

      <div className="quote-main">
        <div className="price-section">
          <div className="current-price">
            ${quote.price.toFixed(2)}
          </div>
          <div className={`price-change ${priceChangeClass}`}>
            <span className="change-arrow">{isPositive ? '▲' : '▼'}</span>
            <span className="change-value">
              {isPositive ? '+' : ''}{quote.change.toFixed(2)}
            </span>
            <span className="change-percent">
              ({quote.changePercent})
            </span>
          </div>
        </div>

        <div className="quote-details">
          <div className="detail-item">
            <span className="detail-label">Open</span>
            <span className="detail-value">${quote.open.toFixed(2)}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">High</span>
            <span className="detail-value">${quote.high.toFixed(2)}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Low</span>
            <span className="detail-value">${quote.low.toFixed(2)}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Prev Close</span>
            <span className="detail-value">${quote.previousClose.toFixed(2)}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Volume</span>
            <span className="detail-value">{quote.volume.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockQuote;
