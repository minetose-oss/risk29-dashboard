#!/usr/bin/env python3
"""
Master script to update all Risk29 Dashboard data
1. Fetches real-time data from FRED API and Yahoo Finance (17 indicators)
2. Fetches 6 new indicators (SOFR, Yield Curve, etc.)
3. Merges 6 new indicators into risk_data_v2.json (total 23 indicators)
4. Updates enhanced_historical_data.json for charts
"""

import subprocess
import sys
import os

def run_script(script_name):
    """Run a Python script and check for errors"""
    script_path = os.path.join(os.path.dirname(__file__), script_name)
    print(f"\n{'='*60}")
    print(f"Running: {script_name}")
    print(f"{'='*60}")
    
    try:
        result = subprocess.run(
            [sys.executable, script_path],
            check=True,
            capture_output=True,
            text=True
        )
        print(result.stdout)
        if result.stderr:
            print("Warnings:", result.stderr)
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Error running {script_name}:")
        print(e.stdout)
        print(e.stderr)
        return False

def main():
    """Main update workflow"""
    print("\n" + "="*60)
    print("Risk29 Dashboard - Data Update Pipeline (23 Indicators)")
    print("="*60)
    
    # Step 1: Fetch real-time data (17 indicators)
    print("\n📡 Step 1: Fetching real-time data from FRED API and Yahoo Finance...")
    if not run_script("fetch_real_data.py"):
        print("\n❌ Failed to fetch real-time data")
        sys.exit(1)
    
    # Step 2: Transform to dashboard format (17 indicators)
    print("\n🔄 Step 2: Transforming data to dashboard format...")
    if not run_script("transform_to_dashboard.py"):
        print("\n❌ Failed to transform data")
        sys.exit(1)
    
    # Step 3: Fetch 6 new indicators
    print("\n📡 Step 3: Fetching 6 new indicators...")
    if not run_script("fetch_6_new_indicators.py"):
        print("\n⚠️  Warning: Failed to fetch new indicators, continuing with 17 indicators only...")
    
    # Step 4: Merge 6 new indicators into risk_data_v2.json
    print("\n🔄 Step 4: Merging 6 new indicators into risk_data_v2.json...")
    if not run_script("merge_indicators.py"):
        print("\n⚠️  Warning: Failed to merge new indicators, risk_data_v2.json has 17 indicators only...")
    
    # Step 5: Combine all indicators for enhanced historical data
    print("\n🔄 Step 5: Combining all indicators for historical charts...")
    if not run_script("combine_all_indicators.py"):
        print("\n⚠️  Warning: Failed to combine indicators, historical data may be incomplete...")
    
    print("\n" + "="*60)
    print("✅ Data Update Complete!")
    print("="*60)
    print("\nUpdated files:")
    print("  - risk_data_v2.json (23 indicators for category cards)")
    print("  - enhanced_historical_data.json (23 indicators for charts)")
    print("  - new_indicators_data.json (6 new indicators)")
    print("="*60 + "\n")

if __name__ == "__main__":
    main()
