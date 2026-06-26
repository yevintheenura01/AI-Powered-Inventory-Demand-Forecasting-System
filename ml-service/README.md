# AI Demand Forecasting ML Microservice

This is the Python-based Machine Learning microservice for the AI-Powered Inventory & Demand Forecasting System. It exposes FastAPI endpoints to calculate future product demand using statistical regression modeling over historical sales timelines.

---

## 🤖 The Forecasting Model

The prediction engine is implemented in `src/model.py` using **Scikit-Learn**:

1. **Pre-processing**: Receives JSON historical logs, converts dates, and resamples the series daily (`resample('D').sum()`) to fill any gaps or missing days with zero sales.
2. **Feature Engineering**:
   - **Trend**: Sequential integer tracking days since the first record.
   - **Weekends**: Binary indicator (`is_weekend`) representing Saturday and Sunday.
   - **Cyclical Encoding**: To capture weekly and monthly cycles smoothly without boundary discontinuities, calendar days are mapped to trigonometric space:
     - `sin_dow` / `cos_dow` (Sine/Cosine of the Day of Week)
     - `sin_month` / `cos_month` (Sine/Cosine of the Month)
3. **Algorithm**: Fits a **Ridge Regression** model (`sklearn.linear_model.Ridge`) on the engineered feature matrix. L2 regularization helps prevent overfitting to noise or sudden sales spikes.
4. **Confidence Intervals**: Generates a standard safety confidence interval of `1.96 * RMSE` (Root Mean Squared Error) to compute upper and lower demand boundaries. This allows supply managers to plan for worst-case surges (Upper Bound) while avoiding overallocation.
5. **Post-processing**: Clips predictions and lower bounds at `0.0` to avoid mathematically invalid negative inventory forecasts.

---

## 🛠️ Tech Stack

- **FastAPI** (High-performance ASGI framework)
- **Uvicorn** (Lightning-fast ASGI server)
- **Pandas** & **NumPy** (Data manipulation and linear algebra)
- **Scikit-Learn** (Ridge Regression modeling and metrics)
- **Pydantic** (Data validation & request/response schemas)

---

## 📦 API Endpoints

### Health Check
- **`GET /health`**
  - **Response**:
    ```json
    {
      "status": "healthy",
      "service": "forecasting-ml-service"
    }
    ```

### Generate Forecast
- **`POST /forecast`**
  - **Request Body (`ForecastRequest`)**:
    ```json
    {
      "history": [
        { "date": "2026-03-01", "quantity": 5.0 },
        { "date": "2026-03-02", "quantity": 7.0 },
        { "date": "2026-03-03", "quantity": 6.0 }
      ],
      "days_to_forecast": 30
    }
    ```
  - **Response Body (`ForecastResponse`)**:
    ```json
    {
      "predictions": [
        {
          "date": "2026-03-04",
          "predicted": 6.2,
          "lower_bound": 4.1,
          "upper_bound": 8.3
        }
      ],
      "metrics": {
        "rmse": 1.05,
        "r2": 0.88
      },
      "model_type": "Scikit-Learn Ridge Regression (Time-Series)"
    }
    ```

---

## 💻 Commands

Inside the `ml-service/` directory, run the following commands to setup and start the microservice:

```bash
# 1. Create a Python virtual environment
python -m venv venv

# 2. Activate the virtual environment
# On Windows (Command Prompt / PowerShell):
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# 3. Install requirements
pip install -r requirements.txt

# 4. Start the service
python run.py
```
