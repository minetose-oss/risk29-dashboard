"""
Centralized indicator weights configuration for Risk29 Dashboard.
All weights within each category sum to 1.00 for proper weighted averaging.
Total: 23 indicators across 5 categories.
"""

# Liquidity Category Weights (6 indicators)
LIQUIDITY_WEIGHTS = {
    'treasury_liquidity': 0.20,      # Treasury market depth
    'funding_stress': 0.20,          # Short-term funding stress
    'libor_ois': 0.15,              # Bank funding costs
    'sofr_spread': 0.15,            # Secured overnight financing
    'bid_ask': 0.15,                # Market liquidity
    'repo_fails': 0.15              # Settlement stress
}

# Credit Category Weights (5 indicators)
CREDIT_WEIGHTS = {
    'credit_spread': 0.25,          # Investment grade spreads
    'high_yield': 0.25,             # High yield spreads
    'cds_spread': 0.20,             # Credit default swaps
    'loan_delinquency': 0.15,       # Consumer loan health
    'consumer_delinquency': 0.15    # Consumer credit stress
}

# Macro Category Weights (5 indicators)
MACRO_WEIGHTS = {
    'unemployment': 0.25,           # Labor market health
    'inflation': 0.25,              # Price stability
    'yield_curve': 0.20,            # Recession indicator
    'sahm_rule': 0.15,              # Recession trigger
    'gdp_growth': 0.15              # Economic growth
}

# Valuation Category Weights (4 indicators)
VALUATION_WEIGHTS = {
    'pe_ratio': 0.30,               # Equity valuation
    'buffett_indicator': 0.25,      # Market cap to GDP
    'earnings_yield': 0.25,         # Earnings relative to yields
    'housing_starts': 0.20          # Real estate activity
}

# Technical Category Weights (3 indicators)
TECHNICAL_WEIGHTS = {
    'vix': 0.40,                    # Market volatility/fear
    'put_call': 0.30,               # Options sentiment
    'retail_sales': 0.30            # Consumer spending momentum
}

# Category weights for overall risk score (optional, for future use)
CATEGORY_WEIGHTS = {
    'liquidity': 0.25,
    'credit': 0.25,
    'macro': 0.20,
    'valuation': 0.15,
    'technical': 0.15
}

def get_category_weights(category):
    """
    Get weights dictionary for a specific category.
    
    Args:
        category (str): Category name ('liquidity', 'credit', 'macro', 'valuation', 'technical')
    
    Returns:
        dict: Dictionary mapping indicator names to weights
    """
    weights_map = {
        'liquidity': LIQUIDITY_WEIGHTS,
        'credit': CREDIT_WEIGHTS,
        'macro': MACRO_WEIGHTS,
        'valuation': VALUATION_WEIGHTS,
        'technical': TECHNICAL_WEIGHTS
    }
    return weights_map.get(category.lower(), {})

def validate_weights():
    """
    Validate that all category weights sum to 1.00.
    
    Returns:
        bool: True if all weights are valid
    """
    categories = {
        'Liquidity': LIQUIDITY_WEIGHTS,
        'Credit': CREDIT_WEIGHTS,
        'Macro': MACRO_WEIGHTS,
        'Valuation': VALUATION_WEIGHTS,
        'Technical': TECHNICAL_WEIGHTS
    }
    
    all_valid = True
    for category_name, weights in categories.items():
        total = sum(weights.values())
        if abs(total - 1.0) > 0.001:  # Allow small floating point errors
            print(f"Warning: {category_name} weights sum to {total:.4f}, not 1.00")
            all_valid = False
        else:
            print(f"✓ {category_name}: {len(weights)} indicators, weights sum to {total:.4f}")
    
    return all_valid

if __name__ == '__main__':
    print("Risk29 Dashboard - Indicator Weights Configuration")
    print("=" * 60)
    print(f"\nTotal Indicators: 23")
    print(f"Categories: 5")
    print("\nValidating weights...")
    print("-" * 60)
    
    if validate_weights():
        print("\n✓ All weights validated successfully!")
    else:
        print("\n✗ Weight validation failed!")
