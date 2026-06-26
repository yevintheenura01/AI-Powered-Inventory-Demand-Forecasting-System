from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from src.model import generate_forecast_predictions

app = FastAPI(title="AI Inventory Forecasting Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SalesRecord(BaseModel):
    date: str  # YYYY-MM-DD
    quantity: float

class ForecastRequest(BaseModel):
    history: List[SalesRecord]
    days_to_forecast: Optional[int] = 30

class PredictionResult(BaseModel):
    date: str
    predicted: float
    lower_bound: float
    upper_bound: float

class ForecastResponse(BaseModel):
    predictions: List[PredictionResult]
    metrics: dict
    model_type: str

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "forecasting-ml-service"}

@app.post("/forecast", response_model=ForecastResponse)
def forecast(payload: ForecastRequest):
    if not payload.history:
        raise HTTPException(status_code=400, detail="Sales history is required for forecasting")
    
    if len(payload.history) < 3:
        raise HTTPException(status_code=400, detail="Sales history is too short. Need at least 3 historical points")

    try:
        # Convert list of Pydantic SalesRecord to list of dicts
        history_list = [record.model_dump() for record in payload.history]
        
        results = generate_forecast_predictions(history_list, payload.days_to_forecast)
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
