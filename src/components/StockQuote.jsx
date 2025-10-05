import './StockQuote.css';

const StockQuote = ({ quote, loading = false }) => {
  // Component now receives pre-fetched data from parent (StockWidget)
  // This eliminates redundant API calls

  const error = !quote && !loading ? 'No quote data available' : null;

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

  // Format large numbers with commas (e.g., 16,012,500)
  const formatNumber = (value) => {
    if (value === null || value === undefined || value === 'N/A' || value === '-' || value === '0') {
      return value || 'N/A';
    }

    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return value;

    return num.toLocaleString('en-US', { maximumFractionDigits: 0 });
  };

  // Format market cap in M/B notation (e.g., $164.65M)
  const formatMarketCap = (value) => {
    if (value === null || value === undefined || value === 'N/A' || value === '-') {
      return value || 'N/A';
    }

    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return value;

    if (num >= 1e12) {
      return `$${(num / 1e12).toFixed(2)}T`;
    } else if (num >= 1e9) {
      return `$${(num / 1e9).toFixed(2)}B`;
    } else if (num >= 1e6) {
      return `$${(num / 1e6).toFixed(2)}M`;
    } else if (num >= 1e3) {
      return `$${(num / 1e3).toFixed(2)}K`;
    }
    return `$${num.toFixed(2)}`;
  };

  // Format regular values with optional prefix/suffix
  const formatValue = (value, prefix = '', suffix = '') => {
    if (value === null || value === undefined || value === 'N/A' || value === '-') {
      return value || 'N/A';
    }
    return `${prefix}${typeof value === 'number' ? value.toFixed(2) : value}${suffix}`;
  };

  return (
    <div className="stock-quote">
      <div className="quote-header">
        <h2 className="symbol">{quote.symbol} (STOCK QUOTE)</h2>
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
              {isPositive ? '+' : ''}${quote.change.toFixed(2)}
            </span>
            <span className="change-percent">
              ({quote.changePercent})
            </span>
          </div>
        </div>

        <div className="quote-details-grid">
          {/* Column 1: Last, Change, Open, High */}
          <div className="detail-item">
            <span className="detail-label">Last</span>
            <span className="detail-value">${quote.price.toFixed(2)}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">$Chg</span>
            <span className={`detail-value ${priceChangeClass}`}>
              {isPositive ? '▲' : '▼'} ${Math.abs(quote.change).toFixed(2)}
            </span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Open</span>
            <span className="detail-value">${quote.open.toFixed(2)}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">High</span>
            <span className="detail-value">${quote.high.toFixed(2)}</span>
          </div>

          {/* Column 2: Volume, % Chg, Prev. Close, Low */}
          <div className="detail-item">
            <span className="detail-label">Volume</span>
            <span className="detail-value">
              {typeof quote.volume === 'number' ? quote.volume.toLocaleString() : quote.volume}
            </span>
          </div>
          <div className="detail-item">
            <span className="detail-label">% Chg</span>
            <span className={`detail-value ${priceChangeClass}`}>{quote.changePercent}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Prev. Close</span>
            <span className="detail-value">${quote.previousClose.toFixed(2)}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Low</span>
            <span className="detail-value">${quote.low.toFixed(2)}</span>
          </div>

          {/* Column 3: MarketCap, Year High, Shares, Year Low */}
          <div className="detail-item">
            <span className="detail-label">MarketCap</span>
            <span className="detail-value">{formatMarketCap(quote.marketCap)}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Year High</span>
            <span className="detail-value">{formatValue(quote.week52High, '$')}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Shares</span>
            <span className="detail-value">{formatNumber(quote.sharesOutstanding)}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Year Low</span>
            <span className="detail-value">{formatValue(quote.week52Low, '$')}</span>
          </div>

          {/* Column 5: PB Ratio, PE Ratio, EPS, Exchange */}
          <div className="detail-item">
            <span className="detail-label">PB Ratio</span>
            <span className="detail-value">{formatValue(quote.pbRatio)}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">PE Ratio</span>
            <span className="detail-value">{formatValue(quote.peRatio)}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">EPS</span>
            <span className="detail-value">{formatValue(quote.eps)}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Exchange</span>
            <span className="detail-value">{formatValue(quote.exchange)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockQuote;
