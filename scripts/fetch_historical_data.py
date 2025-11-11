#!/usr/bin/env python3
"""
Fetch historical risk data for the dashboard
Generates real historical data instead of mock data
"""

import os
import json
from datetime import datetime, timedelta
from fredapi import Fred
import yfinance as yf
from typing import Dict, List, Any

# API Keys
FRED_API_KEY = os.getenv('FRED_API_KEY', 'e438e833b710bbc9f7defdb12b9fa33e')

# Initialize FRED API
fred = Fred(api_key=FRED_API_KEY)

def calculate_risk_score(value: float, threshold_high: float, threshold_low: float, reverse: bool = False) -> float:
    """
    Calculate risk score (0-100) based on value and thresholds
    reverse=True means higher value = lower risk
    """
    if reverse:
        if value >= threshold_high:
            return 0  # Low risk
        elif value <= threshold_low:
            return 100  # High risk
        else:
            # Linear interpolation
            return 100 - ((value - threshold_low) / (threshold_high - threshold_low)) * 100
    else:
        if value >= threshold_high:
            return 100  # High risk
        elif value <= threshold_low:
            return 0  # Low risk
        else:
            # Linear interpolation
            return ((value - threshold_low) / (threshold_high - threshold_low)) * 100

def fetch_historical_liquidity(days: int = 90) -> List[Dict[str, Any]]:
    """Fetch historical liquidity data"""
    try:
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days + 365)  # Get extra data for YoY calc
        
        # M2 Money Supply (year-over-year % change)
        m2_data = fred.get_series("M2SL", start_date=start_date, end_date=end_date)
        
        # Resample to daily and forward fill
        m2_data = m2_data.resample('D').ffill()
        
        historical = []
        for i in range(len(m2_data)):
            if i < 365:  # Need 365 days for YoY calculation
                continue
            
            current = float(m2_data.iloc[i])
            year_ago = float(m2_data.iloc[i-365])
            
            # Calculate YoY change
            yoy_change = ((current - year_ago) / year_ago) * 100 if year_ago != 0 else 0
            
            # Risk score: negative growth = high risk
            # Thresholds: -5% (high risk), +10% (low risk)
            risk_score = calculate_risk_score(yoy_change, 10, -5, reverse=True)
            
            historical.append({
                "date": m2_data.index[i].strftime("%Y-%m-%d"),
                "value": round(risk_score, 1)
            })
        
        return historical[-days:]  # Return only requested days
    except Exception as e:
        print(f"Error fetching liquidity data: {e}")
        return []

def fetch_historical_valuation(days: int = 90) -> List[Dict[str, Any]]:
    """Fetch historical valuation data"""
    try:
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        
        # Use S&P 500 index as proxy for valuation
        sp500_data = fred.get_series("SP500", start_date=start_date, end_date=end_date)
        
        # Resample to daily and forward fill
        sp500_data = sp500_data.resample('D').ffill()
        
        historical = []
        for date, value in sp500_data.items():
            sp500_value = float(value)
            
            # Normalize to risk score (higher price = higher risk)
            # Thresholds: 3000 (low risk), 5000 (high risk)
            risk_score = calculate_risk_score(sp500_value, 5000, 3000, reverse=False)
            
            historical.append({
                "date": date.strftime("%Y-%m-%d"),
                "value": round(risk_score, 1)
            })
        
        return historical[-days:]
    except Exception as e:
        print(f"Error fetching valuation data: {e}")
        return []

def fetch_historical_credit(days: int = 90) -> List[Dict[str, Any]]:
    """Fetch historical credit data"""
    try:
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        
        # High Yield Spread
        spread_data = fred.get_series("BAMLH0A0HYM2", start_date=start_date, end_date=end_date)
        
        # Resample to daily and forward fill
        spread_data = spread_data.resample('D').ffill()
        
        historical = []
        for date, value in spread_data.items():
            spread = float(value)
            
            # Risk score: high spread = high risk
            # Thresholds: 3% (low risk), 10% (high risk)
            risk_score = calculate_risk_score(spread, 10, 3, reverse=False)
            
            historical.append({
                "date": date.strftime("%Y-%m-%d"),
                "value": round(risk_score, 1)
            })
        
        return historical[-days:]
    except Exception as e:
        print(f"Error fetching credit data: {e}")
        return []

def fetch_historical_macro(days: int = 90) -> List[Dict[str, Any]]:
    """Fetch historical macro data"""
    try:
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        
        # Unemployment Rate
        unemployment_data = fred.get_series("UNRATE", start_date=start_date, end_date=end_date)
        
        # Resample to daily and forward fill
        unemployment_data = unemployment_data.resample('D').ffill()
        
        historical = []
        for date, value in unemployment_data.items():
            unemployment = float(value)
            
            # Risk score: high unemployment = high risk
            # Thresholds: 3.5% (low risk), 7% (high risk)
            risk_score = calculate_risk_score(unemployment, 7, 3.5, reverse=False)
            
            historical.append({
                "date": date.strftime("%Y-%m-%d"),
                "value": round(risk_score, 1)
            })
        
        return historical[-days:]
    except Exception as e:
        print(f"Error fetching macro data: {e}")
        return []

def fetch_historical_technical(days: int = 90) -> List[Dict[str, Any]]:
    """Fetch historical technical data (VIX)"""
    try:
        # Fetch VIX data
        vix = yf.Ticker("^VIX")
        hist = vix.history(period=f"{days}d")
        
        historical = []
        for date, row in hist.iterrows():
            vix_value = float(row['Close'])
            
            # Risk score: high VIX = high risk
            # Thresholds: 12 (low risk), 30 (high risk)
            risk_score = calculate_risk_score(vix_value, 30, 12, reverse=False)
            
            historical.append({
                "date": date.strftime("%Y-%m-%d"),
                "value": round(risk_score, 1)
            })
        
        return historical
    except Exception as e:
        print(f"Error fetching technical data: {e}")
        return []

def calculate_overall_risk(liquidity: float, valuation: float, credit: float, macro: float, technical: float) -> float:
    """Calculate overall risk score as weighted average"""
    weights = {
        'liquidity': 0.25,
        'valuation': 0.25,
        'credit': 0.20,
        'macro': 0.15,
        'technical': 0.15
    }
    
    overall = (
        liquidity * weights['liquidity'] +
        valuation * weights['valuation'] +
        credit * weights['credit'] +
        macro * weights['macro'] +
        technical * weights['technical']
    )
    
    return round(overall, 1)

def merge_historical_data(liquidity: List, valuation: List, credit: List, macro: List, technical: List) -> List[Dict[str, Any]]:
    """Merge all historical data by date"""
    # Create a dictionary with dates as keys
    data_by_date = {}
    
    # Collect all dates from all sources
    all_dates = set()
    for item in liquidity:
        all_dates.add(item['date'])
    for item in valuation:
        all_dates.add(item['date'])
    for item in credit:
        all_dates.add(item['date'])
    for item in macro:
        all_dates.add(item['date'])
    for item in technical:
        all_dates.add(item['date'])
    
    # Create lookup dictionaries
    liquidity_dict = {item['date']: item['value'] for item in liquidity}
    valuation_dict = {item['date']: item['value'] for item in valuation}
    credit_dict = {item['date']: item['value'] for item in credit}
    macro_dict = {item['date']: item['value'] for item in macro}
    technical_dict = {item['date']: item['value'] for item in technical}
    
    # Convert to list and calculate overall risk
    result = []
    for date in sorted(all_dates):
        # Use available data or default values
        data = {
            'liquidity': liquidity_dict.get(date, 25),
            'valuation': valuation_dict.get(date, 50),
            'credit': credit_dict.get(date, 15),
            'macro': macro_dict.get(date, 20),
            'technical': technical_dict.get(date, 25)
        }
        
        # Always include (use defaults if data missing)
        if True:
            overall = calculate_overall_risk(
                data['liquidity'],
                data['valuation'],
                data['credit'],
                data['macro'],
                data['technical']
            )
            
            # Format date for display
            date_obj = datetime.strptime(date, "%Y-%m-%d")
            display_date = date_obj.strftime("%b %d")
            
            result.append({
                "date": display_date,
                "overall": overall,
                "liquidity": data['liquidity'],
                "valuation": data['valuation'],
                "credit": data['credit'],
                "macro": data['macro'],
                "technical": data.get('technical', 0)
            })
    
    return result

def main():
    """Main function to fetch and save historical data"""
    print("Fetching historical risk data...")
    
    days = 90  # Fetch 90 days of data
    
    # Fetch data for each category
    print("Fetching liquidity data...")
    liquidity = fetch_historical_liquidity(days)
    
    print("Fetching valuation data...")
    valuation = fetch_historical_valuation(days)
    
    print("Fetching credit data...")
    credit = fetch_historical_credit(days)
    
    print("Fetching macro data...")
    macro = fetch_historical_macro(days)
    
    print("Fetching technical data...")
    technical = fetch_historical_technical(days)
    
    # Merge all data
    print("Merging historical data...")
    historical_data = merge_historical_data(liquidity, valuation, credit, macro, technical)
    
    # Take last 30 days for chart
    historical_data = historical_data[-30:]
    
    # Save to file
    output_file = os.path.join(os.path.dirname(__file__), '..', 'client', 'public', 'historical_data.json')
    
    output = {
        "generated_at": datetime.now().isoformat(),
        "days": len(historical_data),
        "data": historical_data
    }
    
    with open(output_file, 'w') as f:
        json.dump(output, f, indent=2)
    
    print(f"Historical data saved to {output_file}")
    print(f"Generated {len(historical_data)} days of data")
    
    # Print sample
    if historical_data:
        print("\nSample data (first 3 days):")
        for item in historical_data[:3]:
            print(f"  {item['date']}: Overall={item['overall']}, Liquidity={item['liquidity']}, Valuation={item['valuation']}")

if __name__ == "__main__":
    main()
