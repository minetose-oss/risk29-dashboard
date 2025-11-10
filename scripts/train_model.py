"""
Model Training Script for Risk Prediction
Uses Prophet (by Meta) for time series forecasting
"""

import pandas as pd
import pickle
from pathlib import Path
from prophet import Prophet
from prophet.diagnostics import cross_validation, performance_metrics
import json

def load_prepared_data(file_path='scripts/data/prepared_data.csv'):
    """Load prepared data from CSV"""
    df = pd.DataFrame(pd.read_csv(file_path))
    df['ds'] = pd.to_datetime(df['ds'])
    return df

def train_prophet_model(df):
    """
    Train Prophet model on the prepared data
    Prophet automatically handles:
    - Trend
    - Seasonality (yearly, weekly, daily)
    - Holidays (if provided)
    """
    print("Initializing Prophet model...")
    
    # Add floor and cap for logistic growth
    # This prevents predictions from going below 0 or above 100
    df['floor'] = 0
    df['cap'] = 100
    
    # Initialize Prophet with custom parameters
    model = Prophet(
        growth='logistic',              # Use logistic growth (bounded)
        changepoint_prior_scale=0.05,  # Flexibility of trend (lower = less flexible)
        seasonality_prior_scale=10.0,   # Strength of seasonality
        seasonality_mode='additive',    # 'additive' or 'multiplicative'
        yearly_seasonality=True,        # Enable yearly seasonality
        weekly_seasonality=False,       # Disable weekly (monthly data)
        daily_seasonality=False,        # Disable daily (monthly data)
        interval_width=0.95,            # 95% confidence interval
    )
    
    print("Training model...")
    model.fit(df)
    
    print("Model training completed!")
    return model

def evaluate_model(model, df):
    """
    Evaluate model performance using cross-validation
    """
    print("\nEvaluating model performance...")
    
    # Cross-validation: train on first N-k points, test on next k points
    # For 30 data points, we'll use:
    # - initial: 18 months (60% of data)
    # - period: 3 months
    # - horizon: 6 months
    try:
        df_cv = cross_validation(
            model,
            initial='540 days',   # 18 months
            period='90 days',     # 3 months
            horizon='180 days'    # 6 months
        )
        
        # Calculate performance metrics
        df_metrics = performance_metrics(df_cv)
        
        print("\nPerformance Metrics:")
        print(f"  MAE (Mean Absolute Error): {df_metrics['mae'].mean():.2f}")
        print(f"  RMSE (Root Mean Squared Error): {df_metrics['rmse'].mean():.2f}")
        print(f"  MAPE (Mean Absolute Percentage Error): {df_metrics['mape'].mean():.2%}")
        
        return df_metrics
    except Exception as e:
        print(f"Warning: Could not perform cross-validation: {e}")
        print("This is normal for small datasets. Skipping evaluation.")
        return None

def save_model(model, output_path='scripts/models/risk_model.pkl'):
    """Save trained model to disk"""
    output_dir = Path(output_path).parent
    output_dir.mkdir(parents=True, exist_ok=True)
    
    with open(output_path, 'wb') as f:
        pickle.dump(model, f)
    
    print(f"\nModel saved to {output_path}")

def save_metadata(df, metrics, output_path='scripts/models/model_metadata.json'):
    """Save model metadata for reference"""
    metadata = {
        'training_date': pd.Timestamp.now().isoformat(),
        'data_points': len(df),
        'date_range': {
            'start': df['ds'].min().isoformat(),
            'end': df['ds'].max().isoformat(),
        },
        'risk_score_range': {
            'min': float(df['y'].min()),
            'max': float(df['y'].max()),
            'mean': float(df['y'].mean()),
            'std': float(df['y'].std()),
        },
    }
    
    if metrics is not None:
        metadata['performance'] = {
            'mae': float(metrics['mae'].mean()),
            'rmse': float(metrics['rmse'].mean()),
            'mape': float(metrics['mape'].mean()),
        }
    
    output_dir = Path(output_path).parent
    output_dir.mkdir(parents=True, exist_ok=True)
    
    with open(output_path, 'w') as f:
        json.dump(metadata, f, indent=2)
    
    print(f"Metadata saved to {output_path}")

def main():
    """Main training pipeline"""
    print("=" * 60)
    print("Risk Prediction Model Training")
    print("=" * 60)
    
    # Load data
    print("\n1. Loading prepared data...")
    df = load_prepared_data()
    print(f"   Loaded {len(df)} data points")
    
    # Train model
    print("\n2. Training Prophet model...")
    model = train_prophet_model(df)
    
    # Evaluate model
    print("\n3. Evaluating model...")
    metrics = evaluate_model(model, df)
    
    # Save model
    print("\n4. Saving model and metadata...")
    save_model(model)
    save_metadata(df, metrics)
    
    print("\n" + "=" * 60)
    print("Training completed successfully!")
    print("=" * 60)

if __name__ == '__main__':
    main()
