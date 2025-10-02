# Testing Instructions - API Key Working Now! ✅

## 🎉 What Was Done

### ✅ Fixed: API Key Integration
1. **Cleaned dist folder** - Removed old cached build
2. **Fresh rebuild** - Built with `.env.production` containing your API key `X7C24AOJS8XXEHXN`
3. **Restarted preview server** - Now serving fresh build at http://localhost:3008/

### ✅ Your API Key Status
- **API Key**: `X7C24AOJS8XXEHXN` ✅ VALID
- **Direct API Test**: ✅ WORKING (returns real MIMI stock data)
- **Built into dist files**: ✅ YES (fresh build completed)
- **Preview server**: ✅ RUNNING on http://localhost:3008/

---

## 🧪 How to Test NOW

### Step 1: Open Preview Server
```
http://localhost:3008/
```

### Step 2: Open Browser Console (F12)
Press `F12` or right-click → Inspect → Console tab

### Step 3: Check Console Output

**✅ SUCCESS - You should see:**
```
[Stock API] Using API key: X7C2...EHXN
[Stock API] Fetching quote for MIMI...
[Stock API] Response received: {Global Quote: {...}}
[Stock API] ✅ Successfully fetched quote for MIMI
```

**❌ PROBLEM - If you see:**
```
[Stock API] Using API key: demo
[Stock API] ⚠️  Using demo API key - rate limited!
```

**This means**: Browser cached the OLD version

**Fix**: Hard refresh browser
- **Mac**: `Cmd + Shift + R`
- **Windows/Linux**: `Ctrl + Shift + R`

---

## 🎯 What to Look For

### 1. API Key Confirmation
Console should show:
```
[Stock API] Using API key: X7C2...EHXN
```

**NOT**:
```
[Stock API] Using API key: demo
```

### 2. Data Loading
Should show:
```
[Stock API] ✅ Successfully fetched quote for MIMI
```

**NOT**:
```
[Stock API] ❌ No quote data in response
Error loading quote: No quote data available
```

### 3. Stock Price Display
You should see:
- **Price**: $8.00 (real data from Alpha Vantage)
- **Change**: +$0.15 (+1.91%)
- **Volume**: Real trading volume
- **Latest Trading Day**: 2025-10-01

**NOT**:
- Mock/random data
- "Error loading quote" message
- Blank/empty widget

---

## 🔧 Troubleshooting

### Issue 1: Still Shows "demo" Key

**Cause**: Browser cache

**Fix**:
1. Hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Win)
2. Or open Incognito/Private window
3. Or clear browser cache manually

### Issue 2: "No quote data available" Error

**Possible Causes**:
1. **Old cache** - Do hard refresh
2. **Network issue** - Check internet connection
3. **Symbol issue** - Try different symbol: `?symbol=AAPL`

**Fix**:
1. Hard refresh browser
2. Check console for full error message
3. Check Network tab (F12 → Network) for API request
4. Look for Alpha Vantage API call - check response

### Issue 3: Widget Not Loading at All

**Cause**: JavaScript error or server issue

**Fix**:
1. Check Console (F12) for red errors
2. Check preview server is running: http://localhost:3008/
3. Restart preview server:
   ```bash
   # Kill server
   ps aux | grep "vite preview" | grep -v grep | awk '{print $2}' | xargs kill
   # Start fresh
   npm run preview
   ```

---

## 📊 Test Scenarios

### Scenario 1: Default Symbol (MIMI)
```
http://localhost:3008/
```
**Expected**: MIMI stock data loads with price $8.00

### Scenario 2: Different Symbol
```
http://localhost:3008/?symbol=AAPL
```
**Expected**: Apple stock data loads

### Scenario 3: Mock Mode (No API Key Needed)
```
http://localhost:3008/?mock=true
```
**Expected**: Demo/mock data (doesn't use API key)

### Scenario 4: Dark Theme
```
http://localhost:3008/?theme=dark
```
**Expected**: Widget displays in dark theme

---

## 🌐 Next: Deploy to Vercel

Once confirmed working locally, deploy to Vercel:

### Step 1: Set Vercel Environment Variable
1. Go to https://vercel.com/dashboard
2. Select `stock-widget` project
3. Settings → Environment Variables
4. Add new variable:
   - Name: `VITE_ALPHA_VANTAGE_KEY`
   - Value: `X7C24AOJS8XXEHXN`
   - Environments: Production, Preview, Development
5. Save

### Step 2: Redeploy
```bash
git add .
git commit -m "Update environment configuration"
git push
```

### Step 3: Test on Vercel
```
https://stock-widget-five.vercel.app/
```

Check console - should show `X7C2...EHXN` (NOT "demo")

---

## ✅ Success Checklist

After testing, verify:

- [ ] Console shows: `Using API key: X7C2...EHXN`
- [ ] No "demo key" warning
- [ ] Stock data loads successfully
- [ ] Price shows: ~$8.00 (real MIMI data)
- [ ] No "No quote data available" error
- [ ] Network tab shows successful API call to alphavantage.co
- [ ] Data refreshes correctly (check after 60 seconds)

---

## 🎨 WordPress Integration

Once verified working locally, update WordPress:

### Option A: Use Real API (via Vercel)
After Vercel environment variable is set:
```html
<div id="stock-widget"></div>
<script>
  window.stockWidgetConfig = {
    symbol: 'MIMI',
    useMock: false,  // ← Use real API
    theme: 'light'
  };
</script>
<script type="module" src="https://stock-widget-five.vercel.app/stock-widget.js"></script>
<link rel="stylesheet" href="https://stock-widget-five.vercel.app/stock-widget.css">
```

### Option B: Use Mock Data (No API Needed)
Perfect for testing/demo:
```html
<div id="stock-widget"></div>
<script>
  window.stockWidgetConfig = {
    symbol: 'MIMI',
    useMock: true,  // ← Use mock data
    theme: 'light'
  };
</script>
<script type="module" src="https://stock-widget-five.vercel.app/stock-widget.js"></script>
<link rel="stylesheet" href="https://stock-widget-five.vercel.app/stock-widget.css">
```

---

## 📞 Still Having Issues?

If widget still shows error after following all steps:

1. **Check Console Logs** - Copy and share the exact console output
2. **Check Network Tab** - Look for failed requests to alphavantage.co
3. **Try Mock Mode** - Confirm widget works with `?mock=true`
4. **Verify Build** - Check `dist/stock-widget.js` file timestamp

Your API key is valid and the widget is rebuilt with it! 🚀
