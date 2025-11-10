"""
Prediction Generation Script
Loads the trained model and generates 30-day risk score forecasts
"""

import pickle
import pandas as pd
import json
from pathlib import Path
from datetime import datetime, timedelta

def load_model(model_path='scripts/models/risk_model.pkl'):
    """Load the trained Prophet model"""
    with open(model_path, 'rb') as f:
        model = pickle.load(f)
    return model

def generate_predictions(model, periods=30):
    """
    Generate predictions for the next N periods (days)
    
    Args:
        model: Trained Prophet model
        periods: Number of days to forecast (default: 30)
    
    Returns:
        DataFrame with predictions
    """
    # Create future dataframe
    future = model.make_future_dataframe(periods=periods, freq='MS')  # MS = Month Start
    
    # Add floor and cap for logistic growth
    future['floor'] = 0
    future['cap'] = 100
    
    # Generate predictions
    forecast = model.predict(future)
    
    return forecast

def format_predictions(forecast):
    """
    Format predictions for frontend consumption
    Returns JSON-serializable dictionary
    """
    # Get only future predictions (not historical)
    # We want the last 30 rows (30 months forecast)
    future_forecast = forecast.tail(30)
    
    predictions = []
    for _, row in future_forecast.iterrows():
        # Clip predictions to 0-100 range (risk scores must be valid)
        predicted_risk = max(0, min(100, float(row['yhat'])))
        lower_bound = max(0, min(100, float(row['yhat_lower'])))
        upper_bound = max(0, min(100, float(row['yhat_upper'])))
        
        predictions.append({
            'date': row['ds'].strftime('%Y-%m-%d'),
            'predicted_risk': round(predicted_risk, 2),
            'lower_bound': round(lower_bound, 2),
            'upper_bound': round(upper_bound, 2),
        })
    
    return {
        'generated_at': datetime.now().isoformat(),
        'forecast_horizon_days': 30,
        'predictions': predictions,
        'metadata': {
            'model': 'Prophet',
            'confidence_interval': '95%',
            'description': '30-day risk score forecast based on historical M2 Money Supply data',
        }
    }

def save_predictions(predictions, output_path='client/public/predictions.json'):
    """Save predictions to JSON file"""
    output_dir = Path(output_path).parent
    output_dir.mkdir(parents=True, exist_ok=True)
    
    with open(output_path, 'w') as f:
        json.dump(predictions, f, indent=2)
    
    print(f"Predictions saved to {output_path}")

def main():
    """Main prediction pipeline"""
    print("=" * 60)
    print("Risk Prediction Generation")
    print("=" * 60)
    
    # Load model
    print("\n1. Loading trained model...")
    model = load_model()
    print("   Model loaded successfully")
    
    # Generate predictions
    print("\n2. Generating 30-day forecast...")
    forecast = generate_predictions(model, periods=30)
    print(f"   Generated {len(forecast)} predictions")
    
    # Format predictions
    print("\n3. Formatting predictions...")
    predictions = format_predictions(forecast)
    print(f"   Formatted {len(predictions['predictions'])} predictions")
    
    # Print sample
    print("\n4. Sample predictions:")
    for i, pred in enumerate(predictions['predictions'][:5]):
        print(f"   {pred['date']}: {pred['predicted_risk']:.2f} "
              f"(range: {pred['lower_bound']:.2f} - {pred['upper_bound']:.2f})")
    print("   ...")
    for i, pred in enumerate(predictions['predictions'][-3:]):
        print(f"   {pred['date']}: {pred['predicted_risk']:.2f} "
              f"(range: {pred['lower_bound']:.2f} - {pred['upper_bound']:.2f})")
    
    # Save predictions
    print("\n5. Saving predictions...")
    save_predictions(predictions)
    
    print("\n" + "=" * 60)
    print("Prediction generation completed successfully!")
    print("=" * 60)

if __name__ == '__main__':
    main()
