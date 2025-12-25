# Kalshi+ Deployment Guide

## 🚀 Quick Deploy Options

### Option 1: Railway (Fastest - 5 minutes)

```bash
# 1. Push to GitHub
cd kalshi-app
git init && git add . && git commit -m "Initial commit"
gh repo create kalshi-plus --public --push

# 2. Install Railway CLI
npm install -g @railway/cli

# 3. Login and deploy backend
railway login
cd backend
railway init
railway variables set ANTHROPIC_API_KEY=sk-ant-your-key
railway up
# Note your backend URL: https://xxx.up.railway.app

# 4. Deploy frontend
cd ../frontend
railway init
railway variables set VITE_API_URL=https://xxx.up.railway.app/api
railway up
```

**Done!** Your app is live at `https://kalshi-plus.up.railway.app`

---

### Option 2: Vercel + Fly.io (Best Performance)

#### Deploy Backend to Fly.io

```bash
# Install Fly CLI
# Mac: brew install flyctl
# Windows: powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"
# Linux: curl -L https://fly.io/install.sh | sh

flyctl auth signup  # or: flyctl auth login

cd backend
flyctl launch
# Answer prompts:
#   App name: kalshi-api
#   Region: iad (or closest to you)
#   Deploy now? Yes

flyctl secrets set ANTHROPIC_API_KEY=sk-ant-your-key
```

Note your backend URL: `https://kalshi-api.fly.dev`

#### Deploy Frontend to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

cd frontend
vercel login
vercel

# Set environment variable
vercel env add VITE_API_URL
# Enter: https://kalshi-api.fly.dev/api

vercel --prod
```

---

### Option 3: Render (Free Tier Available)

1. Push code to GitHub
2. Go to [render.com](https://render.com)
3. Click "New" → "Blueprint"
4. Connect your GitHub repo
5. Render auto-detects `render.yaml` and deploys both services

Add your `ANTHROPIC_API_KEY` in the Render dashboard under Environment.

---

### Option 4: Docker on VPS ($5/month)

```bash
# On your VPS (DigitalOcean, Linode, etc.)
git clone https://github.com/your-username/kalshi-plus.git
cd kalshi-plus

# Create .env file
echo "ANTHROPIC_API_KEY=sk-ant-your-key" > .env

# Deploy
docker-compose up -d --build

# Optional: Set up nginx reverse proxy with SSL
sudo apt install nginx certbot python3-certbot-nginx
```

---

## 🔧 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | Optional | Enables AI analysis features |
| `VITE_API_URL` | Required (frontend) | Backend API URL |

---

## 📊 Post-Deployment Checklist

- [ ] Verify backend health: `curl https://your-api.com/api/health`
- [ ] Test market fetching: `curl https://your-api.com/api/markets`
- [ ] Check frontend loads correctly
- [ ] Test AI analysis (if API key set)
- [ ] Set up monitoring (optional)

---

## 🔒 Security Recommendations

1. **API Key**: Never commit your Anthropic API key
2. **HTTPS**: All deployment options include automatic HTTPS
3. **Rate Limiting**: Consider adding rate limiting for production
4. **CORS**: Backend is configured for open CORS; restrict in production

---

## 💰 Cost Comparison

| Platform | Free Tier | Paid Starting |
|----------|-----------|---------------|
| Railway | Yes (500 hrs/mo) | $5/mo |
| Vercel | Yes (generous) | $20/mo |
| Fly.io | Yes (3 shared VMs) | $1.94/mo |
| Render | Yes (spins down) | $7/mo |
| DigitalOcean | No | $5/mo |

---

## 🐛 Troubleshooting

**Backend not responding?**
- Check logs: `railway logs` or `flyctl logs`
- Verify health endpoint: `/api/health`

**Frontend can't reach backend?**
- Ensure `VITE_API_URL` is set correctly
- Check CORS settings

**AI analysis not working?**
- Verify `ANTHROPIC_API_KEY` is set
- Check API key is valid and has credits

---

## 📞 Support

Having issues? Check:
1. Platform-specific logs
2. Network tab in browser DevTools
3. Backend `/api/health` endpoint
