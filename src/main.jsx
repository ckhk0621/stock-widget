import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import StockWidget from './components/StockWidget.jsx'

// Render widget to container
function renderWidget(container) {
  const config = window.stockWidgetConfig || {};

  // Check URL query parameters for mock mode
  const urlParams = new URLSearchParams(window.location.search);
  const mockFromUrl = urlParams.get('mock') === 'true';

  const symbol = config.symbol || 'MIMI';
  // Priority: URL parameter > config object > default (false)
  const useMock = mockFromUrl || (config.useMock !== undefined ? config.useMock : false);
  const theme = config.theme || 'light';

  createRoot(container).render(
    <StrictMode>
      <StockWidget
        symbol={symbol}
        useMock={useMock}
        theme={theme}
      />
    </StrictMode>,
  );
}

// Create container in optimal position (before footer if possible)
function createWidgetContainer() {
  const widgetElement = document.createElement('div');
  widgetElement.id = 'stock-widget';

  // Try to insert before footer for better placement
  const footer = document.querySelector('footer');
  const mainContent = document.querySelector('main, article, .content, #content');

  if (mainContent) {
    // Insert at end of main content area (best placement)
    mainContent.appendChild(widgetElement);
  } else if (footer) {
    // Insert before footer (good fallback)
    footer.parentNode.insertBefore(widgetElement, footer);
  } else {
    // Last resort: append to body
    document.body.appendChild(widgetElement);
  }

  return widgetElement;
}

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
    return;
  }

  // WordPress embed mode: look for #stock-widget element
  let widgetElement = document.getElementById('stock-widget');

  if (widgetElement) {
    // Container exists, render widget
    renderWidget(widgetElement);
  } else {
    // Container doesn't exist yet - set up observer to wait for it
    // This handles WordPress shortcode rendering that happens after DOMContentLoaded
    const observer = new MutationObserver((mutations, obs) => {
      widgetElement = document.getElementById('stock-widget');
      if (widgetElement) {
        // Found the container, render and stop observing
        renderWidget(widgetElement);
        obs.disconnect();
      }
    });

    // Start observing for the container to appear
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Timeout after 2 seconds - if container still doesn't exist, create it
    setTimeout(() => {
      widgetElement = document.getElementById('stock-widget');
      if (!widgetElement) {
        // Container never appeared, create it in optimal position
        observer.disconnect();
        widgetElement = createWidgetContainer();
        renderWidget(widgetElement);
      }
    }, 2000);
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
