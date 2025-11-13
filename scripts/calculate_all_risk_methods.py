"""
Calculate risk scores using ALL methods and save to JSON
This script reads indicator data and calculates risk using all 5 methods
"""

import json
import os
from datetime import datetime
from typing import Dict, Any
from calculate_risk import calculate_all_methods, METHOD_INFO

def load_indicator_data() -> Dict[str, float]:
    """
    Load current indicator values from real_data.json
    
    Returns:
        Dict mapping indicator IDs to normalized scores (0-100)
    """
    script_dir = os.path.dirname(os.path.abspath(__file__))
    real_data_path = os.path.join(script_dir, "..", "client", "public", "real_data.json")
    real_data_path = os.path.normpath(real_data_path)
    
    with open(real_data_path, 'r') as f:
        real_data = json.load(f)
    
    indicators = {}
    
    # Extract indicator scores from real_data
    # This is a simplified version - you may need to adjust based on your data structure
    
    # Liquidity indicators
    if "liquidity" in real_data:
        for key, data in real_data["liquidity"].items():
            if isinstance(data, dict) and "risk_score" in data:
                indicators[key] = data["risk_score"]
    
    # Credit indicators
    if "credit" in real_data:
        for key, data in real_data["credit"].items():
            if isinstance(data, dict) and "risk_score" in data:
                indicators[key] = data["risk_score"]
    
    # Macro indicators
    if "macro" in real_data:
        for key, data in real_data["macro"].items():
            if isinstance(data, dict) and "risk_score" in data:
                indicators[key] = data["risk_score"]
    
    # Valuation indicators
    if "valuation" in real_data:
        for key, data in real_data["valuation"].items():
            if isinstance(data, dict) and "risk_score" in data:
                indicators[key] = data["risk_score"]
    
    # Technical indicators
    if "technical" in real_data:
        for key, data in real_data["technical"].items():
            if isinstance(data, dict) and "risk_score" in data:
                indicators[key] = data["risk_score"]
    
    return indicators

def save_multi_method_results(results: Dict[str, tuple], output_path: str):
    """
    Save results from all methods to JSON file
    
    Args:
        results: Dict from calculate_all_methods()
        output_path: Path to save JSON file
    """
    output_data = {
        "timestamp": int(datetime.now().timestamp()),
        "last_updated": datetime.now().isoformat(),
        "methods": {}
    }
    
    for method_name, (overall_score, category_scores) in results.items():
        output_data["methods"][method_name] = {
            "overall_score": round(overall_score, 2),
            "category_scores": {
                cat: round(score, 2) 
                for cat, score in category_scores.items()
            },
            "metadata": METHOD_INFO.get(method_name, {})
        }
    
    # Save to file
    with open(output_path, 'w') as f:
        json.dump(output_data, f, indent=2)
    
    print(f"✅ Saved multi-method results to {output_path}")
    print(f"   Methods calculated: {len(results)}")
    for method_name, (overall_score, _) in results.items():
        print(f"   - {method_name}: {overall_score:.2f}")

def main():
    """Main execution"""
    print("=" * 80)
    print("Calculating Risk Scores Using All Methods")
    print("=" * 80)
    
    # Load indicator data
    print("\n1. Loading indicator data...")
    indicators = load_indicator_data()
    print(f"   Loaded {len(indicators)} indicators")
    
    # Calculate using all methods
    print("\n2. Calculating risk scores...")
    results = calculate_all_methods(indicators)
    
    # Save results
    print("\n3. Saving results...")
    script_dir = os.path.dirname(os.path.abspath(__file__))
    output_path = os.path.join(script_dir, "..", "client", "public", "risk_methods.json")
    output_path = os.path.normpath(output_path)
    
    save_multi_method_results(results, output_path)
    
    print("\n" + "=" * 80)
    print("✅ Done! All methods calculated and saved.")
    print("=" * 80)

if __name__ == "__main__":
    main()
