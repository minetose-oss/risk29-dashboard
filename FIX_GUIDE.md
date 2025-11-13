# 🔧 Fix Guide - Multi-Method Risk Calculation

## 🎯 สิ่งที่แก้ไข:

### **ปัญหาที่ 1: Workflow ล้มเหลว (npm dependency conflict)**
✅ แก้แล้ว - เพิ่ม `--legacy-peer-deps` flag

### **ปัญหาที่ 2: ค่าไม่เปลี่ยนเมื่อสลับ method**
✅ แก้แล้ว - คำนวณทุก method พร้อมกัน

---

## 📂 ไฟล์ที่ต้องอัพเดท:

### **1. `.github/workflows/update-data.yml`**
**การเปลี่ยนแปลง:**
- เพิ่ม `--legacy-peer-deps` ในบรรทัดที่ 52
- แก้ npm dependency conflict

**ก่อน:**
```yaml
- name: Install Node.js dependencies
  run: |
    cd client
    npm install
```

**หลัง:**
```yaml
- name: Install Node.js dependencies
  run: |
    cd client
    npm install --legacy-peer-deps
```

---

### **2. `scripts/calculate_risk.py`**
**การเปลี่ยนแปลง:**
- เพิ่มฟังก์ชัน `calculate_all_methods()`
- แก้ method names ให้ตรงกับ Frontend
  - `"simple"` → `"simple_average"`
  - `"weighted"` → `"weighted_average"`
  - `"time_decay"` → `"time_decay_momentum"`
  - `"regime_adaptive"` → `"regime_adaptive"` (เหมือนเดิม)
  - `"meta_ensemble"` → `"meta_ensemble"` (เหมือนเดิม)

**ฟังก์ชันใหม่:**
```python
def calculate_all_methods(indicators: Dict[str, float]) -> Dict[str, Tuple[float, Dict[str, float]]]:
    """Calculate risk scores using ALL methods"""
    results = {}
    methods = ["simple_average", "weighted_average", "time_decay_momentum", "regime_adaptive", "meta_ensemble"]
    for method in methods:
        overall, categories = calculate_risk_score(indicators, method)
        results[method] = (overall, categories)
    return results
```

---

### **3. `scripts/calculate_all_risk_methods.py` (ไฟล์ใหม่)**
**วัตถุประสงค์:**
- คำนวณ risk scores ด้วยทุก method
- บันทึกผลลัพธ์ไปที่ `client/public/risk_methods.json`
- ถูกเรียกโดย workflow หลังจากอัพเดทข้อมูล

**Output format:**
```json
{
  "timestamp": 1699876543,
  "last_updated": "2025-11-12T20:00:00",
  "methods": {
    "simple_average": {
      "overall_score": 50.0,
      "category_scores": {
        "liquidity": 45.0,
        "credit": 55.0,
        ...
      },
      "metadata": {...}
    },
    "weighted_average": {
      "overall_score": 52.3,
      ...
    },
    ...
  }
}
```

---

## 🚀 ขั้นตอนการติดตั้ง:

### **Step 1: Copy ไฟล์**

```powershell
# ไปที่ repository
cd C:\Users\leadi\risk29-dashboard

# Copy workflow file
# จาก: fix_package/.github/workflows/update-data.yml
# ไปที่: .github/workflows/update-data.yml

# Copy scripts
# จาก: fix_package/scripts/calculate_risk.py
# ไปที่: scripts/calculate_risk.py

# จาก: fix_package/scripts/calculate_all_risk_methods.py  
# ไปที่: scripts/calculate_all_risk_methods.py
```

### **Step 2: แก้ไข workflow ให้เรียก script ใหม่**

เปิดไฟล์ `.github/workflows/update-data.yml`

**หาบรรทัดนี้:**
```yaml
- name: Update dashboard data
  env:
    FRED_API_KEY: ${{ secrets.FRED_API_KEY }}
  run: |
    cd scripts
    python update_all_data.py
    python fetch_historical_data.py
```

**แก้เป็น:**
```yaml
- name: Update dashboard data
  env:
    FRED_API_KEY: ${{ secrets.FRED_API_KEY }}
  run: |
    cd scripts
    python update_all_data.py
    python fetch_historical_data.py
    python calculate_all_risk_methods.py
```

### **Step 3: Commit และ Push**

```powershell
git add .
git commit -m "Fix workflow and add multi-method calculation"
git push
```

### **Step 4: รอ Workflow ทำงาน**

1. ไปที่: https://github.com/minetose-oss/risk29-dashboard/actions
2. รอ workflow เสร็จ (~3-5 นาที)
3. ตรวจสอบว่าไม่มี error

### **Step 5: ทดสอบ Dashboard**

1. ไปที่: https://minetose-oss.github.io/risk29-dashboard/
2. กด Ctrl+Shift+R (hard refresh)
3. ไปที่หน้า Settings
4. **ลองสลับ method** ดูว่าค่าเปลี่ยนหรือไม่

---

## ✅ ผลลัพธ์ที่คาดหวัง:

### **ก่อนแก้:**
- ❌ Workflow ล้มเหลว (npm error)
- ❌ สลับ method แล้วค่าไม่เปลี่ยน
- ⚠️ แสดงแค่ 19 signals

### **หลังแก้:**
- ✅ Workflow ทำงานสำเร็จ
- ✅ สลับ method แล้วค่าเปลี่ยน
- ✅ แสดงค่าที่ต่างกันสำหรับแต่ละ method
- ⚠️ ยังแสดง 19 signals (ปกติ - ต้องเพิ่ม data sources สำหรับ 6 indicators ใหม่)

---

## 🔍 วิธีตรวจสอบว่าทำงาน:

### **1. เช็คว่า workflow สำเร็จ:**
```
✅ Set up Node.js
✅ Install Python dependencies  
✅ Update dashboard data
✅ Install Node.js dependencies  ← ต้องไม่มี error
✅ Build React app
✅ Copy build to docs folder
✅ Commit and push if changed
```

### **2. เช็คว่ามีไฟล์ใหม่:**
ไปที่: https://github.com/minetose-oss/risk29-dashboard/blob/master/client/public/risk_methods.json

ต้องเห็นไฟล์นี้ และมีข้อมูลประมาณนี้:
```json
{
  "methods": {
    "simple_average": { "overall_score": 50.0 },
    "weighted_average": { "overall_score": 52.3 },
    "time_decay_momentum": { "overall_score": 56.0 },
    "regime_adaptive": { "overall_score": 55.8 },
    "meta_ensemble": { "overall_score": 56.3 }
  }
}
```

### **3. เช็คว่า Dashboard แสดงค่าต่างกัน:**

1. เปิด Dashboard
2. ไปหน้า Settings
3. เลือก **Simple Average** → บันทึก → ดู Overall Risk (ควรได้ ~50)
4. เลือก **Time-Decay Momentum** → บันทึก → ดู Overall Risk (ควรได้ ~56)
5. **ถ้าค่าเปลี่ยน = สำเร็จ!** 🎉

---

## 🆘 ถ้ามีปัญหา:

### **ปัญหา: Workflow ยังล้มเหลว**
**ตรวจสอบ:**
- ไฟล์ `update-data.yml` มี `--legacy-peer-deps` หรือยัง?
- บรรทัดที่ 52 ต้องเป็น: `npm install --legacy-peer-deps`

### **ปัญหา: ค่ายังไม่เปลี่ยน**
**ตรวจสอบ:**
- มีไฟล์ `risk_methods.json` หรือยัง?
- ไฟล์มีข้อมูลครบ 5 methods หรือไม่?
- Hard refresh แล้วหรือยัง? (Ctrl+Shift+R)

### **ปัญหา: ไฟล์ `risk_methods.json` ไม่มี**
**สาเหตุ:**
- Script `calculate_all_risk_methods.py` ไม่ถูกเรียก
- ตรวจสอบ workflow ว่ามีบรรทัด `python calculate_all_risk_methods.py` หรือไม่

---

## 📊 สรุป:

| สิ่งที่แก้ | ไฟล์ | การเปลี่ยนแปลง |
|-----------|------|----------------|
| Workflow | `.github/workflows/update-data.yml` | เพิ่ม `--legacy-peer-deps` และเรียก script ใหม่ |
| Calculator | `scripts/calculate_risk.py` | เพิ่ม `calculate_all_methods()` |
| Script ใหม่ | `scripts/calculate_all_risk_methods.py` | คำนวณทุก method และบันทึก JSON |

---

**เวลาที่ใช้:** ~10 นาที (copy + commit + push + รอ workflow)

**ผลลัพธ์:** สลับ method แล้วค่าเปลี่ยน! 🎊
