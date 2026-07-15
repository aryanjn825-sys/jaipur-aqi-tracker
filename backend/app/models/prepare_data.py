"""
Run once to:
1. Precompute city comparison stats (avg AQI, rank, monthly trend) -> data/city_comparison.json
2. Train RandomForest AQI prediction model on Jaipur data -> models/aqi_model.joblib
3. Precompute correlation matrix -> data/correlation.json
4. Precompute seasonal stats -> data/seasonal_stats.json
"""
import pandas as pd
import numpy as np
import json
from pathlib import Path
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score, mean_absolute_error
from scipy import stats
import joblib

BASE = Path(__file__).resolve().parent.parent  # app/
DATA = BASE / "data"

FEATURES = ['PM2.5', 'PM10', 'NO', 'NO2', 'NOx', 'NH3', 'CO', 'SO2', 'O3', 'Benzene', 'Toluene']

def season_of(month):
    if month in [12, 1, 2]:
        return 'Winter'
    elif month in [3, 4, 5]:
        return 'Summer'
    elif month in [6, 7, 8, 9]:
        return 'Monsoon'
    return 'Post-Monsoon'

def main():
    jaipur = pd.read_csv(DATA / "jaipur_aqi_cleaned.csv", parse_dates=['Date'])
    full = pd.read_csv(DATA / "city_day.csv", parse_dates=['Date'])

    # ---------- 1. City comparison ----------
    city_avg = full.groupby('City')['AQI'].mean().dropna().sort_values(ascending=False)
    city_rank = {city: rank + 1 for rank, city in enumerate(city_avg.index)}

    trend_cities = ['Jaipur', 'Delhi', 'Lucknow', 'Hyderabad', 'Chennai', 'Mumbai']
    monthly_trends = {}
    for city in trend_cities:
        cdf = full[full['City'] == city].sort_values('Date').copy()
        cdf['YearMonth'] = cdf['Date'].dt.to_period('M').astype(str)
        m = cdf.groupby('YearMonth')['AQI'].mean().dropna()
        monthly_trends[city] = [{"month": k, "aqi": round(v, 1)} for k, v in m.items()]

    city_comparison = {
        "rankings": [
            {"city": c, "avg_aqi": round(v, 1), "rank": city_rank[c], "is_jaipur": c == "Jaipur"}
            for c, v in city_avg.items()
        ],
        "total_cities": len(city_avg),
        "jaipur_rank": city_rank.get("Jaipur"),
        "monthly_trends": monthly_trends,
    }
    with open(DATA / "city_comparison.json", "w") as f:
        json.dump(city_comparison, f)
    print(f"City comparison saved. Jaipur rank: {city_rank.get('Jaipur')}/{len(city_avg)}")

    # ---------- 2. Correlation matrix ----------
    corr_cols = FEATURES + ['AQI']
    corr = jaipur[corr_cols].corr().round(3)
    correlation_json = {
        "columns": corr_cols,
        "matrix": corr.values.tolist(),
        "aqi_correlations": corr['AQI'].drop('AQI').sort_values(ascending=False).round(3).to_dict(),
    }
    with open(DATA / "correlation.json", "w") as f:
        json.dump(correlation_json, f)
    print("Correlation matrix saved.")

    # ---------- 3. Seasonal stats ----------
    jdf = jaipur.copy()
    jdf['Season'] = jdf['Date'].dt.month.apply(season_of)
    season_order = ['Winter', 'Summer', 'Monsoon', 'Post-Monsoon']
    season_avg = jdf.groupby('Season')['AQI'].mean().reindex(season_order).round(1)

    winter = jdf[jdf.Season == 'Winter']['AQI'].dropna()
    monsoon = jdf[jdf.Season == 'Monsoon']['AQI'].dropna()
    t_stat, p_val = stats.ttest_ind(winter, monsoon, equal_var=False)

    contingency = pd.crosstab(jdf['Season'], jdf['AQI_Bucket'])
    chi2, p_chi, dof, _ = stats.chi2_contingency(contingency)

    bucket_order = ['Good', 'Satisfactory', 'Moderate', 'Poor', 'Very Poor', 'Severe']
    bucket_counts = jdf['AQI_Bucket'].value_counts().reindex(bucket_order).fillna(0).astype(int)

    seasonal_json = {
        "season_avg_aqi": season_avg.to_dict(),
        "bucket_distribution": bucket_counts.to_dict(),
        "stats_tests": {
            "winter_vs_monsoon_ttest": {"t_stat": round(t_stat, 3), "p_value": p_val, "significant": bool(p_val < 0.05)},
            "season_bucket_chi2": {"chi2": round(chi2, 3), "p_value": p_chi, "dof": int(dof), "significant": bool(p_chi < 0.05)},
        },
    }
    with open(DATA / "seasonal_stats.json", "w") as f:
        json.dump(seasonal_json, f)
    print("Seasonal stats saved.")

    # ---------- 4. Train model ----------
    model_df = jaipur.dropna(subset=FEATURES + ['AQI'])
    X = model_df[FEATURES]
    y = model_df['AQI']
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    rf = RandomForestRegressor(n_estimators=300, max_depth=10, random_state=42, n_jobs=-1)
    rf.fit(X_train, y_train)
    y_pred = rf.predict(X_test)
    r2 = r2_score(y_test, y_pred)
    mae = mean_absolute_error(y_test, y_pred)
    print(f"Model trained. R2={r2:.3f}  MAE={mae:.2f}")

    joblib.dump({"model": rf, "features": FEATURES, "r2": r2, "mae": mae}, BASE / "models" / "aqi_model.joblib")

    # feature medians for sensible defaults in the API/frontend form
    defaults = model_df[FEATURES].median().round(2).to_dict()
    with open(DATA / "feature_defaults.json", "w") as f:
        json.dump({"defaults": defaults, "r2": round(r2, 3), "mae": round(mae, 2)}, f)

    print("Done.")

if __name__ == "__main__":
    main()
