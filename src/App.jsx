import StockWidget from './components/StockWidget';
import { resolveSymbol } from './utils/stockConfig';
import './App.css';

function App() {
  // Get symbol from URL params or use default
  const urlParams = new URLSearchParams(window.location.search);
  const symbol = resolveSymbol(urlParams.get('symbol'));
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
