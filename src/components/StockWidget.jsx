import StockQuote from './StockQuote';
import StockChart from './StockChart';
import HistoricalData from './HistoricalData';
import './StockWidget.css';

const StockWidget = ({ symbol = 'MIMI', useMock = false, theme = 'light' }) => {
  return (
    <div className={`stock-widget-container theme-${theme}`}>
      <div className="widget-header">
        <h1>NASDAQ-listed company (NASDAQ: {symbol})</h1>
      </div>

      <div className="widget-content">
        <StockQuote symbol={symbol} useMock={useMock} />
        <StockChart symbol={symbol} useMock={useMock} />
        <HistoricalData symbol={symbol} useMock={useMock} />
      </div>

      <div className="widget-footer">
        <p className="disclaimer">
          Data is delayed. For informational purposes only. Not financial advice.
        </p>
      </div>
    </div>
  );
};

export default StockWidget;
