const SEASON_META = {
  Winter: { icon: '❄', color: 'var(--sky-clear)' },
  Summer: { icon: '☀', color: 'var(--haze-amber)' },
  Monsoon: { icon: '☔', color: 'var(--good)' },
  'Post-Monsoon': { icon: '🍂', color: 'var(--moderate)' },
}

export default function SeasonalCards({ seasonal }) {
  if (!seasonal) return null
  const { season_avg_aqi, stats_tests } = seasonal

  return (
    <div className="rounded-2xl border p-5" style={{ borderColor: 'var(--border-soft)', background: 'var(--bg-panel)' }}>
      <h3 className="font-display text-lg font-semibold mb-1">Seasonal Patterns</h3>
      <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>Average AQI by season, statistically tested</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Object.entries(season_avg_aqi).map(([season, avg]) => {
          const meta = SEASON_META[season] || {}
          return (
            <div key={season} className="rounded-xl p-4 border" style={{ borderColor: 'var(--border-soft)', background: 'var(--bg-panel-hover)' }}>
              <div className="text-2xl mb-1">{meta.icon}</div>
              <div className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>{season}</div>
              <div className="font-display text-2xl font-semibold mt-1" style={{ color: meta.color }}>{avg}</div>
            </div>
          )
        })}
      </div>

      <div className="mt-4 pt-4 border-t space-y-2" style={{ borderColor: 'var(--border-soft)' }}>
        <StatLine
          label="Winter vs Monsoon AQI"
          result={stats_tests.winter_vs_monsoon_ttest.significant}
          pValue={stats_tests.winter_vs_monsoon_ttest.p_value}
          test="t-test"
        />
        <StatLine
          label="Season → AQI category"
          result={stats_tests.season_bucket_chi2.significant}
          pValue={stats_tests.season_bucket_chi2.p_value}
          test="chi-square"
        />
      </div>
    </div>
  )
}

function StatLine({ label, result, pValue, test }) {
  return (
    <div className="flex items-center justify-between text-xs font-mono">
      <span style={{ color: 'var(--text-muted)' }}>{label} <span className="opacity-60">({test})</span></span>
      <span style={{ color: result ? 'var(--good)' : 'var(--text-dim)' }}>
        {result ? 'Significant' : 'Not significant'} · p={pValue < 0.001 ? pValue.toExponential(1) : pValue.toFixed(3)}
      </span>
    </div>
  )
}
