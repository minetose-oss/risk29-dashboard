#!/usr/bin/env python3
"""
Combine 17 existing indicators + 6 new indicators = 23 total indicators
Merges data from historical_data.json and new_indicators_data.json
Outputs enhanced_historical_data.json with all 23 indicators
"""

import json
import os
from datetime import datetime
from typing import Dict, List, Any

def load_json(filepath: str) -> Dict:
    """Load JSON file"""
    with open(filepath, 'r') as f:
        return json.load(f)

def save_json(data: Dict, filepath: str):
    """Save JSON file"""
    with open(filepath, 'w') as f:
        json.dump(data, f, indent=2)

def calculate_weighted_average(values: Dict[str, float], weights: Dict[str, float]) -> float:
    """Calculate weighted average"""
    total = 0
    total_weight = 0
    
    for key, value in values.items():
        if key in weights and value is not None:
            total += value * weights[key]
            total_weight += weights[key]
    
    return round(total / total_weight, 1) if total_weight > 0 else None

def normalize_date(date_str: str) -> str:
    """Normalize date to YYYY-MM-DD format"""
    from datetime import datetime
    
    # If already in YYYY-MM-DD format
    if '-' in date_str and len(date_str) == 10:
        return date_str
    
    # If in "Mon DD" format (e.g., "Sep 18")
    try:
        # Assume current year
        current_year = datetime.now().year
        date_obj = datetime.strptime(f"{date_str} {current_year}", "%b %d %Y")
        return date_obj.strftime("%Y-%m-%d")
    except:
        return date_str

def combine_indicators():
    """Combine 17 existing + 6 new indicators"""
    
    print("=" * 70)
    print("COMBINING 17 + 6 INDICATORS = 23 TOTAL")
    print("=" * 70)
    
    # Load existing 17-indicator data
    print("\n1. Loading existing 17-indicator data...")
    existing_path = "../client/public/historical_data.json"
    existing_data = load_json(existing_path)
    print(f"   ✅ Loaded {len(existing_data['data'])} days of data")
    
    # Load new 6-indicator data
    print("\n2. Loading new 6-indicator data...")
    new_path = "../client/public/new_indicators_data.json"
    new_data = load_json(new_path)
    print(f"   ✅ Loaded 6 new indicators")
    
    # Create lookup dictionaries for new indicators
    print("\n3. Creating lookup dictionaries...")
    new_indicators_by_date = {}
    
    for indicator_name, indicator_data in new_data['indicators'].items():
        for item in indicator_data:
            date = item['date']
            if date not in new_indicators_by_date:
                new_indicators_by_date[date] = {}
            new_indicators_by_date[date][indicator_name] = item['value']
    
    print(f"   ✅ Processed {len(new_indicators_by_date)} dates")
    
    # Updated weights for 23 indicators
    weights = {
        # Liquidity (25%): 5 indicators
        'liquidity_base': 0.25,  # From 17-indicator model
        'liquidity_weights': {
            'existing': 0.80,  # M2, Fed BS, RRP, Reserves (from 17-indicator)
            'sofr': 0.20       # New SOFR
        },
        
        # Credit (20%): 5 indicators
        'credit_base': 0.20,
        'credit_weights': {
            'existing': 0.60,  # HY Spread, TED, CP (from 17-indicator)
            'yield_curve': 0.25,  # New Yield Curve
            'consumer_delinquency': 0.15  # New Consumer Delinquency
        },
        
        # Macro (15%): 7 indicators
        'macro_base': 0.15,
        'macro_weights': {
            'existing': 0.64,  # Unemployment, Claims, PMI, Confidence (from 17-indicator)
            'sahm_rule': 0.20,  # New Sahm Rule
            'housing_starts': 0.08,  # New Housing Starts
            'retail_sales': 0.08  # New Retail Sales
        },
        
        # Valuation (25%): 3 indicators (unchanged)
        'valuation_base': 0.25,
        
        # Technical (15%): 3 indicators (unchanged)
        'technical_base': 0.15
    }
    
    # Combine data
    print("\n4. Combining indicators...")
    enhanced_data = []
    
    for item in existing_data['data']:
        date = normalize_date(item['date'])
        
        # Get existing values
        liquidity_existing = item.get('liquidity', 45)
        credit_existing = item.get('credit', 15)
        macro_existing = item.get('macro', 56)
        valuation = item.get('valuation', 73)
        technical = item.get('technical', 33)
        
        # Get new indicator values
        new_vals = new_indicators_by_date.get(date, {})
        sofr = new_vals.get('sofr', None)
        yield_curve = new_vals.get('yield_curve', None)
        consumer_delinquency = new_vals.get('consumer_delinquency', None)
        sahm_rule = new_vals.get('sahm_rule', None)
        housing_starts = new_vals.get('housing_starts', None)
        retail_sales = new_vals.get('retail_sales', None)
        
        # Calculate enhanced category scores
        # Liquidity: existing (80%) + SOFR (20%)
        if sofr is not None:
            liquidity_enhanced = (
                liquidity_existing * weights['liquidity_weights']['existing'] +
                sofr * weights['liquidity_weights']['sofr']
            )
        else:
            liquidity_enhanced = liquidity_existing
        
        # Credit: existing (60%) + Yield Curve (25%) + Delinquency (15%)
        credit_components = {
            'existing': credit_existing,
            'yield_curve': yield_curve,
            'consumer_delinquency': consumer_delinquency
        }
        credit_enhanced = calculate_weighted_average(
            credit_components,
            weights['credit_weights']
        ) or credit_existing
        
        # Macro: existing (64%) + Sahm (20%) + Housing (8%) + Retail (8%)
        macro_components = {
            'existing': macro_existing,
            'sahm_rule': sahm_rule,
            'housing_starts': housing_starts,
            'retail_sales': retail_sales
        }
        macro_enhanced = calculate_weighted_average(
            macro_components,
            weights['macro_weights']
        ) or macro_existing
        
        # Calculate overall risk with enhanced categories
        overall_enhanced = (
            liquidity_enhanced * weights['liquidity_base'] +
            credit_enhanced * weights['credit_base'] +
            macro_enhanced * weights['macro_base'] +
            valuation * weights['valuation_base'] +
            technical * weights['technical_base']
        )
        
        enhanced_item = {
            "date": date,
            "overall": round(overall_enhanced, 1),
            "liquidity": round(liquidity_enhanced, 1),
            "credit": round(credit_enhanced, 1),
            "macro": round(macro_enhanced, 1),
            "valuation": round(valuation, 1),
            "technical": round(technical, 1),
            # Store new indicator values for reference
            "new_indicators": {
                "sofr": sofr,
                "yield_curve": yield_curve,
                "consumer_delinquency": consumer_delinquency,
                "sahm_rule": sahm_rule,
                "housing_starts": housing_starts,
                "retail_sales": retail_sales
            }
        }
        
        enhanced_data.append(enhanced_item)
    
    # Create output
    output = {
        "model_version": "enhanced_v2_23indicators",
        "generated_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "total_indicators": 23,
        "enhancements": {
            "liquidity": "5 indicators: M2, Fed BS, RRP, Reserves, SOFR",
            "credit": "5 indicators: HY Spread, TED, CP, Yield Curve (10Y-2Y), Consumer Delinquency",
            "macro": "7 indicators: Unemployment, Claims, PMI, Confidence, Sahm Rule, Housing Starts, Retail Sales",
            "valuation": "3 indicators: S&P 500, P/E Ratio, Buffett Indicator",
            "technical": "3 indicators: VIX, Put/Call Ratio, Market Breadth"
        },
        "data": enhanced_data
    }
    
    # Save enhanced data
    output_path = "../client/public/enhanced_historical_data.json"
    save_json(output, output_path)
    
    print(f"\n✅ SUCCESS! Saved to: {output_path}")
    print(f"\nSummary:")
    print(f"  - Total days: {len(enhanced_data)}")
    print(f"  - Total indicators: 23 (17 existing + 6 new)")
    print(f"  - Date range: {enhanced_data[0]['date']} to {enhanced_data[-1]['date']}")
    
    # Show comparison
    print(f"\nLatest Values (Comparison):")
    latest_old = existing_data['data'][-1]
    latest_new = enhanced_data[-1]
    
    print(f"  Overall: {latest_old['overall']} → {latest_new['overall']} ({latest_new['overall'] - latest_old['overall']:+.1f})")
    print(f"  Liquidity: {latest_old['liquidity']} → {latest_new['liquidity']} ({latest_new['liquidity'] - latest_old['liquidity']:+.1f})")
    print(f"  Credit: {latest_old['credit']} → {latest_new['credit']} ({latest_new['credit'] - latest_old['credit']:+.1f})")
    print(f"  Macro: {latest_old['macro']} → {latest_new['macro']} ({latest_new['macro'] - latest_old['macro']:+.1f})")
    
    print("\n" + "=" * 70)
    
    return output

if __name__ == "__main__":
    combine_indicators()
