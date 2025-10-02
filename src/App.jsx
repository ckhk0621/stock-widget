import StockWidget from './components/StockWidget';
import './App.css';

function App() {
  // Get symbol from URL params or use default
  const urlParams = new URLSearchParams(window.location.search);
  const symbol = urlParams.get('symbol') || 'MIMI';
  const useMock = urlParams.get('mock') === 'true';
  const theme = urlParams.get('theme') || 'light';

  return (
    <div className="app">
      <StockWidget
        symbol={symbol}
        useMock={useMock}
        theme={theme}
      />
    </div>
  );
}

export default App;
