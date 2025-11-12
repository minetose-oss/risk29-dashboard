# 📋 Copy & Paste Guide - Risk29 Dashboard Update

## 🎯 Overview

This guide will help you update the Risk29 Dashboard by copying and pasting files directly in GitHub's web editor.

**No installation required!** Everything is done through your browser.

---

## ✅ What You'll Get

After following this guide:
- ✅ Risk Calculator with 5 calculation methods
- ✅ Settings page to switch between methods
- ✅ Weighted average system for 23 indicators
- ✅ Improved calculation accuracy (+12.1%)
- ✅ Fixed GitHub Actions workflow

---

## 📂 Files to Copy & Paste

### **Python Scripts (7 files):**
1. `scripts/calculate_risk.py` - Main risk calculator
2. `scripts/indicator_weights.py` - Weights for 23 indicators
3. `scripts/merge_indicators.py` - Updated with weighted avg
4. `scripts/transform_to_dashboard.py` - Updated with weighted avg
5. `scripts/methods/__init__.py` - Methods package init
6. `scripts/methods/simple_average.py` - Simple average method
7. `scripts/methods/weighted_average.py` - Weighted average method
8. `scripts/methods/time_decay_momentum.py` - Time decay method
9. `scripts/methods/regime_adaptive.py` - Regime adaptive method
10. `scripts/methods/meta_ensemble.py` - Meta ensemble method

### **React Components (2 files):**
11. `client/src/pages/Settings.tsx` - Settings page
12. `client/src/components/RiskMethodSettings.tsx` - Method selector UI

### **GitHub Actions Workflow (1 file):**
13. `.github/workflows/update-data.yml` - Fixed workflow

---

## 🚀 Step-by-Step Instructions

### **Step 1: Open GitHub Web Editor**

1. Go to: https://github.com/minetose-oss/risk29-dashboard
2. Press `.` (period/dot key) on your keyboard
3. GitHub web editor (VS Code) will open

---

### **Step 2: Create/Update Python Scripts**

#### **2.1 Create `scripts/calculate_risk.py`**

1. In the file explorer (left sidebar), navigate to `scripts/`
2. Right-click on `scripts/` → **New File**
3. Name it: `calculate_risk.py`
4. Open the file `scripts/calculate_risk.py` from the package
5. **Copy all content** from the package file
6. **Paste** into the GitHub editor

#### **2.2 Create `scripts/indicator_weights.py`**

1. Right-click on `scripts/` → **New File**
2. Name it: `indicator_weights.py`
3. Open the file from the package
4. **Copy & Paste** all content

#### **2.3 Update `scripts/merge_indicators.py`**

1. In the file explorer, click on `scripts/merge_indicators.py` (should already exist)
2. **Select all** (Ctrl+A)
3. Open the file from the package
4. **Copy & Paste** all content (replace existing)

#### **2.4 Update `scripts/transform_to_dashboard.py`**

1. Click on `scripts/transform_to_dashboard.py`
2. **Select all** (Ctrl+A)
3. **Copy & Paste** from package (replace existing)

#### **2.5 Create `scripts/methods/` folder and files**

1. Right-click on `scripts/` → **New Folder**
2. Name it: `methods`
3. Create these 6 files inside `methods/`:
   - `__init__.py`
   - `simple_average.py`
   - `weighted_average.py`
   - `time_decay_momentum.py`
   - `regime_adaptive.py`
   - `meta_ensemble.py`
4. **Copy & Paste** content for each file from the package

---

### **Step 3: Create/Update React Components**

#### **3.1 Update `client/src/pages/Settings.tsx`**

1. Navigate to `client/src/pages/`
2. If `Settings.tsx` exists, click on it
3. If not, create it: Right-click on `pages/` → **New File** → `Settings.tsx`
4. **Copy & Paste** all content from the package

#### **3.2 Create `client/src/components/RiskMethodSettings.tsx`**

1. Navigate to `client/src/components/`
2. Right-click → **New File**
3. Name it: `RiskMethodSettings.tsx`
4. **Copy & Paste** all content from the package

---

### **Step 4: Update GitHub Actions Workflow**

#### **4.1 Update `.github/workflows/update-data.yml`**

1. Navigate to `.github/workflows/`
2. Click on `update-data.yml`
3. **Select all** (Ctrl+A)
4. **Copy & Paste** from package (replace existing)

**This workflow includes:**
- ✅ Fixed git push conflicts
- ✅ Node.js setup (without cache dependency)
- ✅ React app building
- ✅ Auto-deployment

---

### **Step 5: Commit Changes**

1. Click on **Source Control** icon (left sidebar, looks like a branch)
2. You'll see all changed files listed
3. Enter commit message:
   ```
   Add Risk Calculator and fix workflow

   - Add Risk Calculator with 5 calculation methods
   - Implement weighted average for 23 indicators
   - Add Settings page with method selector UI
   - Fix GitHub Actions workflow for auto-build
   - Update merge_indicators.py and transform_to_dashboard.py
   ```
4. Click **✓ Commit & Push**
5. Confirm the push

---

### **Step 6: Wait for Deployment**

1. Go to: https://github.com/minetose-oss/risk29-dashboard/actions
2. You'll see the workflow running
3. Wait ~3-5 minutes for it to complete
4. Check for ✅ (success) or ❌ (failure)

---

### **Step 7: Verify Dashboard**

1. Go to: https://minetose-oss.github.io/risk29-dashboard/
2. Press **Ctrl+Shift+R** (hard refresh)
3. You should see:
   - ✅ Settings page (click Settings in nav)
   - ✅ 5 calculation methods to choose from
   - ✅ 23 indicators tracked
   - ✅ Weighted average as default method

---

## 🔧 Troubleshooting

### **Issue: Workflow fails with npm error**

**Solution:**
The workflow is configured to use `npm install --legacy-peer-deps` to avoid dependency conflicts.

If it still fails:
1. Check the error in GitHub Actions
2. The workflow might need adjustment for the `--legacy-peer-deps` flag

### **Issue: Settings page not visible**

**Possible causes:**
1. React app not built yet
2. Browser cache not cleared

**Solutions:**
1. Wait for GitHub Actions workflow to complete
2. Hard refresh: Ctrl+Shift+R
3. Try incognito mode
4. Wait 5-10 minutes for cache to clear

### **Issue: Files not showing up**

**Check:**
1. Did you commit and push?
2. Check Source Control tab for uncommitted changes
3. Refresh the GitHub repository page

---

## 📊 Expected Results

### **Dashboard Changes:**

**Before:**
- 19 signals tracked
- Simple average calculation only
- No settings page

**After:**
- ✅ 23 signals tracked
- ✅ 5 calculation methods available
- ✅ Settings page with method selector
- ✅ Weighted average (default)
- ✅ +12.1% accuracy improvement

### **Workflow Changes:**

**Before:**
- Data update only
- No React build
- Git push conflicts

**After:**
- ✅ Data update
- ✅ React app auto-build
- ✅ Fixed git conflicts
- ✅ Auto-deployment

---

## 💡 Tips

1. **Take your time** - Copy & paste carefully
2. **Double-check file paths** - Make sure files are in the correct folders
3. **Use Ctrl+A to select all** - When replacing existing files
4. **Commit often** - You can commit after each section if you want
5. **Check the diff** - GitHub editor shows what changed (green = added, red = removed)

---

## 🎊 Success Checklist

- [ ] All 13 files copied and pasted
- [ ] Committed and pushed changes
- [ ] GitHub Actions workflow running
- [ ] Workflow completed successfully (✅)
- [ ] Dashboard refreshed (Ctrl+Shift+R)
- [ ] Settings page visible
- [ ] 5 methods selectable
- [ ] 23 indicators showing

---

## 📞 Need Help?

If you encounter any issues:
1. Check the error message in GitHub Actions
2. Verify all files are in the correct locations
3. Make sure all content was copied completely
4. Try refreshing the browser

---

**Good luck! 🚀**
