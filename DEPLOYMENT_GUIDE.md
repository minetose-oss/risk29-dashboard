# Risk29 Dashboard - Deployment Guide

## Overview

This guide explains how to deploy the Risk29 Dashboard to GitHub Pages with automated real-time data updates.

## Prerequisites

- GitHub account
- Git installed locally
- FRED API key (already configured: `e438e833b710bbc9f7defdb12b9fa33e`)

## Step 1: Create GitHub Repository

1. Go to GitHub and create a new **public** repository
2. Name it: `risk29-dashboard` (or any name you prefer)
3. **Important:** Make it PUBLIC (GitHub Actions is free for public repos)
4. Do NOT initialize with README (we'll push existing code)

## Step 2: Push Code to GitHub

```bash
cd /home/ubuntu/risk29-dashboard

# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Risk29 Dashboard with real-time data integration"

# Add remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/risk29-dashboard.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 3: Configure GitHub Secrets

1. Go to your repository on GitHub
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add the following secret:
   - Name: `FRED_API_KEY`
   - Value: `e438e833b710bbc9f7defdb12b9fa33e`
5. Click **Add secret**

## Step 4: Enable GitHub Pages

1. Go to **Settings** → **Pages**
2. Under **Source**, select:
   - Branch: `main`
   - Folder: `/client/public` (or root if using build output)
3. Click **Save**
4. Your dashboard will be available at: `https://YOUR_USERNAME.github.io/risk29-dashboard/`

**Note:** If you want a custom domain, you can configure it in the same page.

## Step 5: Enable GitHub Actions

1. Go to **Actions** tab in your repository
2. You should see the workflow: **Update Dashboard Data**
3. If disabled, click **Enable workflow**
4. The workflow will run automatically every hour

### Manual Trigger (Optional)

To manually trigger a data update:
1. Go to **Actions** tab
2. Click **Update Dashboard Data** workflow
3. Click **Run workflow** button
4. Select branch `main`
5. Click **Run workflow**

## Step 6: Verify Automated Updates

After the first workflow run:
1. Check **Actions** tab to see if the workflow completed successfully
2. Look for commits like: `🤖 Auto-update dashboard data 2025-10-31 11:00 UTC`
3. Visit your GitHub Pages URL to see the updated dashboard

## Step 7: Update LINE Automation

The LINE automation scripts in `risk29-line-automation` repository are already configured to fetch data from:
```
https://riskdash-h38zfvrd.manus.space/risk_data.json
```

**To use your new GitHub Pages URL:**

1. Go to `risk29-line-automation` repository
2. Edit `send_daily_report.py` and `check_and_alert.py`
3. Change `DASHBOARD_URL` to your GitHub Pages URL:
   ```python
   DASHBOARD_URL = "https://YOUR_USERNAME.github.io/risk29-dashboard"
   ```
4. Commit and push changes

## Architecture

### Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    GitHub Actions (Hourly)                   │
│                                                               │
│  1. fetch_real_data.py                                       │
│     ├─ FRED API (GDP, M2, CPI, etc.)                        │
│     └─ Yahoo Finance (S&P 500, VIX, DXY, etc.)              │
│           ↓                                                   │
│     real_data.json (raw data)                                │
│                                                               │
│  2. transform_to_dashboard.py                                │
│     ├─ Calculate risk scores                                 │
│     └─ Apply thresholds                                      │
│           ↓                                                   │
│     risk_data.json (dashboard format)                        │
│                                                               │
│  3. Git commit & push                                        │
│           ↓                                                   │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                      GitHub Pages                            │
│                                                               │
│  Dashboard displays real-time data                           │
│  URL: https://YOUR_USERNAME.github.io/risk29-dashboard/     │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│              LINE Automation (GitHub Actions)                │
│                                                               │
│  Daily Report (8:00 AM GMT+7)                               │
│  ├─ Fetch risk_data.json from GitHub Pages                  │
│  └─ Send Flex Message to LINE                               │
│                                                               │
│  Alert Checker (Every 30 minutes)                           │
│  ├─ Fetch risk_data.json from GitHub Pages                  │
│  ├─ Check thresholds (Overall ≥60 OR Category ≥70)         │
│  └─ Send alert if triggered                                 │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Data Update Schedule

- **Dashboard Data:** Every hour (00:00, 01:00, 02:00, etc.)
- **LINE Daily Report:** 8:00 AM GMT+7 (Thailand time)
- **LINE Alerts:** Every 30 minutes

## Monitoring

### Check Data Updates
1. Go to **Actions** tab
2. Look for **Update Dashboard Data** workflow runs
3. Click on a run to see logs

### Check LINE Notifications
1. Go to `risk29-line-automation` repository
2. Check **Actions** tab for workflow runs
3. Verify LINE messages are being sent

## Troubleshooting

### Workflow Fails
- Check **Actions** tab for error messages
- Verify FRED_API_KEY secret is set correctly
- Check if FRED API rate limit exceeded (50 requests/day for free tier)

### Data Not Updating
- Verify workflow is enabled in **Actions** tab
- Check if there are any failed workflow runs
- Manually trigger workflow to test

### LINE Notifications Not Working
- Verify LINE_NOTIFY_TOKEN secret in `risk29-line-automation` repo
- Check if DASHBOARD_URL is correct in LINE scripts
- Verify GitHub Pages is serving the dashboard correctly

## Cost

**Everything is 100% FREE:**
- ✅ GitHub Pages (free hosting)
- ✅ GitHub Actions (free for public repos - 2,000 minutes/month)
- ✅ FRED API (free tier - 50 requests/day)
- ✅ Yahoo Finance (free - no API key needed)
- ✅ LINE Messaging API (free - no message limits for push messages)

**Estimated Usage:**
- GitHub Actions: ~1 minute per workflow run × 24 runs/day = 24 minutes/day = 720 minutes/month
- Well within free tier limit (2,000 minutes/month)

## Security

- FRED API key is stored as GitHub Secret (encrypted)
- LINE access token is stored as GitHub Secret (encrypted)
- No sensitive data is exposed in public repository

## Maintenance

### Update Data Sources
Edit `scripts/fetch_real_data.py` to add/modify data sources:
```python
# Add new FRED series
new_data = fetch_fred_data("NEW_SERIES_ID")

# Add new Yahoo Finance ticker
new_market = fetch_yahoo_finance("TICKER")
```

### Adjust Risk Thresholds
Edit `scripts/transform_to_dashboard.py` to modify risk calculation:
```python
# Example: Change inflation thresholds
risk_score = calculate_risk_score(
    inflation, 
    {'low': 1.5, 'medium': 2.5, 'high': 4, 'critical': 6}
)
```

### Change Update Frequency
Edit `.github/workflows/update-data.yml`:
```yaml
schedule:
  # Run every 2 hours instead of every hour
  - cron: '0 */2 * * *'
```

## Support

For issues or questions:
1. Check the logs in **Actions** tab
2. Review `DATA_VALIDATION_REPORT.md` for data accuracy
3. Read `scripts/README.md` for script documentation

## Next Steps

After deployment:
1. ✅ Verify dashboard is live on GitHub Pages
2. ✅ Check first automated data update (wait 1 hour)
3. ✅ Update LINE automation with new dashboard URL
4. ✅ Test LINE daily report and alerts
5. ✅ Monitor for a few days to ensure stability

---

**Deployed by:** Manus AI  
**Date:** October 31, 2025  
**Version:** 1.0
