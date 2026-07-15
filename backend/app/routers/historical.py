import json
from pathlib import Path
import pandas as pd
from fastapi import APIRouter, Query, HTTPException

router = APIRouter()

DATA = Path(__file__).resolve().parent.parent / "data"

_jaipur_df = pd.read_csv(DATA / "jaipur_aqi_cleaned.csv", parse_dates=["Date"])
with open(DATA / "correlation.json") as f:
    _correlation = json.load(f)
with open(DATA / "seasonal_stats.json") as f:
    _seasonal = json.load(f)
with open(DATA / "city_comparison.json") as f:
    _city_comparison = json.load(f)


@router.get("/trend")
def get_trend(days: int = Query(default=365, ge=7, le=2000, description="Number of most recent days to return")):
    """Daily AQI trend with 30-day rolling average, most recent `days` days."""
    df = _jaipur_df.sort_values("Date").copy()
    df["rolling_30d"] = df["AQI"].rolling(30, min_periods=1).mean().round(1)
    df = df.tail(days)
    return {
        "count": len(df),
        "data": [
            {
                "date": row["Date"].strftime("%Y-%m-%d"),
                "aqi": None if pd.isna(row["AQI"]) else round(row["AQI"], 1),
                "rolling_30d": row["rolling_30d"],
                "bucket": row["AQI_Bucket"],
            }
            for _, row in df.iterrows()
        ],
    }


@router.get("/seasonal")
def get_seasonal():
    """Average AQI by season, AQI bucket distribution, and significance tests."""
    return _seasonal


@router.get("/correlation")
def get_correlation():
    """Full pollutant correlation matrix + ranked correlation with AQI."""
    return _correlation


@router.get("/city-comparison")
def get_city_comparison():
    """Jaipur's rank among 26 Indian cities + monthly trend comparison."""
    return _city_comparison


@router.get("/monthly-avg")
def get_monthly_avg():
    """Jaipur monthly average AQI, for a bar/line chart."""
    df = _jaipur_df.copy()
    df["YearMonth"] = df["Date"].dt.to_period("M").astype(str)
    monthly = df.groupby("YearMonth")["AQI"].mean().dropna().round(1)
    return {"data": [{"month": k, "aqi": v} for k, v in monthly.items()]}


@router.get("/pollutant-distribution")
def get_pollutant_distribution(pollutant: str = Query(default="PM2.5")):
    """Histogram-ready distribution values for a given pollutant."""
    valid = ["PM2.5", "PM10", "NO", "NO2", "NOx", "NH3", "CO", "SO2", "O3", "Benzene", "Toluene"]
    if pollutant not in valid:
        raise HTTPException(status_code=400, detail=f"pollutant must be one of {valid}")
    values = _jaipur_df[pollutant].dropna().round(2).tolist()
    return {"pollutant": pollutant, "values": values, "count": len(values)}
