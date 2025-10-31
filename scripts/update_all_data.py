#!/usr/bin/env python3
"""
Master script to update all Risk29 Dashboard data
1. Fetches real-time data from FRED API and Yahoo Finance
2. Transforms data to dashboard format with risk scores
3. Updates risk_data.json for dashboard consumption
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
    print("Risk29 Dashboard - Data Update Pipeline")
    print("="*60)
    
    # Step 1: Fetch real-time data
    print("\n📡 Step 1: Fetching real-time data from FRED API and Yahoo Finance...")
    if not run_script("fetch_real_data.py"):
        print("\n❌ Failed to fetch real-time data")
        sys.exit(1)
    
    # Step 2: Transform to dashboard format
    print("\n🔄 Step 2: Transforming data to dashboard format...")
    if not run_script("transform_to_dashboard.py"):
        print("\n❌ Failed to transform data")
        sys.exit(1)
    
    print("\n" + "="*60)
    print("✅ Data Update Complete!")
    print("="*60)
    print("\nDashboard data has been updated with latest real-time values.")
    print("risk_data.json is ready for dashboard consumption.")
    print("="*60 + "\n")

if __name__ == "__main__":
    main()
