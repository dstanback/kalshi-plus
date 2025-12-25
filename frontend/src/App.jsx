import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'

// API Base URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

// Fetch helper
const fetchAPI = async (endpoint, options = {}) => {
  const res = await fetch(`${API_URL}${endpoint}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  })
  if (!res.ok) throw new Error(`API Error: ${res.status}`)
  return res.json()
}

// Categories
const CATEGORIES = [
  { id: 'trending', name: 'Trending', icon: '🔥' },
  { id: 'new', name: 'New', icon: '✨' },
  { id: 'politics', name: 'Politics', icon: '🏛️' },
  { id: 'sports', name: 'Sports', icon: '⚽' },
  { id: 'culture', name: 'Culture', icon: '🎬' },
  { id: 'crypto', name: 'Crypto', icon: '₿' },
  { id: 'climate', name: 'Climate', icon: '🌍' },
  { id: 'economics', name: 'Economics', icon: '📈' },
  { id: 'companies', name: 'Companies', icon: '🏢' },
  { id: 'financials', name: 'Financials', icon: '💹' },
  { id: 'tech', name: 'Tech & Science', icon: '🔬' },
  { id: 'health', name: 'Health', icon: '🏥' },
  { id: 'world', name: 'World', icon: '🌐' },
]

// Navigation
function Navbar() {
  return (
    <nav className="bg-[#1a1a1a] border-b border-[#2a2a2a] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <NavLink to="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
              Kalshi+
            </span>
            <span className="text-xs text-gray-500 bg-[#2a2a2a] px-2 py-0.5 rounded">AI</span>
          </NavLink>
          
          <div className="flex items-center gap-1">
            {[
              { to: '/', label: 'Markets' },
              { to: '/suggestions', label: 'AI Picks' },
              { to: '/arbitrage', label: 'Arbitrage' },
              { to: '/spikes', label: 'Volume' },
              { to: '/paper', label: 'Paper Trade' },
              { to: '/portfolio', label: 'Portfolio' },
              { to: '/alerts', label: 'Alerts' },
            ].map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg text-sm transition-colors ${
                    isActive
                      ? 'bg-purple-600/20 text-purple-400'
                      : 'text-gray-400 hover:text-white hover:bg-[#2a2a2a]'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}

// Market Card Component
function MarketCard({ market, onAnalyze }) {
  const [analyzing, setAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState(null)

  const handleAnalyze = async () => {
    setAnalyzing(true)
    try {
      const data = await fetchAPI(`/analyze/${market.ticker}`, { method: 'POST' })
      setAnalysis(data)
    } catch (e) {
      console.error(e)
    }
    setAnalyzing(false)
  }

  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4 hover:border-[#3a3a3a] transition-colors">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-white font-medium text-sm leading-tight flex-1 mr-4">
          {market.title}
        </h3>
        <span className="text-xs text-gray-500 bg-[#2a2a2a] px-2 py-1 rounded shrink-0">
          {market.category}
        </span>
      </div>
      
      <div className="flex items-center gap-4 mb-3">
        <div className="flex-1">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>YES</span>
            <span>NO</span>
          </div>
          <div className="flex gap-2">
            <div className="flex-1 bg-[#00d26a]/20 rounded px-3 py-2 text-center">
              <span className="text-[#00d26a] font-mono font-bold">
                {(market.yes_price * 100).toFixed(0)}¢
              </span>
            </div>
            <div className="flex-1 bg-[#ff4757]/20 rounded px-3 py-2 text-center">
              <span className="text-[#ff4757] font-mono font-bold">
                {(market.no_price * 100).toFixed(0)}¢
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>Vol: {market.volume?.toLocaleString() || 0}</span>
        <button
          onClick={handleAnalyze}
          disabled={analyzing}
          className="bg-purple-600/20 text-purple-400 px-3 py-1 rounded-lg hover:bg-purple-600/30 transition-colors disabled:opacity-50"
        >
          {analyzing ? 'Analyzing...' : '🧠 AI Analysis'}
        </button>
      </div>
      
      {analysis && (
        <div className="mt-4 pt-4 border-t border-[#2a2a2a]">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-1 rounded text-xs font-bold ${
              analysis.recommendation === 'YES' ? 'bg-[#00d26a]/20 text-[#00d26a]' :
              analysis.recommendation === 'NO' ? 'bg-[#ff4757]/20 text-[#ff4757]' :
              'bg-gray-600/20 text-gray-400'
            }`}>
              {analysis.recommendation}
            </span>
            <span className="text-xs text-gray-500">
              AI: {(analysis.ai_probability * 100).toFixed(0)}% vs Market: {(analysis.market_probability * 100).toFixed(0)}%
            </span>
            <span className={`text-xs ${analysis.edge > 0 ? 'text-[#00d26a]' : 'text-[#ff4757]'}`}>
              Edge: {(analysis.edge * 100).toFixed(1)}%
            </span>
          </div>
          <p className="text-xs text-gray-400">{analysis.reasoning}</p>
        </div>
      )}
    </div>
  )
}

// Markets Page
function MarketsPage() {
  const [markets, setMarkets] = useState([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('trending')
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('volume')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams({
          category,
          sort_by: sortBy,
          limit: '50',
          ...(search && { search })
        })
        const data = await fetchAPI(`/markets?${params}`)
        setMarkets(data)
      } catch (e) {
        console.error(e)
      }
      setLoading(false)
    }
    load()
  }, [category, search, sortBy])

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setCategory(cat.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
              category === cat.id
                ? 'bg-purple-600 text-white'
                : 'bg-[#1a1a1a] text-gray-400 hover:bg-[#2a2a2a]'
            }`}
          >
            <span>{cat.icon}</span>
            <span>{cat.name}</span>
          </button>
        ))}
      </div>

      {/* Search & Sort */}
      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Search markets..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:border-purple-500 outline-none"
        />
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-4 py-2 text-white outline-none"
        >
          <option value="volume">Volume</option>
          <option value="probability">Probability</option>
          <option value="spread">Spread</option>
          <option value="closing">Closing Soon</option>
        </select>
      </div>

      {/* Markets Grid */}
      {loading ? (
        <div className="text-center text-gray-500 py-12">Loading markets...</div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {markets.map(market => (
            <MarketCard key={market.ticker} market={market} />
          ))}
        </div>
      )}
    </div>
  )
}

// AI Suggestions Page
function SuggestionsPage() {
  const [suggestions, setSuggestions] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchAPI('/suggestions')
        setSuggestions(data)
      } catch (e) {
        console.error(e)
      }
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <div className="text-center text-gray-500 py-12">Loading AI suggestions...</div>

  const sections = [
    { key: 'balanced', title: '⚖️ Balanced Opportunities', desc: 'Good probability range with solid volume' },
    { key: 'high_potential', title: '🚀 Highest Potential', desc: 'Longshots with massive upside' },
    { key: 'low_risk', title: '🛡️ Lowest Risk', desc: 'High probability with tight spreads' },
    { key: 'best_value', title: '💎 Best Value', desc: 'Unusual volume at extreme odds' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-white mb-2">AI-Curated Picks</h1>
      <p className="text-gray-500 mb-8">Opportunities identified by our analysis engine</p>

      {sections.map(({ key, title, desc }) => (
        <div key={key} className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-1">{title}</h2>
          <p className="text-sm text-gray-500 mb-4">{desc}</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {suggestions?.[key]?.length > 0 ? (
              suggestions[key].map(m => <MarketCard key={m.ticker} market={m} />)
            ) : (
              <p className="text-gray-600 text-sm">No opportunities found</p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

// Arbitrage Page
function ArbitragePage() {
  const [opportunities, setOpportunities] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchAPI('/arbitrage')
        setOpportunities(data)
      } catch (e) {
        console.error(e)
      }
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-white mb-2">Arbitrage Detector</h1>
      <p className="text-gray-500 mb-8">Find pricing inefficiencies and guaranteed profit opportunities</p>

      {loading ? (
        <div className="text-center text-gray-500 py-12">Scanning for arbitrage...</div>
      ) : opportunities.length === 0 ? (
        <div className="text-center text-gray-500 py-12">No arbitrage opportunities found</div>
      ) : (
        <div className="space-y-4">
          {opportunities.map((opp, i) => (
            <div key={i} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-white font-medium">{opp.title}</h3>
                <span className={`px-2 py-1 rounded text-xs ${
                  opp.type === 'underpriced' ? 'bg-[#00d26a]/20 text-[#00d26a]' : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {opp.type}
                </span>
              </div>
              <p className="text-sm text-gray-400 mb-2">{opp.strategy}</p>
              {opp.profit_potential && (
                <span className="text-[#00d26a] font-mono">+{opp.profit_potential}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Volume Spikes Page
function VolumePage() {
  const [spikes, setSpikes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchAPI('/volume-spikes')
        setSpikes(data)
      } catch (e) {
        console.error(e)
      }
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-white mb-2">Volume Spikes</h1>
      <p className="text-gray-500 mb-8">Markets with unusual trading activity</p>

      {loading ? (
        <div className="text-center text-gray-500 py-12">Detecting volume spikes...</div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {spikes.map((spike, i) => (
            <div key={i} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-white font-medium text-sm">{spike.title}</h3>
                <span className={`px-2 py-1 rounded text-xs ${
                  spike.spike_magnitude === 'high' ? 'bg-[#ff4757]/20 text-[#ff4757]' : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {spike.spike_magnitude} activity
                </span>
              </div>
              <p className="text-xs text-gray-400 mb-2">{spike.interpretation}</p>
              <span className="text-sm text-gray-500">Volume: {spike.volume?.toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Paper Trading Page
function PaperTradingPage() {
  const [portfolio, setPortfolio] = useState({ balance: 10000, positions: [] })
  const [markets, setMarkets] = useState([])
  const [selectedMarket, setSelectedMarket] = useState(null)
  const [side, setSide] = useState('YES')
  const [quantity, setQuantity] = useState(10)

  useEffect(() => {
    const load = async () => {
      try {
        const [p, m] = await Promise.all([
          fetchAPI('/paper/portfolio'),
          fetchAPI('/markets?limit=20')
        ])
        setPortfolio(p)
        setMarkets(m)
      } catch (e) {
        console.error(e)
      }
    }
    load()
  }, [])

  const placeTrade = async () => {
    if (!selectedMarket) return
    try {
      const price = side === 'YES' ? selectedMarket.yes_price : selectedMarket.no_price
      await fetchAPI('/paper/trade', {
        method: 'POST',
        body: JSON.stringify({
          ticker: selectedMarket.ticker,
          title: selectedMarket.title,
          side,
          price,
          quantity,
          timestamp: new Date().toISOString()
        })
      })
      const p = await fetchAPI('/paper/portfolio')
      setPortfolio(p)
      setSelectedMarket(null)
    } catch (e) {
      alert(e.message)
    }
  }

  const resetPortfolio = async () => {
    await fetchAPI('/paper/reset', { method: 'POST' })
    const p = await fetchAPI('/paper/portfolio')
    setPortfolio(p)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Paper Trading</h1>
          <p className="text-gray-500">Practice with virtual money</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-mono text-[#00d26a]">${portfolio.balance.toLocaleString()}</div>
          <button onClick={resetPortfolio} className="text-xs text-gray-500 hover:text-white">
            Reset Portfolio
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Market Selection */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4">
          <h2 className="text-white font-semibold mb-4">Select Market</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {markets.map(m => (
              <button
                key={m.ticker}
                onClick={() => setSelectedMarket(m)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  selectedMarket?.ticker === m.ticker
                    ? 'bg-purple-600/20 border border-purple-500'
                    : 'bg-[#0d0d0d] hover:bg-[#2a2a2a]'
                }`}
              >
                <div className="text-sm text-white">{m.title}</div>
                <div className="text-xs text-gray-500 mt-1">
                  YES: {(m.yes_price * 100).toFixed(0)}¢ | NO: {(m.no_price * 100).toFixed(0)}¢
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Trade Form */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4">
          <h2 className="text-white font-semibold mb-4">Place Trade</h2>
          
          {selectedMarket ? (
            <div className="space-y-4">
              <div className="p-3 bg-[#0d0d0d] rounded-lg">
                <div className="text-sm text-white">{selectedMarket.title}</div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setSide('YES')}
                  className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
                    side === 'YES' ? 'bg-[#00d26a] text-black' : 'bg-[#00d26a]/20 text-[#00d26a]'
                  }`}
                >
                  YES @ {(selectedMarket.yes_price * 100).toFixed(0)}¢
                </button>
                <button
                  onClick={() => setSide('NO')}
                  className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
                    side === 'NO' ? 'bg-[#ff4757] text-white' : 'bg-[#ff4757]/20 text-[#ff4757]'
                  }`}
                >
                  NO @ {(selectedMarket.no_price * 100).toFixed(0)}¢
                </button>
              </div>

              <div>
                <label className="text-sm text-gray-400 block mb-2">Quantity</label>
                <input
                  type="number"
                  value={quantity}
                  onChange={e => setQuantity(Number(e.target.value))}
                  min="1"
                  className="w-full bg-[#0d0d0d] border border-[#2a2a2a] rounded-lg px-4 py-2 text-white"
                />
              </div>

              <div className="p-3 bg-[#0d0d0d] rounded-lg">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Total Cost</span>
                  <span className="text-white font-mono">
                    ${((side === 'YES' ? selectedMarket.yes_price : selectedMarket.no_price) * quantity).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-400">Potential Payout</span>
                  <span className="text-[#00d26a] font-mono">${quantity.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={placeTrade}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-semibold transition-colors"
              >
                Place Paper Trade
              </button>
            </div>
          ) : (
            <div className="text-gray-500 text-center py-12">Select a market to trade</div>
          )}
        </div>
      </div>

      {/* Positions */}
      {portfolio.positions.length > 0 && (
        <div className="mt-6">
          <h2 className="text-white font-semibold mb-4">Open Positions</h2>
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-[#0d0d0d]">
                <tr className="text-xs text-gray-500">
                  <th className="text-left p-3">Market</th>
                  <th className="text-center p-3">Side</th>
                  <th className="text-right p-3">Qty</th>
                  <th className="text-right p-3">Price</th>
                  <th className="text-right p-3">Cost</th>
                </tr>
              </thead>
              <tbody>
                {portfolio.positions.map((pos, i) => (
                  <tr key={i} className="border-t border-[#2a2a2a]">
                    <td className="p-3 text-sm text-white">{pos.title}</td>
                    <td className={`p-3 text-center text-sm font-semibold ${
                      pos.side === 'YES' ? 'text-[#00d26a]' : 'text-[#ff4757]'
                    }`}>
                      {pos.side}
                    </td>
                    <td className="p-3 text-right text-sm text-white">{pos.quantity}</td>
                    <td className="p-3 text-right text-sm text-gray-400">{(pos.price * 100).toFixed(0)}¢</td>
                    <td className="p-3 text-right text-sm text-white font-mono">${pos.cost.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

// Portfolio Page
function PortfolioPage() {
  const [portfolio, setPortfolio] = useState({ balance: 10000, positions: [] })
  const [kelly, setKelly] = useState(null)
  const [probability, setProbability] = useState(0.6)
  const [odds, setOdds] = useState(2)
  const [bankroll, setBankroll] = useState(1000)

  useEffect(() => {
    fetchAPI('/paper/portfolio').then(setPortfolio).catch(console.error)
  }, [])

  const calculateKelly = async () => {
    try {
      const data = await fetchAPI(`/kelly?probability=${probability}&odds=${odds}&bankroll=${bankroll}`)
      setKelly(data)
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-white mb-6">Portfolio & Bet Sizing</h1>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Kelly Calculator */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6">
          <h2 className="text-white font-semibold mb-4">Kelly Criterion Calculator</h2>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 block mb-2">
                Win Probability: {(probability * 100).toFixed(0)}%
              </label>
              <input
                type="range"
                min="0.01"
                max="0.99"
                step="0.01"
                value={probability}
                onChange={e => setProbability(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="text-sm text-gray-400 block mb-2">Odds (decimal)</label>
              <input
                type="number"
                value={odds}
                onChange={e => setOdds(Number(e.target.value))}
                step="0.1"
                min="1.01"
                className="w-full bg-[#0d0d0d] border border-[#2a2a2a] rounded-lg px-4 py-2 text-white"
              />
            </div>

            <div>
              <label className="text-sm text-gray-400 block mb-2">Bankroll</label>
              <input
                type="number"
                value={bankroll}
                onChange={e => setBankroll(Number(e.target.value))}
                className="w-full bg-[#0d0d0d] border border-[#2a2a2a] rounded-lg px-4 py-2 text-white"
              />
            </div>

            <button
              onClick={calculateKelly}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg transition-colors"
            >
              Calculate Optimal Bet Size
            </button>

            {kelly && (
              <div className="mt-4 p-4 bg-[#0d0d0d] rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Kelly Fraction</span>
                  <span className="text-white font-mono">{(kelly.kelly_fraction * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Full Kelly</span>
                  <span className="text-[#00d26a] font-mono">${kelly.full_kelly.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Half Kelly (recommended)</span>
                  <span className="text-purple-400 font-mono">${kelly.half_kelly.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Quarter Kelly</span>
                  <span className="text-gray-400 font-mono">${kelly.quarter_kelly.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-[#2a2a2a]">
                  <span className="text-gray-400">Expected Value</span>
                  <span className={kelly.expected_value > 0 ? 'text-[#00d26a]' : 'text-[#ff4757]'}>
                    {kelly.expected_value > 0 ? '+' : ''}{(kelly.expected_value * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Portfolio Summary */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6">
          <h2 className="text-white font-semibold mb-4">Portfolio Summary</h2>
          
          <div className="text-center py-8">
            <div className="text-4xl font-mono text-[#00d26a] mb-2">
              ${portfolio.balance.toLocaleString()}
            </div>
            <div className="text-gray-500">Available Balance</div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="bg-[#0d0d0d] rounded-lg p-4 text-center">
              <div className="text-2xl font-mono text-white">{portfolio.positions.length}</div>
              <div className="text-xs text-gray-500">Open Positions</div>
            </div>
            <div className="bg-[#0d0d0d] rounded-lg p-4 text-center">
              <div className="text-2xl font-mono text-white">
                ${portfolio.positions.reduce((sum, p) => sum + p.cost, 0).toFixed(2)}
              </div>
              <div className="text-xs text-gray-500">Total Invested</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Alerts Page
function AlertsPage() {
  const [alerts, setAlerts] = useState([])
  const [markets, setMarkets] = useState([])
  const [selectedTicker, setSelectedTicker] = useState('')
  const [condition, setCondition] = useState('above')
  const [targetPrice, setTargetPrice] = useState(50)

  useEffect(() => {
    const load = async () => {
      try {
        const [a, m] = await Promise.all([
          fetchAPI('/alerts'),
          fetchAPI('/markets?limit=30')
        ])
        setAlerts(a)
        setMarkets(m)
      } catch (e) {
        console.error(e)
      }
    }
    load()
  }, [])

  const createAlert = async () => {
    const market = markets.find(m => m.ticker === selectedTicker)
    if (!market) return

    try {
      await fetchAPI('/alerts', {
        method: 'POST',
        body: JSON.stringify({
          ticker: selectedTicker,
          title: market.title,
          condition,
          target_price: targetPrice / 100,
          active: true
        })
      })
      const a = await fetchAPI('/alerts')
      setAlerts(a)
      setSelectedTicker('')
    } catch (e) {
      console.error(e)
    }
  }

  const deleteAlert = async (index) => {
    try {
      await fetchAPI(`/alerts/${index}`, { method: 'DELETE' })
      const a = await fetchAPI('/alerts')
      setAlerts(a)
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-white mb-2">Price Alerts</h1>
      <p className="text-gray-500 mb-6">Get notified when markets hit your targets</p>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Create Alert */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6">
          <h2 className="text-white font-semibold mb-4">Create Alert</h2>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 block mb-2">Select Market</label>
              <select
                value={selectedTicker}
                onChange={e => setSelectedTicker(e.target.value)}
                className="w-full bg-[#0d0d0d] border border-[#2a2a2a] rounded-lg px-4 py-2 text-white"
              >
                <option value="">Choose a market...</option>
                {markets.map(m => (
                  <option key={m.ticker} value={m.ticker}>{m.title}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setCondition('above')}
                className={`flex-1 py-2 rounded-lg transition-colors ${
                  condition === 'above' ? 'bg-[#00d26a] text-black' : 'bg-[#2a2a2a] text-gray-400'
                }`}
              >
                Above
              </button>
              <button
                onClick={() => setCondition('below')}
                className={`flex-1 py-2 rounded-lg transition-colors ${
                  condition === 'below' ? 'bg-[#ff4757] text-white' : 'bg-[#2a2a2a] text-gray-400'
                }`}
              >
                Below
              </button>
            </div>

            <div>
              <label className="text-sm text-gray-400 block mb-2">Target Price: {targetPrice}¢</label>
              <input
                type="range"
                min="1"
                max="99"
                value={targetPrice}
                onChange={e => setTargetPrice(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <button
              onClick={createAlert}
              disabled={!selectedTicker}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white py-2 rounded-lg transition-colors"
            >
              Create Alert
            </button>
          </div>
        </div>

        {/* Active Alerts */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6">
          <h2 className="text-white font-semibold mb-4">Active Alerts</h2>
          
          {alerts.length === 0 ? (
            <div className="text-gray-500 text-center py-12">No alerts set</div>
          ) : (
            <div className="space-y-3">
              {alerts.map((alert, i) => (
                <div key={i} className="bg-[#0d0d0d] rounded-lg p-3 flex justify-between items-center">
                  <div>
                    <div className="text-sm text-white">{alert.title}</div>
                    <div className="text-xs text-gray-500">
                      {alert.condition === 'above' ? '📈' : '📉'} {alert.condition} {(alert.target_price * 100).toFixed(0)}¢
                    </div>
                  </div>
                  <button
                    onClick={() => deleteAlert(i)}
                    className="text-gray-500 hover:text-[#ff4757] transition-colors"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Main App
export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#0d0d0d]">
        <Navbar />
        <Routes>
          <Route path="/" element={<MarketsPage />} />
          <Route path="/suggestions" element={<SuggestionsPage />} />
          <Route path="/arbitrage" element={<ArbitragePage />} />
          <Route path="/spikes" element={<VolumePage />} />
          <Route path="/paper" element={<PaperTradingPage />} />
          <Route path="/portfolio" element={<PortfolioPage />} />
          <Route path="/alerts" element={<AlertsPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
