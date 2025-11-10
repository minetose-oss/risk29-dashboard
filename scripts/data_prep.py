"""
Data Preparation Script for Risk Prediction Model
Prepares historical data from real_data.json for Prophet model training
"""

import json
import pandas as pd
from datetime import datetime
from pathlib import Path

def load_real_data(file_path='client/public/real_data.json'):
    """Load real_data.json file"""
    with open(file_path, 'r') as f:
        return json.load(f)

def calculate_risk_score(data):
    """
    Calculate overall risk score based on multiple signals
    This is a simplified version - adjust weights based on domain knowledge
    """
    scores = []
    
    # Valuation signals (weight: 0.2)
    if 'valuation' in data:
        val_score = 0
        if 'total_market_cap' in data['valuation'] and data['valuation']['total_market_cap'].get('value'):
            # Normalize market cap (higher = more risk)
            val_score += 30  # Simplified
        scores.append(('valuation', val_score, 0.2))
    
    # Liquidity signals (weight: 0.3)
    if 'liquidity' in data:
        liq_score = 0
        if 'm2_money_supply' in data['liquidity'] and data['liquidity']['m2_money_supply'].get('value'):
            # Higher M2 = lower risk (more liquidity)
            liq_score += 20  # Simplified
        scores.append(('liquidity', liq_score, 0.3))
    
    # Credit signals (weight: 0.25)
    if 'credit' in data:
        credit_score = 0
        if 'credit_spread' in data['credit'] and data['credit']['credit_spread'].get('value'):
            # Higher spread = more risk
            credit_score += 40  # Simplified
        scores.append(('credit', credit_score, 0.25))
    
    # Sentiment signals (weight: 0.25)
    if 'sentiment' in data:
        sent_score = 0
        if 'consumer_confidence' in data['sentiment'] and data['sentiment']['consumer_confidence'].get('value'):
            # Lower confidence = more risk
            sent_score += 25  # Simplified
        scores.append(('sentiment', sent_score, 0.25))
    
    # Calculate weighted average
    total_score = sum(score * weight for _, score, weight in scores)
    return total_score

def extract_time_series(data):
    """
    Extract time series data for risk score calculation
    Returns a DataFrame with date and risk_score columns
    """
    # For MVP, we'll use M2 Money Supply as a proxy for overall risk
    # In production, this should aggregate multiple signals
    
    if 'liquidity' not in data or 'm2_money_supply' not in data['liquidity']:
        raise ValueError("M2 Money Supply data not found")
    
    m2_data = data['liquidity']['m2_money_supply']
    
    if 'historical' not in m2_data:
        raise ValueError("No historical data found for M2 Money Supply")
    
    # Extract historical data
    records = []
    for point in m2_data['historical']:
        records.append({
            'ds': point['date'],  # Prophet requires 'ds' column
            'y': point['value']   # Prophet requires 'y' column
        })
    
    df = pd.DataFrame(records)
    
    # Convert date strings to datetime
    df['ds'] = pd.to_datetime(df['ds'])
    
    # Sort by date
    df = df.sort_values('ds').reset_index(drop=True)
    
    # Normalize y to 0-100 scale (risk score)
    # Higher M2 = lower risk, so we invert it
    y_min = df['y'].min()
    y_max = df['y'].max()
    df['y'] = 100 - ((df['y'] - y_min) / (y_max - y_min) * 100)
    
    return df

def prepare_data():
    """Main function to prepare data for model training"""
    print("Loading real_data.json...")
    data = load_real_data()
    
    print("Extracting time series...")
    df = extract_time_series(data)
    
    print(f"Extracted {len(df)} data points")
    print(f"Date range: {df['ds'].min()} to {df['ds'].max()}")
    print(f"Risk score range: {df['y'].min():.2f} to {df['y'].max():.2f}")
    
    # Save prepared data
    output_dir = Path('scripts/data')
    output_dir.mkdir(exist_ok=True)
    
    output_file = output_dir / 'prepared_data.csv'
    df.to_csv(output_file, index=False)
    print(f"\nSaved prepared data to {output_file}")
    
    # Print sample
    print("\nSample data:")
    print(df.head(10))
    print("\n...")
    print(df.tail(10))
    
    return df

if __name__ == '__main__':
    df = prepare_data()
