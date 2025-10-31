# Risk29 Dashboard User Guide

**Purpose:** Monitor financial risk across 29 indicators in 8 categories with real-time FRED API data integration.

**Access:** Public dashboard with automatic daily updates at 08:30 Bangkok time.

## Powered by Manus

Built with cutting-edge technology stack: **React 19** + **TypeScript** + **Tailwind CSS 4** + **Recharts** for frontend visualization. Backend powered by **Python** data pipeline with **FRED API** integration for real-time economic data. **Deployment:** Auto-scaling infrastructure with global CDN for fast worldwide access.

## Using Your Dashboard

The dashboard displays comprehensive financial risk monitoring across multiple dimensions. View the "Overall Risk Score" gauge showing current risk level out of 100. Check "Top Risk Highlights" for the three most concerning indicators with their negative scores. Scroll down to "Risk Breakdown by Category" to see 8 categories: Liquidity, Valuation, Macro, Credit, Technical, Sentiment, Qualitative, and Global—each with progress bars and signal counts. Click any category card to view detailed signal breakdowns with current values, interpretations, and status. Review the "Historical Trend" chart showing 30-day risk evolution across major categories—scroll horizontally to see all data points. Check "Risk Levels" legend to understand color coding: Info (0-39, green), Watch (40-59, yellow), Warning (60-74, orange), Alert (75-100, red).

## Managing Your Dashboard

Access the **Management UI** panel on the right side to control your dashboard. Open **Preview** panel to see live updates as data refreshes. Use **Code** panel to download all source files for backup or customization. Check **Dashboard** panel for analytics and visibility settings. View **Settings → General** to customize website name and logo. The dashboard automatically updates daily at 08:30 Bangkok time via scheduled cron job.

## Next Steps

Talk to Manus AI anytime to request changes or add features. The dashboard is now fully deployed and ready for production use. Click the **Publish** button in the Management UI header to deploy to a permanent public URL at manus.space domain. Share your dashboard URL with stakeholders to provide real-time financial risk insights.
