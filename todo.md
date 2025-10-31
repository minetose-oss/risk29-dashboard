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
- [x] Save dashboard to GitHub repository
- [x] Create backup archive
- [x] Verify all data persistence methods

## Chart Enhancement

- [x] Add horizontal scroll to historical trend chart
- [x] Make chart wider to show all 30 days clearly
- [x] Test scroll functionality on mobile and desktop

## Final UI Polish

- [ ] Add "X signals tracked" text above historical trend chart
- [ ] Add Risk Levels legend section (Info, Watch, Warning, Alert)
- [ ] Add footer with "Powered by Risk29 Free-Real API Pack PLUS"
- [ ] Add data sources text "Data sources: FRED, Yahoo Finance, FINRA"
- [ ] Add "Made with Manus" branding
- [ ] Match exact styling from reference image

## Chart Improvements (User Feedback)

- [x] Make legend more visible and clear on mobile
- [x] Add interactive tooltips showing daily values when hovering/touching
- [x] Improve line identification with better colors and labels
- [x] Replace SVG chart with Recharts for better interactivity
- [x] Test tooltip functionality on mobile devices

## Alert Threshold Customization (Phase 1)

- [x] Create Settings page UI with threshold sliders
- [x] Add enable/disable toggle for each category
- [x] Implement Warning threshold (default: 60)
- [x] Implement Critical threshold (default: 75)
- [x] Create threshold configuration JSON storage
- [x] Update LINE alert script to read thresholds
- [x] Send alerts only when thresholds are exceeded
- [x] Add threshold information to LINE messages
- [x] Test threshold system with different values
- [x] Add Settings link to main dashboard navigation

## Phase 2: Data Export & Comparison Features

- [x] Add CSV export button for historical data
- [x] Implement Excel export with formatted sheets
- [x] Add "Export Chart as PNG" button
- [x] Create comparison view page
- [x] Add date range selector for comparison
- [x] Show side-by-side comparison charts
- [x] Display percentage changes between periods
- [x] Add export buttons to dashboard header
- [x] Test CSV export with real data
- [x] Test PNG export functionality

## Phase 4: Detailed Signal Analysis

- [x] Create SignalDetail page component
- [x] Add individual signal historical chart (30-day trend)
- [x] Show signal metadata (current value, risk score, interpretation)
- [x] Add correlation matrix heatmap
- [x] Calculate correlation coefficients between signals
- [x] Display historical performance metrics
- [x] Add signal-to-signal comparison view
- [x] Link from CategoryDetail to individual signals
- [x] Test signal detail pages with real data
- [x] Add navigation breadcrumbs
