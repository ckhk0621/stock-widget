# Upstash Redis Cache Setup Guide

## Overview

This feature adds **server-side shared caching** using Upstash Redis, providing massive API savings for production deployments.

### Benefits

| Metric | Without Redis | With Redis |
|--------|---------------|------------|
| 100 visitors | 300 API calls | **3 API calls** ✅ |
| 1000 visitors | 3000 API calls | **3 API calls** ✅ |
| Cache scope | Per browser | **Global** ✅ |
| New users | Fresh API call | **Instant** ✅ |

## Architecture

```
┌─────────────┐      ┌──────────────────┐      ┌─────────────┐
│  WordPress  │ ───> │ Vercel API Route │ ───> │   Upstash   │
│    Site     │      │  (Serverless)    │      │    Redis    │
└─────────────┘      └──────────────────┘      └─────────────┘
                              │
                              v
                     ┌─────────────────┐
                     │  Stock API      │
                     │  (Finnhub/AV)   │
                     └─────────────────┘
```

## Setup Instructions

### 1. Get Upstash Redis Credentials

1. Sign up at [https://upstash.com/](https://upstash.com/)
2. Create a new Redis database
3. Copy the **REST API** credentials:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

### 2. Configure Environment Variables

Add to your `.env.local` (for local testing):

```bash
UPSTASH_REDIS_REST_URL="https://your-redis-url.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your_redis_token_here"
```

### 3. Configure Vercel Environment Variables

In your Vercel project dashboard:

1. Go to **Settings** → **Environment Variables**
2. Add:
   - `UPSTASH_REDIS_REST_URL` = Your Upstash URL
   - `UPSTASH_REDIS_REST_TOKEN` = Your Upstash token
   - `VITE_STOCK_API_PROVIDER` = `upstash` (to enable Redis mode)
   - `VITE_FINNHUB_API_KEY` = Your Finnhub key
   - `VITE_ALPHA_VANTAGE_KEY` = Your Alpha Vantage key

### 4. Deploy to Vercel

```bash
# Commit your changes
git add .
git commit -m "feat: add Upstash Redis caching"

# Push to trigger deployment
git push origin feature/upstash-redis-cache
```

Or deploy manually:
```bash
vercel --prod
```

## Testing

### Local Testing

1. Start dev server:
```bash
npm run dev
```

2. Open browser console and check logs:
   - First load: `[Redis] ❌ Cache miss` → API call
   - Subsequent loads: `[Redis] ✅ Cache hit` → From Redis

3. Test in multiple browsers - should all use same cache

### Production Testing

After deployment:

1. Visit your widget on WordPress site
2. Check browser console for: `[Upstash] Quote source: redis-cache`
3. Have friend visit same page - should load instantly

## Cache Behavior

### Cache Duration
- **Development**: 12 hours
- **Production**: 24 hours

### Cache Keys Format
```
stock:quote:AAPL:finnhub
stock:intraday:AAPL:5min:finnhub
stock:daily:AAPL:compact:finnhub
```

### Cache Invalidation

Caches expire automatically after TTL. To force refresh:

```bash
# Using Upstash Console
# Delete keys matching pattern: stock:*
```

## API Endpoints

### Quote
```
GET /api/stock/quote?symbol=AAPL
```

Response:
```json
{
  "data": { /* quote data */ },
  "source": "redis-cache",
  "symbol": "AAPL",
  "provider": "finnhub",
  "cached_for": "43200s"
}
```

### Intraday
```
GET /api/stock/intraday?symbol=AAPL&interval=5min
```

### Daily
```
GET /api/stock/daily?symbol=AAPL&outputsize=compact
```

## Switching Between Modes

### Use Upstash (Recommended for Production)
```bash
VITE_STOCK_API_PROVIDER=upstash
```

### Use Direct API (Fallback)
```bash
VITE_STOCK_API_PROVIDER=finnhub
# or
VITE_STOCK_API_PROVIDER=alphavantage
```

## Troubleshooting

### Redis Not Working

1. **Check Vercel logs**:
```bash
vercel logs
```

2. **Verify environment variables** are set in Vercel dashboard

3. **Check console for errors**:
   - `[Redis] Configuration missing` → Add env vars
   - `[Upstash] 401 Unauthorized` → Check token
   - `[Upstash] Network error` → Check URL

### API Routes Not Found (404)

1. Ensure `api/` directory is committed to git
2. Redeploy to Vercel
3. Check Vercel deployment logs for build errors

### Fallback to localStorage

If Redis fails, the app automatically falls back to client-side localStorage caching. No action needed.

## Cost Analysis

### Upstash Free Tier
- ✅ 10,000 commands/day
- ✅ 256 MB storage
- ✅ Perfect for stock widget

### Usage Example
- 1 symbol = 3 cache keys (quote, intraday, daily)
- 1000 visitors/day = ~3,000 reads
- Well within free tier ✅

### Paid Tier (if needed)
- $0.20 per 100K commands
- Still very affordable

## Performance Metrics

### Before Redis (localStorage only)
- 100 visitors = 300 API calls
- Each new browser = fresh API call
- Rate limit exhaustion: Fast

### After Redis (server-side cache)
- 100 visitors = 3 API calls (99% reduction ✅)
- All browsers share cache
- Rate limit exhaustion: Almost never

## Next Steps

After testing:

1. Monitor Upstash dashboard for usage
2. Check Vercel function logs for errors
3. Consider extending cache TTL for slower-moving stocks
4. Set up alerts for rate limit warnings

## Support

For issues or questions:
- Upstash Docs: https://docs.upstash.com/redis
- Vercel Docs: https://vercel.com/docs/serverless-functions
