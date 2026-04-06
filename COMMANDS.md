# 🔧 Command Reference

Quick reference for all commands you'll need.

---

## 📦 Installation

### Install Dependencies
```bash
npm install
```

### Install Vercel KV
```bash
npm install @vercel/kv
```

### Install Vercel CLI (Optional)
```bash
npm install -g vercel
```

---

## 🛠️ Development

### Start Development Server
```bash
npm run dev
```
Opens at: http://localhost:3000

### Start with Vercel CLI (Pulls env vars)
```bash
vercel dev
```

### Build for Production
```bash
npm run build
```

### Start Production Server Locally
```bash
npm start
```

### Run Linter
```bash
npm run lint
```

---

## 🔍 Code Updates

### Find & Replace (VS Code)
```
Ctrl+Shift+H (Windows) or Cmd+Shift+H (Mac)

Find: from '@/lib/room-store'
Replace: from '@/lib/room-store-kv'
Files: app/api/**/*.ts
```

### Update All API Routes at Once
```bash
# Using sed (Mac/Linux)
find app/api -name "*.ts" -exec sed -i '' 's/@\/lib\/room-store/@\/lib\/room-store-kv/g' {} +

# Using PowerShell (Windows)
Get-ChildItem -Path app/api -Filter *.ts -Recurse | ForEach-Object {
    (Get-Content $_.FullName) -replace '@/lib/room-store', '@/lib/room-store-kv' | Set-Content $_.FullName
}
```

---

## 📤 Git Commands

### Check Status
```bash
git status
```

### Add All Changes
```bash
git add .
```

### Commit Changes
```bash
git commit -m "feat: Add Vercel KV and Pusher integration"
```

### Push to GitHub
```bash
git push origin main
```

### Create New Branch
```bash
git checkout -b feature/new-feature
```

### Switch Branch
```bash
git checkout main
```

### Pull Latest Changes
```bash
git pull origin main
```

---

## 🚀 Deployment

### Deploy to Vercel (Auto)
```bash
git push origin main
```
Vercel auto-deploys on push

### Manual Deploy with Vercel CLI
```bash
vercel --prod
```

### Deploy Preview
```bash
vercel
```

### Check Deployment Status
```bash
vercel ls
```

### View Logs
```bash
vercel logs
```

---

## 🧪 Testing

### Run Build Test
```bash
npm run build
```

### Test Locally
```bash
npm run dev
```
Then open http://localhost:3000

### Test with Vercel Environment
```bash
vercel dev
```
Pulls environment variables from Vercel

---

## 🔧 Environment Variables

### List Environment Variables (Vercel CLI)
```bash
vercel env ls
```

### Add Environment Variable (Vercel CLI)
```bash
vercel env add PUSHER_APP_ID
```

### Pull Environment Variables
```bash
vercel env pull .env.local
```

---

## 📊 Monitoring

### View Vercel Logs
```bash
vercel logs --follow
```

### View Specific Deployment Logs
```bash
vercel logs [deployment-url]
```

### Check Build Status
```bash
vercel inspect [deployment-url]
```

---

## 🐛 Debugging

### Check TypeScript Errors
```bash
npx tsc --noEmit
```

### Check for Unused Dependencies
```bash
npx depcheck
```

### Analyze Bundle Size
```bash
npm run build
npx @next/bundle-analyzer
```

### Clear Next.js Cache
```bash
rm -rf .next
npm run build
```

### Clear Node Modules
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## 🔄 Update Dependencies

### Check for Updates
```bash
npm outdated
```

### Update All Dependencies
```bash
npm update
```

### Update Specific Package
```bash
npm install package-name@latest
```

### Update Next.js
```bash
npm install next@latest react@latest react-dom@latest
```

---

## 📝 Code Generation

### Create New API Route
```bash
mkdir -p app/api/your-route
touch app/api/your-route/route.ts
```

### Create New Component
```bash
mkdir -p components/your-component
touch components/your-component/YourComponent.tsx
```

### Create New Hook
```bash
touch hooks/useYourHook.ts
```

---

## 🧹 Cleanup

### Remove Build Artifacts
```bash
rm -rf .next out
```

### Remove Dependencies
```bash
rm -rf node_modules
```

### Full Clean Install
```bash
rm -rf node_modules package-lock.json .next
npm install
npm run build
```

---

## 📦 Package Management

### Install Package
```bash
npm install package-name
```

### Install Dev Dependency
```bash
npm install -D package-name
```

### Uninstall Package
```bash
npm uninstall package-name
```

### List Installed Packages
```bash
npm list --depth=0
```

---

## 🔐 Security

### Audit Dependencies
```bash
npm audit
```

### Fix Vulnerabilities
```bash
npm audit fix
```

### Force Fix (Careful!)
```bash
npm audit fix --force
```

---

## 📊 Performance

### Analyze Bundle
```bash
npm run build
```
Check output for bundle sizes

### Lighthouse Test
```bash
npx lighthouse https://your-app.vercel.app --view
```

### Check Load Time
```bash
curl -w "@curl-format.txt" -o /dev/null -s https://your-app.vercel.app
```

---

## 🎯 Quick Commands

### Full Setup from Scratch
```bash
# Clone and setup
git clone <your-repo-url>
cd ludo-game
npm install
npm install @vercel/kv

# Update API routes (manual or script)
# Add environment variables to Vercel

# Deploy
git add .
git commit -m "feat: Setup complete"
git push origin main
```

### Quick Deploy
```bash
git add .
git commit -m "fix: your changes"
git push
```

### Quick Test
```bash
npm run build && npm start
```

### Emergency Rollback
```bash
# Via Vercel Dashboard
# Deployments → Previous Deployment → Promote to Production

# Or via CLI
vercel rollback
```

---

## 🆘 Troubleshooting Commands

### Build Fails
```bash
# Clear cache and rebuild
rm -rf .next node_modules package-lock.json
npm install
npm run build
```

### Port Already in Use
```bash
# Kill process on port 3000
# Mac/Linux
lsof -ti:3000 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Git Issues
```bash
# Reset to last commit
git reset --hard HEAD

# Discard all changes
git checkout .

# Pull latest and overwrite local
git fetch origin
git reset --hard origin/main
```

---

## 📚 Documentation Commands

### Generate TypeScript Docs
```bash
npx typedoc --out docs src
```

### View README
```bash
cat README.md
```

### Search in Files
```bash
# Mac/Linux
grep -r "search term" .

# Windows PowerShell
Select-String -Path . -Pattern "search term" -Recurse
```

---

## 🎨 Code Formatting

### Format with Prettier (if installed)
```bash
npx prettier --write .
```

### Check Formatting
```bash
npx prettier --check .
```

---

## 🔗 Useful Aliases (Optional)

Add to your `.bashrc` or `.zshrc`:

```bash
# Development
alias dev="npm run dev"
alias build="npm run build"
alias start="npm start"

# Git
alias gs="git status"
alias ga="git add ."
alias gc="git commit -m"
alias gp="git push origin main"

# Vercel
alias vd="vercel dev"
alias vp="vercel --prod"
alias vl="vercel logs --follow"

# Quick deploy
alias deploy="git add . && git commit -m 'deploy' && git push"
```

---

## 📞 Help Commands

### NPM Help
```bash
npm help
npm help install
```

### Next.js Help
```bash
npx next --help
```

### Vercel Help
```bash
vercel --help
```

### Git Help
```bash
git --help
git commit --help
```

---

## 🎯 Most Used Commands

```bash
# Daily workflow
npm run dev              # Start development
git add .                # Stage changes
git commit -m "message"  # Commit
git push                 # Deploy

# When adding features
npm install package      # Add dependency
npm run build            # Test build
git push                 # Deploy

# When debugging
npm run build            # Check for errors
vercel logs --follow     # View logs
npm run dev              # Test locally
```

---

**Pro Tip**: Create a `Makefile` for common tasks:

```makefile
.PHONY: dev build deploy clean

dev:
	npm run dev

build:
	npm run build

deploy:
	git add .
	git commit -m "deploy"
	git push origin main

clean:
	rm -rf .next node_modules
	npm install
```

Then use: `make dev`, `make build`, `make deploy`, `make clean`

---

**Last Updated**: 2026-04-06  
**Version**: 2.0.0
