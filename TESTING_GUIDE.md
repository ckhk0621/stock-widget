# Testing Guide - Upstash Redis Integration

## ⚠️ Important: Local Testing Limitations

**Vite dev server does NOT support Vercel API routes** (`/api/*` endpoints) locally. You have two options:

### Option 1: Test with Frontend Only (Current Setup)
The widget will work in development mode using direct API calls (not through Redis cache).

### Option 2: Deploy to Vercel (Recommended for Full Testing)
Deploy to Vercel to test the complete Redis caching flow.

---

## 🧪 Testing Methods

### Method 1: Frontend Testing (Localhost - No Redis)

This tests the widget UI but **bypasses** Redis caching (uses direct API calls or client-side cache).

**Steps:**

1. **Start dev server** (Node 22.14.0+):
   ```bash
   nvm use 22.14.0
   npm run dev
   ```

2. **Open browser**: http://localhost:3009

3. **Expected behavior**:
   - Widget loads with stock data
   - Uses Upstash adapter but calls fail (fallback to direct API)
   - Console shows: `[Upstash] Error` (normal in dev mode)

**Note**: This won't test Redis caching, but confirms widget functionality.

---

### Method 2: Deploy to Vercel (Full Redis Testing)

This is the **recommended** method to test Redis caching.

#### Step 1: Configure Vercel Environment Variables

Go to https://vercel.com/your-project/settings/environment-variables

Add these variables:

```bash
# Required for Upstash Redis
UPSTASH_REDIS_REST_URL="https://definite-jackal-19140.upstash.io"
UPSTASH_REDIS_REST_TOKEN="AUrEAAIncDI4ZGM2YTkzNThiYmU0YTNmYjU3M2NkNGZmZTg1MjcyOHAyMTkxNDA"

# API Provider Configuration
VITE_STOCK_API_PROVIDER="upstash"

# Stock API Keys (use your actual keys)
VITE_FINNHUB_API_KEY="your_finnhub_key"
VITE_ALPHA_VANTAGE_KEY="your_alpha_vantage_key"
```

#### Step 2: Deploy

```bash
# Option A: Push to GitHub (auto-deploy)
git push origin feature/upstash-redis-cache

# Option B: Manual deploy
vercel --prod
```

#### Step 3: Test Redis Caching

1. **Visit your deployed widget**:
   ```
   https://your-project.vercel.app
   ```

2. **Open browser DevTools** → Console

3. **Look for these logs**:
   ```
   [API Adapter] Initializing provider: upstash
   [API Adapter] Using Upstash Redis (server-side cache)
   [Upstash] Quote source: api              # First load
   [Upstash] Quote source: redis-cache      # Subsequent loads ✅
   ```

4. **Check Vercel function logs**:
   ```bash
   vercel logs --follow
   ```

   Look for:
   ```
   [Redis] ❌ Cache miss: stock:quote:AAPL:alphavantage
   [API] Fetching quote for AAPL from alphavantage
   [Redis] 💾 Cached: stock:quote:AAPL:alphavantage (TTL: 86400s)
   ```

5. **Refresh page** - should see:
   ```
   [Redis] ✅ Cache hit: stock:quote:AAPL:alphavantage
   ```

6. **Open in different browser/incognito** - still cached! ✅

---

### Method 3: Test API Routes Directly (After Deployment)

Once deployed to Vercel, test API endpoints directly:

```bash
# Test quote endpoint
curl "https://your-project.vercel.app/api/stock/quote?symbol=AAPL"

# Expected response:
{
  "data": { /* quote data */ },
  "source": "redis-cache",    # or "api" on first call
  "symbol": "AAPL",
  "provider": "alphavantage",
  "cached_for": "86400s"
}

# Test intraday endpoint
curl "https://your-project.vercel.app/api/stock/intraday?symbol=AAPL&interval=5min"

# Test daily endpoint
curl "https://your-project.vercel.app/api/stock/daily?symbol=AAPL&outputsize=compact"
```

---

## ✅ Verification Checklist

### Deployment Verification

- [ ] Vercel environment variables are set
- [ ] `VITE_STOCK_API_PROVIDER=upstash` is configured
- [ ] Upstash credentials are correct
- [ ] Deployment succeeded (no build errors)
- [ ] API routes exist at `/api/stock/*`

### Redis Cache Verification

- [ ] First page load shows `[Upstash] Quote source: api`
- [ ] Second page load shows `[Upstash] Quote source: redis-cache`
- [ ] Vercel logs show `[Redis] ✅ Cache hit`
- [ ] Different browsers use same cached data
- [ ] Upstash dashboard shows activity

### Performance Verification

- [ ] Page loads faster on subsequent visits
- [ ] Multiple users don't trigger new API calls
- [ ] API usage in Finnhub/Alpha Vantage is minimal
- [ ] No rate limit errors

---

## 🔍 Debugging

### Issue: API Routes Return 404

**Symptoms**: `/api/stock/quote` returns 404 Not Found

**Solutions**:
1. Check `api/` directory is committed to git
2. Verify `vercel.json` has correct configuration
3. Redeploy to Vercel
4. Check deployment logs: `vercel logs`

### Issue: Redis Not Connecting

**Symptoms**: Errors like "Redis configuration missing" or "401 Unauthorized"

**Solutions**:
1. Verify Upstash credentials in Vercel dashboard
2. Check environment variable names are exact:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
3. Test credentials with curl:
   ```bash
   curl -X GET "https://definite-jackal-19140.upstash.io/get/test" \
     -H "Authorization: Bearer AUrE..."
   ```

### Issue: Still Using localStorage

**Symptoms**: Console shows localStorage cache, not Upstash

**Solutions**:
1. Verify `VITE_STOCK_API_PROVIDER=upstash` is set
2. Clear browser cache and hard refresh (Cmd+Shift+R)
3. Check console for provider initialization:
   ```
   [API Adapter] Initializing provider: upstash
   ```
4. If you see `finnhub` or `alphavantage`, env var not loaded

### Issue: API Still Called Every Time

**Symptoms**: Redis shows cache miss every time

**Solutions**:
1. Check Redis TTL is not 0
2. Verify cache keys are consistent
3. Check Upstash dashboard for key expiration
4. Look for cache deletion in logs

---

## 📊 Expected Performance

### Before Upstash Redis

| Visitors | API Calls | Cost Impact |
|----------|-----------|-------------|
| 10       | 30        | Low         |
| 100      | 300       | **High** ⚠️ |
| 1000     | 3000      | **Exhausted** ❌ |

### After Upstash Redis

| Visitors | API Calls | Cost Impact |
|----------|-----------|-------------|
| 10       | 3         | Minimal ✅  |
| 100      | 3         | Minimal ✅  |
| 1000     | 3         | Minimal ✅  |

### Cache Hit Rate

- **Target**: >95% cache hit rate
- **How to measure**: Check Vercel logs for ratio of cache hits vs misses
- **Formula**: (Cache Hits / Total Requests) × 100

---

## 🎯 Success Criteria

Your Redis integration is working correctly if:

1. ✅ **First load**: Shows `source: api` and API is called
2. ✅ **Second load**: Shows `source: redis-cache` and no API call
3. ✅ **Different browser**: Still uses Redis cache (no new API call)
4. ✅ **Vercel logs**: Show `[Redis] ✅ Cache hit` frequently
5. ✅ **Upstash dashboard**: Shows GET/SET operations
6. ✅ **API usage**: Finnhub/Alpha Vantage shows minimal daily calls

---

## 🚀 Next Steps After Testing

Once testing confirms Redis is working:

1. **Merge to main**:
   ```bash
   git checkout main
   git merge feature/upstash-redis-cache
   git push origin main
   ```

2. **Monitor production**:
   - Watch Upstash dashboard for usage
   - Monitor Vercel function logs
   - Track API usage in provider dashboards

3. **Optimize if needed**:
   - Adjust cache TTL based on data freshness needs
   - Add cache warming for popular symbols
   - Implement cache invalidation webhooks

---

## 📝 Quick Reference

### Environment Variables

```bash
# Upstash Redis (required)
UPSTASH_REDIS_REST_URL="https://definite-jackal-19140.upstash.io"
UPSTASH_REDIS_REST_TOKEN="AUrE..."

# Provider Configuration
VITE_STOCK_API_PROVIDER="upstash"  # Enable Redis mode

# API Keys
VITE_FINNHUB_API_KEY="your_key"
VITE_ALPHA_VANTAGE_KEY="your_key"
```

### Useful Commands

```bash
# Deploy to Vercel
vercel --prod

# View logs
vercel logs --follow

# List environment variables
vercel env ls

# Test API endpoint
curl "https://your-project.vercel.app/api/stock/quote?symbol=AAPL"
```

### Log Messages to Look For

**Success**:
- `[API Adapter] Using Upstash Redis (server-side cache)`
- `[Redis] ✅ Cache hit`
- `[Upstash] Quote source: redis-cache`

**Normal on first load**:
- `[Redis] ❌ Cache miss`
- `[Upstash] Quote source: api`
- `[Redis] 💾 Cached`

**Errors to fix**:
- `[Redis] Configuration missing`
- `[Upstash] 401 Unauthorized`
- `[Upstash] Network error`
