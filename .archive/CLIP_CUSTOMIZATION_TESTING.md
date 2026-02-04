# 🧪 Clip Customization Feature - Testing Guide

**Date:** November 5, 2025 - 7:48 PM IST  
**Status:** ✅ READY TO TEST  
**Time to Test:** ~15 minutes

---

## ✅ **What We Built (Last 2 Hours)**

### **Backend:**
1. ✅ Database migration - Added `clipSettings`, `aspectRatio`, `targetPlatform`
2. ✅ DTOs - `ClipSettingsDto`, `DetectClipsDto` with validation
3. ✅ API endpoint - Updated `/v1/projects/:id/detect` to accept settings
4. ✅ Service logic - Clips generated based on custom settings

### **Frontend:**
1. ✅ Platform presets - YouTube Shorts, TikTok, Instagram, LinkedIn, Custom
2. ✅ ClipSettingsModal - Full settings interface
3. ✅ AspectRatioSelector - Visual aspect ratio picker
4. ✅ ClipLengthSelector - Slider for duration (15-180s)
5. ✅ NumberOfClips - Slider for count (1-10)
6. ✅ TimeframeSelector - Process specific video portions
7. ✅ Integration - Connected to upload flow

---

## 🎯 **Testing Checklist**

### **Test 1: Basic Upload (No Custom Settings)** ⭐
**Goal:** Verify default behavior still works

1. Go to http://localhost:3001/dashboard
2. Click "+ Create"
3. Upload a small video (1-2 min)
4. Enter title
5. **DON'T click "Customize Clip Settings"**
6. Click "Upload & Process"
7. Watch progress indicators

**Expected Result:**
- ✅ Upload completes
- ✅ 3 clips generated (default)
- ✅ 16:9 aspect ratio (default)
- ✅ ~60 second clips (default)
- ✅ Redirect to project page
- ✅ All clips visible

---

### **Test 2: YouTube Shorts Preset** 📺
**Goal:** Test platform preset functionality

1. Go to http://localhost:3001/dashboard
2. Click "+ Create"
3. Upload video
4. Enter title
5. **Click "Customize Clip Settings"**
6. **Click "YouTube Shorts" preset**
7. Verify settings auto-fill:
   - Aspect Ratio: 9:16 (Vertical)
   - Clip Length: 45s
   - Number of Clips: 3
8. Click "Save Settings"
9. Verify button shows: "9:16 • 45s • 3 clips"
10. Click "Upload & Process"

**Expected Result:**
- ✅ Settings saved
- ✅ Upload completes
- ✅ 3 clips generated
- ✅ Each clip ~45 seconds
- ✅ Aspect ratio stored as 9:16
- ✅ Target platform: youtube-shorts

**How to Verify:**
Check database:
```bash
docker exec clipforge-postgres psql -U clipforge -d clipforge_dev -c \
  "SELECT title, duration, \"aspectRatio\", \"targetPlatform\" FROM \"Moment\" ORDER BY \"createdAt\" DESC LIMIT 3;"
```

---

### **Test 3: TikTok Preset** 🎵
**Goal:** Test different preset

1. Upload new video
2. Click "Customize Clip Settings"
3. **Click "TikTok" preset**
4. Verify:
   - Aspect Ratio: 9:16
   - Clip Length: 30s
   - Number of Clips: 5
5. Click "Save Settings"
6. Upload & Process

**Expected Result:**
- ✅ 5 clips generated (not 3!)
- ✅ Each clip ~30 seconds
- ✅ Target platform: tiktok

---

### **Test 4: Custom Settings** ⚙️
**Goal:** Test manual customization

1. Upload new video
2. Click "Customize Clip Settings"
3. **Click "Custom" preset**
4. Manually adjust:
   - Aspect Ratio: 1:1 (Square)
   - Clip Length: 90s (drag slider)
   - Number of Clips: 2 (drag slider)
5. Click "Save Settings"
6. Upload & Process

**Expected Result:**
- ✅ 2 clips generated
- ✅ Each clip ~90 seconds
- ✅ Aspect ratio: 1:1

---

### **Test 5: Timeframe Selection** 📊
**Goal:** Test processing specific video portions

1. Upload new video
2. Click "Customize Clip Settings"
3. **Uncheck "Process entire video"**
4. Set timeframe:
   - Start: 0:30 (30 seconds)
   - End: 2:00 (2 minutes)
5. Set clips: 2
6. Click "Save Settings"
7. Upload & Process

**Expected Result:**
- ✅ 2 clips generated
- ✅ Both clips between 30s-120s range
- ✅ No clips before 30s or after 120s

---

### **Test 6: Settings Persistence** 💾
**Goal:** Verify settings are saved with project

1. Upload video with custom settings
2. Wait for completion
3. Go to project page
4. Check database for saved settings:

```bash
docker exec clipforge-postgres psql -U clipforge -d clipforge_dev -c \
  "SELECT id, title, \"clipSettings\" FROM \"Project\" ORDER BY \"createdAt\" DESC LIMIT 1;"
```

**Expected Result:**
- ✅ clipSettings JSON field populated
- ✅ Contains aspectRatio, clipLength, numberOfClips, targetPlatform

---

### **Test 7: Edit Settings** ✏️
**Goal:** Test modifying settings before upload

1. Upload video
2. Click "Customize Clip Settings"
3. Select "Instagram Reels"
4. Click "Save Settings"
5. **Click "Edit Clip Settings" again**
6. Change to "LinkedIn"
7. Click "Save Settings"
8. Upload & Process

**Expected Result:**
- ✅ LinkedIn settings applied (not Instagram)
- ✅ 16:9 aspect ratio
- ✅ 60s clips
- ✅ 2 clips

---

### **Test 8: All Aspect Ratios** 📐
**Goal:** Test each aspect ratio

Test each one:
1. **9:16** (Vertical) - TikTok, Shorts
2. **16:9** (Landscape) - YouTube, LinkedIn
3. **1:1** (Square) - Instagram Feed
4. **4:5** (Portrait) - Instagram Feed

**Expected Result:**
- ✅ Each aspect ratio saves correctly
- ✅ Stored in database
- ✅ Visible in Moment records

---

### **Test 9: Clip Length Boundaries** ⏱️
**Goal:** Test min/max values

1. Test minimum: 15 seconds
2. Test maximum: 180 seconds
3. Test middle: 60 seconds

**Expected Result:**
- ✅ All values work
- ✅ Clips generated with correct duration
- ✅ No errors

---

### **Test 10: Number of Clips Boundaries** 🔢
**Goal:** Test min/max clip count

1. Test minimum: 1 clip
2. Test maximum: 10 clips
3. Test middle: 5 clips

**Expected Result:**
- ✅ Correct number of clips generated
- ✅ No duplicates
- ✅ All clips have unique time ranges

---

## 🐛 **What to Look For (Potential Issues)**

### **UI Issues:**
- ❌ Modal doesn't open
- ❌ Presets don't change settings
- ❌ Sliders don't move
- ❌ Settings don't save
- ❌ Button doesn't show settings summary

### **Backend Issues:**
- ❌ API returns 400/500 errors
- ❌ Wrong number of clips generated
- ❌ Wrong clip duration
- ❌ Settings not saved to database
- ❌ Aspect ratio not stored

### **Integration Issues:**
- ❌ Upload fails with settings
- ❌ Progress indicators break
- ❌ Redirect doesn't work
- ❌ Clips don't appear

---

## 🔍 **Debugging Commands**

### **Check Web Logs:**
```bash
docker logs clipforge-web --tail 50
```

### **Check API Logs:**
```bash
docker logs clipforge-api --tail 50
```

### **Check Latest Project Settings:**
```bash
docker exec clipforge-postgres psql -U clipforge -d clipforge_dev -c \
  "SELECT id, title, \"clipSettings\", status FROM \"Project\" ORDER BY \"createdAt\" DESC LIMIT 3;"
```

### **Check Latest Clips:**
```bash
docker exec clipforge-postgres psql -U clipforge -d clipforge_dev -c \
  "SELECT \"projectId\", title, duration, \"aspectRatio\", \"targetPlatform\" FROM \"Moment\" ORDER BY \"createdAt\" DESC LIMIT 5;"
```

### **Check API Response:**
```bash
# After uploading, check the detect response
docker logs clipforge-api | grep -A 10 "Highlight detection started"
```

---

## ✅ **Success Criteria**

### **Must Work:**
- ✅ All 6 platform presets work
- ✅ Custom settings work
- ✅ Settings persist with project
- ✅ Correct number of clips generated
- ✅ Correct clip duration
- ✅ Aspect ratio stored correctly
- ✅ Upload flow doesn't break

### **Should Work:**
- ✅ Timeframe selection works
- ✅ Settings can be edited
- ✅ Settings summary displays correctly
- ✅ All aspect ratios work

### **Nice to Have:**
- ✅ Smooth animations
- ✅ Clear visual feedback
- ✅ Helpful tooltips

---

## 📊 **Quick Test Script**

**5-Minute Smoke Test:**

1. **Default Upload** (no settings) → Should work
2. **YouTube Shorts** preset → 3 clips, 45s, 9:16
3. **TikTok** preset → 5 clips, 30s, 9:16
4. **Custom** (1:1, 90s, 2 clips) → 2 clips, 90s, 1:1
5. **Check database** → All settings saved

If all 5 pass → ✅ **READY TO PUSH**

---

## 🚀 **After Testing**

### **If Everything Works:**
1. ✅ Commit changes
2. ✅ Push to GitHub
3. ✅ Update documentation
4. ✅ Celebrate! 🎉

### **If Issues Found:**
1. Note the issue
2. Check logs
3. Fix the bug
4. Re-test
5. Repeat until all pass

---

## 📝 **Test Results Template**

```
# Clip Customization Test Results
Date: [DATE]
Tester: [NAME]

## Test Results:
- [ ] Test 1: Basic Upload - PASS/FAIL
- [ ] Test 2: YouTube Shorts - PASS/FAIL
- [ ] Test 3: TikTok - PASS/FAIL
- [ ] Test 4: Custom Settings - PASS/FAIL
- [ ] Test 5: Timeframe - PASS/FAIL
- [ ] Test 6: Persistence - PASS/FAIL
- [ ] Test 7: Edit Settings - PASS/FAIL
- [ ] Test 8: Aspect Ratios - PASS/FAIL
- [ ] Test 9: Clip Length - PASS/FAIL
- [ ] Test 10: Clip Count - PASS/FAIL

## Issues Found:
1. [Issue description]
2. [Issue description]

## Overall Status: PASS/FAIL
```

---

**Status:** ✅ **READY TO TEST**  
**URL:** http://localhost:3001/dashboard  
**Time Needed:** 15 minutes for full test, 5 minutes for smoke test

**Start testing now!** 🚀
