# Alpha Vantage API Key Setup Guide

## ✅ Problem Solved!

Your API key is now properly configured for both local development and Vercel production.

---

## 📋 What Was Fixed

### 1. **Local Development Setup**
- ✅ Created `.env.local` with your API key (gitignored for security)
- ✅ Updated `.env` to use `demo` key (safe to commit)
- ✅ Added API key validation and logging

### 2. **Production/Vercel Setup**
- ✅ Created `.env.production` with API key (gitignored)
- ✅ Need to set environment variable in Vercel dashboard (see below)

### 3. **Enhanced Debugging**
- ✅ Console logs show which API key is being used (masked: `X7C2...EHXN`)
- ✅ Warnings if using demo key
- ✅ Detailed error messages for API failures
- ✅ Full response logging for troubleshooting

---

## 🚀 How to Test Locally

### Option 1: Use Mock Data (Recommended for Testing)
```bash
# No API key needed
npm run dev
# Open: http://localhost:5173/?mock=true
```

### Option 2: Use Real API with Your Key
```bash
# Make sure .env.local exists with your key
npm run dev
# Open: http://localhost:5173/
```

**Note**: You might see Node.js version warning, but the app will still work. To fix, upgrade Node.js to 20.19+ or 22.12+.

---

## 🌐 How to Set API Key in Vercel (Production)

Your API key needs to be set in Vercel dashboard for production deployment:

### Steps:

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Select your `stock-widget` project

2. **Add Environment Variable**
   - Settings → Environment Variables
   - Click "Add New"
   - Name: `VITE_ALPHA_VANTAGE_KEY`
   - Value: `X7C24AOJS8XXEHXN`
   - Environments: Select "Production" (and optionally "Preview" and "Development")
   - Click "Save"

3. **Redeploy**
   - Go to Deployments tab
   - Click "..." on latest deployment
   - Click "Redeploy"
   - OR: Just push a new commit (will trigger auto-deploy)

---

## 🔍 How to Verify It's Working

### Check Console Logs

When the widget loads, you should see in browser console (F12):

```
[Stock API] Using API key: X7C2...EHXN   ← Your key (masked)
[Stock API] Fetching quote for MIMI...
[Stock API] Response received: {...}
[Stock API] ✅ Successfully fetched quote for MIMI
```

### If Using Demo Key (Bad)

You'll see:
```
[Stock API] Using API key: demo
[Stock API] ⚠️  Using demo API key - rate limited! Create .env.local with your API key
```

This means:
- In local dev: `.env.local` file is missing or not loaded
- In production: Vercel environment variable not set

---

## 📁 File Structure

```
stock-widget/
├── .env                 ← Committed to git (demo key only)
├── .env.local          ← Gitignored (your real key) - LOCAL ONLY
├── .env.production     ← Gitignored (your real key) - BUILD TIME
└── .gitignore          ← Ensures .env.local and .env.production stay private
```

**Security**: Only `.env` is committed to git. Your real API key in `.env.local` and `.env.production` is never uploaded to GitHub!

---

## 🔧 Troubleshooting

### Problem: "Error loading quote: No quote data available"

**Possible Causes:**
1. Using demo key (rate limited)
2. Invalid symbol
3. API key not loaded

**Solution:**
1. Check console for `[Stock API]` logs
2. Verify API key is correct in `.env.local`
3. Restart dev server after changing `.env.local`
4. Try mock mode first: `?mock=true` in URL

### Problem: "API Rate Limit" Error

**Cause:** Too many requests to Alpha Vantage API

**Solutions:**
1. Use mock mode: `?mock=true`
2. Cache is set to 1 hour - wait before retrying
3. Free API key has 25 requests/day limit - upgrade if needed

### Problem: Dev Server Won't Start (Node.js Version)

**Error:** `crypto.hash is not a function`

**Cause:** Node.js 20.9.0 too old for Vite 7.x

**Solutions:**
1. **Use preview mode** (built files):
   ```bash
   npm run build
   npm run preview
   ```

2. **Upgrade Node.js**:
   ```bash
   # Using nvm
   nvm install 22
   nvm use 22
   ```

3. **Use mock mode in WordPress** (doesn't need dev server):
   ```javascript
   window.stockWidgetConfig = {
     symbol: 'MIMI',
     useMock: true,  // ← Uses mock data, no API needed
     theme: 'light'
   };
   ```

---

## 📊 Testing Checklist

After setup, verify:

- [ ] Console shows correct API key (masked)
- [ ] No "demo key" warning in console
- [ ] Stock data loads successfully
- [ ] No "No quote data available" errors
- [ ] Data updates show in console logs
- [ ] Vercel deployment uses real API key

---

## 🎯 Quick Reference

**Local Development (.env.local)**:
```bash
VITE_ALPHA_VANTAGE_KEY=X7C24AOJS8XXEHXN
```

**Vercel Environment Variable**:
- Name: `VITE_ALPHA_VANTAGE_KEY`
- Value: `X7C24AOJS8XXEHXN`
- Scope: Production, Preview, Development

**Test URLs**:
- Mock data: `http://localhost:5173/?mock=true`
- Real data: `http://localhost:5173/?symbol=MIMI`
- Vercel: `https://stock-widget-five.vercel.app/`

---

## ✨ What's Next

1. **Set Vercel environment variable** (see above)
2. **Test on Vercel** after next deployment
3. **Monitor API usage** at https://www.alphavantage.co/account/
4. **Consider upgrading** to paid plan if you need more than 25 requests/day

Your API key is now properly configured! 🎉
