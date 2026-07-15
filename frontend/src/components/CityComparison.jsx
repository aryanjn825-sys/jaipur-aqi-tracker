import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const CITY_COLORS = {
  Jaipur: '#E8A33D',
  Delhi: '#C0392B',
  Lucknow: '#4A7FE0',
  Hyderabad: '#4FBF7F',
  Chennai: '#A3CC5C',
  Mumbai: '#7FA6E8',
}

export default function CityComparison({ cityData }) {
  if (!cityData) return null
  const { rankings, jaipur_rank, total_cities, monthly_trends } = cityData

  // Reshape monthly_trends (per-city arrays) into one array keyed by month
  const months = monthly_trends.Jaipur.map(d => d.month)
  const merged = months.map(m => {
    const row = { month: m.slice(2) }
    Object.keys(monthly_trends).forEach(city => {
      const found = monthly_trends[city].find(d => d.month === m)
      if (found) row[city] = found.aqi
    })
    return row
  })

  const top8 = rankings.slice(0, 8)

  return (
    <div className="rounded-2xl border p-5" style={{ borderColor: 'var(--border-soft)', background: 'var(--bg-panel)' }}>
      <div className="flex items-baseline justify-between mb-4">
        <div>
          <h3 className="font-display text-lg font-semibold">City Comparison</h3>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Jaipur ranks <span className="font-mono" style={{ color: 'var(--marigold)' }}>#{jaipur_rank}</span> of {total_cities} cities (worst→best)
          </p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={merged} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-soft)" vertical={false} />
          <XAxis dataKey="month" stroke="var(--text-dim)" tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }} />
          <YAxis stroke="var(--text-dim)" tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }} />
          <Tooltip contentStyle={{ background: 'var(--bg-panel-hover)', border: '1px solid var(--border-soft)', borderRadius: 8, fontSize: 11 }} />
          <Legend wrapperStyle={{ fontSize: 11, fontFamily: 'JetBrains Mono' }} />
          {Object.keys(monthly_trends).map(city => (
            <Line key={city} type="monotone" dataKey={city} stroke={CITY_COLORS[city] || '#888'} strokeWidth={city === 'Jaipur' ? 3 : 1.5} dot={false} />
          ))}
        </LineChart>
      </ResponsiveContainer>

      <div className="mt-4 space-y-1">
        {top8.map(c => (
          <div key={c.city} className="flex items-center gap-3 text-xs font-mono">
            <span className="w-6 text-right" style={{ color: 'var(--text-dim)' }}>{c.rank}</span>
            <span className={`flex-1 ${c.is_jaipur ? 'font-bold' : ''}`} style={{ color: c.is_jaipur ? 'var(--marigold)' : 'var(--text-muted)' }}>
              {c.city}
            </span>
            <div className="w-32 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-panel-hover)' }}>
              <div className="h-full rounded-full" style={{ width: `${Math.min(100, c.avg_aqi / 3)}%`, background: c.is_jaipur ? 'var(--marigold)' : 'var(--text-dim)' }} />
            </div>
            <span style={{ color: 'var(--text-muted)' }}>{c.avg_aqi}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
