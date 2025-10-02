import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import StockWidget from './components/StockWidget.jsx'

// Initialize widget function
function initWidget() {
  // Check if running in standalone mode (has #root element)
  const rootElement = document.getElementById('root');

  if (rootElement) {
    // Standalone mode: render full App to #root
    createRoot(rootElement).render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
  } else {
    // WordPress embed mode: look for #stock-widget element
    let widgetElement = document.getElementById('stock-widget');

    // If container doesn't exist, create it and append to body
    if (!widgetElement) {
      widgetElement = document.createElement('div');
      widgetElement.id = 'stock-widget';
      document.body.appendChild(widgetElement);
    }

    // Get config from window.stockWidgetConfig or use defaults
    const config = window.stockWidgetConfig || {};
    const symbol = config.symbol || 'MIMI';
    const useMock = config.useMock !== undefined ? config.useMock : false;
    const theme = config.theme || 'light';

    // Render StockWidget directly to #stock-widget element
    createRoot(widgetElement).render(
      <StrictMode>
        <StockWidget
          symbol={symbol}
          useMock={useMock}
          theme={theme}
        />
      </StrictMode>,
    );
  }
}

// Wait for DOM to be ready before initializing
// This fixes React error #299 when script loads before container element
if (document.readyState === 'loading') {
  // DOM is still loading, wait for it
  document.addEventListener('DOMContentLoaded', initWidget);
} else {
  // DOM is already ready, init immediately
  initWidget();
}
