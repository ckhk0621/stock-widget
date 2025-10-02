# Deployment Guide - Vercel

## Prerequisites

- Vercel account (free tier works great)
- Alpha Vantage API key (free from https://www.alphavantage.co/support/#api-key)
- Git repository (GitHub, GitLab, or Bitbucket)

## Quick Deploy

### Step 1: Push to Git

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial stock widget commit"

# Add remote (replace with your repo URL)
git remote add origin https://github.com/yourusername/stock-widget.git

# Push to main branch
git push -u origin main
```

### Step 2: Deploy to Vercel

#### Option A: Vercel CLI (Recommended)

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? stock-widget (or your choice)
# - Directory? ./
# - Build command? npm run build
# - Output directory? dist
# - Override settings? No

# Deploy to production
vercel --prod
```

#### Option B: Vercel Dashboard

1. Go to https://vercel.com/new
2. Import your Git repository
3. Configure project:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
4. Add environment variables:
   - Key: `VITE_ALPHA_VANTAGE_KEY`
   - Value: Your Alpha Vantage API key
5. Click "Deploy"

### Step 3: Configure Environment Variables

After deployment:

1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add variable:
   - **Name**: `VITE_ALPHA_VANTAGE_KEY`
   - **Value**: Your Alpha Vantage API key
   - **Environment**: Production, Preview, Development (select all)
4. Click "Save"

### Step 4: Redeploy

If you added environment variables after initial deployment:

```bash
# CLI
vercel --prod

# Or trigger redeploy in Vercel dashboard
```

## Verify Deployment

1. Visit your Vercel app URL: `https://your-app-name.vercel.app`
2. Check if stock widget loads
3. Test with different symbols: `?symbol=AAPL`
4. Test mock mode: `?mock=true`

## Configuration

### Vercel Settings

The `vercel.json` file is already configured with:
- CORS headers (allows embedding in WordPress)
- Cache headers (optimizes performance)
- Route handling (SPA routing)

### Build Settings

Package.json includes `vercel-build` script that runs Vite build.

### Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `VITE_ALPHA_VANTAGE_KEY` | Yes | Alpha Vantage API key | `YOUR_API_KEY_HERE` |

## Custom Domain

### Add Custom Domain

1. Go to Vercel project → Settings → Domains
2. Add your domain: `stock.yourdomain.com`
3. Follow DNS configuration instructions
4. Update WordPress embed code with new domain

### Update WordPress Code

Replace Vercel app URL with your custom domain:

```html
<script src="https://stock.yourdomain.com/stock-widget.js"></script>
<link rel="stylesheet" href="https://stock.yourdomain.com/stock-widget.css">
```

## Monitoring & Analytics

### Vercel Analytics

1. Go to Vercel project → Analytics
2. Enable Web Analytics
3. View real-time traffic and performance

### Error Monitoring

1. Go to Vercel project → Logs
2. View real-time logs
3. Filter by errors

## Troubleshooting

### Build Failures

**Issue**: Build fails on Vercel

**Solutions**:
```bash
# Test build locally first
npm run build

# Check for errors
npm run lint

# Verify all dependencies are installed
npm install

# Check Node version (Vercel uses Node 20+)
node --version
```

### CORS Issues

**Issue**: Widget blocked by CORS when embedded in WordPress

**Solutions**:
1. Verify `vercel.json` includes CORS headers
2. Check WordPress site uses HTTPS
3. Clear browser cache
4. Check browser console for specific CORS errors

### API Rate Limits

**Issue**: Alpha Vantage API rate limit exceeded

**Solutions**:
1. Upgrade Alpha Vantage plan
2. Use mock mode for development: `?mock=true`
3. Implement caching (already included)
4. Consider alternative API (Finnhub, IEX Cloud)

### Environment Variables Not Working

**Issue**: API key not loading

**Solutions**:
1. Ensure variable name is `VITE_ALPHA_VANTAGE_KEY`
2. Redeploy after adding variables
3. Check variables are set for correct environment
4. Verify no typos in variable name

## Performance Optimization

### Already Implemented

- ✅ Build optimization (minification, tree-shaking)
- ✅ Asset caching (1 year cache for static assets)
- ✅ CORS headers
- ✅ Single bundle output
- ✅ API response caching (1 minute)

### Additional Optimizations

#### Enable Vercel Edge Network

Already enabled by default. Your widget is served from global CDN.

#### Image Optimization

If you add images:
```javascript
import { Image } from 'next/image'; // If using Next.js
// Or use Vercel Image Optimization API
```

#### Serverless Functions (Optional)

For API key security, create serverless function:

```javascript
// api/stock-quote.js
export default async function handler(req, res) {
  const { symbol } = req.query;
  const response = await fetch(
    `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${process.env.ALPHA_VANTAGE_KEY}`
  );
  const data = await response.json();
  res.json(data);
}
```

Update `stockApi.js`:
```javascript
const response = await axios.get('/api/stock-quote', {
  params: { symbol }
});
```

## CI/CD

### Automatic Deployments

Vercel automatically deploys:
- **Production**: When you push to `main` branch
- **Preview**: When you create pull requests

### Deployment Hooks

Set up deployment hooks in Vercel:
1. Settings → Git → Deploy Hooks
2. Create hook for manual deploys
3. Use hook URL for automated deployments

## Rollback

### Rollback to Previous Deployment

1. Go to Vercel dashboard
2. Navigate to Deployments
3. Find working deployment
4. Click "..." → "Promote to Production"

### CLI Rollback

```bash
# List deployments
vercel ls

# Promote specific deployment
vercel promote <deployment-url>
```

## Security

### Environment Variables

- ✅ Never commit `.env` files
- ✅ Use Vercel environment variables
- ✅ Rotate API keys regularly

### HTTPS

- ✅ Vercel provides SSL by default
- ✅ Custom domains get free SSL

### Content Security Policy

Add to `vercel.json` if needed:
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
        }
      ]
    }
  ]
}
```

## Costs

### Free Tier Includes

- Unlimited deployments
- 100 GB bandwidth/month
- Automatic HTTPS
- Global CDN
- Analytics (basic)

### Paid Plans

If you need more:
- Pro: $20/month (1 TB bandwidth)
- Enterprise: Custom pricing

For stock widget, free tier is usually sufficient.

## Support

### Vercel Support

- Documentation: https://vercel.com/docs
- Community: https://github.com/vercel/vercel/discussions
- Support: support@vercel.com

### Project Issues

- Check deployment logs in Vercel dashboard
- Review browser console for errors
- Test with mock data first
- Contact your developer for custom help

## Next Steps

1. ✅ Deploy to Vercel
2. ✅ Add environment variables
3. ✅ Test deployment
4. ✅ Configure custom domain (optional)
5. ✅ Update WordPress with deployment URL
6. ✅ Monitor performance
7. ✅ Set up analytics

Your stock widget is now live and ready to embed in WordPress! 🎉
