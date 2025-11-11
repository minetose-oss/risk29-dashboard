#!/bin/bash
# Update all 23 indicators (17 existing + 6 new)

echo "======================================================================"
echo "UPDATING ALL 23 INDICATORS"
echo "======================================================================"

cd /home/ubuntu/risk29-dashboard/scripts

echo ""
echo "1. Fetching 17 existing indicators..."
python3 fetch_historical_data.py

echo ""
echo "2. Fetching 6 new indicators..."
python3 fetch_6_new_indicators.py

echo ""
echo "3. Combining all 23 indicators..."
python3 combine_all_indicators.py

echo ""
echo "======================================================================"
echo "✅ ALL 23 INDICATORS UPDATED!"
echo "======================================================================"
echo ""
echo "Output files:"
echo "  - client/public/historical_data.json (17 indicators)"
echo "  - client/public/new_indicators_data.json (6 indicators)"
echo "  - client/public/enhanced_historical_data.json (23 indicators) ← USE THIS!"
echo ""
echo "Next steps:"
echo "  1. git add ."
echo "  2. git commit -m 'Update 23 indicators data'"
echo "  3. git push origin master"
echo ""
