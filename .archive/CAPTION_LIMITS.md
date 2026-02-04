# 🎬 Caption Style Limits & Recommendations

**Last Updated:** November 10, 2025

---

## 📊 **Caption Style Limits**

| Style | Max Duration | Processing Time | Status |
|-------|--------------|-----------------|--------|
| **Karaoke** | ∞ Unlimited | ~5s | ✅ Recommended for all lengths |
| **Minimal** | ∞ Unlimited | ~5s | ✅ Works perfectly |
| **Podcast** | ∞ Unlimited | ~5s | ✅ Works perfectly |
| **MrBeast** | **15 seconds** | ~15-20s | ⚠️ Limited |
| **Neon** | **15 seconds** | ~15-20s | ⚠️ Limited |
| **Highlight** | **15 seconds** | ~15-20s | ⚠️ Limited |
| **Bold** | **15 seconds** | ~15-20s | ⚠️ Limited |
| **Modern** | **15 seconds** | ~15-20s | ⚠️ Limited |
| **Elegant** | **15 seconds** | ~15-20s | ⚠️ Limited |

---

## ⚠️ **Why the 15-Second Limit?**

**Animated styles** (MrBeast, Neon, Highlight, Bold, Modern, Elegant) use **frame-by-frame rendering**:

- 15s clip = **450 frames** ✅ Reliable
- 20s clip = **600 frames** ⚠️ Risky
- 23s clip = **690 frames** ❌ Crashes during FFmpeg overlay
- 30s clip = **900 frames** ❌ Crashes during generation

**Memory Constraints:**
- Frame generation: ~200MB for 450 frames
- FFmpeg overlay: Additional ~300MB
- Total: ~500MB for 15s clip (safe)
- 23s+ clips exceed available memory and crash

---

## ✅ **Recommended Usage**

### **For Clips Under 15 Seconds:**
Use **any style** you want!
- ✅ MrBeast - Yellow bounce animation
- ✅ Neon - Green glow pulse
- ✅ Highlight - Yellow box slide
- ✅ Bold/Modern/Elegant - Various animations
- ✅ Karaoke - Word highlighting
- ✅ Minimal/Podcast - Static

### **For Clips 15-60 Seconds:**
**Use Karaoke style!**
- ✅ Works for ANY length
- ✅ Beautiful green→yellow word highlighting
- ✅ Fast processing (~5 seconds)
- ✅ No memory issues
- ✅ Looks professional and engaging

### **For Clips Over 60 Seconds:**
- ✅ Karaoke (best choice)
- ✅ Minimal (clean, simple)
- ✅ Podcast (professional)

---

## 🎨 **Style Specifications**

### **Karaoke** (Unlimited Length)
- **Font:** Arial, 48px
- **Colors:** Green (#00FF00) → Yellow (#FFFF00)
- **Animation:** Word-by-word color change
- **Method:** ASS subtitles (instant rendering)
- **Best for:** All content, especially longer clips

### **MrBeast** (Max 15s)
- **Font:** Arial Black, 80px
- **Color:** Gold/Yellow (#FFD700)
- **Stroke:** 10px black outline
- **Animation:** Elastic bounce (0.5 → 1.3 → 1.0 scale)
- **Method:** Frame-by-frame (30 FPS)
- **Best for:** Viral content, high-energy moments

### **Neon** (Max 15s)
- **Font:** Arial Black, 72px
- **Color:** Neon Green (#00FF00)
- **Stroke:** 8px black outline
- **Glow:** 30px blur
- **Animation:** Pulsing glow (4 cycles)
- **Method:** Frame-by-frame (30 FPS)
- **Best for:** Gen Z content, TikTok, party videos

### **Highlight** (Max 15s)
- **Font:** Arial Black, 70px
- **Colors:** Black text on yellow background (#FFD700)
- **Animation:** Sliding yellow box (left to right)
- **Method:** Frame-by-frame (30 FPS)
- **Best for:** Educational, business, key points

---

## 🔧 **Technical Details**

### **Frame-by-Frame Rendering Process:**

1. **Generate Frames** (~4s per 100 frames)
   - Create PNG for each frame (30 FPS)
   - Render text with animations
   - Save to temporary directory

2. **Overlay with FFmpeg** (~10s)
   - Load all frames into memory
   - Overlay onto video
   - Encode final output

3. **Cleanup**
   - Delete temporary frames
   - Free memory

**Memory Usage (15s clip):**
- Frame generation: 200MB
- FFmpeg overlay: 300MB
- Total: ~500MB (safe)

**Memory Usage (23s clip):**
- Frame generation: 300MB
- FFmpeg overlay: 500MB+
- Total: ~800MB+ (crashes!)

---

## 💡 **What Happens When Limit Exceeded?**

If you try to use an animated style on a clip over 15 seconds:

1. **Warning logged:**
   ```
   Clip duration (23.0s) exceeds limit for animated captions (15s).
   Falling back to static captions. Use Karaoke style for longer clips.
   ```

2. **Video exported without captions**
   - No error shown to user
   - Video is still exported
   - Just missing captions

3. **Recommendation:**
   - Re-export with Karaoke style
   - Or split clip into shorter segments

---

## 🎯 **Best Practices**

### **1. Choose the Right Style:**
- **Short clips (5-15s):** Any animated style
- **Medium clips (15-60s):** Karaoke
- **Long clips (60s+):** Karaoke, Minimal, or Podcast

### **2. Optimize Clip Length:**
- Keep viral clips short (10-15s) for maximum engagement
- Use animated styles for impact
- Save longer content for Karaoke

### **3. Test Before Bulk Export:**
- Test one clip first
- Verify captions appear correctly
- Check animation quality
- Then export remaining clips

### **4. Monitor Processing:**
- Watch for "Generating X caption frames" log
- Frame generation progress updates every 100 frames
- If it takes too long, clip might be too long

---

## 🐛 **Troubleshooting**

### **"Failed to export clips" Error:**

**Possible causes:**
1. **Clip too long for animated style**
   - Solution: Use Karaoke or reduce clip length

2. **API crashed during processing**
   - Check logs: `docker logs clipforge-api --tail 50`
   - Look for "Killed" message
   - Solution: Use shorter clips or Karaoke

3. **Out of memory**
   - Solution: Restart API, use Karaoke style

### **Captions Not Appearing:**

**Check:**
1. Is "Burn Captions" toggled ON?
2. Is clip longer than 15s with animated style?
3. Check API logs for warnings
4. Try Karaoke style instead

### **Captions Look Wrong:**

**Check:**
1. Video aspect ratio (portrait vs landscape)
2. Font size appropriate for video resolution
3. Try different style
4. Check exported video quality

---

## 📈 **Future Improvements**

**Potential optimizations to increase limits:**

1. **Streaming Frame Generation**
   - Generate and overlay frames in batches
   - Don't load all frames into memory at once
   - Could support 30-60s clips

2. **Lower Resolution Frames**
   - Generate at 720p instead of 1080p
   - Upscale during overlay
   - Reduce memory by 50%

3. **Optimized FFmpeg Pipeline**
   - Use pipe instead of files
   - Stream frames directly
   - Reduce disk I/O

4. **Increase Docker Memory**
   - Allocate more RAM to container
   - Support longer clips
   - May impact system performance

---

## 📝 **Summary**

**Current Limits:**
- ✅ **Karaoke:** Unlimited (recommended for all lengths)
- ⚠️ **Animated styles:** 15 seconds max
- ✅ **Static styles:** Unlimited

**Best Practice:**
- Use **Karaoke** for clips over 15 seconds
- Use **animated styles** for short, impactful moments
- Test before bulk exporting

**The system is stable and reliable within these limits!** 🚀
