import { Fragment } from 'react'

export default function CorrelationHeatmap({ correlation }) {
  if (!correlation) return null
  const { columns, matrix } = correlation

  const colorFor = (v) => {
    // -1 (blue) -> 0 (panel) -> 1 (marigold/red)
    if (v >= 0) {
      const t = Math.min(1, v)
      const r = Math.round(22 + t * (192 - 22))
      const g = Math.round(26 + t * (57 - 26))
      const b = Math.round(40 + t * (43 - 40))
      return `rgb(${r},${Math.round(26 + t * (163 - 26))},${Math.round(40 + t * (61 - 40))})`
    }
    const t = Math.min(1, -v)
    return `rgb(${Math.round(22 + t * (74 - 22))},${Math.round(26 + t * (127 - 26))},${Math.round(40 + t * (224 - 40))})`
  }

  return (
    <div className="rounded-2xl border p-5 overflow-x-auto" style={{ borderColor: 'var(--border-soft)', background: 'var(--bg-panel)' }}>
      <h3 className="font-display text-lg font-semibold mb-1">Pollutant Correlation</h3>
      <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>How pollutants move together and with overall AQI</p>
      <div className="inline-block min-w-full">
        <div className="grid" style={{ gridTemplateColumns: `100px repeat(${columns.length}, 40px)` }}>
          <div />
          {columns.map(c => (
            <div key={c} className="text-[9px] font-mono text-center -rotate-45 origin-bottom-left h-16 flex items-end justify-center pb-1" style={{ color: 'var(--text-dim)' }}>
              {c}
            </div>
          ))}
          {matrix.map((row, i) => (
            <Fragment key={i}>
              <div className="text-[10px] font-mono flex items-center pr-2" style={{ color: 'var(--text-muted)' }}>
                {columns[i]}
              </div>
              {row.map((v, j) => (
                <div
                  key={`${i}-${j}`}
                  title={`${columns[i]} × ${columns[j]}: ${v.toFixed(2)}`}
                  className="w-10 h-10 flex items-center justify-center text-[9px] font-mono border"
                  style={{ background: colorFor(v), borderColor: 'var(--bg-deep)', color: Math.abs(v) > 0.5 ? '#fff' : 'var(--text-muted)' }}
                >
                  {v.toFixed(1)}
                </div>
              ))}
            </Fragment>
          ))}
        </div>
      </div>
    </div>
  )
}
