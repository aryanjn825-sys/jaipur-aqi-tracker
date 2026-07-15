from fastapi import APIRouter, Query

router = APIRouter()

ADVISORY_TABLE = {
    "Good": {
        "range": "0-50",
        "color": "#2ecc71",
        "message": "Air quality is satisfactory. Enjoy outdoor activities freely.",
        "sensitive_groups": "No precautions needed.",
    },
    "Satisfactory": {
        "range": "51-100",
        "color": "#8bc34a",
        "message": "Air quality is acceptable. Minor breathing discomfort possible for unusually sensitive people.",
        "sensitive_groups": "Consider reducing prolonged outdoor exertion if you have respiratory conditions.",
    },
    "Moderate": {
        "range": "101-200",
        "color": "#f1c40f",
        "message": "Breathing discomfort possible for people with lung, asthma, or heart conditions.",
        "sensitive_groups": "Children, elderly, and those with asthma/heart disease should limit prolonged outdoor exertion.",
    },
    "Poor": {
        "range": "201-300",
        "color": "#e67e22",
        "message": "Breathing discomfort for most people on prolonged exposure.",
        "sensitive_groups": "Avoid outdoor exercise. Sensitive groups should stay indoors with air purification if possible.",
    },
    "Very Poor": {
        "range": "301-400",
        "color": "#e74c3c",
        "message": "Respiratory illness on prolonged exposure. Effects noticeable even on short exposure.",
        "sensitive_groups": "Everyone should avoid outdoor activity. Sensitive groups should remain indoors.",
    },
    "Severe": {
        "range": "401-500",
        "color": "#8b0000",
        "message": "Affects healthy people and seriously impacts those with existing diseases.",
        "sensitive_groups": "Avoid all outdoor exertion. Use N95 mask if you must go out. Sensitive groups should seek medical advice if symptoms appear.",
    },
}


def bucket_of(aqi: float) -> str:
    if aqi <= 50:
        return "Good"
    elif aqi <= 100:
        return "Satisfactory"
    elif aqi <= 200:
        return "Moderate"
    elif aqi <= 300:
        return "Poor"
    elif aqi <= 400:
        return "Very Poor"
    return "Severe"


@router.get("")
def get_advisory(aqi: float = Query(..., ge=0, le=600, description="Current or predicted AQI value")):
    bucket = bucket_of(aqi)
    info = ADVISORY_TABLE[bucket]
    return {"aqi": aqi, "bucket": bucket, **info}


@router.get("/table")
def get_full_table():
    """Full advisory reference table, for a legend/key in the UI."""
    return ADVISORY_TABLE
