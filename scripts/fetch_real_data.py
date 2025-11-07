#!/usr/bin/env python3
"""
Real-time data fetcher for Risk29 Dashboard
Fetches data from FRED, Yahoo Finance, and other sources
"""

import os
import json
from datetime import datetime, timedelta
from fredapi import Fred
import yfinance as yf
import requests
from typing import Dict, Any

# API Keys
FRED_API_KEY = os.getenv('FRED_API_KEY', 'e438e833b710bbc9f7defdb12b9fa33e')

# Initialize FRED API
fred = Fred(api_key=FRED_API_KEY)

def fetch_fred_data(series_id: str, days_back: int = 365) -> Dict[str, Any]:
    """Fetch data from FRED API"""
    try:
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days_back)
        
        data = fred.get_series(series_id, start_date=start_date, end_date=end_date)
        
        if len(data) == 0:
            return {"value": None, "error": "No data available"}
        
        # Get latest value
        latest_value = float(data.iloc[-1])
        
        # Get historical values for trend
        historical = []
        for date, value in data.tail(30).items():
            historical.append({
                "date": date.strftime("%Y-%m-%d"),
                "value": float(value)
            })
        
        return {
            "value": latest_value,
            "date": data.index[-1].strftime("%Y-%m-%d"),
            "historical": historical
        }
    except Exception as e:
        print(f"Error fetching {series_id}: {e}")
        return {"value": None, "error": str(e)}

def fetch_yahoo_finance(ticker: str) -> Dict[str, Any]:
    """Fetch data from Yahoo Finance"""
    try:
        stock = yf.Ticker(ticker)
        hist = stock.history(period="1mo")
        
        if len(hist) == 0:
            return {"value": None, "error": "No data available"}
        
        latest_price = float(hist['Close'].iloc[-1])
        
        if len(hist) >= 2:
            change = float(hist['Close'].iloc[-1] - hist['Close'].iloc[-2])
            change_pct = (change / hist['Close'].iloc[-2]) * 100
        else:
            change = 0
            change_pct = 0
        
        # Get historical values
        historical = []
        for date, row in hist.tail(30).iterrows():
            historical.append({
                "date": date.strftime("%Y-%m-%d"),
                "value": float(row['Close'])
            })
        
        return {
            "value": latest_price,
            "change": change,
            "change_pct": change_pct,
            "date": hist.index[-1].strftime("%Y-%m-%d"),
            "historical": historical
        }
    except Exception as e:
        print(f"Error fetching {ticker}: {e}")
        return {"value": None, "error": str(e)}

def calculate_market_cap_to_gdp() -> Dict[str, Any]:
    """Calculate Market Cap to GDP using FRED data directly"""
    try:
        # Use FRED series for Market Cap to GDP ratio
        # DDDM01USA156NWDB is Market Capitalization of Listed Domestic Companies (% of GDP)
        mc_gdp = fetch_fred_data("DDDM01USA156NWDB", days_back=730)
        return mc_gdp
    except Exception as e:
        print(f"Error fetching Market Cap to GDP: {e}")
        return {"value": None, "error": str(e)}

def calculate_yoy_change(current: float, year_ago: float) -> float:
    """Calculate year-over-year percentage change"""
    if year_ago == 0:
        return 0
    return ((current - year_ago) / year_ago) * 100

def fetch_all_data() -> Dict[str, Any]:
    """Fetch all data from various sources"""
    
    print("Fetching data from FRED and Yahoo Finance...")
    
    data = {
        "timestamp": datetime.now().isoformat(),
        "last_updated": datetime.now().strftime("%B %d, %Y %H:%M"),
        
        # Valuation Category
        "valuation": {
            "market_cap_to_gdp": calculate_market_cap_to_gdp(),  # Market Cap to GDP from FRED
            "sp500_pe": fetch_fred_data("SP500PE"),  # S&P 500 P/E Ratio
            "total_market_cap": fetch_yahoo_finance("^W5000"),  # Wilshire 5000
        },
        
        # Liquidity Category
        "liquidity": {
            "m2_money_supply": fetch_fred_data("M2SL"),  # M2 Money Supply
            "fed_balance_sheet": fetch_fred_data("WALCL"),  # Fed Balance Sheet
            "repo_rate": fetch_fred_data("RRPONTSYD"),  # Overnight Reverse Repo
        },
        
        # Credit Category
        "credit": {
            "corporate_debt_to_gdp": fetch_fred_data("BCNSDODNS"),  # Corporate Debt
            "credit_spread": fetch_fred_data("BAMLC0A0CM"),  # Corporate Bond Spread
            "high_yield_spread": fetch_fred_data("BAMLH0A0HYM2"),  # High Yield Spread
        },
        
        # Macro Category
        "macro": {
            "gdp_growth": fetch_fred_data("A191RL1Q225SBEA"),  # Real GDP Growth Rate
            "unemployment": fetch_fred_data("UNRATE"),  # Unemployment Rate
            "inflation_cpi": fetch_fred_data("CPIAUCSL"),  # CPI
            "pce_inflation": fetch_fred_data("PCEPI"),  # PCE Price Index
        },
        
        # Global Category
        "global": {
            "dollar_index": fetch_yahoo_finance("DX-Y.NYB"),  # Dollar Index
            "vix": fetch_yahoo_finance("^VIX"),  # VIX
            "emerging_markets": fetch_yahoo_finance("EEM"),  # Emerging Markets ETF
        },
        
        # Technical Category
        "technical": {
            "sp500": fetch_yahoo_finance("^GSPC"),  # S&P 500
            "nasdaq": fetch_yahoo_finance("^IXIC"),  # NASDAQ
            "dow": fetch_yahoo_finance("^DJI"),  # Dow Jones
            "russell_2000": fetch_yahoo_finance("^RUT"),  # Russell 2000
            # Asia Pacific Indices
            "nikkei": fetch_yahoo_finance("^N225"),  # Nikkei 225
            "hang_seng": fetch_yahoo_finance("^HSI"),  # Hang Seng
            "shanghai": fetch_yahoo_finance("000001.SS"),  # Shanghai Composite
            "kospi": fetch_yahoo_finance("^KS11"),  # KOSPI
            "set": fetch_yahoo_finance("^SET.BK"),  # SET Thailand
        },
        
        # Sentiment Category
        "sentiment": {
            "consumer_confidence": fetch_fred_data("UMCSENT"),  # U of Michigan Consumer Sentiment
            "aaii_sentiment": fetch_fred_data("AAIIBULL"),  # AAII Bullish Sentiment
        },
        
        # Qualitative Category
        "qualitative": {
            "retail_sales": fetch_fred_data("RSXFS"),  # Retail Sales
            "housing_starts": fetch_fred_data("HOUST"),  # Housing Starts
            "industrial_production": fetch_fred_data("INDPRO"),  # Industrial Production
        },
        
        # Additional Market Data
        "markets": {
            "gold": fetch_yahoo_finance("GC=F"),  # Gold Futures
            "silver": fetch_yahoo_finance("SI=F"),  # Silver Futures
            "crude_oil": fetch_yahoo_finance("CL=F"),  # Crude Oil WTI
            "brent_oil": fetch_yahoo_finance("BZ=F"),  # Brent Oil
            "natural_gas": fetch_yahoo_finance("NG=F"),  # Natural Gas
            "copper": fetch_yahoo_finance("HG=F"),  # Copper
            "us_10y": fetch_fred_data("DGS10"),  # 10-Year Treasury
            "us_2y": fetch_fred_data("DGS2"),  # 2-Year Treasury
        },
        
        # Global Indices
        "global_indices": {
            "nikkei": fetch_yahoo_finance("^N225"),  # Nikkei 225
            "hang_seng": fetch_yahoo_finance("^HSI"),  # Hang Seng
            "shanghai": fetch_yahoo_finance("000001.SS"),  # Shanghai Composite
            "kospi": fetch_yahoo_finance("^KS11"),  # KOSPI
            "set": fetch_yahoo_finance("^SET.BK"),  # SET Thailand
            "ftse": fetch_yahoo_finance("^FTSE"),  # FTSE 100
            "dax": fetch_yahoo_finance("^GDAXI"),  # DAX
            "cac": fetch_yahoo_finance("^FCHI"),  # CAC 40
            "ftse_mib": fetch_yahoo_finance("FTSEMIB.MI"),  # FTSE MIB
            "bovespa": fetch_yahoo_finance("^BVSP"),  # Bovespa
            "stoxx50": fetch_yahoo_finance("^STOXX50E"),  # Euro Stoxx 50
        }
    }
    
    print("Data fetching complete!")
    return data

def calculate_inflation_rate(cpi_data: Dict[str, Any]) -> float:
    """Calculate inflation rate from CPI data"""
    try:
        if not cpi_data.get("historical") or len(cpi_data["historical"]) < 12:
            return None
        
        current_cpi = cpi_data["historical"][-1]["value"]
        year_ago_cpi = cpi_data["historical"][-12]["value"]
        
        inflation_rate = ((current_cpi - year_ago_cpi) / year_ago_cpi) * 100
        return round(inflation_rate, 2)
    except Exception as e:
        print(f"Error calculating inflation rate: {e}")
        return None

def main():
    """Main function to fetch and save data"""
    print("=" * 60)
    print("Risk29 Real Data Fetcher")
    print("=" * 60)
    
    # Fetch all data
    data = fetch_all_data()
    
    # Calculate derived metrics
    if data["macro"]["inflation_cpi"].get("value"):
        inflation_rate = calculate_inflation_rate(data["macro"]["inflation_cpi"])
        data["macro"]["inflation_rate"] = inflation_rate
    
    # Save to JSON file
    # Use relative path for GitHub Actions compatibility
    script_dir = os.path.dirname(os.path.abspath(__file__))
    output_path = os.path.join(script_dir, "..", "client", "public", "real_data.json")
    output_path = os.path.normpath(output_path)
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    with open(output_path, 'w') as f:
        json.dump(data, f, indent=2)
    
    print(f"\n✅ Data saved to: {output_path}")
    print(f"📊 Timestamp: {data['timestamp']}")
    
    # Print summary
    print("\n" + "=" * 60)
    print("Data Summary:")
    print("=" * 60)
    
    # Market Cap to GDP
    mc_gdp = data["valuation"]["market_cap_to_gdp"]
    if mc_gdp.get("value"):
        print(f"Market Cap to GDP: {mc_gdp['value']:.2f}%")
    
    # GDP Growth
    gdp = data["macro"]["gdp_growth"]
    if gdp.get("value"):
        print(f"GDP Growth: {gdp['value']:.2f}%")
    
    # Inflation
    if data["macro"].get("inflation_rate"):
        print(f"Inflation Rate: {data['macro']['inflation_rate']:.2f}%")
    
    # Unemployment
    unemp = data["macro"]["unemployment"]
    if unemp.get("value"):
        print(f"Unemployment Rate: {unemp['value']:.2f}%")
    
    # Dollar Index
    dxy = data["global"]["dollar_index"]
    if dxy.get("value"):
        print(f"Dollar Index (DXY): {dxy['value']:.2f}")
    
    # S&P 500
    sp500 = data["technical"]["sp500"]
    if sp500.get("value"):
        print(f"S&P 500: {sp500['value']:.2f} ({sp500.get('change_pct', 0):.2f}%)")
    
    # VIX
    vix = data["global"]["vix"]
    if vix.get("value"):
        print(f"VIX: {vix['value']:.2f}")
    
    print("=" * 60)

if __name__ == "__main__":
    main()
