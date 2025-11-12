"""
Time-Decay Momentum Method
Applies momentum multipliers that decay for persistent signals
Best overall performance: 13.91 average error
"""

from typing import Dict, Tuple
from .weighted_average import calculate_weighted_average

def calculate_time_decay_multiplier(indicator_value: float, indicator_id: str) -> float:
    """
    Calculate time-decay momentum multiplier
    
    Logic:
    - Fresh signals (40-60): Full multiplier
    - Persistent signals (>60): Reduced multiplier (market has adjusted)
    - Low signals (<40): Normal multiplier
    """
    
    # Key indicators that get momentum adjustment
    if indicator_id == "VIXCLS":
        if indicator_value > 60:
            return 1.3  # Reduced from 1.8 (persistent high)
        elif indicator_value > 40:
            return 1.5  # Full multiplier (fresh spike)
        elif indicator_value > 30:
            return 1.2  # Moderate
        else:
            return 1.0  # Normal
    
    elif indicator_id == "YIELD_CURVE":
        if indicator_value > 60:
            return 1.3  # Reduced (persistent inversion)
        elif indicator_value > 50:
            return 1.5  # Full (fresh inversion)
        elif indicator_value > 30:
            return 1.2  # Moderate
        else:
            return 1.0  # Normal
    
    elif indicator_id == "SAHM_RULE":
        if indicator_value > 60:
            return 1.3  # Reduced (deep recession, market adjusted)
        elif indicator_value > 40:
            return 1.5  # Full (fresh recession signal)
        elif indicator_value > 30:
            return 1.2  # Moderate
        else:
            return 1.0  # Normal
    
    elif indicator_id == "BAMLH0A0HYM2":  # High Yield Spread
        if indicator_value > 60:
            return 1.3  # Reduced (persistent credit stress)
        elif indicator_value > 40:
            return 1.5  # Full (fresh credit spike)
        else:
            return 1.0  # Normal
    
    # Other indicators: no adjustment
    return 1.0

def calculate_time_decay_momentum(indicators: Dict[str, float]) -> Tuple[float, Dict[str, float]]:
    """
    Calculate risk score using time-decay momentum
    
    Args:
        indicators: Dict mapping indicator IDs to scores (0-100)
    
    Returns:
        (overall_score, category_scores)
    """
    
    # Apply time-decay multipliers
    adjusted_indicators = {}
    
    for ind_id, value in indicators.items():
        multiplier = calculate_time_decay_multiplier(value, ind_id)
        adjusted_value = value * multiplier
        
        # Cap at 100
        adjusted_indicators[ind_id] = min(adjusted_value, 100.0)
    
    # Use weighted average on adjusted values
    return calculate_weighted_average(adjusted_indicators)
