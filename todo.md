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

- [x] Add "X signals tracked" text above historical trend chart
- [x] Add Risk Levels legend section (Info, Watch, Warning, Alert)
- [x] Add footer with "Powered by Risk29 Free-Real API Pack PLUS"
- [x] Add data sources text "Data sources: FRED, Yahoo Finance, FINRA"
- [x] Add "Made with Manus" branding
- [x] Match exact styling from reference image

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

## Phase 8: Dashboard Customization (UI/UX Improvements)

- [x] Enable theme switching (Dark/Light mode)
- [x] Add theme toggle button to header
- [x] Update ThemeProvider to support switchable themes
- [x] Implement show/hide categories feature
- [x] Add category visibility settings
- [x] Save category preferences to localStorage
- [x] Install @dnd-kit for drag-drop
- [x] Implement drag-drop reordering for category cards
- [x] Save card order to localStorage
- [x] Add color scheme customization
- [x] Create color presets (Blue, Green, Purple, Red)
- [x] Apply color scheme across dashboard
- [x] Test all customization features
- [x] Ensure settings persist across page reloads

## Phase 9: Multiple Dashboards

- [x] Create DashboardProfileContext for managing profiles
- [x] Define 3 preset profiles (Conservative, Balanced, Aggressive)
- [x] Conservative: High weight on Liquidity & Credit, low thresholds (40-60)
- [x] Balanced: Equal weights, normal thresholds (60-75)
- [x] Aggressive: High weight on Valuation & Technical, high thresholds (70-85)
- [x] Build dashboard switcher UI component
- [x] Add profile selector dropdown in header
- [x] Implement weighted scoring calculation
- [x] Apply profile-specific thresholds to alerts
- [x] Save active profile to localStorage
- [x] Test switching between profiles
- [x] Verify weighted scores update correctly
- [x] Test alert thresholds for each profile

## Phase 6: Custom Indicators

- [x] Create Custom Indicator Builder page
- [x] Add weight editor for all 8 categories
- [x] Implement slider controls for fine-tuning weights
- [x] Create formula builder UI
- [x] Support basic operations (+, -, *, /)
- [x] Allow combining multiple categories in formulas
- [x] Build backtesting engine
- [x] Load historical data for backtesting
- [x] Calculate custom indicator scores over time
- [x] Compare custom vs default scoring
- [x] Add performance metrics visualization
- [x] Show accuracy, precision, recall metrics
- [x] Display backtest results chart
- [x] Save custom indicators to localStorage
- [x] Add indicator management (create, edit, delete)
- [x] Test custom indicators with different weights

## Phase 7: Predictive Analytics

- [x] Create prediction engine using linear regression
- [x] Implement trend analysis algorithm
- [x] Calculate momentum and direction indicators
- [x] Build 7-day prediction model
- [x] Build 30-day prediction model
- [x] Add confidence intervals for predictions
- [x] Implement anomaly detection algorithm
- [x] Detect sudden spikes and drops
- [x] Calculate z-scores for anomaly threshold
- [x] Create Predictions page component
- [x] Add prediction charts with confidence bands
- [x] Show trend direction indicators
- [x] Display anomaly alerts
- [x] Integrate with LINE alert system
- [x] Test predictions with historical data
- [x] Validate anomaly detection accuracy

## Phase 8: Mobile App (PWA)

- [x] Create PWA manifest.json
- [x] Configure app icons and splash screens
- [x] Add service worker for offline support
- [x] Implement caching strategy
- [x] Add install prompt
- [x] Enable push notifications
- [x] Test offline functionality
- [x] Test installation on mobile devices
- [x] Optimize for mobile performance

## Phase 9: Historical Scenario Analysis

- [x] Create Scenarios page component
- [x] Define historical scenarios (2008 crisis, 2020 pandemic, etc.)
- [x] Implement scenario simulation engine
- [x] Compare current risk profile with historical events
- [x] Add "What if" scenario builder
- [x] Show impact analysis for each scenario
- [x] Display scenario comparison charts
- [x] Add scenario backtest results
- [x] Test scenario accuracy with real data

## Phase 10: Portfolio Integration (Frontend-only)

- [x] Create Portfolio page component
- [x] Add portfolio input form (assets, weights, values)
- [x] Store portfolio data in localStorage
- [x] Calculate portfolio risk exposure based on current risk scores
- [x] Show impact of each risk category on portfolio
- [x] Implement allocation optimizer algorithm (frontend calculation)
- [x] Add portfolio rebalancing suggestions
- [x] Display portfolio risk score vs market risk score
- [x] Add portfolio historical performance chart
- [x] Test portfolio calculations with sample data

## Phase 11: PDF Report Generator (Frontend-only)

- [x] Install jspdf and html2canvas libraries
- [x] Create PDF report template with branding
- [x] Include current risk scores and gauges in PDF
- [x] Add all category charts to PDF report
- [x] Include predictions and analysis sections
- [x] Add correlation matrix to PDF
- [x] Add download PDF button to dashboard
- [x] Generate filename with timestamp
- [x] Test PDF generation in browser
- [x] Optimize PDF file size

## Phase 12: Enhanced Alert System (Frontend-only)

- [x] Create advanced alert rules builder UI
- [x] Add multiple condition support (AND/OR logic)
- [x] Implement threshold crossing detection
- [x] Add rate of change alerts
- [x] Create alert history log (localStorage)
- [x] Add browser notification API integration
- [x] Implement alert snooze functionality
- [x] Add alert priority levels
- [x] Create alert summary dashboard
- [x] Test alert rules with different scenarios

## Phase 13: Dashboard Sharing (Frontend-only)

- [x] Implement URL parameter encoding for dashboard state
- [x] Add "Share Dashboard" button
- [x] Generate shareable URL with current settings
- [x] Include profile, theme, and customization in URL
- [x] Add copy-to-clipboard functionality
- [x] Create QR code for mobile sharing
- [x] Add import dashboard from URL
- [x] Test URL sharing across different browsers
- [x] Add share via LINE/Email buttons
- [x] Validate URL parameter parsing

## Bug Fixes

- [x] Fix "Signal Not Found" error when clicking "View Detailed Analysis" from signal cards
- [x] Fix signal ID mapping between signal cards and detail page
- [x] Ensure signal detail page can load data from risk_data.json correctly

## Phase 14: Mobile App Experience

- [x] Improve mobile responsive design across all pages
- [x] Add swipe gestures for category navigation
- [x] Implement bottom navigation bar for mobile
- [x] Add pull-to-refresh functionality
- [x] Optimize touch targets for mobile (min 44px)
- [x] Add mobile-specific layouts for dashboard
- [x] Implement hamburger menu for mobile
- [x] Add gesture-based chart interactions
- [x] Optimize performance for mobile devices
- [x] Test on various mobile screen sizes

## Phase 15: Smart Notifications

- [x] Create notification settings page
- [x] Implement daily risk summary notification
- [x] Implement weekly risk report notification
- [x] Add customizable notification schedule
- [x] Create notification templates
- [x] Add notification history log
- [x] Implement notification preferences (email format)
- [x] Add one-click unsubscribe option
- [x] Test notification delivery timing
- [x] Add notification preview feature

## Phase 16: Advanced Analytics

- [x] Create risk heatmap calendar component
- [x] Implement sector rotation analysis chart
- [x] Add volatility clustering detection algorithm
- [x] Create correlation network graph
- [x] Add risk distribution histogram
- [x] Implement rolling statistics calculator
- [x] Create advanced analytics page
- [x] Add interactive tooltips for all charts
- [x] Implement data export for analytics
- [x] Test analytics calculations accuracy

## Phase 17: Data Management

- [x] Add import portfolio from CSV/Excel
- [x] Add export portfolio to CSV/Excel
- [x] Implement backup all data to JSON
- [x] Implement restore data from JSON backup
- [x] Add data sync via URL parameters
- [x] Create data management UI in Settings
- [x] Add data validation for imports
- [x] Implement data migration for version updates
- [x] Add data compression for large exports
- [x] Test import/export with various file formats

## Phase 18: AI Assistant

- [x] Create AI chatbot component
- [x] Implement natural language query parser
- [x] Add risk analysis Q&A responses
- [x] Implement investment suggestion engine
- [x] Create chat history storage
- [x] Add context-aware responses
- [x] Implement quick action buttons
- [x] Add voice input support
- [x] Create AI assistant UI/UX
- [x] Test chatbot with various queries

## Phase 19: Performance Tracking

- [x] Create performance tracking page
- [x] Implement portfolio value history chart
- [x] Add actual vs predicted risk comparison
- [x] Create ROI calculator
- [x] Add performance metrics dashboard
- [x] Implement benchmark comparison
- [x] Add performance alerts
- [x] Create performance report generator
- [x] Add time-weighted return calculation
- [x] Test performance calculations accuracy

## Phase 20: Global Markets

- [x] Create Global Markets page
- [x] Add international indices tracking (Asia, Europe, Americas)
- [x] Implement currency risk monitoring (major pairs)
- [x] Add commodity prices tracking (Gold, Oil, Copper, etc.)
- [x] Create cross-market correlation matrix
- [x] Add global economic calendar
- [x] Implement market hours indicator
- [x] Add regional risk heatmap
- [x] Create currency strength meter
- [x] Test global markets data integration


## Bug Fixes (Current)

- [x] Fix React forwardRef error in AIAssistant component


## Critical Feature: Scheduled LINE Notifications

- [ ] Research available solutions for scheduled tasks without backend
- [ ] Implement daily 8 AM LINE notification using schedule tool
- [ ] Create risk summary message format
- [ ] Test scheduled notification delivery
- [ ] Document setup instructions for user


## Data Accuracy Updates (URGENT)

### API Integration
- [ ] Set up FRED API integration for economic data
- [ ] Set up Yahoo Finance API for market indices
- [ ] Set up Alpha Vantage API for forex and additional data
- [ ] Create data fetching service with caching

### Fix Incorrect Data
- [ ] Market Cap to GDP - fetch real data from FRED (currently showing 200.5%, should be 207.26%)
- [ ] GDP Growth - fix to show growth rate (%) not total GDP (currently 30.49T)
- [ ] CPI Inflation - convert CPI index to inflation rate (%) (currently showing 324.40 index)
- [ ] Dollar Index (DXY) - fetch real-time data (currently 121.34, should be 99.597)
- [ ] Unemployment Rate - fetch real data
- [ ] Consumer Confidence - fetch real data (currently 55.10)
- [ ] Retail Sales - fetch real data and YoY calculation (currently 632.5B)
- [ ] Stock Indices (S&P 500, Dow, NASDAQ, etc.) - fetch real-time prices
- [ ] Commodities (Gold, Silver, Oil, etc.) - fetch real-time prices
- [ ] Interest Rates - fetch real data

### Risk Score Calculation
- [ ] Update risk score calculation logic with real data
- [ ] Verify thresholds are appropriate for real data ranges
- [ ] Test overall risk score accuracy

### Testing
- [ ] Test all data sources
- [ ] Verify data updates in real-time
- [ ] Check LINE automation still works with new data
- [ ] Verify alert system triggers correctly

### Documentation
- [ ] Update userGuide.md with data sources
- [ ] Document API rate limits and caching strategy

# Real-time Data Integration (Phase 21)
- [x] Create data transformation service to convert FRED API data to risk_data.json format
- [x] Calculate risk scores for all indicators based on real-time values
- [x] Update dashboard to load real-time data instead of mock data
- [x] Create automated GitHub Actions workflow to refresh data every hour
- [x] Test all 25+ indicators display correct real-time values
- [x] Update LINE automation scripts to use real-time dashboard data
- [x] Verify daily reports and alerts work with real data
- [x] Add data freshness indicator showing last update time
