# Changelog

## [1.1.0] - 2025-10-02

### Changed
- **Default Symbol**: Updated from MEGL to MIMI (NASDAQ-listed company)
- **Layout**: Changed from tab-based navigation to vertical list layout
  - Removed tab navigation (Overview, Chart, Historical Data)
  - All sections now display in continuous vertical scroll
  - Stock Quote → Interactive Chart → Historical Data Table
- **Header Format**: Updated to "NASDAQ-listed company (NASDAQ: MIMI)"
- **Documentation**: Updated all examples and defaults to use MIMI symbol

### Improved
- Simplified user experience - all information visible at once
- Better for scrolling and skimming stock data
- Removed unnecessary state management for tab switching
- Cleaner, more streamlined design
- Mobile-friendly vertical scroll layout

### Technical Changes
- Removed `useState` from StockWidget component
- Simplified component rendering (no conditional display)
- Updated CSS to remove tab-related styles
- Reduced CSS file size by ~500 bytes
- Cleaner component architecture

### Files Modified
- `src/App.jsx` - Updated default symbol to MIMI
- `src/components/StockWidget.jsx` - Removed tabs, added vertical layout
- `src/components/StockWidget.css` - Removed tab styles, added header border
- `.env.example` - Added MIMI as default symbol
- `README.md` - Updated all MIMI references and examples
- `WORDPRESS_INTEGRATION.md` - Updated all embed code examples
- `QUICKSTART.md` - Updated quick start examples

## [1.0.0] - 2025-10-02

### Added
- Initial release of Stock Widget
- Real-time stock quotes with Alpha Vantage API
- Interactive charts with 7 time periods (10D, 1M, 3M, 6M, 1Y, 5Y, ALL)
- Sortable historical data table (30-day OHLC)
- WordPress-ready embed code
- Dark/Light theme support
- Mock data mode for testing
- Responsive mobile design
- Vercel deployment configuration
- Comprehensive documentation
