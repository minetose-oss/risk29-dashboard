#!/usr/bin/env python3
"""
Simple Dashboard Data Updater
Updates risk_data.json, predictions.json, and historical_data.json
No ML model required - uses simple calculations
"""

import json
import requests
from datetime import datetime, timedelta
import os

# Configuration
FRED_API_KEY = os.environ.get('FRED_API_KEY', '')
OUTPUT_DIR = 'client/public'

def fetch_fred_data(series_id, days=30):
    """Fetch data from FRED API"""
    if not FRED_API_KEY:
        print(f"⚠️  Warning: FRED_API_KEY not set, using mock data for {series_id}")
        return generate_mock_data(days)
    
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days)
    
    url = f"https://api.stlouisfed.org/fred/series/observations"
    params = {
        'series_id': series_id,
        'api_key': FRED_API_KEY,
        'file_type': 'json',
        'observation_start': start_date.strftime('%Y-%m-%d'),
        'observation_end': end_date.strftime('%Y-%m-%d')
    }
    
    try:
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        if 'observations' in data:
            return [(obs['date'], float(obs['value'])) for obs in data['observations'] if obs['value'] != '.']
        else:
            print(f"⚠️  No data for {series_id}, using mock data")
            return generate_mock_data(days)
    except Exception as e:
        print(f"⚠️  Error fetching {series_id}: {e}, using mock data")
        return generate_mock_data(days)

def generate_mock_data(days=30):
    """Generate mock data for testing"""
    import random
    data = []
    base_value = 50
    for i in range(days):
        date = (datetime.now() - timedelta(days=days-i)).strftime('%Y-%m-%d')
        value = base_value + random.uniform(-5, 5) + (i * 0.1)
        data.append((date, value))
    return data

def calculate_risk_score(vix, unemployment, inflation, market_volatility):
    """
    Calculate risk score from multiple indicators
    Returns: 0-100 (higher = more risk)
    """
    # Normalize each indicator (0-100 scale)
    vix_score = min(100, (vix / 40) * 100)  # VIX > 40 = high risk
    unemployment_score = min(100, (unemployment / 10) * 100)  # Unemployment > 10% = high risk
    inflation_score = min(100, (inflation / 5) * 100)  # Inflation > 5% = high risk
    volatility_score = min(100, (market_volatility / 30) * 100)  # Volatility > 30% = high risk
    
    # Weighted average
    risk_score = (
        vix_score * 0.4 +
        unemployment_score * 0.2 +
        inflation_score * 0.2 +
        volatility_score * 0.2
    )
    
    return round(risk_score, 2)

def generate_predictions(historical_data, days=30):
    """Generate simple predictions based on historical data"""
    if not historical_data:
        return []
    
    # Calculate trend
    recent_values = [item['risk_score'] for item in historical_data[-7:]]
    avg_recent = sum(recent_values) / len(recent_values)
    trend = (recent_values[-1] - recent_values[0]) / 7  # Daily trend
    
    predictions = []
    last_date = datetime.strptime(historical_data[-1]['date'], '%Y-%m-%d')
    last_value = historical_data[-1]['risk_score']
    
    for i in range(1, days + 1):
        pred_date = (last_date + timedelta(days=i)).strftime('%Y-%m-%d')
        pred_value = last_value + (trend * i)
        pred_value = max(0, min(100, pred_value))  # Clamp to 0-100
        
        predictions.append({
            'date': pred_date,
            'predicted_risk': round(pred_value, 2)
        })
    
    return predictions

def main():
    print("🚀 Starting Simple Dashboard Data Update...")
    print(f"📅 Current date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Create output directory if not exists
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    # Fetch data from FRED
    print("\n📊 Fetching data from FRED API...")
    vix_data = fetch_fred_data('VIXCLS', 30)  # VIX
    unemployment_data = fetch_fred_data('UNRATE', 30)  # Unemployment Rate
    inflation_data = fetch_fred_data('CPIAUCSL', 30)  # CPI
    
    # Get latest values
    latest_vix = vix_data[-1][1] if vix_data else 20
    latest_unemployment = unemployment_data[-1][1] if unemployment_data else 4
    latest_inflation = inflation_data[-1][1] if inflation_data else 3
    latest_volatility = 15  # Placeholder
    
    # Calculate current risk score
    current_risk = calculate_risk_score(latest_vix, latest_unemployment, latest_inflation, latest_volatility)
    
    print(f"\n📈 Latest indicators:")
    print(f"  VIX: {latest_vix}")
    print(f"  Unemployment: {latest_unemployment}%")
    print(f"  Inflation: {latest_inflation}")
    print(f"  Risk Score: {current_risk}")
    
    # Generate historical data (last 30 days)
    historical_data = []
    for i in range(30):
        date = (datetime.now() - timedelta(days=29-i)).strftime('%Y-%m-%d')
        
        # Get values for this date (or interpolate)
        vix_val = vix_data[min(i, len(vix_data)-1)][1] if vix_data else 20
        unemp_val = unemployment_data[min(i, len(unemployment_data)-1)][1] if unemployment_data else 4
        infl_val = inflation_data[min(i, len(inflation_data)-1)][1] if inflation_data else 3
        
        risk = calculate_risk_score(vix_val, unemp_val, infl_val, 15)
        
        historical_data.append({
            'date': date,
            'risk_score': risk,
            'vix': round(vix_val, 2),
            'unemployment': round(unemp_val, 2),
            'inflation': round(infl_val, 2)
        })
    
    # Generate predictions
    print("\n🔮 Generating predictions...")
    predictions = generate_predictions(historical_data, 30)
    
    # Save risk_data.json
    risk_data = {
        'date': datetime.now().strftime('%Y-%m-%d'),
        'risk_score': current_risk,
        'indicators': {
            'vix': round(latest_vix, 2),
            'unemployment': round(latest_unemployment, 2),
            'inflation': round(latest_inflation, 2),
            'market_volatility': 15
        }
    }
    
    risk_data_path = os.path.join(OUTPUT_DIR, 'risk_data.json')
    with open(risk_data_path, 'w') as f:
        json.dump(risk_data, f, indent=2)
    print(f"✅ Saved {risk_data_path}")
    
    # Save historical_data.json
    historical_data_path = os.path.join(OUTPUT_DIR, 'historical_data.json')
    with open(historical_data_path, 'w') as f:
        json.dump(historical_data, f, indent=2)
    print(f"✅ Saved {historical_data_path}")
    
    # Save predictions.json
    predictions_data = {
        'generated_at': datetime.now().isoformat(),
        'predictions': predictions
    }
    
    predictions_path = os.path.join(OUTPUT_DIR, 'predictions.json')
    with open(predictions_path, 'w') as f:
        json.dump(predictions_data, f, indent=2)
    print(f"✅ Saved {predictions_path}")
    
    print("\n🎉 Dashboard data updated successfully!")
    print(f"📊 Current Risk Score: {current_risk}")
    print(f"📅 Next update: Run this script again or schedule via cron")

if __name__ == '__main__':
    main()
