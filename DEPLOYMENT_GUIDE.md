# Deployment Guide - Risk29 Dashboard

## Quick Deployment Steps

### 1. Push to GitHub

```bash
# Make sure you're in the project directory
cd /home/ubuntu/risk29-dashboard

# Push all commits to GitHub
git push origin master
```

### 2. Verify GitHub Actions

After pushing, check that the workflows are set up:

1. Go to your repository on GitHub
2. Click on "Actions" tab
3. You should see two workflows:
   - "Train Risk Prediction Model" (runs weekly)
   - "Generate Risk Predictions" (runs daily)

### 3. Manually Trigger Workflows (First Time)

Since the workflows are scheduled, you can manually trigger them for the first time:

1. Go to Actions tab
2. Select "Train Risk Prediction Model"
3. Click "Run workflow" → "Run workflow"
4. Wait for it to complete
5. Then select "Generate Risk Predictions"
6. Click "Run workflow" → "Run workflow"

### 4. Deploy to GitHub Pages

If your repository is already set up for GitHub Pages:

```bash
# Build the production version
cd client
pnpm build

# The dist folder is ready for deployment
# GitHub Pages should automatically deploy from the gh-pages branch
```

If using GitHub Actions for deployment, the workflow should automatically deploy after pushing.

### 5. Verify Production

After deployment:

1. Visit your GitHub Pages URL
2. Check that the Home page loads correctly
3. Scroll down to verify the "Risk Forecast (Next 30 Days)" chart appears
4. Check that the average predicted risk shows "4.1 Low"
5. Wait 5 minutes and verify toast notification appears for auto-refresh

## Environment Variables

Make sure these are set in your GitHub repository settings (if needed):

- No environment variables required for basic functionality
- All data files are committed to the repository

## Troubleshooting

### Workflows Not Running

- Check that the workflow files are in `.github/workflows/`
- Verify the repository has Actions enabled
- Check workflow logs for error messages

### Predictions Not Showing

- Verify `client/public/predictions.json` exists
- Check browser console for fetch errors
- Ensure the file is being served correctly

### Build Errors

- Run `pnpm install` to ensure all dependencies are installed
- Check that Node.js version is 22.x or compatible
- Verify Python 3.11 is available for model training

## Monitoring

After deployment, monitor:

1. **GitHub Actions**: Check that weekly training and daily predictions run successfully
2. **Prediction Accuracy**: Compare predictions with actual risk scores over time
3. **User Feedback**: Monitor for any issues with the prediction chart or auto-refresh

## Maintenance

### Weekly Tasks
- Review model training logs
- Check prediction accuracy

### Monthly Tasks
- Review model performance metrics
- Consider retraining with more data if available
- Update dependencies if needed

## Support

For issues or questions:
- Check the TESTING_RESULTS.md file
- Review the IMPLEMENTATION_SUMMARY.md file
- Check GitHub Actions logs for workflow errors
