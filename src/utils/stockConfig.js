/**
 * Widget-wide stock settings and display formatters.
 * Pure module (no browser APIs) so it can be unit-tested with `node --test`.
 */

// Mint Incorporation renamed to Axonex AI Group; Nasdaq ticker MIMI -> AXNX on 2026-10-13.
export const DEFAULT_SYMBOL = 'AXNX';

// Retired tickers that embeds may still pass via window.stockWidgetConfig or ?symbol=.
const SYMBOL_ALIASES = {
  MIMI: 'AXNX'
};

/**
 * Normalize a requested symbol: trim, uppercase, map retired tickers, fall back to default.
 */
export const resolveSymbol = (symbol) => {
  const normalized = typeof symbol === 'string' ? symbol.trim().toUpperCase() : '';
  if (!normalized) {
    return DEFAULT_SYMBOL;
  }
  return SYMBOL_ALIASES[normalized] || normalized;
};

// 10D needs TIME_SERIES_INTRADAY and 1Y/5Y/ALL need outputsize=full;
// both are premium-only on Alpha Vantage, so the free key cannot serve them.
export const AVAILABLE_PERIODS = ['1M', '3M', '6M'];

/**
 * Y-axis price label. Sub-$10 prices need cents, otherwise every tick reads "$1".
 */
export const formatPriceTick = (value) => {
  if (Math.abs(value) < 10) {
    return `$${value.toFixed(2)}`;
  }
  return `$${value.toFixed(0)}`;
};

const trimDecimal = (num) => num.toFixed(1).replace(/\.0$/, '');

/**
 * Volume axis label with K/M units, so low-volume days do not all read "0.0M".
 */
export const formatVolumeTick = (value) => {
  const abs = Math.abs(value);
  if (abs >= 1e6) {
    return `${trimDecimal(value / 1e6)}M`;
  }
  if (abs >= 1e3) {
    return `${trimDecimal(value / 1e3)}K`;
  }
  return `${value}`;
};
