"""
Regime-Adaptive Hybrid Method
Selects calculation approach based on market regime
Best calm period performance: 9.95 average error
"""

from typing import Dict, Tuple
from .weighted_average import calculate_weighted_average, INDICATOR_WEIGHTS

def detect_market_regime(indicators: Dict[str, float]) -> str:
    """
    Detect current market regime
    
    Returns:
        One of: "crisis", "bear_market", "bubble", "calm", "normal"
    """
    
    vix = indicators.get("VIXCLS", 25.0)
    yield_curve = indicators.get("YIELD_CURVE", 20.0)
    valuation = indicators.get("NCBEILQ027S", 70.0)
    credit = indicators.get("BAMLH0A0HYM2", 35.0)
    
    # Crisis: VIX > 40 or Credit > 60
    if vix > 40 or credit > 60:
        return "crisis"
    
    # Bear Market: Yield Curve inverted + elevated credit
    if yield_curve > 50 and credit > 40:
        return "bear_market"
    
    # Bubble: Extreme valuation + low VIX
    if valuation > 80 and vix < 20:
        return "bubble"
    
    # Calm: Low VIX, low credit spreads
    if vix < 20 and credit < 35:
        return "calm"
    
    # Default: normal
    return "normal"

# Regime-specific category weights
REGIME_CATEGORY_WEIGHTS = {
    "crisis": {
        "liquidity": 0.25,
        "credit": 0.30,  # Credit most important in crisis
        "macro": 0.20,
        "valuation": 0.10,
        "technical": 0.15
    },
    "bear_market": {
        "liquidity": 0.20,
        "credit": 0.30,
        "macro": 0.25,
        "valuation": 0.15,
        "technical": 0.10
    },
    "bubble": {
        "liquidity": 0.15,
        "credit": 0.15,
        "macro": 0.15,
        "valuation": 0.40,  # Valuation most important in bubble
        "technical": 0.15
    },
    "calm": {
        "liquidity": 0.15,
        "credit": 0.15,
        "macro": 0.20,
        "valuation": 0.35,  # Focus on fundamentals
        "technical": 0.15
    },
    "normal": {
        "liquidity": 0.20,
        "credit": 0.20,
        "macro": 0.20,
        "valuation": 0.20,
        "technical": 0.20
    }
}

def calculate_regime_adaptive(indicators: Dict[str, float]) -> Tuple[float, Dict[str, float]]:
    """
    Calculate risk score using regime-adaptive approach
    
    Args:
        indicators: Dict mapping indicator IDs to scores (0-100)
    
    Returns:
        (overall_score, category_scores)
    """
    
    # Detect regime
    regime = detect_market_regime(indicators)
    
    # Get regime-specific category weights
    regime_weights = REGIME_CATEGORY_WEIGHTS[regime]
    
    # Calculate category scores using indicator weights
    category_scores = {}
    
    for category, indicator_weights in INDICATOR_WEIGHTS.items():
        weighted_sum = 0.0
        total_weight = 0.0
        
        for ind_id, weight in indicator_weights.items():
            if ind_id in indicators:
                weighted_sum += indicators[ind_id] * weight
                total_weight += weight
        
        if total_weight > 0:
            category_scores[category] = weighted_sum / total_weight
        else:
            category_scores[category] = 50.0
    
    # Calculate overall score using regime-specific category weights
    overall_score = sum(
        category_scores[cat] * regime_weights[cat]
        for cat in category_scores.keys()
    )
    
    return overall_score, category_scores
