# Jaipur AQI & Weather Correlation Tracker

Full-stack dashboard: FastAPI backend + React/Vite frontend, reusing your placement-dashboard stack.

## What's inside

**Backend (FastAPI)**
- `/api/historical/*` — trend, seasonal stats (t-test, chi-square), correlation matrix, city comparison (26 cities), all precomputed from your Jupyter notebook's cleaned Jaipur CSV + the full CPCB dataset
- `/api/predict` — Random Forest model (R²=0.881, MAE=13.82) trained on Jaipur pollutant data, same model logic from the notebook, now served live
- `/api/live/*` — WAQI (real-time AQI) + Open-Meteo (weather, free/no-key) for the live hero section
- `/api/advisory` — rule-based health advisory by AQI bucket

**Frontend (React + Vite + Tailwind v4 + Recharts)**
- Dusk-sky design system: deep indigo background, marigold accent (nod to Jaipur/Rajasthan, not the generic AI terracotta look)
- Signature element: the **Sky Strip** — a live gradient bar (clear blue → hazy amber → smog red) with a marker showing today's actual AQI position
- Trend chart, correlation heatmap (custom grid, not a generic library heatmap), seasonal cards with significance tests, city ranking + comparison chart, interactive AQI predictor form, health advisory banner

## Setup

### 1. Backend

```bash
cd backend
pip install -r requirements.txt

# Get a free WAQI token (30 seconds): https://aqicn.org/data-platform/token/
export WAQI_TOKEN=your_token_here   # Windows PowerShell: $env:WAQI_TOKEN="your_token_here"

uvicorn app.main:app --reload --port 8000
```
Visit http://localhost:8000/docs for interactive API docs.

Without `WAQI_TOKEN` set, the app still runs fully — the live AQI card just shows an inline message; weather (Open-Meteo) works with no key at all.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```
Visit http://localhost:5173 — the Vite dev server proxies `/api` calls to `localhost:8000` (see `vite.config.js`).

### 3. Regenerating the model / precomputed data (optional)

If you update the dataset, re-run:
```bash
cd backend
python3 app/models/prepare_data.py
```
This retrains the Random Forest model and regenerates `city_comparison.json`, `correlation.json`, `seasonal_stats.json`, `feature_defaults.json`.

## Deployment (same pattern as your placement dashboard)

- Backend → Render/Railway (set `WAQI_TOKEN` as an environment variable there)
- Frontend → Vercel (set `VITE_API_URL` if you split the domains, or keep the Vite proxy pattern via a rewrite rule)

## Data sources

- Historical: CPCB "Air Quality Data in India (2015–2020)" (your uploaded `city_day.csv`, cleaned in your notebook)
- Live AQI: WAQI (aqicn.org) — free tier
- Live weather: Open-Meteo — free, no key required
