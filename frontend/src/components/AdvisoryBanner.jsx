export default function AdvisoryBanner({ advisory }) {
  if (!advisory) return null

  return (
    <div className="rounded-2xl border p-5 flex flex-col md:flex-row md:items-center gap-4" style={{ borderColor: advisory.color, background: `${advisory.color}14` }}>
      <div className="w-14 h-14 rounded-full flex items-center justify-center font-display font-bold text-lg shrink-0" style={{ background: advisory.color, color: '#14171F' }}>
        {advisory.bucket === 'Good' ? '✓' : '!'}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-display font-semibold" style={{ color: advisory.color }}>{advisory.bucket}</span>
          <span className="text-xs font-mono" style={{ color: 'var(--text-dim)' }}>AQI {advisory.range}</span>
        </div>
        <p className="text-sm mt-1" style={{ color: 'var(--text-primary)' }}>{advisory.message}</p>
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{advisory.sensitive_groups}</p>
      </div>
    </div>
  )
}
