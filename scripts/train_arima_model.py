#!/usr/bin/env python3
"""
Train ARIMA model for risk prediction
Compare with Prophet model performance
"""

import os
import json
import warnings
from datetime import datetime, timedelta
import pandas as pd
import numpy as np
from statsmodels.tsa.arima.model import ARIMA
from statsmodels.tools.sm_exceptions import ConvergenceWarning
from sklearn.metrics import mean_absolute_percentage_error, mean_squared_error

warnings.filterwarnings('ignore', category=ConvergenceWarning)
warnings.filterwarnings('ignore', category=FutureWarning)

def load_historical_data():
    """Load historical risk data"""
    data_file = os.path.join(os.path.dirname(__file__), '..', 'client', 'public', 'historical_data.json')
    
    with open(data_file, 'r') as f:
        data = json.load(f)
    
    # Convert to DataFrame
    df = pd.DataFrame(data['data'])
    
    # Parse dates (they're in format "Oct 12")
    current_year = datetime.now().year
    df['date_full'] = df['date'].apply(lambda x: datetime.strptime(f"{x} {current_year}", "%b %d %Y"))
    
    # Sort by date
    df = df.sort_values('date_full')
    
    return df

def train_arima_model(data, order=(1, 1, 1)):
    """Train ARIMA model"""
    try:
        # Fit ARIMA model
        model = ARIMA(data, order=order)
        fitted_model = model.fit()
        
        return fitted_model
    except Exception as e:
        print(f"Error training ARIMA model: {e}")
        return None

def generate_arima_predictions(model, steps=30):
    """Generate predictions using ARIMA model"""
    try:
        # Forecast
        forecast = model.forecast(steps=steps)
        
        # Get confidence intervals
        forecast_df = model.get_forecast(steps=steps)
        conf_int = forecast_df.conf_int()
        
        predictions = []
        for i in range(steps):
            date = datetime.now() + timedelta(days=i+1)
            predictions.append({
                'date': date.strftime('%Y-%m-%d'),
                'predicted_risk': float(forecast.iloc[i]),
                'lower_bound': float(conf_int.iloc[i, 0]),
                'upper_bound': float(conf_int.iloc[i, 1])
            })
        
        return predictions
    except Exception as e:
        print(f"Error generating predictions: {e}")
        return []

def calculate_metrics(y_true, y_pred):
    """Calculate performance metrics"""
    mape = mean_absolute_percentage_error(y_true, y_pred) * 100
    rmse = np.sqrt(mean_squared_error(y_true, y_pred))
    mae = np.mean(np.abs(y_true - y_pred))
    
    return {
        'mape': round(float(mape), 2),
        'rmse': round(float(rmse), 2),
        'mae': round(float(mae), 2)
    }

def evaluate_model(model, data, test_size=7):
    """Evaluate model on test data"""
    try:
        # Split data
        train = data[:-test_size]
        test = data[-test_size:]
        
        # Train on train data
        train_model = ARIMA(train, order=(1, 1, 1))
        fitted_train = train_model.fit()
        
        # Predict on test data
        predictions = fitted_train.forecast(steps=test_size)
        
        # Calculate metrics
        metrics = calculate_metrics(test.values, predictions.values)
        
        return metrics
    except Exception as e:
        print(f"Error evaluating model: {e}")
        return {'mape': 0, 'rmse': 0, 'mae': 0}

def compare_with_prophet():
    """Load Prophet predictions for comparison"""
    try:
        pred_file = os.path.join(os.path.dirname(__file__), '..', 'client', 'public', 'predictions.json')
        
        with open(pred_file, 'r') as f:
            prophet_data = json.load(f)
        
        return prophet_data
    except Exception as e:
        print(f"Error loading Prophet predictions: {e}")
        return None

def main():
    """Main function"""
    print("Training ARIMA model for risk prediction...")
    
    # Load historical data
    print("Loading historical data...")
    df = load_historical_data()
    
    # Use overall risk score
    risk_data = df['overall']
    
    print(f"Loaded {len(risk_data)} data points")
    
    # Train ARIMA model
    print("Training ARIMA model...")
    model = train_arima_model(risk_data, order=(1, 1, 1))
    
    if model is None:
        print("Failed to train ARIMA model")
        return
    
    # Generate predictions
    print("Generating predictions...")
    predictions = generate_arima_predictions(model, steps=30)
    
    # Evaluate model
    print("Evaluating model...")
    metrics = evaluate_model(model, risk_data, test_size=7)
    
    print(f"Model Performance:")
    print(f"  MAPE: {metrics['mape']}%")
    print(f"  RMSE: {metrics['rmse']}")
    print(f"  MAE: {metrics['mae']}")
    
    # Save predictions
    output = {
        'generated_at': datetime.now().isoformat(),
        'model': 'ARIMA',
        'order': '(1,1,1)',
        'forecast_horizon_days': 30,
        'predictions': predictions,
        'performance_metrics': metrics,
        'metadata': {
            'model': 'ARIMA(1,1,1)',
            'confidence_interval': '95%',
            'description': 'ARIMA model predictions for the next 30 days',
            'training_data_points': len(risk_data)
        }
    }
    
    output_file = os.path.join(os.path.dirname(__file__), '..', 'client', 'public', 'arima_predictions.json')
    
    with open(output_file, 'w') as f:
        json.dump(output, f, indent=2)
    
    print(f"ARIMA predictions saved to {output_file}")
    
    # Compare with Prophet
    print("\nComparing with Prophet model...")
    prophet_data = compare_with_prophet()
    
    if prophet_data:
        print("Prophet model loaded successfully")
        
        # Create comparison data
        comparison = {
            'generated_at': datetime.now().isoformat(),
            'models': [
                {
                    'name': 'Prophet',
                    'type': 'Time Series (Facebook Prophet)',
                    'metrics': prophet_data.get('performance_metrics', {}),
                    'predictions_file': 'predictions.json'
                },
                {
                    'name': 'ARIMA',
                    'type': 'Statistical (ARIMA)',
                    'metrics': metrics,
                    'predictions_file': 'arima_predictions.json'
                }
            ]
        }
        
        comparison_file = os.path.join(os.path.dirname(__file__), '..', 'client', 'public', 'model_comparison.json')
        
        with open(comparison_file, 'w') as f:
            json.dump(comparison, f, indent=2)
        
        print(f"Model comparison saved to {comparison_file}")

if __name__ == "__main__":
    main()
