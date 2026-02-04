# 💳 Credit System Analysis: ClipForge vs OpusClip

**Date:** November 25, 2025, 12:23 PM IST  
**Analysis:** Credit pricing comparison and market positioning

---

## 📊 **OPUSCLIP CREDIT SYSTEM**

### **How Credits Work:**

**Base Rule:**
- **1 credit = 1 minute of video processing**
- Videos < 1 minute = rounded UP to 1 credit
- Videos with partial minutes = rounded DOWN (e.g., 4.5 min = 4 credits)

### **Plans & Credits:**

| Plan | Monthly Credits | Annual Credits | Price/Month | Cost per Minute |
|------|----------------|----------------|-------------|-----------------|
| **Free** | 60 | - | $0 | $0 |
| **Starter** | 150 | 1,800 | $9 | $0.06 |
| **Pro** | 300 | 3,600 | $29 | $0.097 |
| **Business** | Custom | Custom | Custom | Custom |

### **Example Costs:**

| Video Length | Credits Needed | Free Plan | Starter Plan | Pro Plan |
|--------------|----------------|-----------|--------------|----------|
| **10 seconds** | 1 | ✅ 59 left | ✅ 149 left | ✅ 299 left |
| **1 minute** | 1 | ✅ 59 left | ✅ 149 left | ✅ 299 left |
| **30 minutes** | 30 | ✅ 30 left | ✅ 120 left | ✅ 270 left |
| **60 minutes** | 60 | ✅ 0 left | ✅ 90 left | ✅ 240 left |
| **120 minutes** | 120 | ❌ Need 60 more | ✅ 30 left | ✅ 180 left |

**Key Insight:**
- Free plan can process **1 hour-long video** per month
- Starter can process **2.5 hours** per month
- Pro can process **5 hours** per month

---

## 💰 **CLIPFORGE CREDIT SYSTEM (CURRENT)**

### **How Credits Work:**

**Base Rule:**
- **1 credit = 1 minute of video processing**
- Videos < 1 minute = 1 credit
- Videos with partial minutes = rounded DOWN (e.g., 4.5 min = 4 credits)

**URL Import Multiplier:**
- **1.5x credits for URL imports** (to cover download costs)
- Direct uploads = base credits
- URL imports = base credits × 1.5

### **Plans & Credits:**

| Plan | Monthly Credits | Price/Month | Cost per Minute |
|------|----------------|-------------|-----------------|
| **Free** | 60 | $0 | $0 |
| **Starter** | 150 | TBD | TBD |
| **Pro** | 300 | TBD | TBD |
| **Business** | 1,000 | TBD | TBD |
| **Enterprise** | 10,000 | TBD | TBD |

### **Example Costs:**

#### **Direct Upload (No Multiplier):**

| Video Length | Credits Needed | Free Plan | Starter Plan | Pro Plan |
|--------------|----------------|-----------|--------------|----------|
| **10 seconds** | 1 | ✅ 59 left | ✅ 149 left | ✅ 299 left |
| **1 minute** | 1 | ✅ 59 left | ✅ 149 left | ✅ 299 left |
| **30 minutes** | 30 | ✅ 30 left | ✅ 120 left | ✅ 270 left |
| **60 minutes** | 60 | ✅ 0 left | ✅ 90 left | ✅ 240 left |
| **120 minutes** | 120 | ❌ Need 60 more | ✅ 30 left | ✅ 180 left |

#### **URL Import (1.5x Multiplier):**

| Video Length | Base Credits | Actual Cost | Free Plan | Starter Plan | Pro Plan |
|--------------|--------------|-------------|-----------|--------------|----------|
| **10 seconds** | 1 | **2** | ✅ 58 left | ✅ 148 left | ✅ 298 left |
| **1 minute** | 1 | **2** | ✅ 58 left | ✅ 148 left | ✅ 298 left |
| **30 minutes** | 30 | **45** | ✅ 15 left | ✅ 105 left | ✅ 255 left |
| **60 minutes** | 60 | **90** | ❌ Need 30 more | ✅ 60 left | ✅ 210 left |
| **120 minutes** | 120 | **180** | ❌ Need 120 more | ❌ Need 30 more | ✅ 120 left |

**Key Insight:**
- Free plan can process **40 minutes** of URL imports per month
- Starter can process **100 minutes** (1.67 hours) of URL imports per month
- Pro can process **200 minutes** (3.33 hours) of URL imports per month

---

## 🔍 **COMPARISON: CLIPFORGE VS OPUSCLIP**

### **For Direct Uploads:**

| Metric | ClipForge | OpusClip | Winner |
|--------|-----------|----------|--------|
| **Credit Calculation** | 1 credit/min | 1 credit/min | 🟰 **Tie** |
| **Rounding Rule** | Round down | Round down | 🟰 **Tie** |
| **Free Plan** | 60 credits | 60 credits | 🟰 **Tie** |
| **Starter Plan** | 150 credits | 150 credits | 🟰 **Tie** |
| **Pro Plan** | 300 credits | 300 credits | 🟰 **Tie** |

**Result:** ✅ **IDENTICAL** - We match OpusClip exactly!

### **For URL Imports:**

| Metric | ClipForge | OpusClip | Winner |
|--------|-----------|----------|--------|
| **Credit Calculation** | 1.5x base | 1x base | 🏆 **OpusClip** |
| **2-hour video cost** | 180 credits | 120 credits | 🏆 **OpusClip** |
| **Free plan capacity** | 40 min | 60 min | 🏆 **OpusClip** |
| **Starter plan capacity** | 100 min | 150 min | 🏆 **OpusClip** |
| **Pro plan capacity** | 200 min | 300 min | 🏆 **OpusClip** |

**Result:** ❌ **OPUSCLIP WINS** - They don't charge extra for URL imports!

---

## ⚠️ **ISSUE: 1.5X MULTIPLIER**

### **The Problem:**

**Our Current System:**
- URL imports cost **1.5x more** than direct uploads
- 2-hour video = 180 credits (vs 120 for direct upload)
- This is **NOT market standard**

**OpusClip's System:**
- URL imports cost the **SAME** as direct uploads
- 2-hour video = 120 credits (regardless of source)
- This is **user-friendly**

### **Why This Matters:**

**User Experience:**
```
User: "I want to import a 2-hour podcast"
ClipForge: "That'll be 180 credits"
OpusClip: "That'll be 120 credits"
User: "Why is ClipForge more expensive?" 🤔
```

**Competitive Disadvantage:**
- Users will prefer OpusClip for URL imports
- Our Free plan only handles **40 minutes** vs OpusClip's **60 minutes**
- We're **50% more expensive** for URL imports

---

## 💡 **RECOMMENDATION**

### **Option 1: Remove 1.5x Multiplier (RECOMMENDED)**

**Change:**
```typescript
// Before:
const creditsNeeded = Math.ceil(baseCredits * 1.5); // 1.5x for URL imports

// After:
const creditsNeeded = baseCredits; // Same as direct upload
```

**Benefits:**
- ✅ Matches market standard (OpusClip)
- ✅ Better user experience
- ✅ Competitive pricing
- ✅ Simpler to explain

**Costs:**
- ⚠️ Slightly higher infrastructure costs (download bandwidth)
- ⚠️ But minimal - bandwidth is cheap

**Impact:**
| Video Length | Current Cost | New Cost | Savings |
|--------------|--------------|----------|---------|
| **30 minutes** | 45 credits | 30 credits | **33%** |
| **60 minutes** | 90 credits | 60 credits | **33%** |
| **120 minutes** | 180 credits | 120 credits | **33%** |

### **Option 2: Keep 1.5x Multiplier**

**Justification:**
- URL imports require download bandwidth
- Extra infrastructure costs
- Incentivize direct uploads

**Risks:**
- ❌ Not competitive with OpusClip
- ❌ Confusing for users
- ❌ Harder to market

---

## 📈 **MARKET ANALYSIS**

### **What Users Expect:**

**Based on OpusClip (market leader):**
1. ✅ 1 credit = 1 minute (we match)
2. ✅ Round down partial minutes (we match)
3. ❌ Same cost for URL imports (we don't match)
4. ✅ 60/150/300 credit tiers (we match)

**Verdict:** We're **75% aligned** with market standards.

### **Competitive Positioning:**

**If we remove 1.5x multiplier:**
- ✅ **100% aligned** with OpusClip
- ✅ Can compete on features, not pricing
- ✅ No pricing disadvantage

**If we keep 1.5x multiplier:**
- ⚠️ **75% aligned** with OpusClip
- ⚠️ Must justify higher pricing
- ⚠️ Risk losing users to OpusClip

---

## 🎯 **FINAL RECOMMENDATION**

### **Remove the 1.5x Multiplier**

**Reasons:**
1. **Market Standard** - OpusClip doesn't charge extra
2. **User Experience** - Simpler, fairer pricing
3. **Competitive** - No pricing disadvantage
4. **Cost** - Bandwidth is cheap (~$0.01/GB)

**Implementation:**
```typescript
// File: apps/api/src/queues/processors/video-import.processor.ts
// Line 81-83

// Remove this:
const creditsNeeded = Math.ceil(baseCredits * 1.5);

// Replace with:
const creditsNeeded = baseCredits;
```

**Impact:**
- Users save 33% on URL imports
- Free plan: 40 min → **60 min** capacity
- Starter plan: 100 min → **150 min** capacity
- Pro plan: 200 min → **300 min** capacity

---

## 📊 **CURRENT TEST RESULTS**

### **2-Hour Video Test:**

**Video:** Joe Rogan Experience #2253 - Theo Von  
**Duration:** 119 minutes (7,140 seconds)

**Credits Calculation:**
```
Base credits: 119 minutes = 119 credits
With 1.5x multiplier: 119 × 1.5 = 178.5 → 179 credits
```

**Actual Deduction:**
- Started: 230 credits
- Used: 179 credits
- Remaining: 51 credits

**If we removed 1.5x:**
- Would use: 119 credits
- Would save: 60 credits (33%)
- Would have: 111 credits remaining

---

## ✅ **CONCLUSION**

**Current System:**
- ✅ Matches OpusClip for direct uploads
- ❌ 50% more expensive for URL imports
- ⚠️ Not competitive

**Recommended Change:**
- Remove 1.5x multiplier
- Match OpusClip exactly
- Better user experience
- Competitive pricing

**Next Steps:**
1. Remove 1.5x multiplier from code
2. Update documentation
3. Test with another 2-hour video
4. Verify credit calculations

---

**Time:** 12:30 PM IST  
**Status:** Analysis complete, recommendation ready
