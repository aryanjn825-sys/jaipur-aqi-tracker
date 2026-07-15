import { useState, useEffect } from 'react'
import { getPredictDefaults, postPredict } from '../api'
import { aqiColor } from '../utils/aqi'

const LABELS = {
  'PM2.5': 'PM2.5', 'PM10': 'PM10', 'NO': 'NO', 'NO2': 'NO2', 'NOx': 'NOx',
  'NH3': 'NH3', 'CO': 'CO', 'SO2': 'SO2', 'O3': 'O3', 'Benzene': 'Benzene', 'Toluene': 'Toluene',
}

export default function PredictionCalculator() {
  const [values, setValues] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getPredictDefaults().then(d => setValues(d.defaults)).catch(() => {})
  }, [])

  const handleChange = (key, val) => {
    setValues(v => ({ ...v, [key]: parseFloat(val) || 0 }))
  }

  const runPrediction = async () => {
    setLoading(true)
    try {
      const r = await postPredict(values)
      setResult(r)
    } catch (e) {
      setResult(null)
    }
    setLoading(false)
  }

  if (!values) return null

  return (
    <div className="rounded-2xl border p-5" style={{ borderColor: 'var(--border-soft)', background: 'var(--bg-panel)' }}>
      <h3 className="font-display text-lg font-semibold mb-1">AQI Predictor</h3>
      <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
        Adjust pollutant levels (µg/m³) and predict AQI using a Random Forest model trained on Jaipur data
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
        {Object.keys(LABELS).map(key => (
          <label key={key} className="text-xs font-mono">
            <span style={{ color: 'var(--text-dim)' }}>{LABELS[key]}</span>
            <input
              type="number"
              step="0.1"
              value={values[key]}
              onChange={e => handleChange(key, e.target.value)}
              className="w-full mt-1 rounded-md px-2 py-1.5 outline-none border"
              style={{ background: 'var(--bg-panel-hover)', borderColor: 'var(--border-soft)', color: 'var(--text-primary)' }}
            />
          </label>
        ))}
      </div>

      <button
        onClick={runPrediction}
        disabled={loading}
        className="font-display text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
        style={{ background: 'var(--marigold)', color: '#14171F' }}
      >
        {loading ? 'Predicting…' : 'Predict AQI'}
      </button>

      {result && (
        <div className="mt-4 p-4 rounded-xl border flex items-center justify-between" style={{ borderColor: 'var(--border-soft)', background: 'var(--bg-panel-hover)' }}>
          <div>
            <div className="text-xs font-mono" style={{ color: 'var(--text-dim)' }}>Predicted AQI</div>
            <div className="font-display text-3xl font-bold" style={{ color: aqiColor(result.predicted_aqi) }}>
              {result.predicted_aqi}
            </div>
          </div>
          <div className="font-display text-sm px-3 py-1.5 rounded-full" style={{ background: aqiColor(result.predicted_aqi), color: '#14171F' }}>
            {result.bucket}
          </div>
        </div>
      )}
    </div>
  )
}
