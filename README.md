# Stock Widget - React + Vite

A modern, embeddable stock information widget built with React and Vite, designed for WordPress integration.

## 🌟 Features

- **Real-time Stock Quotes** - Current price, change, volume, and key metrics
- **Multiple API Providers** - Finnhub (60/min, recommended) or Alpha Vantage (25/day)
- **Interactive Charts** - Multi-period price and volume charts (10D, 1M, 3M, 6M, 1Y, 5Y, ALL)
- **Historical Data** - Sortable table with 30-day price history
- **WordPress Ready** - Easy embed with script tag or shortcode
- **Responsive Design** - Mobile-friendly and accessible
- **Dark/Light Theme** - Customizable theme support
- **Mock Data Mode** - Testing without API limits
- **Fast & Optimized** - Built with Vite, optimized for performance

## 🚀 Quick Start

### Development

```bash
# Install dependencies
npm install

# Setup API provider (Finnhub recommended)
# Get free API key: https://finnhub.io/register
cp .env.example .env.local

# Edit .env.local and add:
# VITE_STOCK_API_PROVIDER=finnhub
# VITE_FINNHUB_API_KEY=your_api_key_here

# Build and preview (works on any Node version)
npm run build
npm run preview

# Open http://localhost:4173
```

### Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Deploy to production
vercel --prod
```

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for detailed deployment instructions.

## 📦 WordPress Integration

### Quick Embed

Add this code to your WordPress page/post (Custom HTML block):

```html
<div id="stock-widget"></div>
<script>
  window.stockWidgetConfig = {
    symbol: 'MIMI',
    useMock: false,
    theme: 'light'
  };
</script>
<script type="module" crossorigin src="https://your-vercel-app.vercel.app/stock-widget.js"></script>
<link rel="stylesheet" href="https://your-vercel-app.vercel.app/stock-widget.css">
```

See [docs/WORDPRESS_INTEGRATION.md](docs/WORDPRESS_INTEGRATION.md) for detailed integration guide.

## ⚙️ Configuration

### Widget Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `symbol` | string | 'MIMI' | Stock ticker symbol |
| `useMock` | boolean | false | Use mock data (testing) |
| `theme` | string | 'light' | Theme: 'light' or 'dark' |

### URL Parameters

Configure via URL parameters:
- `?symbol=AAPL` - Change stock symbol
- `?mock=true` - Use mock data
- `?theme=dark` - Use dark theme

Example: `http://localhost:3008?symbol=AAPL&theme=dark`

## 🔑 Stock API Setup

### Finnhub (Recommended - FREE)

**Best choice for production:**
- ✅ **60 API calls per minute** (~86,400/day)
- ✅ **2,400x better** than Alpha Vantage free tier
- ✅ Free forever with generous limits

**Setup:**
1. Get free API key: https://finnhub.io/register
2. Add to `.env.local`:
   ```bash
   VITE_STOCK_API_PROVIDER=finnhub
   VITE_FINNHUB_API_KEY=your_key_here
   ```

### Alpha Vantage (Legacy)

**Limited free tier:**
- ❌ Only 25 requests/day, 5 requests/minute
- Use only if you already have an API key

**Setup:**
1. Get API key: https://www.alphavantage.co/support/#api-key
2. Add to `.env.local`:
   ```bash
   VITE_STOCK_API_PROVIDER=alphavantage
   VITE_ALPHA_VANTAGE_KEY=your_key_here
   # Optional: Enable comprehensive data (Market Cap, PE, PB, EPS, etc.)
   # Reduces daily capacity from 12 to 8 page loads
   VITE_ENABLE_OVERVIEW=false
   ```

**API Optimization:**
- **OVERVIEW disabled** (default): 2 API calls/page = **12 page loads/day**
- **OVERVIEW enabled**: 3 API calls/page = **8 page loads/day**
- Fields requiring OVERVIEW: Market Cap, PE Ratio, PB Ratio, EPS, 52-week High/Low, Exchange
- Basic fields always available: Price, Change, Volume, Open, High, Low

See [docs/API_KEY_SETUP.md](docs/API_KEY_SETUP.md) for detailed setup instructions.

### API Provider Comparison

- [Finnhub](https://finnhub.io/) - Free tier with real-time data
- [IEX Cloud](https://iexcloud.io/) - Professional API
- [Yahoo Finance (unofficial)](https://github.com/ranaroussi/yfinance)

## 🏗️ Project Structure

```
stock-widget/
├── src/
│   ├── components/
│   │   ├── StockQuote.jsx       # Current price display
│   │   ├── StockChart.jsx       # Interactive charts
│   │   ├── HistoricalData.jsx   # Data table
│   │   └── StockWidget.jsx      # Main widget
│   ├── services/
│   │   └── stockApi.js          # API integration
│   ├── App.jsx                  # App entry point
│   └── main.jsx                 # React entry point
├── public/                      # Static assets
├── dist/                        # Build output
├── vite.config.js              # Vite configuration
├── vercel.json                 # Vercel deployment config
└── package.json
```

## 🎨 Customization

### Override Styles

Add custom CSS to WordPress:

```css
/* Full width */
.stock-widget-container {
  max-width: 100% !important;
}

/* Brand colors */
.current-price {
  color: #your-brand-color !important;
}
```

### Custom Theme

Modify theme in [StockWidget.css](src/components/StockWidget.css):

```css
.theme-custom {
  background-color: #your-bg-color;
  color: #your-text-color;
}
```

Use: `window.stockWidgetConfig = { theme: 'custom' }`

## 📊 Components

### StockQuote
Displays current price, change, volume, and key metrics.

### StockChart
Interactive area chart with multiple time periods and volume chart.
- Uses Recharts library
- Responsive design
- Touch-friendly on mobile

### HistoricalData
Sortable table with 30-day price history.
- Click column headers to sort
- Shows OHLC data and volume
- Color-coded changes

## 🔧 Tech Stack

- **React 19** - UI library
- **Vite** - Build tool
- **Recharts** - Charting library
- **Axios** - HTTP client
- **date-fns** - Date formatting
- **Alpha Vantage** - Stock data API

## 🧪 Testing

### Mock Data Mode

Test without API limits:

```javascript
window.stockWidgetConfig = {
  symbol: 'AAPL',
  useMock: true  // Use mock data
};
```

Or via URL: `?mock=true`

### Development Testing

```bash
# Start dev server with mock data
npm run dev
# Visit: http://localhost:3008?mock=true

# Test different symbols
# http://localhost:3008?symbol=AAPL&mock=true
```

## 🚀 Performance

### Optimizations Included

- ✅ **Code splitting** - Separate vendor chunks (React, Charts, App)
- ✅ **Lazy loading** - Chart library loads on demand (50% initial bundle reduction)
- ✅ **Long-term caching** - 1-year CDN cache with versioned files
- ✅ **Resource hints** - Preconnect & DNS prefetch for faster connections
- ✅ **Tree shaking** - Remove unused code from libraries
- ✅ **Minification** - Optimized with esbuild
- ✅ **CDN delivery** - Vercel global CDN with HTTP/3 & Brotli

### Performance Metrics

**Bundle Sizes:**
- Initial load: ~279 KB (130 KB gzipped) - 51% reduction
- Chart lazy load: ~171 KB (46 KB gzipped)
- Total: ~450 KB (176 KB gzipped)

**Load Times:**
- First visit (3G): 2-3 seconds (50-60% faster)
- Repeat visit: 0.2-0.5 seconds (80-90% faster)
- Fast network: 0.5-1 second

### Lighthouse Score

- Performance: 95+
- Accessibility: 100
- Best Practices: 100
- SEO: 100

See [Performance Optimizations Guide](docs/PERFORMANCE_OPTIMIZATIONS.md) for detailed analysis.

## 🔒 Security

- ✅ API keys stored in environment variables
- ✅ HTTPS only (Vercel SSL)
- ✅ CORS properly configured
- ✅ No sensitive data in client
- ✅ Input sanitization
- ✅ XSS prevention

## 📝 License

MIT License - feel free to use in your projects!

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open Pull Request

## 📚 Documentation

- [Deployment Guide](docs/DEPLOYMENT.md) - Deploy to Vercel
- [WordPress Integration](docs/WORDPRESS_INTEGRATION.md) - Embed in WordPress
- [Performance Optimizations](docs/PERFORMANCE_OPTIMIZATIONS.md) - Performance guide
- [API Documentation](src/services/stockApi.js) - API service details

## 🐛 Troubleshooting

### Widget Not Loading

1. Check browser console for errors
2. Verify API key in environment variables
3. Test with mock data: `?mock=true`
4. Clear browser cache

### CORS Errors

1. Ensure both sites use HTTPS
2. Check `vercel.json` CORS configuration
3. Verify Vercel deployment includes CORS headers

### API Rate Limits

1. Use mock mode for development
2. Implement caching (already included)
3. Upgrade Alpha Vantage plan
4. Consider alternative API

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/stock-widget/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/stock-widget/discussions)
- **Email**: your.email@example.com

## 🎯 Roadmap

- [ ] Multiple widget instances
- [ ] Watchlist feature
- [ ] News integration
- [ ] Crypto support
- [ ] Custom indicators
- [ ] Export data (CSV, PDF)
- [ ] Portfolio tracking

## ⭐ Acknowledgments

- [Alpha Vantage](https://www.alphavantage.co/) - Stock data API
- [Recharts](https://recharts.org/) - React charting library
- [Vite](https://vitejs.dev/) - Next generation frontend tooling
- [Vercel](https://vercel.com/) - Deployment platform

---

Made with ❤️ for WordPress stock display

**Live Demo**: https://your-vercel-app.vercel.app

**Documentation**: [Full Documentation](docs/WORDPRESS_INTEGRATION.md)
