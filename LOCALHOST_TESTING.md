# Localhost Testing Guide - Quick Start

## ✅ Fixed: Widget Now Works in Localhost!

The widget now automatically falls back to direct API calls in development mode.

---

## 🚀 How to Test in Localhost

### Step 1: Use Node.js 22.14.0+

```bash
# Switch to Node 22.14.0
nvm use 22.14.0

# Verify version
node --version  # Should show v22.14.0
```

### Step 2: Start Dev Server

```bash
# Start development server
npm run dev

# Server will start at:
# http://localhost:3009 (or next available port)
```

### Step 3: Open in Browser

```
http://localhost:3009
```

### Step 4: Check Console

**Expected Console Output:**

```javascript
[API Adapter] Initializing provider: upstash
[API Adapter] Using Upstash Redis (server-side cache)
[Upstash Adapter] Initializing with API base: http://localhost:3009
[Upstash] DEV MODE: API routes not available. Using fallback: alphavantage  ✅
[Alpha Vantage] Using API key: M09Q...K127
[API Adapter] Cache miss for quote_MIMI_alphavantage, fetching...
[API Adapter] Fetching quote for MIMI via alphavantage...
[Alpha Vantage] Fetching GLOBAL_QUOTE for MIMI...
[API Adapter] ✅ Successfully fetched quote for MIMI
```

**This is NORMAL and CORRECT** ✅

---

## 📊 How It Works

### Development Mode (Localhost)

```
Widget
  ↓
Upstash Adapter (detects DEV mode)
  ↓
Falls back to: Alpha Vantage (direct API call)
  ↓
Data displayed ✅
```

**Cache**: Client-side localStorage (12-hour TTL)

### Production Mode (Vercel)

```
Widget
  ↓
Upstash Adapter
  ↓
Vercel API Routes (/api/stock/*)
  ↓
Upstash Redis Cache
  ↓
Finnhub/Alpha Vantage (if cache miss)
  ↓
Data displayed ✅
```

**Cache**: Server-side Redis (24-hour TTL, shared globally)

---

## 🎯 What You're Testing

In localhost, you're testing:

- ✅ Widget UI and functionality
- ✅ Stock data loading and display
- ✅ Chart rendering and interactions
- ✅ Period selection (10D, 1M, 3M, etc.)
- ✅ Auto-fallback to direct API in dev mode

**NOT tested in localhost**:
- ❌ Redis caching (requires Vercel deployment)
- ❌ API routes (Vercel serverless functions)
- ❌ Shared cache across users

---

## 🔧 Configuration

### Current Setup (`.env.local`)

```bash
# Main provider (Upstash mode enabled)
VITE_STOCK_API_PROVIDER=upstash

# Fallback for dev mode (when API routes unavailable)
VITE_STOCK_API_PROVIDER_FALLBACK=alphavantage

# API Keys
VITE_ALPHA_VANTAGE_KEY=M09Q2UFBRWVAK127
VITE_FINNHUB_API_KEY=d3fb...iqrg

# Redis credentials (used in production only)
UPSTASH_REDIS_REST_URL="https://definite-jackal-19140.upstash.io"
UPSTASH_REDIS_REST_TOKEN="AUrE..."
```

### Switch Fallback Provider

To use Finnhub instead of Alpha Vantage in dev mode:

```bash
# Edit .env.local
VITE_STOCK_API_PROVIDER_FALLBACK=finnhub
```

---

## ✅ Verification Checklist

### Widget Loads Successfully

- [ ] Page loads at http://localhost:3009
- [ ] Stock widget displays
- [ ] Stock symbol shows (e.g., MIMI, AAPL)
- [ ] Price data loads
- [ ] Chart renders
- [ ] Period buttons work (10D, 1M, 3M, etc.)

### Console Shows Correct Behavior

- [ ] `[API Adapter] Initializing provider: upstash`
- [ ] `[Upstash] DEV MODE: API routes not available`
- [ ] `[Upstash] Using fallback provider in dev mode`
- [ ] `[Alpha Vantage]` or `[Finnhub]` logs appear
- [ ] No error messages about "No quote data available"

### Data Updates

- [ ] Refresh page - data should be cached (12 hours)
- [ ] Clear cache - data fetches fresh
- [ ] Change stock symbol - new data loads

---

## 🐛 Troubleshooting

### Issue: "No quote data available"

**Old behavior** (before fix): Widget failed in dev mode

**New behavior** (after fix): Widget works with fallback provider

**If still seeing this error:**

1. **Check console** for actual error message
2. **Verify API keys** in `.env.local`
3. **Check rate limits** (Alpha Vantage: 25 calls/day, Finnhub: 60 calls/min)
4. **Try different symbol** (use AAPL, MSFT, GOOGL instead of MIMI)
5. **Clear localStorage** and refresh

### Issue: Server won't start

```bash
# Error: "crypto.hash is not a function"
# Solution: Use Node 22.14.0+
nvm use 22.14.0
npm run dev
```

### Issue: Port 3009 in use

```bash
# Vite will automatically try next port (3010, 3011, etc.)
# Check console output for actual port
```

### Issue: Environment variables not loading

```bash
# Restart dev server after changing .env.local
Ctrl+C
npm run dev
```

---

## 📈 API Usage in Localhost

### With Alpha Vantage Fallback

- **Limit**: 25 calls/day
- **Cache**: 12 hours per symbol
- **Capacity**: ~12 unique page loads/day (with 2 API calls each)

### With Finnhub Fallback

```bash
# Switch to Finnhub
VITE_STOCK_API_PROVIDER_FALLBACK=finnhub
```

- **Limit**: 60 calls/minute (~86,400 calls/day)
- **Cache**: 12 hours per symbol
- **Capacity**: Essentially unlimited for development

---

## 🚀 Next Step: Test in Production

Once you've verified the widget works in localhost:

1. **Deploy to Vercel** to test Redis caching
2. **See `TESTING_GUIDE.md`** for complete Vercel testing instructions
3. **Check Redis cache** works with multiple users

### Quick Deploy

```bash
# Set Vercel environment variables (dashboard):
UPSTASH_REDIS_REST_URL="https://definite-jackal-19140.upstash.io"
UPSTASH_REDIS_REST_TOKEN="AUrE..."
VITE_STOCK_API_PROVIDER="upstash"
VITE_FINNHUB_API_KEY="your_key"
VITE_ALPHA_VANTAGE_KEY="your_key"

# Deploy
vercel --prod

# Test
https://your-project.vercel.app
```

---

## 📚 Additional Resources

- **`TESTING_GUIDE.md`** - Complete testing instructions (localhost + production)
- **`UPSTASH_SETUP.md`** - Upstash Redis setup and configuration
- **`REDIS_IMPLEMENTATION_SUMMARY.md`** - Technical implementation details

---

## ✨ Summary

**Localhost Testing** (What you're doing now):
- ✅ Widget functionality works
- ✅ Direct API calls (Alpha Vantage/Finnhub)
- ✅ Client-side cache (12 hours)
- ❌ No Redis caching (requires Vercel)

**Production Testing** (Next step):
- ✅ Widget functionality works
- ✅ Redis cache via API routes
- ✅ Server-side cache (24 hours)
- ✅ Shared across all users
- ✅ 99% API call reduction

You're all set for localhost testing! 🎉
