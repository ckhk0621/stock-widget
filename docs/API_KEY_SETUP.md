# Stock API Setup Guide

## 🎯 Recommended: Finnhub (Free Tier)

The widget now uses **Finnhub API** by default, which offers:
- ✅ **60 API calls per minute** (~86,400/day)
- ✅ **2,400x better** than Alpha Vantage free tier (25/day)
- ✅ **Free forever** with generous limits
- ✅ **Real-time data** for US stocks

## 📋 Quick Start with Finnhub

### Step 1: Get Your Free Finnhub API Key

1. Go to https://finnhub.io/register
2. Sign up for a free account (email + password)
3. Copy your API key from the dashboard

### Step 2: Configure Locally

Edit `.env.local` (create if it doesn't exist):

```bash
# API Provider
VITE_STOCK_API_PROVIDER=finnhub

# Finnhub API Key (paste yours here)
VITE_FINNHUB_API_KEY=your_actual_finnhub_key_here

# Alpha Vantage (optional, kept as fallback)
VITE_ALPHA_VANTAGE_KEY=X7C24AOJS8XXEHXN
```

### Step 3: Test Locally

```bash
npm run build
npm run preview
# Open: http://localhost:4173/
```

You should see console logs:
```
[Finnhub] Using API key: abcd...xyz
[API Adapter] Initializing provider: finnhub
[API Adapter] Fetching quote for MIMI via finnhub...
```

---

## 🌐 Vercel/Production Deployment

### Steps to Deploy with Finnhub:

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Select your `stock-widget` project

2. **Add Environment Variables**
   - Settings → Environment Variables

   Add these two variables:

   **Variable 1:**
   - Name: `VITE_STOCK_API_PROVIDER`
   - Value: `finnhub`
   - Environments: Production, Preview, Development

   **Variable 2:**
   - Name: `VITE_FINNHUB_API_KEY`
   - Value: `your_actual_finnhub_api_key`
   - Environments: Production, Preview, Development

3. **Redeploy**
   - Go to Deployments tab
   - Click "..." on latest deployment → "Redeploy"
   - OR: Push a new commit (auto-deploys)

---

## 🔍 Verification

### Successful Finnhub Connection

Open browser console (F12) and look for:

```
[Finnhub] Using API key: abcd...wxyz
[API Adapter] Initializing provider: finnhub
[API Adapter] Fetching quote for MIMI via finnhub...
[API Adapter] ✅ Successfully fetched quote for MIMI
```

### If You See Errors

**"No API key configured"**
- Add `VITE_FINNHUB_API_KEY` to `.env.local`
- Restart dev server after adding key

**"Rate limit exceeded"**
- You've hit the 60 calls/minute limit (unlikely with caching)
- Wait a minute and try again

**"Invalid symbol"**
- Symbol doesn't exist or market is closed
- Try a common symbol like `AAPL` or `TSLA`

---

---

## 📁 File Structure

```
stock-widget/
├── .env                              ← Example config (safe to commit)
├── .env.local                       ← Your real API keys (gitignored)
├── src/services/
│   ├── stockApi.js                 ← Main API interface
│   ├── apiAdapter.js               ← Provider abstraction layer
│   └── providers/
│       ├── finnhubAdapter.js       ← Finnhub implementation
│       └── alphaVantageAdapter.js  ← Alpha Vantage implementation
```

**Security**: `.env.local` is gitignored - your API keys stay private!

---

## 🔧 Troubleshooting

### Use Mock Mode (No API Key Needed)

For testing without an API key:

```bash
npm run build
npm run preview
# Open: http://localhost:4173/?mock=true
```

Or in WordPress config:
```javascript
window.stockWidgetConfig = {
  symbol: 'MIMI',
  useMock: true,
  theme: 'light'
};
```

### Switch Back to Alpha Vantage (Legacy)

If you prefer Alpha Vantage, edit `.env.local`:

```bash
VITE_STOCK_API_PROVIDER=alphavantage
VITE_ALPHA_VANTAGE_KEY=X7C24AOJS8XXEHXN
```

**Note**: Alpha Vantage free tier is limited to 25 calls/day vs Finnhub's 86,400/day.

### Node.js Version Warning

If you see: `"Node.js 20.9.0... Vite requires 20.19+"`

**Solutions:**
1. Use build + preview mode (works on any Node version):
   ```bash
   npm run build
   npm run preview
   ```

2. Upgrade Node.js (optional):
   ```bash
   nvm install 22
   nvm use 22
   ```

---

## 📊 Testing Checklist

After setup, verify:

- [ ] Console shows: `[Finnhub] Using API key: xxxx...yyyy`
- [ ] Console shows: `[API Adapter] Initializing provider: finnhub`
- [ ] Stock data loads successfully
- [ ] No "No API key configured" errors
- [ ] Data updates show in console logs
- [ ] Vercel deployment uses Finnhub API key

---

## 🎯 Quick Reference

### Finnhub (Recommended)

**Local (.env.local)**:
```bash
VITE_STOCK_API_PROVIDER=finnhub
VITE_FINNHUB_API_KEY=your_key_here
```

**Vercel Environment Variables**:
- `VITE_STOCK_API_PROVIDER` = `finnhub`
- `VITE_FINNHUB_API_KEY` = `your_key_here`

**Get API Key**: https://finnhub.io/register

### Alpha Vantage (Legacy)

**Local (.env.local)**:
```bash
VITE_STOCK_API_PROVIDER=alphavantage
VITE_ALPHA_VANTAGE_KEY=X7C24AOJS8XXEHXN
```

**Vercel Environment Variables**:
- `VITE_STOCK_API_PROVIDER` = `alphavantage`
- `VITE_ALPHA_VANTAGE_KEY` = `X7C24AOJS8XXEHXN`

---

## ✨ Benefits of Finnhub

- ✅ **2,400x more API calls** (60/min vs 25/day)
- ✅ **$600/year savings** vs Alpha Vantage premium
- ✅ **Free forever** with generous limits
- ✅ **Real-time data** for all US stocks
- ✅ **Easy migration** - works with existing code

Your widget is now future-proof with Finnhub! 🎉
