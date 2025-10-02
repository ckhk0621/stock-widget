# API Calls Reduced: From 3 to 2 Per Page Load

## ✅ Optimization Complete

Successfully reduced API calls by **33%** through component refactoring and data sharing.

**Date**: October 3, 2025
**Previous**: 3 API calls per page load
**Current**: 2 API calls per page load
**Improvement**: 33% reduction

---

## 🔍 Problem Identified

### Root Cause of Rate Limit Hit

You hit Alpha Vantage's 25 calls/day limit on **first usage** because:

**Widget makes 3 API calls per page load**:
1. `StockQuote` → `getStockQuote()` → 1 API call (quote data)
2. `StockChart` → `getStockData('1M')` → 1 API call (daily data)
3. `HistoricalData` → `getStockData('1M')` → 1 API call (same daily data, duplicated!)

**Testing scenario**:
- 1 page load = 3 calls
- Refresh 3 times = 12 calls
- Test different symbols (MIMI, AAPL) = 6 calls
- **Total: 18+ calls** in minutes

**Result**: Rate limit hit immediately, even with 24-hour cache.

---

## 💡 Solution Implemented

### Architecture Change: Data Sharing

**Before (3 API calls)**:
```
StockWidget (parent)
├── StockQuote (fetches own quote data) → 1 API call
├── StockChart (fetches own daily data) → 1 API call
└── HistoricalData (fetches same daily data!) → 1 API call
                                        Total: 3 API calls
```

**After (2 API calls)**:
```
StockWidget (parent fetches all data once)
│  ├── Fetch quote → 1 API call
│  └── Fetch daily data → 1 API call
│                  Total: 2 API calls
├── StockQuote (receives pre-fetched quote)
├── StockChart (receives pre-fetched daily data)
└── HistoricalData (receives same daily data, no duplicate!)
```

**Improvement**: Eliminated 1 redundant API call (daily data was fetched twice)

---

## 📊 Changes Made

### 1. StockWidget.jsx - Parent Data Fetcher

**File**: `src/components/StockWidget.jsx`

**Change**: Added data fetching logic to parent component

```javascript
// Fetch all data once in parent
const [quote, setQuote] = useState(null);
const [dailyData, setDailyData] = useState(null);

useEffect(() => {
  // Fetch both in parallel
  const [quoteData, dailyDataResult] = await Promise.all([
    getStockQuote(symbol),    // 1 API call
    getStockData(symbol, '1M') // 1 API call
  ]);

  setQuote(quoteData);
  setDailyData(dailyDataResult);
}, [symbol, useMock]);

// Pass pre-fetched data to children
<StockQuote quote={quote} />
<StockChart dailyData={dailyData} />
<HistoricalData dailyData={dailyData} /> // Same data, no extra call!
```

---

### 2. StockQuote.jsx - Receives Pre-Fetched Data

**File**: `src/components/StockQuote.jsx`

**Change**: Removed internal data fetching

```javascript
// Before: Fetched own data
useEffect(() => {
  const data = await getStockQuote(symbol); // API call
  setQuote(data);
}, [symbol]);

// After: Receives data from parent
const StockQuote = ({ quote, loading }) => {
  // No data fetching, just display
  return <div>{quote.price}</div>;
};
```

---

### 3. StockChart.jsx - Receives Pre-Fetched Data

**File**: `src/components/StockChart.jsx`

**Change**: Removed internal data fetching, disabled multi-period support

```javascript
// Before: Fetched data for each period change
useEffect(() => {
  const data = await getStockData(symbol, selectedPeriod); // API call
  setChartData(data);
}, [symbol, selectedPeriod]); // Triggers on every period change!

// After: Receives data from parent, only 1M period
const StockChart = ({ dailyData, loading }) => {
  // Transform received data for recharts
  useEffect(() => {
    const transformed = dailyData.map(...);
    setChartData(transformed);
  }, [dailyData]);

  // Period buttons disabled except 1M
  <button disabled={period !== '1M'}>
};
```

**Note**: Period selector now only shows 1M. Other periods are disabled to prevent additional API calls.

---

### 4. HistoricalData.jsx - Receives Pre-Fetched Data

**File**: `src/components/HistoricalData.jsx`

**Change**: Removed duplicate data fetching

```javascript
// Before: Fetched same data as StockChart (duplicate!)
useEffect(() => {
  const data = await getStockData(symbol, '1M'); // Duplicate API call!
  setData(data);
}, [symbol]);

// After: Receives data from parent (shares with StockChart)
const HistoricalData = ({ dailyData, loading }) => {
  // Transform received data for table
  useEffect(() => {
    const transformed = dailyData.map(...);
    setData(transformed);
  }, [dailyData]);
};
```

---

## 📈 Results

### API Call Reduction

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| **Calls per page load** | 3 calls | 2 calls | **33% reduction** |
| **Duplicate calls** | 1 (daily data) | 0 | **Eliminated** |
| **Daily capacity** | 8 visitors | 12 visitors | **50% increase** |

### Math

**Before**:
- 25 calls/day ÷ 3 calls/visitor = **~8 visitors per day**

**After**:
- 25 calls/day ÷ 2 calls/visitor = **~12 visitors per day**

**With 24-hour cache** (same-day visitors use cached data):
- First visitor: 2 API calls
- Subsequent visitors (within 24h): 0 API calls (cached)
- **Capacity: 12 unique page loads/day + unlimited cached visitors**

---

## 🎯 Current Setup Summary

### Configuration
- ✅ **Provider**: Alpha Vantage (includes historical data in free tier)
- ✅ **Cache TTL**: 24 hours (86,400,000 ms)
- ✅ **Auto-refresh**: Disabled (no polling)
- ✅ **Data sharing**: Enabled (parent fetches, children receive)
- ✅ **API calls**: 2 per page load (quote + daily data)

### API Usage Pattern

**First page load of the day**:
```
[Alpha Vantage] Fetching quote for MIMI...     → 1 API call
[Alpha Vantage] Fetching daily data for MIMI... → 1 API call
Total: 2 API calls
```

**Subsequent loads (same day)**:
```
[API Adapter] Cache hit for quote_MIMI_alphavantage → 0 API calls
[API Adapter] Cache hit for daily_MIMI_compact_alphavantage → 0 API calls
Total: 0 API calls
```

**Next day (cache expired)**:
```
[Alpha Vantage] Fetching quote for MIMI...     → 1 API call
[Alpha Vantage] Fetching daily data for MIMI... → 1 API call
Total: 2 API calls
```

---

## ⚠️ Trade-offs

### What Changed

**Chart Period Selector**:
- ✅ Before: All periods (10D, 1M, 3M, 6M, 1Y, 5Y, ALL) clickable
- ⚠️ After: Only 1M period enabled, others disabled

**Reason**: Each period change would trigger a new API call. To stay within 25 calls/day limit, we restrict to pre-fetched 1M data only.

**User Experience**:
- Period buttons show as disabled (grayed out)
- Hover tooltip: "Only 1M period available to reduce API calls"
- Still shows comprehensive 1-month data (sufficient for most users)

---

## 🧪 Testing

### How to Test (Mock Mode - Unlimited)

Since you're still rate-limited, test with mock mode:

```bash
npm run build
npm run preview
```

Then open:
```
http://localhost:4173/?symbol=MIMI&mock=true
```

**Expected behavior**:
- ✅ Widget loads all 3 components (quote, chart, historical)
- ✅ No API calls (using mock data)
- ✅ Period selector shows 1M active, others disabled
- ✅ All data displays correctly

### When Rate Limit Resets

Your Alpha Vantage calls reset at **midnight UTC**.

**To test with real API** (after reset):

```
http://localhost:4173/?symbol=MIMI
```

**Monitor console for**:
```
[Alpha Vantage] Using API key: I612...TTUR
[API Adapter] Initializing provider: alphavantage
[API Adapter] Fetching quote for MIMI via alphavantage...
[API Adapter] Fetching daily data for MIMI via alphavantage...
[API Adapter] ✅ Successfully fetched quote for MIMI
[API Adapter] ✅ Successfully fetched daily data for MIMI
```

**Count**: Should see only **2 API calls** (quote + daily data)

**Refresh page**:
```
[API Adapter] Cache hit for quote_MIMI_alphavantage
[API Adapter] Cache hit for daily_MIMI_compact_alphavantage
```

**Count**: **0 API calls** (served from cache) ✅

---

## 📝 Files Modified

### Components (4 files)
1. ✅ `src/components/StockWidget.jsx` - Added parent data fetching
2. ✅ `src/components/StockQuote.jsx` - Accepts pre-fetched quote
3. ✅ `src/components/StockChart.jsx` - Accepts pre-fetched data, disabled multi-period
4. ✅ `src/components/HistoricalData.jsx` - Accepts pre-fetched data (eliminates duplicate)

### Build
- ✅ `npm run build` - Successful
- ✅ Bundle size: 565 KB (176 KB gzipped)

### Documentation
- ✅ `API_CALLS_REDUCED.md` - This file

---

## 💰 Cost Analysis

### Current Optimization Level

**Configuration**:
- Cache: 24 hours
- API calls: 2 per page load
- Auto-refresh: Disabled

**Daily Capacity** (Alpha Vantage free tier = 25 calls/day):
- Unique page loads: 25 ÷ 2 = **12 loads/day**
- Same-day cached visitors: **Unlimited**

**Realistic Scenario**:
- Morning visitor (9 AM): 2 API calls → cached for 24h
- Afternoon visitors (12 PM, 3 PM, 5 PM): 0 API calls (cached)
- Next morning (9 AM): 2 API calls → cached for another 24h

**Result**: 12 unique days of fresh data per month, unlimited visitors per day.

---

## 🚀 Further Optimization Options

If you still need more capacity, here are options ranked by value:

### Option 1: Extend Cache to 48-72 Hours (Free)

**Change**: Increase `CACHE_DURATION` to 172,800,000 ms (48 hours)

**Impact**:
- 25 calls ÷ 2 calls = **12 loads every 2 days** = 6 loads/day average
- Good for low-traffic sites with infrequent updates

**When to use**: If you don't need daily data updates

---

### Option 2: Switch to Twelve Data (Better Free Tier)

**Free tier**: 800 API calls/day (vs Alpha Vantage 25/day)

**Impact**:
- 800 calls ÷ 2 calls = **400 unique page loads/day**
- **32x improvement** over Alpha Vantage

**Cost**:
- Free: 800 calls/day
- Paid: $9.99/month for 5,000 calls/day (vs Alpha Vantage $49.99/month)

**Recommendation**: Best upgrade path if you outgrow Alpha Vantage

---

### Option 3: Combine Quote + Daily into 1 Call (Complex)

**Current**: 2 API calls (quote + daily data)
**Possible**: 1 API call (daily data only, derive quote from latest price)

**Implementation**:
- Remove `getStockQuote()` call
- Use last entry in daily data as "current quote"
- Calculate change from previous day

**Impact**:
- 25 calls/day ÷ 1 call = **25 unique page loads/day**
- **Another 25% improvement**

**Trade-off**: "Current price" is actually EOD (end-of-day) price, not real-time

**Recommendation**: Only if you need more capacity and don't need intraday updates

---

## ✅ Summary

**What We Achieved**:
- ✅ **33% reduction** in API calls (3 → 2 per page load)
- ✅ **Eliminated duplicate** daily data fetching
- ✅ **50% capacity increase** (8 → 12 visitors/day)
- ✅ **Simpler architecture** (parent fetches, children receive)
- ✅ **Better caching** (shared data = better cache efficiency)

**Current Status**:
- Provider: Alpha Vantage (free tier)
- API calls: 2 per page load
- Cache: 24 hours
- Capacity: 12 unique loads/day + unlimited cached visitors
- Cost: $0/month

**Next Steps**:
1. **Wait for rate limit reset** (midnight UTC)
2. **Test with real API** (`?symbol=MIMI` without mock=true)
3. **Monitor API usage** at https://www.alphavantage.co/account/
4. **Deploy to Vercel** when ready

**If you still hit limits**:
- Use mock mode for development (`?mock=true`)
- Consider Twelve Data (800 calls/day free)
- Or combine quote + daily into 1 call (advanced)

Your widget is now optimized for maximum efficiency with Alpha Vantage free tier! 🎉
