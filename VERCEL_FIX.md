# Vercel Configuration Fix

## ✅ Issue Resolved

**Error**:
```
If `rewrites`, `redirects`, `headers`, `cleanUrls` or `trailingSlash` are used,
then `routes` cannot be present.
```

## 🔧 What Was Changed

### Before (Legacy Configuration)
```json
{
  "version": 2,
  "builds": [...],
  "routes": [...],  // ❌ Legacy - conflicts with modern features
  "headers": [...]   // ✅ Modern
}
```

### After (Modern Configuration)
```json
{
  "headers": [...],   // ✅ Modern - CORS and caching
  "rewrites": [       // ✅ Modern - SPA routing
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

## 📋 What's Configured

### CORS Headers (WordPress Embedding)
All routes now have CORS headers allowing embedding from any domain:
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: GET, OPTIONS`
- `Access-Control-Allow-Headers: Content-Type`

### Cache Headers (Performance)
- **Static Assets** (`stock-widget.js`, `stock-widget.css`, `/assets/*`):
  - `Cache-Control: public, max-age=31536000, immutable` (1 year)

- **HTML** (`index.html`):
  - `Cache-Control: public, max-age=0, must-revalidate` (always fresh)

### SPA Routing
- All routes rewrite to `/index.html` for client-side routing
- React Router works correctly

## 🚀 Deploy Now

```bash
# From stock-widget directory
vercel --prod
```

This should deploy without errors! ✅

## 🔍 Verify Deployment

After deployment, check:

1. **CORS Headers** (should work in WordPress):
   ```bash
   curl -I https://your-app.vercel.app/stock-widget.js
   # Should show: Access-Control-Allow-Origin: *
   ```

2. **Widget Loading**:
   ```bash
   # Visit in browser
   https://your-app.vercel.app

   # Test with parameters
   https://your-app.vercel.app?symbol=MIMI&mock=true
   ```

3. **WordPress Embed** (after deployment):
   ```html
   <div id="stock-widget"></div>
   <script>
     window.stockWidgetConfig = {
       symbol: 'MIMI',
       useMock: false,
       theme: 'light'
     };
   </script>
   <script type="module" crossorigin src="https://YOUR-APP.vercel.app/stock-widget.js"></script>
   <link rel="stylesheet" href="https://YOUR-APP.vercel.app/stock-widget.css">
   ```

## 📝 Configuration Details

### Headers Applied
- **`/stock-widget.js`**: CORS + long-term cache (1 year)
- **`/stock-widget.css`**: CORS + long-term cache (1 year)
- **`/assets/*`**: CORS + long-term cache (1 year)
- **`/*`** (all other routes): CORS only

### Rewrites Applied
- **`/*`** → `/index.html` (SPA routing for React)

## ❓ Troubleshooting

### Still Getting Errors?

1. **Clear Vercel cache**:
   ```bash
   vercel --prod --force
   ```

2. **Check Vercel dashboard**:
   - Go to: https://vercel.com/dashboard
   - Check deployment logs for errors

3. **Validate JSON**:
   ```bash
   cat vercel.json | jq .
   # Should output valid JSON without errors
   ```

### CORS Not Working in WordPress?

1. Check browser console (F12) for specific CORS error
2. Verify Vercel deployment includes headers:
   ```bash
   curl -I https://your-app.vercel.app/stock-widget.js | grep -i "access-control"
   ```
3. Ensure WordPress site uses HTTPS (not HTTP)

## ✅ Next Steps

1. Deploy: `vercel --prod`
2. Get deployment URL from output
3. Update WordPress embed code with your URL
4. Test widget on WordPress site

---

**Configuration is now Vercel-compatible!** 🎉
