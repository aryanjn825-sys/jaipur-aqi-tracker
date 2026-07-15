import { useState, useEffect } from 'react'
import SkyStripHero from './components/SkyStripHero'
import TrendChart from './components/TrendChart'
import CorrelationHeatmap from './components/CorrelationHeatmap'
import SeasonalCards from './components/SeasonalCards'
import CityComparison from './components/CityComparison'
import PredictionCalculator from './components/PredictionCalculator'
import AdvisoryBanner from './components/AdvisoryBanner'
import { getTrend, getSeasonal, getCorrelation, getCityComparison, getLiveCombined, getAdvisory } from './api'

export default function App() {
  const [trend, setTrend] = useState(null)
  const [seasonal, setSeasonal] = useState(null)
  const [correlation, setCorrelation] = useState(null)
  const [cityData, setCityData] = useState(null)
  const [live, setLive] = useState(null)
  const [advisory, setAdvisory] = useState(null)
  const [liveLoading, setLiveLoading] = useState(true)
  const [trendDays, setTrendDays] = useState(180)

  useEffect(() => {
    getSeasonal().then(setSeasonal).catch(() => {})
    getCorrelation().then(setCorrelation).catch(() => {})
    getCityComparison().then(setCityData).catch(() => {})
    getLiveCombined('Jaipur')
      .then(d => {
        setLive(d)
        const aqiVal = d?.aqi?.aqi
        if (aqiVal != null) getAdvisory(aqiVal).then(setAdvisory).catch(() => {})
      })
      .catch(() => {})
      .finally(() => setLiveLoading(false))
  }, [])

  useEffect(() => {
    getTrend(trendDays).then(setTrend).catch(() => {})
  }, [trendDays])

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-deep)' }}>
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 space-y-6">

        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg" style={{ background: 'linear-gradient(135deg, var(--sky-clear), var(--marigold))' }} />
            <span className="font-display font-semibold tracking-tight">Jaipur AQI Tracker</span>
          </div>
          <nav className="hidden md:flex gap-6 text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
            <a href="#trend" className="hover:text-white transition-colors">Trend</a>
            <a href="#correlation" className="hover:text-white transition-colors">Correlation</a>
            <a href="#compare" className="hover:text-white transition-colors">Cities</a>
            <a href="#predict" className="hover:text-white transition-colors">Predict</a>
          </nav>
        </header>

        <SkyStripHero live={live} loading={liveLoading} />

        {advisory && <AdvisoryBanner advisory={advisory} />}

        <section id="trend">
          <div className="flex items-center gap-2 mb-2">
            {[30, 90, 180, 365].map(d => (
              <button
                key={d}
                onClick={() => setTrendDays(d)}
                className="text-xs font-mono px-3 py-1 rounded-full border transition-colors"
                style={{
                  borderColor: 'var(--border-soft)',
                  background: trendDays === d ? 'var(--marigold)' : 'transparent',
                  color: trendDays === d ? '#14171F' : 'var(--text-muted)',
                }}
              >
                {d}d
              </button>
            ))}
          </div>
          <TrendChart data={trend?.data} />
        </section>

        <div className="grid md:grid-cols-2 gap-6">
          <SeasonalCards seasonal={seasonal} />
          <div id="correlation">
            <CorrelationHeatmap correlation={correlation} />
          </div>
        </div>

        <section id="compare">
          <CityComparison cityData={cityData} />
        </section>

        <section id="predict">
          <PredictionCalculator />
        </section>

        <footer className="text-center text-xs font-mono py-6" style={{ color: 'var(--text-dim)' }}>
          Data: CPCB via Kaggle (2017–2020 historical) · WAQI + Open-Meteo (live) · Built by Aryan
        </footer>
      </div>
    </div>
  )
}
