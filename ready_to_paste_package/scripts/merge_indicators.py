#!/usr/bin/env python3
"""
Merge 6 new indicators into risk_data_v2.json
Combines existing 17 indicators with 6 new indicators to create 23 total
"""

import json
import os
from datetime import datetime

def merge_indicators():
    """Merge new_indicators_data.json into risk_data_v2.json"""
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    base_dir = os.path.join(script_dir, "..", "client", "public")
    base_dir = os.path.normpath(base_dir)
    
    # Load existing risk_data_v2.json (17 indicators)
    risk_data_path = os.path.join(base_dir, "risk_data_v2.json")
    with open(risk_data_path, 'r') as f:
        risk_data = json.load(f)
    
    # Load new_indicators_data.json (6 indicators)
    new_indicators_path = os.path.join(base_dir, "new_indicators_data.json")
    try:
        with open(new_indicators_path, 'r') as f:
            new_data = json.load(f)
    except FileNotFoundError:
        print("⚠️  new_indicators_data.json not found, skipping merge")
        return
    
    # Get latest data point
    if not new_data.get("data") or len(new_data["data"]) == 0:
        print("⚠️  No data in new_indicators_data.json, skipping merge")
        return
    
    latest = new_data["data"][-1]
    
    print(f"\n📊 Merging 6 new indicators into risk_data_v2.json...")
    print(f"Latest data date: {latest.get('date', 'unknown')}")
    
    # Add SOFR to Liquidity category
    if "liquidity" in risk_data["categories"]:
        sofr_value = latest["new_indicators"].get("sofr")
        if sofr_value is not None:
            risk_data["categories"]["liquidity"]["signals"].append({
                "id": "SOFR",
                "name": "Secured Overnight Financing Rate",
                "description": "Federal Reserve's preferred short-term interest rate benchmark.",
                "current_value": sofr_value,
                "unit": "Risk Score",
                "risk_score": sofr_value,
                "date": latest.get("date", datetime.now().strftime("%Y-%m-%d")),
                "status": get_status(sofr_value),
                "interpretation": {
                    "low": "Low SOFR indicates ample liquidity",
                    "high": "High SOFR suggests tight liquidity conditions"
                }
            })
            print(f"  ✅ Added SOFR: {sofr_value}")
    
    # Add Yield Curve and Consumer Delinquency to Credit category
    if "credit" in risk_data["categories"]:
        yield_curve = latest["new_indicators"].get("yield_curve")
        if yield_curve is not None:
            risk_data["categories"]["credit"]["signals"].append({
                "id": "YIELD_CURVE",
                "name": "Yield Curve (10Y-2Y)",
                "description": "Spread between 10-year and 2-year Treasury yields. Inversion signals recession risk.",
                "current_value": yield_curve,
                "unit": "Risk Score",
                "risk_score": yield_curve,
                "date": latest.get("date", datetime.now().strftime("%Y-%m-%d")),
                "status": get_status(yield_curve),
                "interpretation": {
                    "low": "Positive yield curve is normal",
                    "high": "Inverted yield curve signals recession risk"
                }
            })
            print(f"  ✅ Added Yield Curve: {yield_curve}")
        
        consumer_delinq = latest["new_indicators"].get("consumer_delinquency")
        if consumer_delinq is not None:
            risk_data["categories"]["credit"]["signals"].append({
                "id": "CONSUMER_DELINQ",
                "name": "Consumer Loan Delinquency",
                "description": "Percentage of consumer loans 90+ days past due.",
                "current_value": consumer_delinq,
                "unit": "Risk Score",
                "risk_score": consumer_delinq,
                "date": latest.get("date", datetime.now().strftime("%Y-%m-%d")),
                "status": get_status(consumer_delinq),
                "interpretation": {
                    "low": "Low delinquency indicates healthy consumer credit",
                    "high": "Rising delinquency signals credit stress"
                }
            })
            print(f"  ✅ Added Consumer Delinquency: {consumer_delinq}")
    
    # Add Sahm Rule, Housing Starts, Retail Sales to Macro category
    if "macro" in risk_data["categories"]:
        sahm_rule = latest["new_indicators"].get("sahm_rule")
        if sahm_rule is not None:
            risk_data["categories"]["macro"]["signals"].append({
                "id": "SAHM_RULE",
                "name": "Sahm Rule Recession Indicator",
                "description": "Real-time recession indicator based on unemployment rate changes.",
                "current_value": sahm_rule,
                "unit": "Risk Score",
                "risk_score": sahm_rule,
                "date": latest.get("date", datetime.now().strftime("%Y-%m-%d")),
                "status": get_status(sahm_rule),
                "interpretation": {
                    "low": "Below 0.5 suggests no recession",
                    "high": "Above 0.5 signals recession has begun"
                }
            })
            print(f"  ✅ Added Sahm Rule: {sahm_rule}")
        
        housing_starts = latest["new_indicators"].get("housing_starts")
        if housing_starts is not None:
            risk_data["categories"]["macro"]["signals"].append({
                "id": "HOUSING_STARTS",
                "name": "Housing Starts YoY Change",
                "description": "Year-over-year change in new residential construction.",
                "current_value": housing_starts,
                "unit": "Risk Score",
                "risk_score": housing_starts,
                "date": latest.get("date", datetime.now().strftime("%Y-%m-%d")),
                "status": get_status(housing_starts),
                "interpretation": {
                    "low": "Strong housing starts indicate economic strength",
                    "high": "Declining housing starts signal economic weakness"
                }
            })
            print(f"  ✅ Added Housing Starts: {housing_starts}")
        
        retail_sales = latest["new_indicators"].get("retail_sales")
        if retail_sales is not None:
            risk_data["categories"]["macro"]["signals"].append({
                "id": "RETAIL_SALES",
                "name": "Retail Sales YoY Change",
                "description": "Year-over-year change in retail sales.",
                "current_value": retail_sales,
                "unit": "Risk Score",
                "risk_score": retail_sales,
                "date": latest.get("date", datetime.now().strftime("%Y-%m-%d")),
                "status": get_status(retail_sales),
                "interpretation": {
                    "low": "Strong retail sales indicate healthy consumer spending",
                    "high": "Weak retail sales signal consumer weakness"
                }
            })
            print(f"  ✅ Added Retail Sales: {retail_sales}")
    
    # Recalculate category scores
    for category_name, category_data in risk_data["categories"].items():
        if "signals" in category_data and len(category_data["signals"]) > 0:
            scores = [s["risk_score"] for s in category_data["signals"] if s.get("risk_score") is not None]
            if scores:
                category_data["score"] = round(sum(scores) / len(scores))
    
    # Recalculate overall score
    category_scores = [cat["score"] for cat in risk_data["categories"].values() if cat.get("score") is not None]
    if category_scores:
        risk_data["score"] = round(sum(category_scores) / len(category_scores))
    
    # Update timestamp
    risk_data["timestamp"] = int(datetime.now().timestamp())
    risk_data["last_updated"] = datetime.now().isoformat()
    
    # Save updated risk_data_v2.json
    with open(risk_data_path, 'w') as f:
        json.dump(risk_data, f, indent=2)
    
    print(f"\n✅ Successfully merged 6 new indicators into risk_data_v2.json")
    print(f"   Total indicators: {sum(len(cat.get('signals', [])) for cat in risk_data['categories'].values())}")
    print(f"   Overall risk score: {risk_data['score']}")

def get_status(risk_score):
    """Get risk status based on score"""
    if risk_score is None:
        return "Unknown"
    elif risk_score <= 20:
        return "Very low risk - conditions are favorable"
    elif risk_score <= 40:
        return "Low risk - conditions are stable"
    elif risk_score <= 60:
        return "Moderate risk - monitor closely"
    elif risk_score <= 80:
        return "High risk - caution advised"
    else:
        return "Critical risk - immediate attention needed"

if __name__ == "__main__":
    merge_indicators()
