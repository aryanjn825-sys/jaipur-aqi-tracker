from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import historical, predict, live, advisory

app = FastAPI(
    title="Jaipur AQI & Weather Correlation Tracker API",
    description="Historical analysis, live conditions, and ML prediction for Jaipur air quality.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten in production to your deployed frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(historical.router, prefix="/api/historical", tags=["historical"])
app.include_router(predict.router, prefix="/api/predict", tags=["predict"])
app.include_router(live.router, prefix="/api/live", tags=["live"])
app.include_router(advisory.router, prefix="/api/advisory", tags=["advisory"])


@app.get("/")
def root():
    return {
        "status": "ok",
        "service": "Jaipur AQI & Weather Correlation Tracker",
        "docs": "/docs",
    }


@app.get("/api/health")
def health():
    return {"status": "healthy"}
