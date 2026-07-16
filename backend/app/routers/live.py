import os
import time
import httpx
from fastapi import APIRouter, HTTPException

router = APIRouter()

WAQI_TOKEN = os.environ.get("WAQI_TOKEN", "")
JAIPUR_LAT = 26.9124
JAIPUR_LON = 75.7873

# Simple in-memory cache: {(lat, lon): (timestamp, data)}
_weather_cache = {}
_WEATHER_CACHE_TTL = 900  # 15 minutes — weather doesn't need to be fetched more often than this

_aqi_cache = {}
_AQI_CACHE_TTL = 600  # 10 minutes — WAQI station readings don't update faster than this anyway

# City name -> WAQI station search term. Adjust if your token resolves a different station id.
CITY_STATIONS = {
    "Jaipur": "jaipur",
    "Jodhpur": "jodhpur",
    "Udaipur": "udaipur",
    "Kota": "kota",
}


@router.get("/aqi")
async def get_live_aqi(city: str = "Jaipur"):
    """Live AQI from WAQI (aqicn.org). Requires WAQI_TOKEN env var (free at aqicn.org/data-platform/token).
    Cached for 10 minutes per city to reduce load on the shared free-tier quota."""
    cached = _aqi_cache.get(city)
    if cached and (time.time() - cached[0]) < _AQI_CACHE_TTL:
        return cached[1]

    if not WAQI_TOKEN:
        raise HTTPException(
            status_code=503,
            detail="WAQI_TOKEN not configured on the server. Get a free token at https://aqicn.org/data-platform/token/ and set it as an environment variable.",
        )
    station = CITY_STATIONS.get(city, city.lower())
    url = f"https://api.waqi.info/feed/{station}/?token={WAQI_TOKEN}"

    last_error = None
    data = None
    for attempt in range(2):
        try:
            async with httpx.AsyncClient(timeout=20) as client:
                resp = await client.get(url)
            data = resp.json()
            break
        except httpx.TimeoutException:
            last_error = "WAQI request timed out"
        except httpx.RequestError as e:
            last_error = f"WAQI network error: {e}"

    if data is None:
        if cached:
            return cached[1]
        raise HTTPException(status_code=502, detail=last_error or "WAQI request failed")

    if data.get("status") != "ok":
        if cached:
            return cached[1]
        raise HTTPException(status_code=502, detail=f"WAQI error: {data.get('data')}")

    d = data["data"]
    iaqi = d.get("iaqi", {})
    result = {
        "city": city,
        "aqi": d.get("aqi"),
        "dominant_pollutant": d.get("dominentpol"),
        "station": d.get("city", {}).get("name"),
        "updated": d.get("time", {}).get("s"),
        "pollutants": {k: v.get("v") for k, v in iaqi.items()},
        "coordinates": d.get("city", {}).get("geo"),
    }
    _aqi_cache[city] = (time.time(), result)
    return result


@router.get("/weather")
async def get_live_weather(lat: float = JAIPUR_LAT, lon: float = JAIPUR_LON):
    """Live + hourly forecast weather from Open-Meteo (free, no API key required).
    Cached for 15 minutes per coordinate pair to stay well under Open-Meteo's shared-IP rate limit."""
    cache_key = (round(lat, 4), round(lon, 4))
    cached = _weather_cache.get(cache_key)
    if cached and (time.time() - cached[0]) < _WEATHER_CACHE_TTL:
        return cached[1]

    url = (
        "https://api.open-meteo.com/v1/forecast"
        f"?latitude={lat}&longitude={lon}"
        "&current=temperature_2m,relative_humidity_2m,wind_speed_10m,surface_pressure,precipitation"
        "&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m"
        "&timezone=Asia%2FKolkata&forecast_days=2"
    )

    last_error = None
    for attempt in range(2):  # try once, retry once on transient failure
        try:
            async with httpx.AsyncClient(timeout=20) as client:
                resp = await client.get(url)
            if resp.status_code == 200:
                data = resp.json()
                current = data.get("current", {})
                result = {
                    "temperature_c": current.get("temperature_2m"),
                    "humidity_pct": current.get("relative_humidity_2m"),
                    "wind_speed_kmh": current.get("wind_speed_10m"),
                    "pressure_hpa": current.get("surface_pressure"),
                    "precipitation_mm": current.get("precipitation"),
                    "updated": current.get("time"),
                    "hourly_forecast": data.get("hourly"),
                }
                _weather_cache[cache_key] = (time.time(), result)
                return result
            last_error = f"Open-Meteo returned HTTP {resp.status_code}: {resp.text[:200]}"
        except httpx.TimeoutException:
            last_error = "Open-Meteo request timed out"
        except httpx.RequestError as e:
            last_error = f"Open-Meteo network error: {e}"

    # If we have a stale cached value, serve it rather than fail outright
    if cached:
        return cached[1]

    raise HTTPException(status_code=502, detail=last_error or "Open-Meteo request failed")


@router.get("/combined")
async def get_combined(city: str = "Jaipur"):
    """AQI + weather in a single call, for the dashboard hero section."""
    aqi_data, weather_data, aqi_error, weather_error = None, None, None, None
    try:
        aqi_data = await get_live_aqi(city)
    except Exception as e:
        aqi_error = str(e) if not isinstance(e, HTTPException) else e.detail

    try:
        weather_data = await get_live_weather()
    except Exception as e:
        weather_error = str(e) if not isinstance(e, HTTPException) else e.detail

    return {"aqi": aqi_data, "aqi_error": aqi_error, "weather": weather_data, "weather_error": weather_error}