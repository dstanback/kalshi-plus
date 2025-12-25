# Kalshi+ | AI-Powered Prediction Market Platform

<div align="center">

![Kalshi+](https://img.shields.io/badge/Kalshi+-AI%20Powered-purple)
![React](https://img.shields.io/badge/React-18-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.109-green)
![License](https://img.shields.io/badge/License-MIT-yellow)

**Enhance your Kalshi trading with AI analysis, arbitrage detection, and smart bet sizing.**

</div>

---

## ✨ Features

### 📊 Markets Browser
- Browse all Kalshi categories (Politics, Sports, Crypto, Economics, etc.)
- Advanced filtering and sorting
- Real-time price and volume data

### 🧠 AI Analysis
- Independent probability estimates from Claude AI
- Edge detection vs market price
- Buy/Sell/Pass recommendations with reasoning

### 💰 Smart Tools
- **Kelly Criterion Calculator**: Optimal bet sizing
- **Arbitrage Detector**: Find pricing inefficiencies
- **Volume Spikes**: Detect unusual activity
- **Price Alerts**: Set notifications for price targets

### 📈 Paper Trading
- Practice with $10,000 virtual bankroll
- Track positions and P&L
- Risk-free strategy testing

---

## 🚀 Quick Start

### Local Development

```bash
# Clone the repo
git clone https://github.com/your-username/kalshi-plus.git
cd kalshi-plus

# Start backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload

# Start frontend (new terminal)
cd frontend
npm install
npm run dev
```

Open http://localhost:3000

### Docker

```bash
echo "ANTHROPIC_API_KEY=sk-ant-..." > .env
docker-compose up --build
```

---

## 🌐 Deploy to Production

See [DEPLOY.md](./DEPLOY.md) for detailed instructions.

**Quickest option (Railway):**
```bash
railway login
cd backend && railway init && railway up
cd ../frontend && railway init && railway up
```

---

## 🛠 Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | React 18, Vite, Tailwind CSS |
| Backend | Python, FastAPI |
| AI | Anthropic Claude API |
| Data | Kalshi Public API |
| Deploy | Docker, Railway/Vercel/Fly.io |

---

## 📁 Project Structure

```
kalshi-app/
├── backend/
│   ├── main.py           # FastAPI application
│   ├── requirements.txt  # Python dependencies
│   ├── Dockerfile
│   └── fly.toml          # Fly.io config
├── frontend/
│   ├── src/
│   │   ├── App.jsx       # Main React app
│   │   ├── main.jsx      # Entry point
│   │   └── index.css     # Tailwind styles
│   ├── package.json
│   ├── vite.config.js
│   ├── Dockerfile
│   └── vercel.json       # Vercel config
├── docker-compose.yml
├── railway.json
├── render.yaml
├── DEPLOY.md
└── README.md
```

---

## ⚙️ Configuration

### Environment Variables

**Backend:**
```env
ANTHROPIC_API_KEY=sk-ant-...  # Optional: enables AI features
```

**Frontend:**
```env
VITE_API_URL=http://localhost:8000/api
```

---

## 📖 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/markets` | GET | List markets with filters |
| `/api/markets/{ticker}` | GET | Get single market |
| `/api/analyze/{ticker}` | POST | AI analysis |
| `/api/suggestions` | GET | AI-curated picks |
| `/api/arbitrage` | GET | Arbitrage opportunities |
| `/api/volume-spikes` | GET | Unusual volume |
| `/api/kelly` | GET | Kelly criterion calc |
| `/api/paper/portfolio` | GET | Paper trading portfolio |
| `/api/paper/trade` | POST | Place paper trade |
| `/api/alerts` | GET/POST | Price alerts |

---

## ⚠️ Disclaimer

This tool is for informational and educational purposes only. Prediction market trading involves risk. Past performance does not guarantee future results. Always do your own research.

---

## 📄 License

MIT License - see [LICENSE](./LICENSE) for details.
