# 🎬 Caption Testing Guide

**Date:** November 10, 2025  
**Status:** ✅ ALL 9 STYLES READY TO TEST!

---

## ✅ System Status

**API:** 🟢 Running on http://localhost:3000  
**Web:** 🟢 Running on http://localhost:3001  
**Canvas:** ✅ Installed and working  
**Caption Styles:** 9 available (3 static, 6 animated)

---

## 🧪 Testing All 9 Caption Styles

### **Step 1: Access the App**
1. Open browser: http://localhost:3001
2. Login/create account
3. Navigate to a project with clips

### **Step 2: Select Clips for Export**
1. Click on clips you want to export
2. Click "Export" button
3. Export modal will open

### **Step 3: Enable Captions**
1. Toggle "Burn Captions" ON
2. You'll see the caption style selector

---

## 🎨 Test Each Style

### **1. Minimal** ⚪ (STATIC)
**What to expect:**
- Simple white text
- Subtle dark background
- Bottom position
- No animation
- Clean, readable

**Best for:** General content, accessibility

---

### **2. Bold** 💪 (ANIMATED)
**What to expect:**
- Large white text (56px)
- Pop/bounce animation
- Scale: 0.8 → 1.0
- Thick black outline (5px)
- Center position

**Animation:** Pops in at start of caption  
**Best for:** High-impact moments, viral content

---

### **3. Elegant** ✨ (ANIMATED)
**What to expect:**
- Serif font (Georgia)
- Slide-up animation
- Moves 30px upward
- Soft background
- Bottom position

**Animation:** Slides up smoothly  
**Best for:** Premium, sophisticated content

---

### **4. Modern** 🎯 (ANIMATED)
**What to expect:**
- Clean sans-serif
- Fade-in animation
- Opacity: 0 → 1
- Professional look
- Bottom position

**Animation:** Fades in over 200ms  
**Best for:** Tech, professional content

---

### **5. Karaoke** 🎤 (ANIMATED - ASS)
**What to expect:**
- Green text (#00FF00)
- Word-by-word highlighting
- Each word turns yellow as spoken
- Thick black outline (4px)
- Bottom position

**Animation:** Color change per word (green → yellow)  
**Best for:** Social media, engagement, sing-alongs

---

### **6. Podcast** 🎙️ (STATIC)
**What to expect:**
- Professional white text
- Dark background
- Bottom position
- No animation
- Clear, readable

**Best for:** Interviews, podcasts, clarity

---

### **7. MrBeast** ⭐ (ANIMATED - NEW!)
**What to expect:**
- **GOLD/YELLOW text** (#FFD700)
- **Word-by-word elastic bounce**
- Scale: 0.7 → 1.2 → 1.0
- **Thick black outline** (8px)
- Center position
- **MOST VIRAL STYLE!**

**Animation:** Each word pops in with bounce  
**Best for:** Viral content, YouTube Shorts, TikTok

---

### **8. Neon** 💚 (ANIMATED - NEW!)
**What to expect:**
- **Bright neon green** (#00FF00)
- **Pulsing glow effect**
- Multiple glow layers
- Pulses 4 times
- Thick black outline (6px)
- Bottom position

**Animation:** Continuous glow pulse  
**Best for:** Gen Z content, TikTok, party videos

---

### **9. Highlight** 💡 (ANIMATED - NEW!)
**What to expect:**
- **Black text on yellow background**
- **Sliding box animation**
- Box reveals left to right
- Word-by-word timing
- Center position
- **Hormozi style!**

**Animation:** Yellow box slides behind words  
**Best for:** Educational, business, key points

---

## 📋 Testing Checklist

### **For Each Style:**
- [ ] Select style in UI
- [ ] Export clip
- [ ] Download video
- [ ] Play and verify:
  - [ ] Captions appear
  - [ ] Animation works (if applicable)
  - [ ] Text is readable
  - [ ] Position is correct
  - [ ] Colors are right
  - [ ] Timing is synced to speech

---

## 🎯 What to Look For

### **Quality Checks:**
1. **Text Clarity**
   - Sharp, not blurry
   - Good contrast with background
   - Readable at all sizes

2. **Animation Smoothness**
   - 30 FPS (smooth motion)
   - No jitter or stuttering
   - Natural timing

3. **Positioning**
   - Not too low on screen
   - Not cut off
   - Centered properly

4. **Timing**
   - Synced to speech
   - Words appear when spoken
   - No lag or delay

5. **Colors**
   - Match style specifications
   - Good visibility
   - Proper contrast

---

## 🔥 Priority Testing Order

**Test these first (most important):**

1. **Karaoke** - Already proven to work, most engaging
2. **MrBeast** - NEW viral style, word-by-word bounce
3. **Neon** - NEW viral style, pulsing glow
4. **Highlight** - NEW viral style, sliding box

**Then test these:**
5. Bold - Pop animation
6. Modern - Fade animation
7. Elegant - Slide animation

**Finally:**
8. Minimal - Static baseline
9. Podcast - Static professional

---

## 🐛 If Something Doesn't Work

### **No Captions Appearing:**
1. Check if "Burn Captions" is toggled ON
2. Verify transcript exists for the clip
3. Check API logs: `docker logs clipforge-api --tail 50`

### **Animation Not Working:**
1. Check if canvas is installed: `docker exec clipforge-api npm list canvas`
2. Verify API restarted after canvas install
3. Check for errors in logs

### **Poor Quality:**
1. Verify CRF 20 in FFmpeg settings
2. Check if 30 FPS is being used
3. Look for frame generation errors

### **Wrong Colors:**
1. Compare with style specifications in VIRAL_CAPTIONS_COMPLETE.md
2. Check if correct style is selected
3. Verify style routing in code

---

## 📊 Expected Processing Times

**For a 30-second clip:**

| Style | Method | Time | Frames |
|-------|--------|------|--------|
| Minimal | ASS | ~5s | 0 |
| Podcast | ASS | ~5s | 0 |
| Karaoke | ASS | ~5s | 0 |
| Bold | Frame-by-frame | ~15s | 900 |
| Modern | Frame-by-frame | ~15s | 900 |
| Elegant | Frame-by-frame | ~15s | 900 |
| **MrBeast** | Frame-by-frame | ~18s | 900 |
| **Neon** | Frame-by-frame | ~17s | 900 |
| **Highlight** | Frame-by-frame | ~16s | 900 |

**Note:** First export may be slower (cold start)

---

## 🎬 Test Scenarios

### **Scenario 1: Quick Test**
1. Select 1 short clip (10-15s)
2. Test Karaoke style
3. Verify word highlighting works
4. **Time:** 2 minutes

### **Scenario 2: Viral Styles Test**
1. Select 1 clip (20-30s)
2. Test MrBeast style
3. Test Neon style
4. Test Highlight style
5. Compare animations
6. **Time:** 10 minutes

### **Scenario 3: Full Test**
1. Select 1 clip (30s)
2. Export with each of 9 styles
3. Download all 9 videos
4. Compare side-by-side
5. **Time:** 30 minutes

### **Scenario 4: Performance Test**
1. Select 3 clips (30s each)
2. Export all with MrBeast style
3. Monitor processing time
4. Check memory usage
5. Verify cleanup
6. **Time:** 15 minutes

---

## 📸 What Success Looks Like

### **Karaoke:**
- Green text appears
- Each word turns yellow as spoken
- Smooth color transition
- Perfect timing

### **MrBeast:**
- Yellow/gold text
- Each word bounces in
- Elastic, energetic feel
- Thick black outline visible

### **Neon:**
- Bright green glow
- Pulsing effect visible
- Multiple glow layers
- Eye-catching

### **Highlight:**
- Yellow box slides in
- Reveals behind each word
- Clean, professional
- Black text readable

---

## 🚀 Ready to Test!

**Everything is set up and ready:**
- ✅ API running
- ✅ Canvas installed
- ✅ All 9 styles available
- ✅ Animations implemented
- ✅ UI updated

**Start with Karaoke or MrBeast style - they're the most impressive!**

---

## 📝 Feedback Template

After testing, note:

**Style Tested:** ___________  
**Clip Length:** ___________  
**Processing Time:** ___________  

**Quality (1-5):**
- Text Clarity: ___
- Animation Smoothness: ___
- Positioning: ___
- Timing: ___
- Overall: ___

**Issues Found:**
- [ ] None
- [ ] Animation not smooth
- [ ] Colors wrong
- [ ] Positioning off
- [ ] Timing issues
- [ ] Other: ___________

**Notes:**
___________________________
___________________________

---

**Happy Testing! 🎉**
