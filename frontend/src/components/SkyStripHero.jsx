import { aqiBucket, aqiColor, aqiPosition } from '../utils/aqi'

export default function SkyStripHero({ live, loading }) {
  const aqi = live?.aqi?.aqi
  const bucket = aqiBucket(aqi)
  const color = aqiColor(aqi)
  const pos = aqiPosition(aqi ?? 0)
  const weather = live?.weather

  return (
    <div className="rounded-2xl overflow-hidden border" style={{ borderColor: 'var(--border-soft)', background: 'var(--bg-panel)' }}>
      <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] font-mono" style={{ color: 'var(--text-dim)' }}>
            Live · Jaipur, Rajasthan
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-semibold mt-2">
            Sky Report
          </h1>
          <p className="mt-2 text-sm max-w-md" style={{ color: 'var(--text-muted)' }}>
            Where today's air sits between clear sky and full haze — pulled live from ground monitoring stations.
          </p>
        </div>

        <div className="flex items-end gap-8">
          <div>
            <div className="font-mono text-6xl font-bold leading-none" style={{ color }}>
              {loading ? '···' : aqi ?? '—'}
            </div>
            <div className="font-display text-sm mt-1" style={{ color }}>
              {loading ? 'Loading' : bucket}
            </div>
          </div>
          {weather && (
            <div className="hidden sm:flex flex-col gap-1 text-sm font-mono" style={{ color: 'var(--text-muted)' }}>
              <span>{weather.temperature_c != null ? `${Math.round(weather.temperature_c)}°C` : '—'}</span>
              <span>{weather.humidity_pct != null ? `${weather.humidity_pct}% humidity` : '—'}</span>
              <span>{weather.wind_speed_kmh != null ? `${weather.wind_speed_kmh} km/h wind` : '—'}</span>
            </div>
          )}
        </div>
      </div>

      {/* Signature element: the Sky Strip gradient */}
      <div className="relative h-16 md:h-20" style={{
        background: 'linear-gradient(90deg, #4A7FE0 0%, #7FA6E8 15%, #A3CC5C 30%, #E8C93D 50%, #E8A33D 68%, #E0703D 82%, #C0392B 100%)'
      }}>
        <div
          className="absolute top-0 bottom-0 w-[2px] bg-white transition-all duration-700"
          style={{ left: `${pos}%` }}
        >
          <div className="absolute -top-1 -left-[7px] w-4 h-4 rounded-full bg-white shadow-lg" />
        </div>
        <div className="absolute inset-0 flex items-center justify-between px-4 text-[10px] font-mono uppercase tracking-wider text-black/50">
          <span>Clear</span>
          <span>Moderate</span>
          <span>Severe</span>
        </div>
      </div>

      {live?.aqi_error && (
        <div className="px-6 py-3 text-xs font-mono" style={{ background: 'var(--bg-panel-hover)', color: 'var(--text-dim)' }}>
          Live AQI unavailable: {live.aqi_error}
        </div>
      )}
    </div>
  )
}
