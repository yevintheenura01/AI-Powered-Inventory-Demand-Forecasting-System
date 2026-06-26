import numpy as np
import pandas as pd
from sklearn.linear_model import Ridge
from sklearn.metrics import mean_squared_error, r2_score
from datetime import datetime, timedelta

def generate_forecast_predictions(history, days_to_forecast=30):
    """
    history: list of dicts [{"date": "YYYY-MM-DD", "quantity": X}, ...]
    days_to_forecast: number of future days to predict
    """
    # 1. Parse into DataFrame
    df = pd.DataFrame(history)
    df['date'] = pd.to_datetime(df['date'])
    df['quantity'] = pd.to_numeric(df['quantity'])
    df = df.sort_values('date').reset_index(drop=True)

    # Resample to ensure consecutive daily frequency
    df.set_index('date', inplace=True)
    df = df.resample('D').sum().reset_index()

    # 2. Engineer features
    # Base trend is ordinal number of days since the first record
    start_date = df['date'].min()
    df['trend'] = (df['date'] - start_date).dt.days

    # Seasonal features
    df['day_of_week'] = df['date'].dt.dayofweek
    df['day_of_month'] = df['date'].dt.day
    df['month'] = df['date'].dt.month
    df['is_weekend'] = df['day_of_week'].isin([5, 6]).astype(int)

    # Sin/Cos representation of day of week (captures smooth cyclical transitions)
    df['sin_dow'] = np.sin(2 * np.pi * df['day_of_week'] / 7.0)
    df['cos_dow'] = np.cos(2 * np.pi * df['day_of_week'] / 7.0)
    
    # Sin/Cos representation of month of year
    df['sin_month'] = np.sin(2 * np.pi * df['month'] / 12.0)
    df['cos_month'] = np.cos(2 * np.pi * df['month'] / 12.0)

    features = ['trend', 'is_weekend', 'sin_dow', 'cos_dow', 'sin_month', 'cos_month']
    X = df[features]
    y = df['quantity']

    # 3. Fit Ridge Regression Model
    model = Ridge(alpha=1.0)
    model.fit(X, y)

    # Predict on training data to calculate residuals and RMSE
    y_pred_train = model.predict(X)
    rmse = np.sqrt(mean_squared_error(y, y_pred_train))
    r2 = r2_score(y, y_pred_train)

    # 4. Generate features for future dates
    last_date = df['date'].max()
    future_dates = [last_date + timedelta(days=i) for i in range(1, days_to_forecast + 1)]
    
    future_df = pd.DataFrame({'date': future_dates})
    future_df['trend'] = (future_df['date'] - start_date).dt.days
    future_df['day_of_week'] = future_df['date'].dt.dayofweek
    future_df['day_of_month'] = future_df['date'].dt.day
    future_df['month'] = future_df['date'].dt.month
    future_df['is_weekend'] = future_df['day_of_week'].isin([5, 6]).astype(int)
    
    future_df['sin_dow'] = np.sin(2 * np.pi * future_df['day_of_week'] / 7.0)
    future_df['cos_dow'] = np.cos(2 * np.pi * future_df['day_of_week'] / 7.0)
    future_df['sin_month'] = np.sin(2 * np.pi * future_df['month'] / 12.0)
    future_df['cos_month'] = np.cos(2 * np.pi * future_df['month'] / 12.0)

    X_future = future_df[features]
    predictions = model.predict(X_future)

    # Calculate safety confidence interval (e.g. 95% is ~1.96 * RMSE)
    # Ensure lower bounds do not go below 0
    predictions_results = []
    for idx, row in future_df.iterrows():
        pred_val = float(predictions[idx])
        margin = 1.96 * rmse
        lower_bound = max(0.0, pred_val - margin)
        upper_bound = pred_val + margin

        predictions_results.append({
          'date': row['date'].strftime('%Y-%m-%d'),
          'predicted': max(0.0, pred_val),
          'lower_bound': lower_bound,
          'upper_bound': upper_bound
        })

    return {
      'predictions': predictions_results,
      'metrics': {
        'rmse': float(rmse),
        'r2': float(r2)
      },
      'model_type': 'Scikit-Learn Ridge Regression (Time-Series)'
    }
