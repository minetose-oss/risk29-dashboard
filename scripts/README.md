# Risk29 Dashboard - Data Update Scripts

## Overview

This directory contains scripts for fetching and transforming real-time economic data for the Risk29 Dashboard.

## Scripts

### 1. `fetch_real_data.py`
Fetches real-time data from FRED API and Yahoo Finance.

**Data Sources:**
- **FRED API**: GDP, M2, CPI, unemployment, treasury yields, credit spreads, etc.
- **Yahoo Finance**: Stock indices (S&P 500, NASDAQ, etc.), commodities (gold, oil), global indices

**Output:** `client/public/real_data.json`

**Usage:**
```bash
python3 fetch_real_data.py
```

### 2. `transform_to_dashboard.py`
Transforms raw data into dashboard format with risk scores.

**Features:**
- Calculates risk scores (0-100) for each indicator
- Applies threshold-based risk assessment
- Generates category scores and overall risk score
- Creates dashboard-ready JSON structure

**Output:** `client/public/risk_data.json`

**Usage:**
```bash
python3 transform_to_dashboard.py
```

### 3. `update_all_data.py`
Master script that runs both fetch and transform steps.

**Usage:**
```bash
python3 update_all_data.py
```

## Automated Updates

The dashboard data is automatically updated every hour via GitHub Actions workflow (`.github/workflows/update-data.yml`).

**Schedule:** Every hour at minute 0 (00:00, 01:00, 02:00, etc.)

**Manual Trigger:** You can manually trigger the workflow from GitHub Actions tab.

## Setup

### Prerequisites
```bash
pip install fredapi yfinance requests
```

### Environment Variables
- `FRED_API_KEY`: Your FRED API key (default: e438e833b710bbc9f7defdb12b9fa33e)

### GitHub Secrets
For automated updates, add the following secret to your GitHub repository:
- `FRED_API_KEY`: Your FRED API key

## Data Categories

### 1. Liquidity
- M2 Money Supply
- Fed Balance Sheet
- Overnight Reverse Repo

### 2. Valuation
- Market Cap to GDP (Buffett Indicator)
- Wilshire 5000 Total Market Index

### 3. Macro
- GDP Growth Rate
- Unemployment Rate
- CPI Inflation (YoY)

### 4. Credit
- Corporate Debt to GDP
- Corporate Bond Spread
- High Yield Spread

### 5. Technical
- S&P 500 Index
- VIX Volatility Index

### 6. Global
- US Dollar Index (DXY)
- Emerging Markets ETF

### 7. Sentiment
- Consumer Sentiment Index

### 8. Qualitative
- Retail Sales
- Housing Starts
- Industrial Production

## Risk Score Calculation

Risk scores are calculated based on current values relative to historical thresholds:

- **0-20**: Very Low Risk (Green)
- **21-40**: Low Risk (Light Green)
- **41-60**: Moderate Risk (Yellow)
- **61-80**: High Risk (Orange)
- **81-100**: Critical Risk (Red)

### Threshold Examples

**GDP Growth** (Inverse - lower is worse):
- Critical: < 0% (recession)
- High: 0-2%
- Medium: 2-3%
- Low: 3-4%
- Very Low: > 4%

**Inflation** (Direct - higher is worse):
- Very Low: < 1.5%
- Low: 1.5-2.5%
- Medium: 2.5-4%
- High: 4-6%
- Critical: > 6%

## Troubleshooting

### FRED API Errors
If you see "Bad Request" errors, the FRED series ID may be incorrect or unavailable. Check the [FRED website](https://fred.stlouisfed.org/) for valid series IDs.

### Yahoo Finance Errors
Yahoo Finance data may be delayed or unavailable during market hours. The script will continue with available data.

### Missing Data
If a data point is unavailable, the script assigns a default risk score of 50 (moderate risk).

## Data Freshness

- **FRED Data**: Updated daily (some series weekly/monthly)
- **Yahoo Finance**: Real-time during market hours
- **Dashboard Update**: Every hour via GitHub Actions

## Contact

For issues or questions, please open an issue on GitHub.
