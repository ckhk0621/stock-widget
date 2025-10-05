# Redis Caching Testing Guide

## Overview

This guide explains how to test Upstash Redis caching in both development and production environments.

## 🎯 Quick Start

### Enable Redis Caching

**1. Set environment variable in `.env.local`:**
```bash
VITE_STOCK_API_PROVIDER=upstash
```

**2. Ensure Upstash credentials are set:**
```bash
UPSTASH_REDIS_REST_URL="https://definite-jackal-19140.upstash.io"
UPSTASH_REDIS_REST_TOKEN="AUrE..."
```

**3. Test locally:**
```bash
npm run build
npm run preview
```

**4. Open browser and check console:**
```
[API Adapter] Server-side cache (upstash) - bypassing localStorage
[Upstash] Quote source: api | Symbol: MIMI
```

**5. Refresh page - should see:**
```
[Upstash] Quote source: redis-cache | Symbol: MIMI
```

---

## 🔍 Understanding Cache Behavior

### First Request (Cache Miss)
```
Browser → Upstash Adapter → /api/stock/quote
                          ↓
                    Vercel Serverless Function
                          ↓
                    Check Redis Cache → MISS
                          ↓
                    Fetch from Finnhub/Alpha Vantage
                          ↓
                    Save to Redis (TTL: 12h dev, 24h prod)
                          ↓
                    Return: {"source": "api", "data": {...}}
```

### Subsequent Requests (Cache Hit)
```
Browser → Upstash Adapter → /api/stock/quote
                          ↓
                    Vercel Serverless Function
                          ↓
                    Check Redis Cache → HIT
                          ↓
                    Return: {"source": "redis-cache", "data": {...}}
```

**Result**: 99% reduction in API calls (100 visitors = 3 API calls)

---

## 🧪 Testing Checklist

### Local Testing (Development)

**Step 1: Build Production Bundle**
```bash
npm run build
```

**Step 2: Preview Locally**
```bash
npm run preview
# Opens at http://localhost:4173
```

**Step 3: Verify in Browser Console**
```
✅ [API Adapter] Initializing provider: upstash
✅ [API Adapter] Using Upstash Redis (server-side cache)
✅ [Upstash Adapter] Initializing with API base: http://localhost:4173
✅ [API Adapter] Server-side cache (upstash) - bypassing localStorage
✅ [Upstash] Quote source: api | Symbol: MIMI (first load)
✅ [Upstash] Quote source: redis-cache | Symbol: MIMI (refresh)
```

**Step 4: Check Network Tab**
```
✅ GET /api/stock/quote?symbol=MIMI → 200 OK
✅ Response: {"source": "redis-cache", "data": {...}}
```

**Step 5: Verify Redis Dashboard**
- Login to https://console.upstash.com/
- Select your Redis database
- Check "Data Browser"
- Look for keys: `stock:quote:MIMI:finnhub`

---

### Production Testing (WordPress)

**Step 1: Deploy to Vercel**
```bash
# Push to GitHub (triggers auto-deploy)
git add .
git commit -m "feat: enable Redis caching without DEV mode bypass"
git push origin main
```

**Step 2: Set Vercel Environment Variables**
- Go to https://vercel.com/dashboard
- Select your project
- Settings → Environment Variables
- Ensure these are set:
  - `VITE_STOCK_API_PROVIDER=upstash`
  - `UPSTASH_REDIS_REST_URL=https://definite-jackal-19140.upstash.io`
  - `UPSTASH_REDIS_REST_TOKEN=AUrE...`
  - `VITE_FINNHUB_API_KEY=d3fb...iqrg`

**Step 3: Redeploy**
- Deployments tab → Latest deployment → "Redeploy"

**Step 4: Test WordPress Site**
- Visit: https://www.mimintinc.com/?page_id=581
- Open browser console (F12)
- Check for Redis cache logs

**Step 5: Verify Redis Keys**
- Open Upstash Console: https://console.upstash.com/
- Check "Data Browser"
- Verify keys exist:
  - `stock:quote:MIMI:finnhub`
  - `stock:intraday:MIMI:5min:finnhub`
  - `stock:daily:MIMI:compact:finnhub`

---

## 🐛 Troubleshooting

### Issue: No Redis Keys Created

**Symptoms:**
- Browser console shows cache hits from localStorage
- Upstash dashboard shows no keys
- Console shows: `[API Adapter] Client-side cache hit for quote_MIMI_upstash`

**Solution:**
1. Check `VITE_STOCK_API_PROVIDER=upstash` in environment
2. Rebuild: `npm run build`
3. Clear localStorage: `localStorage.clear()` in browser console
4. Refresh page

---

### Issue: API Routes Return 404

**Symptoms:**
- Console error: `[Upstash] Quote error: Request failed with status code 404`
- Network tab shows: `GET /api/stock/quote → 404 Not Found`

**Cause:**
- API routes only exist in production builds
- `npm run dev` doesn't support serverless functions

**Solution:**
Use production preview mode:
```bash
npm run build
npm run preview
```

---

### Issue: CORS Errors

**Symptoms:**
- Console error: `Access to XMLHttpRequest blocked by CORS policy`

**Solution:**
1. Check `vercel.json` has CORS headers for `/api/*`
2. Redeploy to Vercel
3. Clear browser cache

---

### Issue: "Cache hit" but No Redis Keys

**Symptoms:**
- Console shows: `[API Adapter] Server-side cache (upstash) - bypassing localStorage`
- But Upstash dashboard shows no keys

**Cause:**
- API routes might not be calling Redis
- Environment variables not set on Vercel

**Solution:**
1. Check Vercel function logs: `vercel logs`
2. Verify environment variables in Vercel dashboard
3. Look for `[Redis] ✅ Cache hit` in function logs

---

## 📊 Performance Verification

### Expected API Call Reduction

| Scenario | Without Redis | With Redis | Savings |
|----------|---------------|------------|---------|
| 1st visitor | 3 API calls | 3 API calls | 0% |
| 2nd visitor (within TTL) | 3 API calls | 0 API calls | 100% |
| 100 visitors (within TTL) | 300 API calls | 3 API calls | 99% |
| 1000 visitors (within TTL) | 3000 API calls | 3 API calls | 99.9% |

### Cache TTL (Time To Live)

- **Development**: 12 hours (43200 seconds)
- **Production**: 24 hours (86400 seconds)

Configured in: `api/stock/utils/redis.js`

---

## 🔧 Advanced Testing

### Test Cache Expiration

**1. Create Redis key with short TTL:**
```bash
# In Upstash Console → CLI
SET stock:quote:TEST:finnhub '{"c":100,"pc":95}' EX 60
```

**2. Test in browser:**
```javascript
// First call (within 60s) → redis-cache
// After 60s → api (cache expired)
```

### Monitor Redis Usage

**Upstash Console → Metrics:**
- Total Commands: Should increase with each API call
- Get/Set Ratio: Higher GET = better cache efficiency
- Memory Usage: Should stay low with 24h TTL

### Test Fallback Behavior

**1. Temporarily disable Redis:**
- Set `VITE_STOCK_API_PROVIDER=finnhub`
- Rebuild and test
- Should use localStorage caching

**2. Re-enable Redis:**
- Set `VITE_STOCK_API_PROVIDER=upstash`
- Rebuild and test
- Should bypass localStorage

---

## ✅ Success Criteria

### Development
- ✅ `npm run build && npm run preview` works
- ✅ Console shows: `[Upstash] Quote source: api` (first load)
- ✅ Console shows: `[Upstash] Quote source: redis-cache` (refresh)
- ✅ No localStorage cache hits for Upstash provider
- ✅ Redis keys visible in Upstash dashboard

### Production
- ✅ WordPress site loads widget successfully
- ✅ Browser console shows Redis cache logs
- ✅ Upstash dashboard shows keys with correct TTL
- ✅ Second visitor gets instant cached data (0 API calls)
- ✅ API usage in Finnhub/Alpha Vantage dashboard shows 99% reduction

---

## 📚 Related Documentation

- **Setup Guide**: [UPSTASH_SETUP.md](./UPSTASH_SETUP.md)
- **Implementation Summary**: [REDIS_IMPLEMENTATION_SUMMARY.md](./REDIS_IMPLEMENTATION_SUMMARY.md)
- **WordPress Integration**: [docs/WORDPRESS_INTEGRATION.md](./docs/WORDPRESS_INTEGRATION.md)
- **API Configuration**: [docs/API_KEY_SETUP.md](./docs/API_KEY_SETUP.md)

---

## 🎓 Best Practices

### 1. **Always Test Locally First**
```bash
npm run build && npm run preview
```

### 2. **Monitor Redis Usage**
- Check Upstash dashboard daily
- Free tier: 10K commands/day (sufficient for stock widget)

### 3. **Clear Old Cache Keys**
- Redis auto-expires keys after TTL
- No manual cleanup needed

### 4. **Environment Parity**
- Use same provider in dev and prod
- Test with production data locally

### 5. **Logging Best Practices**
- Keep console logs for debugging
- Monitor `source: redis-cache` vs `source: api`

---

## 🚀 Next Steps

1. ✅ Complete local testing checklist
2. ✅ Deploy to Vercel
3. ✅ Verify Redis keys in Upstash dashboard
4. ✅ Test WordPress site with real traffic
5. ✅ Monitor API usage reduction in provider dashboard

**Happy caching!** 🎉
