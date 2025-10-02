# Quick Start Guide

## 🚀 Get Up and Running in 5 Minutes

### Step 1: Install & Setup (2 min)

```bash
# Navigate to project
cd stock-widget

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# (Optional) Add your Alpha Vantage API key to .env
# For testing, you can use mock data without an API key
```

### Step 2: Development (1 min)

```bash
# Start development server with mock data
npm run dev

# Server will open at http://localhost:3008
# Test with: http://localhost:3008?mock=true
```

### Step 3: Test Build (1 min)

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### Step 4: Deploy to Vercel (1 min)

```bash
# Install Vercel CLI (first time only)
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

## 📦 WordPress Embed Code

After deploying to Vercel, use this code in WordPress:

```html
<!-- Add to WordPress Custom HTML Block -->
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

Replace `YOUR-APP` with your actual Vercel app name.

## 🧪 Testing Options

### Test with Mock Data (No API Key Required)

```bash
# URL parameter
http://localhost:3008?mock=true

# Different symbols
http://localhost:3008?symbol=AAPL&mock=true

# Dark theme
http://localhost:3008?symbol=AAPL&mock=true&theme=dark
```

### Test with Real Data (Requires API Key)

1. Get free API key: https://www.alphavantage.co/support/#api-key
2. Add to `.env`: `VITE_ALPHA_VANTAGE_KEY=your_key_here`
3. Visit: http://localhost:3008?symbol=AAPL

## 📋 Configuration Checklist

- [ ] Dependencies installed (`npm install`)
- [ ] Environment file created (`.env`)
- [ ] API key added (or using mock mode)
- [ ] Dev server running (`npm run dev`)
- [ ] Build successful (`npm run build`)
- [ ] Deployed to Vercel (`vercel --prod`)
- [ ] WordPress embed code updated with your URL

## 🔗 Next Steps

- **Full Documentation**: See [README.md](../README.md)
- **Deployment Guide**: See [DEPLOYMENT.md](DEPLOYMENT.md)
- **WordPress Integration**: See [WORDPRESS_INTEGRATION.md](WORDPRESS_INTEGRATION.md)

## 🐛 Quick Troubleshooting

### Widget Not Loading
- Check browser console (F12)
- Try mock mode: `?mock=true`
- Clear browser cache

### Build Errors
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
npm run build
```

### API Issues
- Verify API key in `.env`
- Use mock mode for testing
- Check API limits (25 requests/day free tier)

## 📞 Need Help?

1. Check documentation files in project root
2. Review browser console for errors
3. Test with mock data first
4. Verify all steps completed

---

**You're all set!** 🎉

The stock widget is ready to embed in WordPress!
