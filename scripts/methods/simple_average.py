"""
Simple Average Method
Treats all indicators equally with no weighting
"""

from typing import Dict, Tuple

def calculate_simple_average(indicators: Dict[str, float]) -> Tuple[float, Dict[str, float]]:
    """
    Calculate risk score using simple average
    
    Args:
        indicators: Dict mapping indicator IDs to scores (0-100)
    
    Returns:
        (overall_score, category_scores)
    """
    
    # Define category mappings
    CATEGORY_INDICATORS = {
        "liquidity": ["M2SL", "WALCL", "RRPONTSYD", "SOFR"],
        "credit": ["DGS10", "BAMLH0A0HYM2", "DRTSCILM", "YIELD_CURVE", "CONSUMER_DELINQ", "MORTGAGE_DELINQ"],
        "macro": ["UNRATE", "CPIAUCSL", "GDP", "SAHM_RULE", "HOUSING_STARTS", "RETAIL_SALES", "INDPRO", "PAYEMS"],
        "valuation": ["NCBEILQ027S", "NASDAQCOM"],
        "technical": ["VIXCLS", "DCOILWTICO", "DXY"]
    }
    
    category_scores = {}
    
    # Calculate simple average for each category
    for category, indicator_ids in CATEGORY_INDICATORS.items():
        scores = []
        for ind_id in indicator_ids:
            if ind_id in indicators:
                scores.append(indicators[ind_id])
        
        if scores:
            category_scores[category] = sum(scores) / len(scores)
        else:
            category_scores[category] = 50.0  # Default
    
    # Overall score is simple average of category scores
    overall_score = sum(category_scores.values()) / len(category_scores)
    
    return overall_score, category_scores
