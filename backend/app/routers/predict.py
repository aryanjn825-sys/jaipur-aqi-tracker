import json
from pathlib import Path
import joblib
import pandas as pd
from fastapi import APIRouter
from pydantic import BaseModel, Field

router = APIRouter()

BASE = Path(__file__).resolve().parent.parent
_bundle = joblib.load(BASE / "models" / "aqi_model.joblib")
_model = _bundle["model"]
_features = _bundle["features"]

with open(BASE / "data" / "feature_defaults.json") as f:
    _defaults_info = json.load(f)


class PollutantInput(BaseModel):
    pm25: float = Field(..., alias="PM2.5", ge=0)
    pm10: float = Field(..., alias="PM10", ge=0)
    no: float = Field(..., alias="NO", ge=0)
    no2: float = Field(..., alias="NO2", ge=0)
    nox: float = Field(..., alias="NOx", ge=0)
    nh3: float = Field(..., alias="NH3", ge=0)
    co: float = Field(..., alias="CO", ge=0)
    so2: float = Field(..., alias="SO2", ge=0)
    o3: float = Field(..., alias="O3", ge=0)
    benzene: float = Field(..., alias="Benzene", ge=0)
    toluene: float = Field(..., alias="Toluene", ge=0)

    class Config:
        populate_by_name = True


def aqi_bucket(aqi: float) -> str:
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


@router.get("/defaults")
def get_defaults():
    """Median pollutant values from Jaipur historical data — sensible pre-fill for the prediction form."""
    return _defaults_info


@router.get("/model-info")
def get_model_info():
    return {
        "model_type": "RandomForestRegressor",
        "features": _features,
        "r2_score": _defaults_info["r2"],
        "mae": _defaults_info["mae"],
        "trained_on": "Jaipur CPCB daily data (2017-2020)",
    }


@router.post("")
def predict_aqi(payload: PollutantInput):
    """Predict AQI from raw pollutant concentrations."""
    row = payload.model_dump(by_alias=True)
    X = pd.DataFrame([[row[f] for f in _features]], columns=_features)
    pred = float(_model.predict(X)[0])
    pred = round(max(pred, 0), 1)
    return {
        "predicted_aqi": pred,
        "bucket": aqi_bucket(pred),
        "input": row,
    }
