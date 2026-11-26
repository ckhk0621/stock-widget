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

// Splits that Alpha Vantage's free TIME_SERIES_DAILY does not adjust for
// (TIME_SERIES_DAILY_ADJUSTED is premium). ratio = new shares per old share.
// AXNX: 2-for-5 reverse split effective 2026-10-22 (6-K filed 2026-10-20).
const SPLITS = {
  AXNX: [{ date: '2026-10-22', ratio: 2 / 5 }]
};

const isoDateToUnixSeconds = (iso) => {
  const [y, m, d] = iso.split('-').map(Number);
  return Date.UTC(y, m - 1, d) / 1000;
};

/**
 * Back-adjust candles dated before each recorded split so the series is continuous.
 * Returns new objects; the input may be a shared cache entry and is not mutated.
 */
export const applySplitAdjustments = (symbol, candles) => {
  const splits = SPLITS[symbol];
  if (!splits || !Array.isArray(candles)) {
    return candles;
  }

  return candles.map((candle) => {
    let factor = 1;
    for (const split of splits) {
      if (candle.time < isoDateToUnixSeconds(split.date)) {
        factor *= split.ratio;
      }
    }
    if (factor === 1) {
      return candle;
    }
    return {
      ...candle,
      open: candle.open / factor,
      high: candle.high / factor,
      low: candle.low / factor,
      close: candle.close / factor,
      volume: Math.round(candle.volume * factor)
    };
  });
};
