# Risk29 Dashboard TODO

## Features to Implement

- [x] Overall Risk Score display with gauge chart
- [x] Top Risk Highlights section (top 3 negative indicators)
- [x] Risk Breakdown by Category (8 categories with progress bars)
- [x] Historical Trend chart (Last 30 Days)
- [x] Dark theme styling
- [x] Real-time data loading from JSON file
- [x] Auto-refresh functionality
- [x] Responsive layout for mobile/tablet
- [ ] Deploy to GitHub Pages

## Completed

- [x] Project initialization
- [x] Basic structure setup

## New Features to Add

- [x] Create category detail pages for all 8 categories
- [x] Add routing to category pages (/category/liquidity, etc.)
- [x] Display individual signals with current values
- [x] Show risk scores for each signal
- [x] Add interpretation (Low Score Good vs High Score Risk)
- [x] Display current status for each signal
- [x] Add "Back to Dashboard" navigation button
- [x] Make category cards clickable from main dashboard

## Pipeline Enhancement & Integration

- [x] Update fetch_data.py to fetch all 29 indicators from FRED
- [x] Update calc_scores.py to calculate real risk scores
- [x] Generate comprehensive JSON with all signal details
- [x] Push JSON to GitHub repository
- [x] Update dashboard to read from real FRED data
- [x] Test complete data flow
- [x] Verify auto-update schedule

## Chart Update & Data Persistence

- [x] Convert historical trend chart from stacked bar to line chart
- [x] Add proper axis labels and grid lines
- [x] Test line chart display on different screen sizes
- [ ] Save dashboard to GitHub repository
- [ ] Create backup archive
- [ ] Verify all data persistence methods

## Chart Enhancement

- [x] Add horizontal scroll to historical trend chart
- [x] Make chart wider to show all 30 days clearly
- [x] Test scroll functionality on mobile and desktop
