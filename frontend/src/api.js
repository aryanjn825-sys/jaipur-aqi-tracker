import axios from 'axios'

const api = axios.create({ baseURL: '/api', timeout: 15000 })

export const getTrend = (days = 365) => api.get(`/historical/trend?days=${days}`).then(r => r.data)
export const getSeasonal = () => api.get('/historical/seasonal').then(r => r.data)
export const getCorrelation = () => api.get('/historical/correlation').then(r => r.data)
export const getCityComparison = () => api.get('/historical/city-comparison').then(r => r.data)
export const getMonthlyAvg = () => api.get('/historical/monthly-avg').then(r => r.data)

export const getPredictDefaults = () => api.get('/predict/defaults').then(r => r.data)
export const getModelInfo = () => api.get('/predict/model-info').then(r => r.data)
export const postPredict = (payload) => api.post('/predict', payload).then(r => r.data)

export const getLiveCombined = (city = 'Jaipur') => api.get(`/live/combined?city=${city}`).then(r => r.data)

export const getAdvisory = (aqi) => api.get(`/advisory?aqi=${aqi}`).then(r => r.data)
export const getAdvisoryTable = () => api.get('/advisory/table').then(r => r.data)

export default api
