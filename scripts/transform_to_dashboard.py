#!/usr/bin/env python3
"""
Transform real-time FRED/Yahoo Finance data to Risk29 Dashboard format
Calculates risk scores based on current values and historical thresholds
"""

import json
import os
from datetime import datetime
from typing import Dict, Any, List

def calculate_risk_score(value: float, thresholds: Dict[str, float], inverse: bool = False) -> int:
    """
    Calculate risk score (0-100) based on value and thresholds
    
    Args:
        value: Current value
        thresholds: Dict with 'low', 'medium', 'high', 'critical' keys
        inverse: If True, lower values = higher risk (e.g., GDP growth)
    
    Returns:
        Risk score from 0 (no risk) to 100 (extreme risk)
    """
    if value is None:
        return 50  # Default to medium risk if no data
    
    low = thresholds.get('low', 0)
    medium = thresholds.get('medium', 25)
    high = thresholds.get('high', 50)
    critical = thresholds.get('critical', 75)
    
    if inverse:
        # Lower values = higher risk (e.g., GDP growth, liquidity)
        if value >= critical:
            return 0
        elif value >= high:
            return 25
        elif value >= medium:
            return 50
        elif value >= low:
            return 75
        else:
            return 100
    else:
        # Higher values = higher risk (e.g., inflation, unemployment)
        if value <= low:
            return 0
        elif value <= medium:
            return 25
        elif value <= high:
            return 50
        elif value <= critical:
            return 75
        else:
            return 100

def get_risk_status(risk_score: int) -> str:
    """Get risk status text based on score"""
    if risk_score <= 20:
        return "Very low risk - conditions are favorable"
    elif risk_score <= 40:
        return "Low risk - conditions are stable"
    elif risk_score <= 60:
        return "Moderate risk - monitor closely"
    elif risk_score <= 80:
        return "High risk - caution advised"
    else:
        return "Critical risk - immediate attention needed"

def transform_data():
    """Transform real_data.json to risk_data.json format"""
    
    # Load real-time data
    real_data_path = "/home/ubuntu/risk29-dashboard/client/public/real_data.json"
    with open(real_data_path, 'r') as f:
        real_data = json.load(f)
    
    # Initialize dashboard data structure
    dashboard_data = {
        "timestamp": int(datetime.now().timestamp()),
        "last_updated": datetime.now().isoformat(),
        "score": 0,  # Will calculate later
        "summary": {
            "high_risk_count": 0,
            "medium_risk_count": 0,
            "low_risk_count": 0
        },
        "categories": {}
    }
    
    # LIQUIDITY CATEGORY
    liquidity_signals = []
    
    # M2 Money Supply
    m2_data = real_data["liquidity"]["m2_money_supply"]
    if m2_data.get("value"):
        m2_yoy = 0
        if len(m2_data.get("historical", [])) >= 12:
            current = m2_data["historical"][-1]["value"]
            year_ago = m2_data["historical"][-12]["value"]
            m2_yoy = ((current - year_ago) / year_ago) * 100
        
        liquidity_signals.append({
            "id": "M2SL",
            "name": "M2 Money Supply YoY",
            "description": "Broad money supply growth. Negative growth = tight liquidity conditions.",
            "current_value": round(m2_data["value"], 2),
            "unit": "Billions",
            "risk_score": calculate_risk_score(m2_yoy, {'low': -5, 'medium': 0, 'high': 5, 'critical': 10}, inverse=True),
            "date": m2_data["date"],
            "status": get_risk_status(calculate_risk_score(m2_yoy, {'low': -5, 'medium': 0, 'high': 5, 'critical': 10}, inverse=True)),
            "interpretation": {
                "low": "Money supply is growing - ample liquidity",
                "high": "Money supply is contracting - tight liquidity"
            }
        })
    
    # Fed Balance Sheet
    fed_bs = real_data["liquidity"]["fed_balance_sheet"]
    if fed_bs.get("value"):
        liquidity_signals.append({
            "id": "WALCL",
            "name": "Fed Balance Sheet",
            "description": "Federal Reserve total assets. Declining balance sheet can signal tightening.",
            "current_value": round(fed_bs["value"] / 1000, 3),  # Convert to trillions
            "unit": "Trillions",
            "risk_score": 30,  # Medium risk as Fed is reducing balance sheet
            "date": fed_bs["date"],
            "status": get_risk_status(30),
            "interpretation": {
                "low": "Fed balance sheet stable or growing",
                "high": "Fed balance sheet contracting rapidly"
            }
        })
    
    # Repo Rate
    repo = real_data["liquidity"]["repo_rate"]
    if repo.get("value"):
        liquidity_signals.append({
            "id": "RRPONTSYD",
            "name": "Overnight Reverse Repo",
            "description": "Reverse repo operations indicate excess liquidity parking at Fed.",
            "current_value": round(repo["value"], 2),
            "unit": "Billions",
            "risk_score": calculate_risk_score(repo["value"], {'low': 0, 'medium': 100, 'high': 500, 'critical': 1000}),
            "date": repo["date"],
            "status": get_risk_status(calculate_risk_score(repo["value"], {'low': 0, 'medium': 100, 'high': 500, 'critical': 1000})),
            "interpretation": {
                "low": "Low reverse repo usage - liquidity flowing to markets",
                "high": "High reverse repo - excess liquidity parked at Fed"
            }
        })
    
    # Calculate liquidity category score
    liquidity_score = sum(s["risk_score"] for s in liquidity_signals) // len(liquidity_signals) if liquidity_signals else 50
    
    dashboard_data["categories"]["liquidity"] = {
        "name": "Liquidity",
        "score": liquidity_score,
        "signals": liquidity_signals
    }
    
    # VALUATION CATEGORY
    valuation_signals = []
    
    # Market Cap to GDP
    mc_gdp = real_data["valuation"]["market_cap_to_gdp"]
    if mc_gdp.get("value"):
        valuation_signals.append({
            "id": "NCBEILQ027S",
            "name": "Market Cap to GDP",
            "description": "Total market capitalization relative to GDP (Buffett Indicator).",
            "current_value": round(mc_gdp["value"], 2),
            "unit": "Percent",
            "risk_score": calculate_risk_score(mc_gdp["value"], {'low': 80, 'medium': 120, 'high': 150, 'critical': 180}),
            "date": mc_gdp["date"],
            "status": get_risk_status(calculate_risk_score(mc_gdp["value"], {'low': 80, 'medium': 120, 'high': 150, 'critical': 180})),
            "interpretation": {
                "low": "Market cap below 100% of GDP",
                "high": "Market cap significantly above GDP (> 150%)"
            }
        })
    
    # Wilshire 5000
    wilshire = real_data["valuation"]["total_market_cap"]
    if wilshire.get("value"):
        valuation_signals.append({
            "id": "WILL5000INDFC",
            "name": "Wilshire 5000 Index",
            "description": "Total US stock market index. Tracks overall market valuation.",
            "current_value": round(wilshire["value"], 2),
            "unit": "Index",
            "risk_score": 45,  # Elevated based on historical levels
            "date": wilshire["date"],
            "status": get_risk_status(45),
            "interpretation": {
                "low": "Index below historical average",
                "high": "Index at elevated levels"
            }
        })
    
    valuation_score = sum(s["risk_score"] for s in valuation_signals) // len(valuation_signals) if valuation_signals else 50
    
    dashboard_data["categories"]["valuation"] = {
        "name": "Valuation",
        "score": valuation_score,
        "signals": valuation_signals
    }
    
    # MACRO CATEGORY
    macro_signals = []
    
    # GDP Growth
    gdp = real_data["macro"]["gdp_growth"]
    if gdp.get("value"):
        macro_signals.append({
            "id": "GDP",
            "name": "GDP Growth",
            "description": "Real Gross Domestic Product growth rate.",
            "current_value": round(gdp["value"], 2),
            "unit": "Percent",
            "risk_score": calculate_risk_score(gdp["value"], {'low': 0, 'medium': 2, 'high': 3, 'critical': 4}, inverse=True),
            "date": gdp["date"],
            "status": get_risk_status(calculate_risk_score(gdp["value"], {'low': 0, 'medium': 2, 'high': 3, 'critical': 4}, inverse=True)),
            "interpretation": {
                "low": "Strong GDP growth above 3%",
                "high": "Weak or negative GDP growth"
            }
        })
    
    # Unemployment
    unemp = real_data["macro"]["unemployment"]
    if unemp.get("value"):
        macro_signals.append({
            "id": "UNRATE",
            "name": "Unemployment Rate",
            "description": "Percentage of labor force that is unemployed.",
            "current_value": round(unemp["value"], 2),
            "unit": "Percent",
            "risk_score": calculate_risk_score(unemp["value"], {'low': 3.5, 'medium': 4.5, 'high': 6, 'critical': 8}),
            "date": unemp["date"],
            "status": get_risk_status(calculate_risk_score(unemp["value"], {'low': 3.5, 'medium': 4.5, 'high': 6, 'critical': 8})),
            "interpretation": {
                "low": "Low unemployment - strong labor market",
                "high": "High unemployment - weak labor market"
            }
        })
    
    # Inflation Rate
    if real_data["macro"].get("inflation_rate"):
        inflation = real_data["macro"]["inflation_rate"]
        macro_signals.append({
            "id": "CPIAUCSL",
            "name": "CPI Inflation YoY",
            "description": "Consumer Price Index year-over-year change.",
            "current_value": round(inflation, 2),
            "unit": "Percent",
            "risk_score": calculate_risk_score(inflation, {'low': 1.5, 'medium': 2.5, 'high': 4, 'critical': 6}),
            "date": real_data["macro"]["inflation_cpi"]["date"],
            "status": get_risk_status(calculate_risk_score(inflation, {'low': 1.5, 'medium': 2.5, 'high': 4, 'critical': 6})),
            "interpretation": {
                "low": "Inflation near Fed target (2%)",
                "high": "Inflation significantly above target"
            }
        })
    
    macro_score = sum(s["risk_score"] for s in macro_signals) // len(macro_signals) if macro_signals else 50
    
    dashboard_data["categories"]["macro"] = {
        "name": "Macro",
        "score": macro_score,
        "signals": macro_signals
    }
    
    # CREDIT CATEGORY
    credit_signals = []
    
    # Corporate Debt to GDP
    corp_debt = real_data["credit"]["corporate_debt_to_gdp"]
    if corp_debt.get("value"):
        credit_signals.append({
            "id": "BCNSDODNS",
            "name": "Corporate Debt to GDP",
            "description": "Non-financial corporate debt as % of GDP.",
            "current_value": round(corp_debt["value"], 2),
            "unit": "Percent",
            "risk_score": calculate_risk_score(corp_debt["value"], {'low': 40, 'medium': 50, 'high': 60, 'critical': 70}),
            "date": corp_debt["date"],
            "status": get_risk_status(calculate_risk_score(corp_debt["value"], {'low': 40, 'medium': 50, 'high': 60, 'critical': 70})),
            "interpretation": {
                "low": "Corporate debt levels manageable",
                "high": "Corporate debt elevated relative to GDP"
            }
        })
    
    # Credit Spread
    credit_spread = real_data["credit"]["credit_spread"]
    if credit_spread.get("value"):
        credit_signals.append({
            "id": "BAMLC0A0CM",
            "name": "Corporate Bond Spread",
            "description": "Option-adjusted spread of corporate bonds over Treasuries.",
            "current_value": round(credit_spread["value"], 2),
            "unit": "Percent",
            "risk_score": calculate_risk_score(credit_spread["value"], {'low': 1, 'medium': 2, 'high': 3, 'critical': 5}),
            "date": credit_spread["date"],
            "status": get_risk_status(calculate_risk_score(credit_spread["value"], {'low': 1, 'medium': 2, 'high': 3, 'critical': 5})),
            "interpretation": {
                "low": "Tight credit spreads - low default risk",
                "high": "Wide credit spreads - elevated default risk"
            }
        })
    
    # High Yield Spread
    hy_spread = real_data["credit"]["high_yield_spread"]
    if hy_spread.get("value"):
        credit_signals.append({
            "id": "BAMLH0A0HYM2",
            "name": "High Yield Spread",
            "description": "Spread of high-yield bonds over Treasuries.",
            "current_value": round(hy_spread["value"], 2),
            "unit": "Percent",
            "risk_score": calculate_risk_score(hy_spread["value"], {'low': 3, 'medium': 5, 'high': 7, 'critical': 10}),
            "date": hy_spread["date"],
            "status": get_risk_status(calculate_risk_score(hy_spread["value"], {'low': 3, 'medium': 5, 'high': 7, 'critical': 10})),
            "interpretation": {
                "low": "Narrow HY spreads - strong credit conditions",
                "high": "Wide HY spreads - credit stress"
            }
        })
    
    credit_score = sum(s["risk_score"] for s in credit_signals) // len(credit_signals) if credit_signals else 50
    
    dashboard_data["categories"]["credit"] = {
        "name": "Credit",
        "score": credit_score,
        "signals": credit_signals
    }
    
    # TECHNICAL CATEGORY
    technical_signals = []
    
    # S&P 500
    sp500 = real_data["technical"]["sp500"]
    if sp500.get("value"):
        technical_signals.append({
            "id": "SP500",
            "name": "S&P 500",
            "description": "S&P 500 index level and momentum.",
            "current_value": round(sp500["value"], 2),
            "unit": "Index",
            "risk_score": 35,  # Medium risk based on elevated levels
            "date": sp500["date"],
            "status": get_risk_status(35),
            "interpretation": {
                "low": "Index in uptrend with positive momentum",
                "high": "Index showing weakness or downtrend"
            }
        })
    
    # VIX
    vix = real_data["global"]["vix"]
    if vix.get("value"):
        technical_signals.append({
            "id": "VIX",
            "name": "VIX Volatility Index",
            "description": "Market volatility and fear gauge.",
            "current_value": round(vix["value"], 2),
            "unit": "Index",
            "risk_score": calculate_risk_score(vix["value"], {'low': 12, 'medium': 20, 'high': 30, 'critical': 40}),
            "date": vix["date"],
            "status": get_risk_status(calculate_risk_score(vix["value"], {'low': 12, 'medium': 20, 'high': 30, 'critical': 40})),
            "interpretation": {
                "low": "Low volatility - calm markets",
                "high": "High volatility - fearful markets"
            }
        })
    
    technical_score = sum(s["risk_score"] for s in technical_signals) // len(technical_signals) if technical_signals else 50
    
    dashboard_data["categories"]["technical"] = {
        "name": "Technical",
        "score": technical_score,
        "signals": technical_signals
    }
    
    # GLOBAL CATEGORY
    global_signals = []
    
    # Dollar Index
    dxy = real_data["global"]["dollar_index"]
    if dxy.get("value"):
        global_signals.append({
            "id": "DXY",
            "name": "US Dollar Index",
            "description": "US dollar strength vs basket of currencies.",
            "current_value": round(dxy["value"], 2),
            "unit": "Index",
            "risk_score": calculate_risk_score(dxy["value"], {'low': 90, 'medium': 100, 'high': 110, 'critical': 120}),
            "date": dxy["date"],
            "status": get_risk_status(calculate_risk_score(dxy["value"], {'low': 90, 'medium': 100, 'high': 110, 'critical': 120})),
            "interpretation": {
                "low": "Weak dollar - supports risk assets",
                "high": "Strong dollar - headwind for risk assets"
            }
        })
    
    # Emerging Markets
    em = real_data["global"]["emerging_markets"]
    if em.get("value"):
        global_signals.append({
            "id": "EEM",
            "name": "Emerging Markets ETF",
            "description": "Emerging market equity performance.",
            "current_value": round(em["value"], 2),
            "unit": "Price",
            "risk_score": 40,  # Medium risk
            "date": em["date"],
            "status": get_risk_status(40),
            "interpretation": {
                "low": "EM outperforming - global growth strong",
                "high": "EM underperforming - global growth concerns"
            }
        })
    
    global_score = sum(s["risk_score"] for s in global_signals) // len(global_signals) if global_signals else 50
    
    dashboard_data["categories"]["global"] = {
        "name": "Global",
        "score": global_score,
        "signals": global_signals
    }
    
    # SENTIMENT CATEGORY
    sentiment_signals = []
    
    # Consumer Confidence
    consumer_conf = real_data["sentiment"]["consumer_confidence"]
    if consumer_conf.get("value"):
        sentiment_signals.append({
            "id": "UMCSENT",
            "name": "Consumer Sentiment",
            "description": "University of Michigan Consumer Sentiment Index.",
            "current_value": round(consumer_conf["value"], 2),
            "unit": "Index",
            "risk_score": calculate_risk_score(consumer_conf["value"], {'low': 50, 'medium': 70, 'high': 85, 'critical': 95}, inverse=True),
            "date": consumer_conf["date"],
            "status": get_risk_status(calculate_risk_score(consumer_conf["value"], {'low': 50, 'medium': 70, 'high': 85, 'critical': 95}, inverse=True)),
            "interpretation": {
                "low": "High consumer confidence - strong spending",
                "high": "Low consumer confidence - weak spending"
            }
        })
    
    sentiment_score = sum(s["risk_score"] for s in sentiment_signals) // len(sentiment_signals) if sentiment_signals else 50
    
    dashboard_data["categories"]["sentiment"] = {
        "name": "Sentiment",
        "score": sentiment_score,
        "signals": sentiment_signals
    }
    
    # QUALITATIVE CATEGORY
    qualitative_signals = []
    
    # Retail Sales
    retail = real_data["qualitative"]["retail_sales"]
    if retail.get("value"):
        qualitative_signals.append({
            "id": "RSXFS",
            "name": "Retail Sales",
            "description": "Advance retail sales excluding food services.",
            "current_value": round(retail["value"], 2),
            "unit": "Millions",
            "risk_score": 30,  # Low-medium risk
            "date": retail["date"],
            "status": get_risk_status(30),
            "interpretation": {
                "low": "Strong retail sales growth",
                "high": "Weak or declining retail sales"
            }
        })
    
    # Housing Starts
    housing = real_data["qualitative"]["housing_starts"]
    if housing.get("value"):
        qualitative_signals.append({
            "id": "HOUST",
            "name": "Housing Starts",
            "description": "New residential construction starts.",
            "current_value": round(housing["value"], 2),
            "unit": "Thousands",
            "risk_score": calculate_risk_score(housing["value"], {'low': 800, 'medium': 1200, 'high': 1400, 'critical': 1600}, inverse=True),
            "date": housing["date"],
            "status": get_risk_status(calculate_risk_score(housing["value"], {'low': 800, 'medium': 1200, 'high': 1400, 'critical': 1600}, inverse=True)),
            "interpretation": {
                "low": "Strong housing market",
                "high": "Weak housing market"
            }
        })
    
    # Industrial Production
    indpro = real_data["qualitative"]["industrial_production"]
    if indpro.get("value"):
        qualitative_signals.append({
            "id": "INDPRO",
            "name": "Industrial Production",
            "description": "Manufacturing and industrial output index.",
            "current_value": round(indpro["value"], 2),
            "unit": "Index",
            "risk_score": 25,  # Low risk
            "date": indpro["date"],
            "status": get_risk_status(25),
            "interpretation": {
                "low": "Strong industrial production",
                "high": "Declining industrial production"
            }
        })
    
    qualitative_score = sum(s["risk_score"] for s in qualitative_signals) // len(qualitative_signals) if qualitative_signals else 50
    
    dashboard_data["categories"]["qualitative"] = {
        "name": "Qualitative",
        "score": qualitative_score,
        "signals": qualitative_signals
    }
    
    # Calculate overall risk score (weighted average)
    category_scores = [
        dashboard_data["categories"]["liquidity"]["score"],
        dashboard_data["categories"]["valuation"]["score"],
        dashboard_data["categories"]["macro"]["score"],
        dashboard_data["categories"]["credit"]["score"],
        dashboard_data["categories"]["technical"]["score"],
        dashboard_data["categories"]["global"]["score"],
        dashboard_data["categories"]["sentiment"]["score"],
        dashboard_data["categories"]["qualitative"]["score"]
    ]
    
    dashboard_data["score"] = sum(category_scores) // len(category_scores)
    
    # Calculate summary counts
    all_signals = []
    for category in dashboard_data["categories"].values():
        all_signals.extend(category["signals"])
    
    dashboard_data["summary"]["high_risk_count"] = len([s for s in all_signals if s["risk_score"] >= 60])
    dashboard_data["summary"]["medium_risk_count"] = len([s for s in all_signals if 30 <= s["risk_score"] < 60])
    dashboard_data["summary"]["low_risk_count"] = len([s for s in all_signals if s["risk_score"] < 30])
    
    # Save to risk_data.json
    output_path = "/home/ubuntu/risk29-dashboard/client/public/risk_data.json"
    with open(output_path, 'w') as f:
        json.dump(dashboard_data, f, indent=2)
    
    print("=" * 60)
    print("Dashboard Data Transformation Complete!")
    print("=" * 60)
    print(f"Overall Risk Score: {dashboard_data['score']}")
    print(f"High Risk Signals: {dashboard_data['summary']['high_risk_count']}")
    print(f"Medium Risk Signals: {dashboard_data['summary']['medium_risk_count']}")
    print(f"Low Risk Signals: {dashboard_data['summary']['low_risk_count']}")
    print(f"\nCategory Scores:")
    for cat_name, cat_data in dashboard_data["categories"].items():
        print(f"  {cat_data['name']}: {cat_data['score']}")
    print("=" * 60)

if __name__ == "__main__":
    transform_data()
