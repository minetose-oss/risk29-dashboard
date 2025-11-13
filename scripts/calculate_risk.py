"""
Main Risk Calculator
Provides unified interface for all risk calculation methods
"""

from typing import Dict, Tuple, Optional
from methods import (
    calculate_simple_average,
    calculate_weighted_average,
    calculate_time_decay_momentum,
    calculate_regime_adaptive,
    calculate_meta_ensemble
)

# Method metadata for UI
METHOD_INFO = {
    "simple_average": {
        "name": "Simple Average (Baseline)",
        "description": "Treats all indicators equally with no weighting. Good baseline for comparison.",
        "complexity": 1,
        "overall_error": 15.83,
        "crisis_error": 20.10,
        "calm_error": 10.50,
        "improvement": 0.0,
        "recommended_for": "Beginners, baseline comparison",
        "pros": ["Simple to understand", "No assumptions"],
        "cons": ["Ignores indicator importance", "Slowest to respond"]
    },
    "weighted_average": {
        "name": "Weighted Average",
        "description": "Uses research-based weights for each indicator category.",
        "complexity": 2,
        "overall_error": 15.11,
        "crisis_error": 18.88,
        "calm_error": 10.40,
        "improvement": 4.6,
        "recommended_for": "General use, balanced approach",
        "pros": ["Research-based weights", "Better than simple average"],
        "cons": ["Static weights", "Doesn't adapt to conditions"]
    },
    "time_decay_momentum": {
        "name": "Time-Decay Momentum",
        "description": "Adjusts momentum multipliers based on how long indicators have been elevated. Prevents overreaction to persistent signals.",
        "complexity": 3,
        "overall_error": 13.91,
        "crisis_error": 16.72,
        "calm_error": 10.40,
        "improvement": 12.1,
        "recommended_for": "Most users - best overall performance",
        "pros": ["Best overall accuracy", "Balanced crisis/calm", "Prevents overreaction"],
        "cons": ["Moderate complexity"]
    },
    "regime_adaptive": {
        "name": "Regime-Adaptive",
        "description": "Adjusts category weights based on market regime (crisis, calm, bubble, etc.). Best for calm periods.",
        "complexity": 4,
        "overall_error": 13.93,
        "crisis_error": 17.12,
        "calm_error": 9.95,
        "improvement": 12.0,
        "recommended_for": "Users focused on calm period accuracy",
        "pros": ["Best calm performance", "Adapts to regime"],
        "cons": ["Slightly worse in crisis", "More complex"]
    },
    "meta_ensemble": {
        "name": "Meta-Ensemble",
        "description": "Selects the best method for each situation. Time-Decay for crisis, Regime-Adaptive for calm.",
        "complexity": 5,
        "overall_error": 13.82,
        "crisis_error": 16.72,
        "calm_error": 9.95,
        "improvement": 12.6,
        "recommended_for": "Power users, maximum accuracy",
        "pros": ["Best overall", "Best crisis", "Best calm"],
        "cons": ["Most complex", "Harder to explain"]
    }
}

def calculate_risk_score(
    indicators: Dict[str, float],
    method: str = "time_decay_momentum"
) -> Tuple[float, Dict[str, float]]:
    """
    Calculate risk score using specified method
    
    Args:
        indicators: Dict mapping indicator IDs to scores (0-100)
        method: One of ["simple_average", "weighted_average", "time_decay_momentum", "regime_adaptive", "meta_ensemble"]
    
    Returns:
        (overall_score, category_scores)
    
    Example:
        >>> indicators = {"VIXCLS": 45, "YIELD_CURVE": 60, ...}
        >>> overall, categories = calculate_risk_score(indicators, "time_decay_momentum")
        >>> print(f"Overall Risk: {overall:.1f}")
        Overall Risk: 67.5
    """
    
    if method == "simple_average":
        return calculate_simple_average(indicators)
    
    elif method == "weighted_average":
        return calculate_weighted_average(indicators)
    
    elif method == "time_decay_momentum":
        return calculate_time_decay_momentum(indicators)
    
    elif method == "regime_adaptive":
        return calculate_regime_adaptive(indicators)
    
    elif method == "meta_ensemble":
        return calculate_meta_ensemble(indicators)
    
    else:
        # Default to time_decay_momentum (recommended)
        print(f"Warning: Unknown method '{method}', using 'time_decay_momentum' instead")
        return calculate_time_decay_momentum(indicators)

def calculate_all_methods(indicators: Dict[str, float]) -> Dict[str, Tuple[float, Dict[str, float]]]:
    """
    Calculate risk scores using ALL methods
    
    Args:
        indicators: Dict mapping indicator IDs to scores (0-100)
    
    Returns:
        Dict mapping method names to (overall_score, category_scores)
    
    Example:
        >>> indicators = {"VIXCLS": 45, "YIELD_CURVE": 60, ...}
        >>> results = calculate_all_methods(indicators)
        >>> print(results["time_decay_momentum"][0])  # Overall score
        67.5
    """
    results = {}
    
    methods = [
        "simple_average",
        "weighted_average", 
        "time_decay_momentum",
        "regime_adaptive",
        "meta_ensemble"
    ]
    
    for method in methods:
        try:
            overall, categories = calculate_risk_score(indicators, method)
            results[method] = (overall, categories)
        except Exception as e:
            print(f"Error calculating {method}: {e}")
            # Use weighted_average as fallback
            results[method] = calculate_weighted_average(indicators)
    
    return results

def get_method_info(method: str) -> Optional[Dict]:
    """
    Get metadata about a specific method
    
    Args:
        method: Method ID
    
    Returns:
        Dict with method information or None if not found
    """
    return METHOD_INFO.get(method)

def list_available_methods() -> Dict[str, Dict]:
    """
    List all available methods with their metadata
    
    Returns:
        Dict mapping method IDs to their info
    """
    return METHOD_INFO

def get_recommended_method() -> str:
    """
    Get the recommended method for most users
    
    Returns:
        Method ID (currently "time_decay_momentum")
    """
    return "time_decay_momentum"

# For backward compatibility
def calculate_risk_score_default(indicators: Dict[str, float]) -> Tuple[float, Dict[str, float]]:
    """Calculate risk score using default (recommended) method"""
    return calculate_risk_score(indicators, get_recommended_method())


if __name__ == "__main__":
    # Example usage
    print("Available Risk Calculation Methods:")
    print("=" * 80)
    
    for method_id, info in METHOD_INFO.items():
        print(f"\n{info['name']} ({method_id})")
        print(f"  Description: {info['description']}")
        print(f"  Overall Error: {info['overall_error']:.2f}")
        print(f"  Improvement: +{info['improvement']:.1f}%")
        print(f"  Recommended for: {info['recommended_for']}")
    
    print(f"\n{'=' * 80}")
    print(f"Recommended method: {get_recommended_method()}")
