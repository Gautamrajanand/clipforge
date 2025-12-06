# Caption Testing Quick Guide

## 🚀 **Quick Test - Typewriter Style**

### Step 1: Restart Worker
```bash
# Make sure Python changes are loaded
cd /Users/gautamrajanand/CascadeProjects/windsurf-project/workers
pm2 restart all
# OR if using Docker:
docker restart clipforge-worker
```

### Step 2: Test Export
1. Go to http://localhost:3000
2. Upload a short video (10-30 seconds)
3. Select **Typewriter** style
4. Click Export
5. Download the result

### Step 3: Verify
Check the exported video for:
- ✅ **Font:** Courier New (monospace)
- ✅ **Size:** 38px (medium size)
- ✅ **Color:** White (#FFFFFF)
- ✅ **Position:** Bottom center
- ✅ **Stroke:** 2px black outline
- ✅ **NO DOUBLE CAPTIONS** (most important!)

---

## 🎯 **Top 5 Styles to Test**

### 1. MrBeast Bold
- **Expected:** Yellow Impact font, center, 75px, thick stroke
- **Test:** Upload comedy/reaction video

### 2. Typewriter
- **Expected:** White Courier New, bottom, 38px, letter spacing
- **Test:** Upload storytelling video

### 3. Neon
- **Expected:** Neon green Arial Black, bottom, 85px, glow effect
- **Test:** Upload gaming/EDM video

### 4. Highlight
- **Expected:** Black text on yellow box, center, 47px
- **Test:** Upload debate/educational video

### 5. Karaoke Sync
- **Expected:** White → Cyan fill, bottom, 48px, word-by-word
- **Test:** Upload singing/music video

---

## 📊 **Quick Verification Checklist**

For each exported video, check:

```markdown
- [ ] Captions appear at correct position (top/center/bottom)
- [ ] Font matches style (Impact, Courier New, Arial Black, etc.)
- [ ] Size is appropriate (not too small, not too large)
- [ ] Color is correct (white, yellow, green, etc.)
- [ ] Stroke/outline is visible and correct width
- [ ] NO double/ghost captions
- [ ] Text is readable on video background
- [ ] Animation is smooth (if animated style)
- [ ] Timing matches audio
```

---

## 🐛 **If You See Double Captions**

### Debug Steps:

1. **Check ASS File:**
   ```bash
   # Find the generated ASS file
   # It should be in /tmp or workers temp directory
   cat /path/to/captions.ass
   
   # Look for:
   # - Only ONE "Style: Default" line
   # - One dialogue line per caption timestamp
   ```

2. **Check FFmpeg Command:**
   ```bash
   # In worker logs, find the FFmpeg command
   # Should have only ONE -vf flag
   # Example: ffmpeg -i input.mp4 -vf "ass=captions.ass" output.mp4
   ```

3. **Test with Minimal Style:**
   - Export same video with "Minimal" style
   - If double captions persist → FFmpeg issue
   - If double captions gone → Style-specific issue

---

## 🎨 **Preview GIFs - Next Steps**

### Option A: Use Opus Clip GIFs (Fastest)
1. Visit https://www.opus.pro
2. Open their caption style selector
3. Right-click each preview → "Save image as"
4. Save as: `mrbeast.gif`, `typewriter.gif`, etc.
5. Upload to S3 or CDN
6. Update `PREVIEW_GIFS` in `CaptionStyleSelector.tsx`

### Option B: Create Custom GIFs
1. Use After Effects or Premiere Pro
2. Create 21 compositions (one per style)
3. Add sample text: "This is a sample caption"
4. Apply style (font, color, position, animation)
5. Export as GIF (400x200px, 3-5 seconds, looping)
6. Optimize with ezgif.com
7. Upload to CDN

### Option C: Use Video Previews
1. Same as Option B but export as MP4
2. Use HTML5 `<video>` tag with autoplay/loop
3. Better quality but larger file size

---

## 📝 **Sample Test Videos**

Use these types of videos for testing:

1. **Podcast/Interview** (10-30 sec)
   - Test: Minimal, Podcast, Bubble

2. **Comedy/Reaction** (10-30 sec)
   - Test: Bold, MrBeast, Bounce

3. **Gaming** (10-30 sec)
   - Test: Neon, Glitch, Rainbow

4. **Educational** (10-30 sec)
   - Test: Highlight, Documentary, Uppercase

5. **Music/Singing** (10-30 sec)
   - Test: Karaoke, Fill, Typewriter

---

## ✅ **Success Criteria**

### Must Pass:
- ✅ No double captions in ANY style
- ✅ All fonts render correctly
- ✅ All colors are accurate
- ✅ All positions are correct (top/center/bottom)
- ✅ Stroke/outline widths match specs
- ✅ Text is readable on all backgrounds

### Nice to Have:
- Smooth animations
- Professional preview GIFs
- Fast export times
- High quality output

---

## 🔧 **Quick Fixes**

### If fonts don't render:
```bash
# Install missing fonts on worker
apt-get install fonts-liberation fonts-dejavu-core
fc-cache -f -v
```

### If colors are wrong:
- Check ASS color format: `&HAABBGGRR`
- Verify hex → ASS conversion
- Example: `#FFD900` → `&H00D9FFFF`

### If position is wrong:
- Check alignment value (1-9)
- Bottom center = 2
- Center = 5
- Top center = 8

### If text is too small/large:
- Check font_size in Python backend
- Should match TypeScript frontend
- Common sizes: 38-95px

---

## 📞 **Need Help?**

### Check These Files:
1. `/workers/services/caption_presets.py` - Style definitions
2. `/apps/api/src/captions/caption-styles.ts` - Frontend styles
3. `/workers/services/caption_engine.py` - ASS generation
4. `/workers/services/render_pipeline.py` - FFmpeg rendering

### Common Issues:
- **Double captions:** Check ASS file for duplicates
- **Wrong colors:** Check ASS color format
- **Wrong position:** Check alignment value
- **Wrong font:** Check font_name spelling
- **No captions:** Check FFmpeg command

---

**Last Updated:** December 6, 2025  
**Status:** Ready for testing  
**Priority:** Test Typewriter first (reported issue)
