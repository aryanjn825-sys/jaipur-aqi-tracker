import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, ComposedChart } from 'recharts'
import { aqiColor } from '../utils/aqi'

export default function TrendChart({ data }) {
  const chartData = (data || []).filter(d => d.aqi != null).map(d => ({
    date: d.date.slice(5), // MM-DD
    aqi: d.aqi,
    rolling: d.rolling_30d,
  }))

  return (
    <div className="rounded-2xl border p-5" style={{ borderColor: 'var(--border-soft)', background: 'var(--bg-panel)' }}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display text-lg font-semibold">AQI Trend</h3>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Daily readings with 30-day rolling average</p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="aqiFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--marigold)" stopOpacity={0.35} />
              <stop offset="95%" stopColor="var(--marigold)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-soft)" vertical={false} />
          <XAxis dataKey="date" stroke="var(--text-dim)" tick={{ fontSize: 11, fontFamily: 'JetBrains Mono' }} interval={Math.floor(chartData.length / 8)} />
          <YAxis stroke="var(--text-dim)" tick={{ fontSize: 11, fontFamily: 'JetBrains Mono' }} />
          <Tooltip
            contentStyle={{ background: 'var(--bg-panel-hover)', border: '1px solid var(--border-soft)', borderRadius: 8, fontFamily: 'JetBrains Mono', fontSize: 12 }}
            labelStyle={{ color: 'var(--text-muted)' }}
          />
          <Area type="monotone" dataKey="aqi" stroke="var(--sky-mid)" strokeWidth={1} fill="url(#aqiFill)" name="Daily AQI" />
          <Line type="monotone" dataKey="rolling" stroke="var(--marigold)" strokeWidth={2.5} dot={false} name="30-day avg" />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
