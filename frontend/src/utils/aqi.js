export function aqiBucket(aqi) {
  if (aqi == null) return 'Unknown'
  if (aqi <= 50) return 'Good'
  if (aqi <= 100) return 'Satisfactory'
  if (aqi <= 200) return 'Moderate'
  if (aqi <= 300) return 'Poor'
  if (aqi <= 400) return 'Very Poor'
  return 'Severe'
}

export function aqiColor(aqi) {
  if (aqi == null) return '#565C74'
  if (aqi <= 50) return '#4FBF7F'
  if (aqi <= 100) return '#A3CC5C'
  if (aqi <= 200) return '#E8C93D'
  if (aqi <= 300) return '#E8A33D'
  if (aqi <= 400) return '#E0703D'
  return '#C0392B'
}

// Position (0-100%) along the sky-strip gradient for a given AQI (capped at 500 scale)
export function aqiPosition(aqi) {
  if (aqi == null) return 0
  return Math.min(100, Math.max(0, (aqi / 500) * 100))
}
