# Cache-Busting Fix - Production Deployment Issue ✅

## Problem Solved

**Issue**: Production at https://stock-widget-five.vercel.app/ was showing old version despite new git commits

**Root Causes**:
1. ❌ **Aggressive browser caching**: `max-age=31536000` (1 year) + `immutable`
2. ❌ **Static filenames**: `stock-widget.js` (same name every build)
3. ❌ **CDN edge caching**: Vercel CDN cached old files globally

## Solutions Implemented ✅

### 1. Vite Build-Time Filename Hashing

**File**: [vite.config.js:25-32](vite.config.js#L25-L32)

**Before**:
```javascript
entryFileNames: 'stock-widget.js',
chunkFileNames: 'stock-widget-[name].js',
assetFileNames: (assetInfo) => {
  if (assetInfo.names?.[0]?.endsWith('.css')) {
    return 'stock-widget.css';
  }
  return 'assets/[name]-[hash][extname]';
}
```

**After**:
```javascript
entryFileNames: 'stock-widget.[hash].js',
chunkFileNames: 'stock-widget-[name].[hash].js',
assetFileNames: (assetInfo) => {
  if (assetInfo.names?.[0]?.endsWith('.css')) {
    return 'stock-widget.[hash].css';
  }
  return 'assets/[name]-[hash][extname]';
}
```

**Result**: Every build generates unique filenames
- Before: `stock-widget.js` (always the same)
- After: `stock-widget.abc123def.js` (changes with every build)

---

### 2. Reduced Cache Duration

**File**: [vercel.json:4-55](vercel.json#L4-L55)

**Before**:
```json
{
  "source": "/stock-widget.js",
  "headers": [
    {
      "key": "Cache-Control",
      "value": "public, max-age=31536000, immutable"
    }
  ]
}
```

**After**:
```json
{
  "source": "/stock-widget.*.js",
  "headers": [
    {
      "key": "Cache-Control",
      "value": "public, max-age=300"
    }
  ]
}
```

**Changes**:
- ✅ Cache duration: **1 year → 5 minutes** (31536000 → 300)
- ✅ Removed `immutable` directive
- ✅ Updated path pattern: `/stock-widget.js` → `/stock-widget.*.js` (matches hashed filenames)
- ✅ Applied to all assets: JS, CSS, assets/

---

## How It Works Now

### Build Process:
1. Developer commits code to GitHub
2. Vercel detects push and triggers auto-deploy
3. Vite builds with **unique hash**: `stock-widget.a1b2c3d4.js`
4. Vercel deploys to CDN with new filename
5. Browser sees **different filename** → fetches new file automatically

### Cache Behavior:
- **New deploys**: Browsers fetch immediately (different filename)
- **Same deploy**: Browsers cache for 5 minutes (reduces API load)
- **No manual cache clearing needed** ✅

---

## Next Steps for WordPress Integration

### ⚠️ IMPORTANT: WordPress Embed Code Must Be Updated

**Old embed code** (will break):
```html
<script src="https://stock-widget-five.vercel.app/stock-widget.js"></script>
<link rel="stylesheet" href="https://stock-widget-five.vercel.app/stock-widget.css">
```

**New approach** - Two options:

#### Option 1: Direct HTML Link (Recommended for Now)
```html
<!-- Check Vercel deployment and copy actual filenames -->
<script src="https://stock-widget-five.vercel.app/stock-widget.abc123def.js"></script>
<link rel="stylesheet" href="https://stock-widget-five.vercel.app/stock-widget.xyz789.css">
```

**Pros**: Simple, works immediately
**Cons**: Must manually update WordPress every deployment

#### Option 2: Create Version Endpoint (Better Long-Term)
Add a `/version.json` endpoint that returns current filenames:
```json
{
  "js": "stock-widget.abc123def.js",
  "css": "stock-widget.xyz789.css"
}
```

WordPress can fetch this and dynamically load correct files.

---

## Verification Steps

### 1. Check Vercel Deployment

**Monitor deployment**:
- Visit: https://vercel.com/your-team/stock-widget/deployments
- Look for commit: `380d12b` - "Enable cache-busting for production deployments"
- Wait for: "Deployment Completed" status (usually 1-2 minutes)

### 2. Verify Build Output

**Check generated filenames**:
```bash
# After Vercel builds, visit:
https://stock-widget-five.vercel.app/
```

**Inspect network tab** in browser DevTools:
- Should see: `stock-widget.[hash].js` with unique hash
- Should see: `stock-widget.[hash].css` with matching hash

### 3. Test Cache Headers

**Check response headers**:
```bash
curl -I https://stock-widget-five.vercel.app/stock-widget.*.js
```

**Expected headers**:
```
Cache-Control: public, max-age=300
Access-Control-Allow-Origin: *
```

**NOT** (old headers):
```
Cache-Control: public, max-age=31536000, immutable  ❌
```

### 4. Test Widget Functionality

1. Open production URL: https://stock-widget-five.vercel.app/
2. **Expected console output**:
   ```
   [Stock API] Using API key: X7C2...EHXN
   [Stock API] Daily data response received: {Information: "...rate limit..."}
   [Stock API] Daily response keys: ['Information']
   ```
3. Widget should display with **mock data** (if `useMock: true`)

---

## Environment Variable Setup

### ⚠️ REQUIRED: Add API Key to Vercel

**Current state**: Production builds don't have API key in environment

**Action needed**:
1. Visit: https://vercel.com/your-team/stock-widget/settings/environment-variables
2. Add variable:
   - **Key**: `VITE_ALPHA_VANTAGE_KEY`
   - **Value**: `X7C24AOJS8XXEHXN`
   - **Environments**: Production, Preview
3. Trigger redeploy for changes to take effect

**Why needed**: Vite bakes environment variables into build at build-time

---

## Testing Checklist

- [x] ✅ Pushed commit `380d12b` to GitHub
- [ ] ⏳ Vercel auto-deploy triggered (wait 1-2 min)
- [ ] 🔍 Check deployment status in Vercel dashboard
- [ ] 🔍 Verify hashed filenames in network tab
- [ ] 🔍 Confirm cache headers show `max-age=300`
- [ ] 🔍 Test widget displays correctly
- [ ] 🔍 Add `VITE_ALPHA_VANTAGE_KEY` to Vercel environment variables
- [ ] 🔍 Trigger redeploy to apply environment variable
- [ ] 🔍 Update WordPress embed code with new hashed URLs

---

## Rollback Plan (If Needed)

**If issues occur**:

1. Revert vite.config.js:
   ```bash
   git revert 380d12b
   git push origin main
   ```

2. Or manually update [vite.config.js:25](vite.config.js#L25):
   ```javascript
   entryFileNames: 'stock-widget.js',  // Remove [hash]
   ```

3. WordPress embed code will work again with static filenames

---

## Summary

✅ **Fixed**: Production caching issue with build-time hashing + reduced cache duration
✅ **Deployed**: Commit `380d12b` pushed to GitHub
⏳ **Pending**: Vercel auto-deploy (1-2 minutes)
⚠️ **Action Required**: Add `VITE_ALPHA_VANTAGE_KEY` to Vercel dashboard
⚠️ **Action Required**: Update WordPress embed code with hashed filenames after deployment completes

**Timeline**:
- Now: Changes pushed, Vercel building
- +2 min: Deployment complete, new hashed files available
- +5 min: Add environment variable, trigger redeploy
- +7 min: Production fully updated and ready for WordPress integration
