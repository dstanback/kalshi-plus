"""
Kalshi+ Backend API
AI-powered prediction market analysis platform
"""

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import httpx
import os
from datetime import datetime, timedelta
import json

app = FastAPI(
    title="Kalshi+ API",
    description="AI-powered prediction market analysis",
    version="2.0.0"
)

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Kalshi API base URL
KALSHI_API = "https://api.elections.kalshi.com/trade-api/v2"
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")

# Categories mapping
CATEGORIES = {
    "trending": {"name": "Trending", "icon": "🔥"},
    "new": {"name": "New", "icon": "✨"},
    "politics": {"name": "Politics", "icon": "🏛️"},
    "sports": {"name": "Sports", "icon": "⚽"},
    "culture": {"name": "Culture", "icon": "🎬"},
    "crypto": {"name": "Crypto", "icon": "₿"},
    "climate": {"name": "Climate", "icon": "🌍"},
    "economics": {"name": "Economics", "icon": "📈"},
    "mentions": {"name": "Mentions", "icon": "💬"},
    "companies": {"name": "Companies", "icon": "🏢"},
    "financials": {"name": "Financials", "icon": "💹"},
    "tech": {"name": "Tech & Science", "icon": "🔬"},
    "health": {"name": "Health", "icon": "🏥"},
    "world": {"name": "World", "icon": "🌐"},
}

# In-memory storage (replace with database in production)
paper_trades = []
alerts = []
portfolio = {"balance": 10000, "positions": []}


class Market(BaseModel):
    ticker: str
    title: str
    yes_price: float
    no_price: float
    volume: int
    close_time: Optional[str]
    category: str
    status: str


class AIAnalysis(BaseModel):
    market_ticker: str
    ai_probability: float
    market_probability: float
    edge: float
    recommendation: str
    reasoning: str
    confidence: str
    risk_factors: List[str]


class PaperTrade(BaseModel):
    ticker: str
    title: str
    side: str  # YES or NO
    price: float
    quantity: int
    timestamp: str


class Alert(BaseModel):
    ticker: str
    title: str
    condition: str  # above or below
    target_price: float
    active: bool = True


@app.get("/")
async def root():
    return {"status": "ok", "message": "Kalshi+ API v2.0", "timestamp": datetime.utcnow().isoformat()}


@app.get("/api/health")
async def health():
    return {"status": "healthy", "version": "2.0.0"}


@app.get("/api/categories")
async def get_categories():
    return CATEGORIES


@app.get("/api/markets")
async def get_markets(
    category: Optional[str] = None,
    search: Optional[str] = None,
    sort_by: str = "volume",
    sort_order: str = "desc",
    limit: int = 100,
    min_volume: int = 0,
    bucket: Optional[str] = None
):
    """Fetch markets from Kalshi API with filtering"""
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            # Fetch events and markets
            params = {"limit": 200, "status": "open"}
            
            if category and category not in ["trending", "new"]:
                # Map category to Kalshi series_ticker prefix
                category_map = {
                    "politics": "PRES,SENATE,HOUSE,GOV",
                    "sports": "NFL,NBA,MLB,NHL,SOCCER",
                    "crypto": "BTC,ETH,CRYPTO",
                    "economics": "GDP,CPI,FOMC,FED",
                    "climate": "CLIMATE,WEATHER",
                    "companies": "AAPL,GOOGL,TSLA,AMZN",
                    "financials": "SPX,NDX,DJI",
                    "tech": "AI,TECH",
                    "health": "COVID,FDA",
                }
                if category in category_map:
                    params["series_ticker"] = category_map[category]
            
            response = await client.get(f"{KALSHI_API}/markets", params=params)
            
            if response.status_code != 200:
                # Return sample data if API fails
                return get_sample_markets(category, search, sort_by, sort_order, limit)
            
            data = response.json()
            markets = data.get("markets", [])
            
            # Transform to our format
            result = []
            for m in markets:
                yes_price = m.get("yes_ask", 50) / 100 if m.get("yes_ask") else 0.50
                no_price = m.get("no_ask", 50) / 100 if m.get("no_ask") else 0.50
                volume = m.get("volume", 0) or 0
                
                if volume < min_volume:
                    continue
                
                if search and search.lower() not in m.get("title", "").lower():
                    continue
                
                # Bucket filter
                if bucket:
                    prob = yes_price
                    bucket_ranges = {
                        "longshot": (0, 0.15),
                        "unlikely": (0.15, 0.35),
                        "uncertain": (0.35, 0.65),
                        "likely": (0.65, 0.85),
                        "favorite": (0.85, 1.0),
                    }
                    if bucket in bucket_ranges:
                        low, high = bucket_ranges[bucket]
                        if not (low <= prob < high):
                            continue
                
                result.append({
                    "ticker": m.get("ticker", ""),
                    "title": m.get("title", "Unknown"),
                    "yes_price": yes_price,
                    "no_price": no_price,
                    "volume": volume,
                    "close_time": m.get("close_time"),
                    "category": detect_category(m.get("title", "")),
                    "status": m.get("status", "open"),
                    "spread": abs(yes_price - (1 - no_price)),
                })
            
            # Sort
            reverse = sort_order == "desc"
            if sort_by == "volume":
                result.sort(key=lambda x: x["volume"], reverse=reverse)
            elif sort_by == "probability":
                result.sort(key=lambda x: x["yes_price"], reverse=reverse)
            elif sort_by == "spread":
                result.sort(key=lambda x: x["spread"], reverse=reverse)
            elif sort_by == "closing":
                result.sort(key=lambda x: x["close_time"] or "", reverse=not reverse)
            
            return result[:limit]
            
    except Exception as e:
        print(f"Error fetching markets: {e}")
        return get_sample_markets(category, search, sort_by, sort_order, limit)


def detect_category(title: str) -> str:
    """Detect category from market title"""
    title_lower = title.lower()
    if any(w in title_lower for w in ["trump", "biden", "president", "senate", "congress", "election"]):
        return "politics"
    if any(w in title_lower for w in ["bitcoin", "btc", "ethereum", "crypto"]):
        return "crypto"
    if any(w in title_lower for w in ["nfl", "nba", "mlb", "super bowl", "world series"]):
        return "sports"
    if any(w in title_lower for w in ["fed", "rate", "gdp", "inflation", "cpi"]):
        return "economics"
    if any(w in title_lower for w in ["tesla", "apple", "google", "amazon", "microsoft"]):
        return "companies"
    return "general"


def get_sample_markets(category=None, search=None, sort_by="volume", sort_order="desc", limit=100):
    """Return sample markets when API is unavailable"""
    samples = [
        {"ticker": "PRES-2028-DEM", "title": "Who will win the 2028 Democratic Presidential Primary?", "yes_price": 0.35, "no_price": 0.67, "volume": 125000, "category": "politics"},
        {"ticker": "BTC-100K-2025", "title": "Will Bitcoin reach $100,000 by end of 2025?", "yes_price": 0.72, "no_price": 0.30, "volume": 89000, "category": "crypto"},
        {"ticker": "FED-RATE-JAN", "title": "Will Fed cut rates in January 2025?", "yes_price": 0.45, "no_price": 0.57, "volume": 67000, "category": "economics"},
        {"ticker": "NFL-SB-CHIEFS", "title": "Will Chiefs win Super Bowl 2025?", "yes_price": 0.22, "no_price": 0.80, "volume": 54000, "category": "sports"},
        {"ticker": "TSLA-500-Q1", "title": "Will Tesla stock reach $500 in Q1 2025?", "yes_price": 0.18, "no_price": 0.84, "volume": 43000, "category": "companies"},
        {"ticker": "AI-AGI-2025", "title": "Will AGI be announced by a major lab in 2025?", "yes_price": 0.08, "no_price": 0.93, "volume": 38000, "category": "tech"},
        {"ticker": "AAPL-250", "title": "Will Apple stock reach $250 by March 2025?", "yes_price": 0.62, "no_price": 0.40, "volume": 31000, "category": "companies"},
        {"ticker": "ETH-5K", "title": "Will Ethereum reach $5,000 by end of 2025?", "yes_price": 0.55, "no_price": 0.47, "volume": 28000, "category": "crypto"},
    ]
    
    for s in samples:
        s["close_time"] = (datetime.utcnow() + timedelta(days=30)).isoformat()
        s["status"] = "open"
        s["spread"] = abs(s["yes_price"] - (1 - s["no_price"]))
    
    if category and category not in ["trending", "new"]:
        samples = [s for s in samples if s["category"] == category]
    
    if search:
        samples = [s for s in samples if search.lower() in s["title"].lower()]
    
    return samples[:limit]


@app.get("/api/markets/{ticker}")
async def get_market(ticker: str):
    """Get single market details"""
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(f"{KALSHI_API}/markets/{ticker}")
            if response.status_code == 200:
                return response.json().get("market", {})
    except:
        pass
    
    # Return sample
    return {
        "ticker": ticker,
        "title": f"Market {ticker}",
        "yes_price": 0.50,
        "no_price": 0.52,
        "volume": 10000,
    }


@app.post("/api/analyze/{ticker}")
async def analyze_market(ticker: str):
    """AI analysis of a market"""
    # Get market data first
    market = await get_market(ticker)
    
    if not ANTHROPIC_API_KEY:
        # Return mock analysis if no API key
        market_prob = market.get("yes_price", 0.5)
        ai_prob = market_prob + (0.1 if market_prob < 0.5 else -0.1)
        edge = ai_prob - market_prob
        
        return {
            "market_ticker": ticker,
            "market_title": market.get("title", ticker),
            "ai_probability": round(ai_prob, 2),
            "market_probability": market_prob,
            "edge": round(edge, 2),
            "recommendation": "YES" if edge > 0.05 else ("NO" if edge < -0.05 else "PASS"),
            "reasoning": "AI analysis requires ANTHROPIC_API_KEY to be set. This is a placeholder analysis based on market dynamics.",
            "confidence": "medium",
            "risk_factors": [
                "Market volatility",
                "Information asymmetry",
                "Time decay",
            ]
        }
    
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            prompt = f"""Analyze this prediction market and provide your independent probability estimate:

Market: {market.get('title', ticker)}
Current YES price: {market.get('yes_price', 0.5):.0%}
Current NO price: {market.get('no_price', 0.5):.0%}
Volume: {market.get('volume', 0):,}

Provide:
1. Your probability estimate (0-100%)
2. Whether you recommend YES, NO, or PASS
3. Key reasoning (2-3 sentences)
4. Confidence level (low/medium/high)
5. 2-3 risk factors

Respond in JSON format:
{{"probability": 45, "recommendation": "YES", "reasoning": "...", "confidence": "medium", "risk_factors": ["...", "..."]}}"""

            response = await client.post(
                "https://api.anthropic.com/v1/messages",
                headers={
                    "x-api-key": ANTHROPIC_API_KEY,
                    "anthropic-version": "2023-06-01",
                    "content-type": "application/json",
                },
                json={
                    "model": "claude-sonnet-4-20250514",
                    "max_tokens": 500,
                    "messages": [{"role": "user", "content": prompt}]
                }
            )
            
            if response.status_code == 200:
                result = response.json()
                content = result["content"][0]["text"]
                
                # Parse JSON from response
                import re
                json_match = re.search(r'\{.*\}', content, re.DOTALL)
                if json_match:
                    analysis = json.loads(json_match.group())
                    ai_prob = analysis["probability"] / 100
                    market_prob = market.get("yes_price", 0.5)
                    
                    return {
                        "market_ticker": ticker,
                        "market_title": market.get("title", ticker),
                        "ai_probability": ai_prob,
                        "market_probability": market_prob,
                        "edge": round(ai_prob - market_prob, 2),
                        "recommendation": analysis["recommendation"],
                        "reasoning": analysis["reasoning"],
                        "confidence": analysis["confidence"],
                        "risk_factors": analysis["risk_factors"]
                    }
    except Exception as e:
        print(f"AI analysis error: {e}")
    
    # Fallback
    return {
        "market_ticker": ticker,
        "market_title": market.get("title", ticker),
        "ai_probability": 0.5,
        "market_probability": market.get("yes_price", 0.5),
        "edge": 0,
        "recommendation": "PASS",
        "reasoning": "Unable to complete AI analysis at this time.",
        "confidence": "low",
        "risk_factors": ["Analysis unavailable"]
    }


@app.get("/api/suggestions")
async def get_suggestions(risk_level: str = "balanced"):
    """Get AI-curated betting suggestions"""
    markets = await get_markets(limit=50, min_volume=1000)
    
    suggestions = {
        "balanced": [],
        "high_potential": [],
        "low_risk": [],
        "best_value": [],
    }
    
    for m in markets:
        prob = m["yes_price"]
        volume = m["volume"]
        spread = m.get("spread", 0.02)
        
        # Balanced: good probability range with decent volume
        if 0.3 <= prob <= 0.7 and volume > 5000:
            suggestions["balanced"].append({**m, "reason": "Good probability range with strong volume"})
        
        # High potential: longshots with volume
        if prob < 0.2 and volume > 2000:
            suggestions["high_potential"].append({**m, "reason": f"Potential {1/prob:.1f}x return if YES wins"})
        
        # Low risk: high probability with tight spread
        if prob > 0.75 and spread < 0.03:
            suggestions["low_risk"].append({**m, "reason": "High probability with tight spread"})
        
        # Best value: unusual volume at extreme odds
        if (prob < 0.15 or prob > 0.85) and volume > 10000:
            suggestions["best_value"].append({**m, "reason": "Unusual volume at extreme odds"})
    
    # Limit each category
    for key in suggestions:
        suggestions[key] = suggestions[key][:5]
    
    return suggestions


@app.get("/api/arbitrage")
async def get_arbitrage():
    """Find potential arbitrage opportunities"""
    markets = await get_markets(limit=100)
    opportunities = []
    
    for m in markets:
        yes_price = m["yes_price"]
        no_price = m["no_price"]
        
        # Check if YES + NO < 1 (buy both for guaranteed profit)
        if yes_price + no_price < 0.98:
            profit = 1 - (yes_price + no_price)
            opportunities.append({
                **m,
                "type": "underpriced",
                "profit_potential": f"{profit*100:.1f}%",
                "strategy": f"Buy YES at {yes_price:.0%} + NO at {no_price:.0%} = guaranteed profit"
            })
        
        # Check for wide spreads (market inefficiency)
        spread = abs(yes_price - (1 - no_price))
        if spread > 0.05:
            opportunities.append({
                **m,
                "type": "wide_spread",
                "spread": f"{spread*100:.1f}%",
                "strategy": "Wide spread indicates potential mispricing"
            })
    
    return opportunities[:20]


@app.get("/api/volume-spikes")
async def get_volume_spikes():
    """Detect unusual volume activity"""
    markets = await get_markets(sort_by="volume", limit=50)
    
    # In production, compare to historical averages
    # For now, flag high-volume markets
    spikes = []
    for m in markets:
        if m["volume"] > 20000:
            spikes.append({
                **m,
                "spike_magnitude": "high",
                "interpretation": "Significant trading activity - possible news or insider activity"
            })
        elif m["volume"] > 10000:
            spikes.append({
                **m,
                "spike_magnitude": "medium", 
                "interpretation": "Above average volume"
            })
    
    return spikes[:15]


@app.get("/api/kelly")
async def calculate_kelly(
    probability: float = Query(..., ge=0, le=1),
    odds: float = Query(..., gt=0),
    bankroll: float = Query(default=1000, gt=0)
):
    """Calculate Kelly Criterion bet sizing"""
    # Kelly formula: f* = (bp - q) / b
    # where b = odds-1, p = win probability, q = 1-p
    
    b = odds - 1 if odds > 1 else (1 / odds) - 1
    p = probability
    q = 1 - p
    
    kelly_fraction = (b * p - q) / b if b > 0 else 0
    kelly_fraction = max(0, kelly_fraction)  # No negative bets
    
    full_kelly = bankroll * kelly_fraction
    half_kelly = full_kelly / 2
    quarter_kelly = full_kelly / 4
    
    ev = (probability * (odds - 1)) - (1 - probability)
    
    return {
        "probability": probability,
        "odds": odds,
        "bankroll": bankroll,
        "kelly_fraction": round(kelly_fraction, 4),
        "full_kelly": round(full_kelly, 2),
        "half_kelly": round(half_kelly, 2),
        "quarter_kelly": round(quarter_kelly, 2),
        "expected_value": round(ev, 4),
        "recommendation": "half_kelly" if kelly_fraction > 0.1 else "full_kelly"
    }


# Paper Trading Endpoints
@app.get("/api/paper/portfolio")
async def get_paper_portfolio():
    """Get paper trading portfolio"""
    return portfolio


@app.post("/api/paper/trade")
async def place_paper_trade(trade: PaperTrade):
    """Place a paper trade"""
    cost = trade.price * trade.quantity
    
    if cost > portfolio["balance"]:
        raise HTTPException(status_code=400, detail="Insufficient balance")
    
    portfolio["balance"] -= cost
    portfolio["positions"].append({
        "ticker": trade.ticker,
        "title": trade.title,
        "side": trade.side,
        "price": trade.price,
        "quantity": trade.quantity,
        "cost": cost,
        "timestamp": trade.timestamp or datetime.utcnow().isoformat()
    })
    paper_trades.append(trade.dict())
    
    return {"success": True, "new_balance": portfolio["balance"]}


@app.post("/api/paper/reset")
async def reset_paper_portfolio():
    """Reset paper trading portfolio"""
    portfolio["balance"] = 10000
    portfolio["positions"] = []
    paper_trades.clear()
    return {"success": True, "balance": 10000}


# Alerts Endpoints
@app.get("/api/alerts")
async def get_alerts():
    """Get all price alerts"""
    return alerts


@app.post("/api/alerts")
async def create_alert(alert: Alert):
    """Create a price alert"""
    alerts.append(alert.dict())
    return {"success": True, "alert_count": len(alerts)}


@app.delete("/api/alerts/{index}")
async def delete_alert(index: int):
    """Delete an alert"""
    if 0 <= index < len(alerts):
        alerts.pop(index)
        return {"success": True}
    raise HTTPException(status_code=404, detail="Alert not found")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
