# Git Setup Guide

## ✅ Repository Initialized

Your stock widget repository has been initialized with:

- ✅ Git repository created (`git init`)
- ✅ Branch renamed to `main` (from master)
- ✅ `.env` added to `.gitignore` for security
- ✅ All files staged and committed
- ✅ Initial commit created

## 📋 Current Status

```bash
Branch: main
Commit: d1c642e
Files: 28 files, 6014 lines of code
```

## 🚀 Next Steps

### 1. Create GitHub Repository

1. Go to https://github.com/new
2. Create a new repository (e.g., `stock-widget`)
3. **Do NOT initialize** with README, .gitignore, or license (we already have them)

### 2. Connect to GitHub

```bash
# Add remote repository
git remote add origin https://github.com/YOUR_USERNAME/stock-widget.git

# Verify remote
git remote -v

# Push to GitHub
git push -u origin main
```

### 3. Deploy to Vercel

**Option A: Vercel CLI**
```bash
# Login to Vercel
vercel login

# Deploy (first time - will link to git)
vercel --prod

# Follow prompts:
# - Link to existing project? No
# - Project name: stock-widget
# - Directory: ./
# - Build command: npm run build
# - Output directory: dist
```

**Option B: Vercel Dashboard**
1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Configure:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Add environment variable:
   - Name: `VITE_ALPHA_VANTAGE_KEY`
   - Value: Your API key (or 'demo')
5. Click "Deploy"

### 4. Add Environment Variables to Vercel

After first deployment:

1. Go to project dashboard on Vercel
2. Settings → Environment Variables
3. Add:
   ```
   VITE_ALPHA_VANTAGE_KEY = your_api_key_here
   ```
4. Redeploy: `vercel --prod`

## 🔄 Daily Git Workflow

### Making Changes

```bash
# Check status
git status

# Add specific files
git add src/components/StockWidget.jsx

# Or add all changes
git add .

# Commit with message
git commit -m "Update stock widget layout"

# Push to GitHub
git push
```

### Pull Latest Changes

```bash
git pull origin main
```

### Create Feature Branch

```bash
# Create and switch to new branch
git checkout -b feature/new-chart-type

# Make changes, commit, then push
git push -u origin feature/new-chart-type

# Create pull request on GitHub
```

## 🔒 Security Notes

### Protected Files (in .gitignore)

- ✅ `.env` - Your local API keys (never committed)
- ✅ `.env.local` - Local overrides
- ✅ `.env.production` - Production secrets
- ✅ `node_modules/` - Dependencies
- ✅ `dist/` - Build output

### Safe to Commit

- ✅ `.env.example` - Template without secrets
- ✅ Source code (`src/`)
- ✅ Configuration files (`vite.config.js`, `vercel.json`)
- ✅ Documentation (`README.md`, etc.)

## 📝 Commit Message Guidelines

Good commit messages:
```bash
✅ git commit -m "Add dark theme support to StockWidget"
✅ git commit -m "Fix price formatting in StockQuote component"
✅ git commit -m "Update API endpoint to use v2"
```

Bad commit messages:
```bash
❌ git commit -m "updates"
❌ git commit -m "fix"
❌ git commit -m "wip"
```

## 🛠️ Useful Git Commands

```bash
# View commit history
git log --oneline

# View changes
git diff

# Undo uncommitted changes to a file
git checkout -- src/App.jsx

# Undo last commit (keep changes)
git reset --soft HEAD~1

# View remote repositories
git remote -v

# Create new branch
git branch feature-name

# Switch branches
git checkout feature-name

# Delete branch
git branch -d feature-name

# View all branches
git branch -a
```

## 🔗 Repository Links

After pushing to GitHub and deploying to Vercel:

- **GitHub Repository**: `https://github.com/YOUR_USERNAME/stock-widget`
- **Vercel Dashboard**: `https://vercel.com/YOUR_USERNAME/stock-widget`
- **Live Demo**: `https://stock-widget.vercel.app` (or your custom domain)

## 📚 Resources

- [Git Documentation](https://git-scm.com/doc)
- [GitHub Guides](https://guides.github.com/)
- [Vercel Documentation](https://vercel.com/docs)
- [Pro Git Book](https://git-scm.com/book/en/v2)

---

**Your repository is ready!** 🎉

Push to GitHub and deploy to Vercel to make your stock widget live.
