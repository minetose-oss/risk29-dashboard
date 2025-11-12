"""
Meta-Ensemble Method
Selects the best method for each market state
Best theoretical performance: 13.82 average error
"""

from typing import Dict, Tuple
from .time_decay_momentum import calculate_time_decay_momentum
from .regime_adaptive import calculate_regime_adaptive

def detect_market_state(indicators: Dict[str, float]) -> str:
    """
    Detect if market is in crisis, calm, or normal state
    
    Returns:
        One of: "crisis", "calm", "normal"
    """
    
    vix = indicators.get("VIXCLS", 25.0)
    yield_curve = indicators.get("YIELD_CURVE", 20.0)
    credit = indicators.get("BAMLH0A0HYM2", 35.0)
    sahm = indicators.get("SAHM_RULE", 15.0)
    
    # Crisis indicators
    crisis_score = 0
    
    if vix > 35:
        crisis_score += 2
    elif vix > 25:
        crisis_score += 1
    
    if yield_curve > 55:
        crisis_score += 2
    elif yield_curve > 40:
        crisis_score += 1
    
    if credit > 50:
        crisis_score += 2
    elif credit > 40:
        crisis_score += 1
    
    if sahm > 50:
        crisis_score += 2
    elif sahm > 30:
        crisis_score += 1
    
    # Determine state
    if crisis_score >= 3:
        return "crisis"
    elif crisis_score <= 1 and vix < 20:
        return "calm"
    else:
        return "normal"

def calculate_meta_ensemble(indicators: Dict[str, float]) -> Tuple[float, Dict[str, float]]:
    """
    Calculate risk score using meta-ensemble (best-of-breed selector)
    
    Strategy:
    - Crisis: Use Time-Decay Momentum (best crisis performance: 16.72)
    - Calm: Use Regime-Adaptive (best calm performance: 9.95)
    - Normal: Use Time-Decay Momentum (default)
    
    Args:
        indicators: Dict mapping indicator IDs to scores (0-100)
    
    Returns:
        (overall_score, category_scores)
    """
    
    state = detect_market_state(indicators)
    
    if state == "crisis":
        # Use Time-Decay for crisis
        return calculate_time_decay_momentum(indicators)
    
    elif state == "calm":
        # Use Regime-Adaptive for calm
        return calculate_regime_adaptive(indicators)
    
    else:
        # Use Time-Decay as default
        return calculate_time_decay_momentum(indicators)
