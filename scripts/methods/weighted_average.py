"""
Weighted Average Method
Uses research-based weights for each indicator
"""

from typing import Dict, Tuple

# Indicator weights by category
INDICATOR_WEIGHTS = {
    "liquidity": {
        "M2SL": 0.30,
        "WALCL": 0.25,
        "RRPONTSYD": 0.30,
        "SOFR": 0.15
    },
    "credit": {
        "DGS10": 0.15,
        "BAMLH0A0HYM2": 0.20,
        "DRTSCILM": 0.10,
        "YIELD_CURVE": 0.30,  # Most important
        "CONSUMER_DELINQ": 0.15,
        "MORTGAGE_DELINQ": 0.10
    },
    "macro": {
        "UNRATE": 0.15,
        "CPIAUCSL": 0.15,
        "GDP": 0.15,
        "SAHM_RULE": 0.15,  # Important recession indicator
        "HOUSING_STARTS": 0.10,
        "RETAIL_SALES": 0.15,
        "INDPRO": 0.075,
        "PAYEMS": 0.075
    },
    "valuation": {
        "NCBEILQ027S": 0.60,  # Market cap to GDP
        "NASDAQCOM": 0.40
    },
    "technical": {
        "VIXCLS": 0.40,  # Most important
        "DCOILWTICO": 0.30,
        "DXY": 0.30
    }
}

def calculate_weighted_average(indicators: Dict[str, float]) -> Tuple[float, Dict[str, float]]:
    """
    Calculate risk score using weighted average
    
    Args:
        indicators: Dict mapping indicator IDs to scores (0-100)
    
    Returns:
        (overall_score, category_scores)
    """
    
    category_scores = {}
    
    # Calculate weighted average for each category
    for category, weights in INDICATOR_WEIGHTS.items():
        weighted_sum = 0.0
        total_weight = 0.0
        
        for ind_id, weight in weights.items():
            if ind_id in indicators:
                weighted_sum += indicators[ind_id] * weight
                total_weight += weight
        
        if total_weight > 0:
            category_scores[category] = weighted_sum / total_weight
        else:
            category_scores[category] = 50.0  # Default
    
    # Overall score is simple average of category scores
    overall_score = sum(category_scores.values()) / len(category_scores)
    
    return overall_score, category_scores
