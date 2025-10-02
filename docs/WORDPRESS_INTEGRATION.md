# WordPress Integration Guide

## Overview

This guide explains how to embed the Stock Widget into your WordPress website.

## Quick Start

### Method 1: WPCode Plugin (Recommended) ✅ EASIEST

**Why WPCode?** Better control over script loading order and placement.

**Step 1**: Install **WPCode** plugin from WordPress

**Step 2**: Code Snippets → Add Snippet → Universal Snippet

**Step 3**: Copy the EXACT code from `../tests/wpcode-snippet.html` file, or use this:

```html
<!-- Performance optimization: Preconnect to CDN -->
<link rel="preconnect" href="https://stock-widget-five.vercel.app" crossorigin>
<link rel="dns-prefetch" href="https://stock-widget-five.vercel.app">

<!-- Container MUST be first -->
<div id="stock-widget"></div>

<!-- Config MUST be before script -->
<script>
  window.stockWidgetConfig = {
    symbol: 'MIMI',
    useMock: true,      // ✅ Use true for mock data (recommended)
    theme: 'light'
  };
</script>

<!-- Load widget script -->
<script type="module" crossorigin src="https://stock-widget-five.vercel.app/stock-widget.js"></script>
<link rel="stylesheet" href="https://stock-widget-five.vercel.app/stock-widget.css">
```

**Step 4**: Set Insert Method
   - Auto Insert: "After Post Content" (for specific pages)
   - OR: Enable shortcode and use `[wpcode id="YOUR_ID"]`

**Step 5**: Customize configuration:
   - `symbol`: Stock symbol (e.g., 'MIMI', 'AAPL', 'GOOGL')
   - `useMock`: `true` = Mock data ✅ | `false` = Real API data
   - `theme`: 'light' or 'dark'

**Step 6**: Save and activate snippet

**✅ The widget will now display correctly!**

---

### Method 2: Custom HTML Block (Alternative)

**Use if you can't install plugins.**

**Step 1**: In WordPress editor, add a **Custom HTML** block

**Step 2**: Paste the optimized code (including preconnect hints):

```html
<!-- Performance optimization: Preconnect to CDN -->
<link rel="preconnect" href="https://stock-widget-five.vercel.app" crossorigin>
<link rel="dns-prefetch" href="https://stock-widget-five.vercel.app">

<!-- Container MUST be first -->
<div id="stock-widget"></div>

<!-- Config MUST be before script -->
<script>
  window.stockWidgetConfig = {
    symbol: 'MIMI',
    useMock: true,
    theme: 'light'
  };
</script>

<!-- Load widget script -->
<script type="module" crossorigin src="https://stock-widget-five.vercel.app/stock-widget.js"></script>
<link rel="stylesheet" href="https://stock-widget-five.vercel.app/stock-widget.css">
```

**Step 3**: Click "Preview" or "Publish"

**⚠️ Important**: Some themes may load scripts in wrong order. If widget doesn't show, use Method 1 (WPCode) instead.

### Method 3: iframe Embed (Fallback)

If script embed doesn't work, use iframe:

```html
<iframe
  src="https://stock-widget-five.vercel.app/?symbol=MIMI&mock=true&theme=light"
  width="100%"
  height="900"
  frameborder="0"
  style="border: none;"
></iframe>
```

**Note**: Adjust `height` based on your content needs.

---

## Troubleshooting

### Widget Not Showing? Follow This Checklist ✓

**1. Check Browser Console (F12 → Console)**
   - Look for JavaScript errors
   - Check if script is loading: `stock-widget.js` should appear in Network tab
   - Verify config: Type `window.stockWidgetConfig` in console

**2. Verify Element Exists**
   - Right-click page → Inspect
   - Search for `<div id="stock-widget"></div>`
   - Should be present BEFORE `<script>` tags

**3. Check Script Loading Order** ⚠️ MOST COMMON ISSUE
   ```
   ✓ Correct Order:
   1. <div id="stock-widget"></div>
   2. <script>window.stockWidgetConfig = {...}</script>
   3. <script src="...stock-widget.js"></script>

   ✗ Wrong Order (will fail):
   1. <script>window.stockWidgetConfig = {...}</script>
   2. <script src="...stock-widget.js"></script>
   3. <div id="stock-widget"></div>  ← Too late!
   ```

**4. Verify Vercel URL**
   - Check deployment status: https://vercel.com/dashboard
   - Test URL directly: https://stock-widget-five.vercel.app/
   - Ensure URL in code matches Vercel deployment URL

**5. WordPress Theme/Plugin Conflicts**
   - Disable JavaScript optimization plugins temporarily
   - Check Content Security Policy (CSP) settings
   - Try disabling other plugins to find conflicts

**6. Common WPCode Issues**
   - **Location**: Use "Auto Insert" → "After Post Content" or "Before Post Content"
   - **Priority**: If multiple snippets, set priority (lower = earlier)
   - **Shortcode**: If using `[wpcode id="X"]`, ensure snippet is active

### Still Not Working?

**Quick Debug Test**:
1. Open browser console (F12)
2. Paste this and press Enter:
```javascript
console.log('Container exists:', !!document.getElementById('stock-widget'));
console.log('Config exists:', !!window.stockWidgetConfig);
console.log('Config value:', window.stockWidgetConfig);
```

**Expected Output**:
```
Container exists: true
Config exists: true
Config value: {symbol: "MIMI", useMock: true, theme: "light"}
```

**If Container is `false`**: The `<div id="stock-widget"></div>` is missing or loaded after script
**If Config is `false`**: The config script didn't load or loaded after widget script

---

### Method 4: PHP Shortcode (Advanced)

1. Install **Code Snippets** plugin from WordPress
2. Create a new snippet with this code:

```php
function stock_widget_shortcode($atts) {
    $atts = shortcode_atts(array(
        'symbol' => 'MIMI',
        'mock' => 'false',
        'theme' => 'light',
        'url' => 'https://your-vercel-app.vercel.app'
    ), $atts);

    ob_start();
    ?>
    <div id="stock-widget"></div>
    <script>
      window.stockWidgetConfig = {
        symbol: '<?php echo esc_js($atts['symbol']); ?>',
        useMock: <?php echo $atts['mock'] === 'true' ? 'true' : 'false'; ?>,
        theme: '<?php echo esc_js($atts['theme']); ?>'
      };
    </script>
    <script type="module" crossorigin src="<?php echo esc_url($atts['url']); ?>/stock-widget.js"></script>
    <link rel="stylesheet" href="<?php echo esc_url($atts['url']); ?>/stock-widget.css">
    <?php
    return ob_get_clean();
}
add_shortcode('stock_widget', 'stock_widget_shortcode');
```

3. Use the shortcode in any page/post:

```
[stock_widget symbol="AAPL" theme="dark"]
```

## Configuration Options

### Widget Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `symbol` | string | 'MIMI' | Stock ticker symbol |
| `useMock` | boolean | false | Use mock data (for testing) |
| `theme` | string | 'light' | Theme: 'light' or 'dark' |

### URL Parameters (Alternative Method)

You can also configure the widget using URL parameters:

```html
<iframe
  src="https://your-vercel-app.vercel.app/?symbol=AAPL&theme=dark&mock=false"
  width="100%"
  height="800"
  frameborder="0"
></iframe>
```

## Styling & Customization

**Note**: The widget is **full width (100%) by default**. It will automatically span the entire width of its container in WordPress.

### Optional: Limit Width on Large Screens

If you want to limit the widget width on very large screens, add this CSS to your WordPress theme's Custom CSS:

```css
/* Optional: Limit width and center on large screens */
.stock-widget-container {
  max-width: 1200px;
  margin: 0 auto;
}

/* Customize brand colors */
.stock-widget-container .current-price {
  color: #your-brand-color !important;
}

/* Adjust padding for mobile */
@media (max-width: 768px) {
  .stock-widget-container {
    padding: 10px !important;
  }
}
```

### Dark Mode Integration

If your WordPress theme has dark mode, add:

```javascript
// Auto-detect WordPress dark mode
window.stockWidgetConfig = {
  symbol: 'MIMI',
  useMock: false,
  theme: document.body.classList.contains('dark-mode') ? 'dark' : 'light'
};
```

## Multiple Widgets

To add multiple stock widgets on the same page:

```html
<!-- Widget 1 -->
<div id="stock-widget-1"></div>
<script>
  window.stockWidgetConfig1 = { symbol: 'MIMI', theme: 'light' };
</script>
<script type="module" crossorigin src="https://your-vercel-app.vercel.app/stock-widget.js"></script>

<!-- Widget 2 -->
<div id="stock-widget-2"></div>
<script>
  window.stockWidgetConfig2 = { symbol: 'AAPL', theme: 'dark' };
</script>
```

**Note**: Currently, the widget is designed for single-page usage. For multiple widgets, consider using iframes or contact us for multi-instance support.

## Troubleshooting

### Widget Not Appearing

1. **Check browser console** for errors (F12 → Console)
2. **Verify URLs** - Ensure Vercel app URL is correct
3. **Check CORS** - Widget should allow your WordPress domain
4. **Clear cache** - Clear WordPress cache and browser cache

### Styling Issues

1. **Check CSS conflicts** - Widget uses scoped styles but may conflict
2. **Use !important** - Override styles with `!important` if needed
3. **Inspect elements** - Use browser DevTools to debug

### Performance Issues

1. **Use CDN** - Vercel provides CDN by default
2. **Lazy load** - Load widget only when visible (see Advanced section)
3. **Cache API calls** - Widget caches API responses for 1 minute

## Advanced Usage

### Lazy Loading

Load widget only when it's visible on screen:

```javascript
// Lazy load widget
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const script = document.createElement('script');
      script.src = 'https://your-vercel-app.vercel.app/stock-widget.js';
      script.type = 'module';
      script.crossOrigin = 'anonymous';
      document.body.appendChild(script);

      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://your-vercel-app.vercel.app/stock-widget.css';
      document.head.appendChild(link);

      observer.disconnect();
    }
  });
});

observer.observe(document.getElementById('stock-widget'));
```

### Dynamic Symbol Updates

Update stock symbol dynamically:

```javascript
// Change symbol on button click
document.getElementById('change-symbol').addEventListener('click', () => {
  window.stockWidgetConfig.symbol = 'AAPL';
  location.reload(); // Or implement dynamic update
});
```

### Custom Events

Listen to widget events:

```javascript
// Listen for widget load
window.addEventListener('stock-widget-loaded', (e) => {
  console.log('Widget loaded:', e.detail);
});

// Listen for data updates
window.addEventListener('stock-data-updated', (e) => {
  console.log('Stock data updated:', e.detail);
});
```

## Security Considerations

1. **Use HTTPS** - Both WordPress and widget host must use HTTPS
2. **Content Security Policy** - Add widget domain to CSP if enabled
3. **API Key Security** - Keep API keys on server side (already handled)
4. **CORS** - Ensure proper CORS configuration on Vercel

## Performance Best Practices

1. **Single widget per page** - Better performance and user experience
2. **Use mock mode for testing** - Avoid API rate limits during development
3. **Cache WordPress pages** - Use caching plugins for better performance
4. **Optimize images** - Widget already optimizes, but check WordPress settings

## Support

For issues or questions:
- Check browser console for errors
- Verify Vercel deployment is working
- Test with mock data first (`useMock: true`)
- Contact your developer for custom integrations

## Example Pages

### Full-Width Stock Page (Default)

```html
<!-- WordPress Custom HTML Block -->
<!-- Widget automatically spans full width -->
<div id="stock-widget"></div>
<script>
  window.stockWidgetConfig = {
    symbol: 'MIMI',
    useMock: false,
    theme: 'light'
  };
</script>
<script type="module" crossorigin src="https://your-vercel-app.vercel.app/stock-widget.js"></script>
<link rel="stylesheet" href="https://your-vercel-app.vercel.app/stock-widget.css">
```

### Centered/Limited Width Page (Optional)

```html
<!-- Optional: Wrap in container to limit width -->
<div style="max-width: 1200px; margin: 0 auto;">
  <h1>Investor Relations</h1>
  <div id="stock-widget"></div>
  <script>
    window.stockWidgetConfig = {
      symbol: 'MIMI',
      useMock: false,
      theme: 'light'
    };
  </script>
  <script type="module" crossorigin src="https://your-vercel-app.vercel.app/stock-widget.js"></script>
  <link rel="stylesheet" href="https://your-vercel-app.vercel.app/stock-widget.css">
</div>
```

## Next Steps

1. Deploy widget to Vercel (see DEPLOYMENT.md)
2. Get Alpha Vantage API key (see README.md)
3. Add widget to WordPress using method above
4. Customize styling as needed
5. Test thoroughly before going live
