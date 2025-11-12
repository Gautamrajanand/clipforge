# AI Reframe & AI Subtitles - Standalone Features

**Date:** November 12, 2025  
**Status:** READY TO IMPLEMENT  
**Priority:** HIGH (Quick Win!)

---

## 🎯 THE OPPORTUNITY

### **Competitive Analysis:**
- ✅ **OpusClip** offers "AI Reframe" separately
- ✅ **Podcastle** offers "AI Subtitles" separately
- ✅ Both charge separately for these features

### **Our Advantage:**
- ✅ We already have the backend code
- ✅ Just need new UI workflows
- ✅ Can launch in 1-2 days!

### **Business Impact:**
- **1 product → 3 products** instantly
- More entry points for users
- Higher conversion potential
- Competitive parity with OpusClip/Podcastle

---

## 📊 CURRENT STATE

### **What We Have:**
- ✅ Aspect ratio processing (FFmpeg)
- ✅ Caption generation (10 styles)
- ✅ Video upload/import
- ✅ Storage system
- ✅ Job queue system

### **What We Need:**
- 🆕 AI Reframe workflow UI
- 🆕 AI Subtitles workflow UI
- 🆕 Simplified modals (no clip settings)
- 🆕 Dashboard integration

---

## 🎨 FEATURE 1: AI REFRAME

### **User Journey:**
1. Click "AI Reframe" on dashboard
2. Upload/Import video
3. Select target aspect ratio:
   - 9:16 (Vertical - TikTok, Reels)
   - 16:9 (Horizontal - YouTube)
   - 1:1 (Square - Instagram)
   - 4:5 (Portrait - Instagram Feed)
4. Choose framing strategy:
   - Smart Crop (AI-powered)
   - Center Crop
   - Pad with Blur
   - Pad with Color
5. Preview (optional)
6. Process & Download

### **What Gets Skipped:**
- ❌ Transcription
- ❌ Clip detection
- ❌ Caption generation

### **Backend Flow:**
```
Upload → Storage → Aspect Ratio Job → Download
```

### **API Endpoints Needed:**
```typescript
POST /v1/projects/:id/reframe
{
  aspectRatio: "9:16" | "16:9" | "1:1" | "4:5",
  strategy: "smart_crop" | "center_crop" | "pad_blur" | "pad_color",
  backgroundColor?: string
}
```

---

## 🎨 FEATURE 2: AI SUBTITLES

### **User Journey:**
1. Click "AI Subtitles" on dashboard
2. Upload/Import video
3. Auto-transcribe (AssemblyAI)
4. Select caption style:
   - Karaoke
   - Deep Diver
   - Pod P
   - Viral Captions
   - (+ 6 more styles)
5. Customize:
   - Colors
   - Font size
   - Position
6. Preview
7. Process & Download

### **What Gets Skipped:**
- ❌ Clip detection
- ❌ Aspect ratio changes

### **Backend Flow:**
```
Upload → Storage → Transcription → Caption Generation → Download
```

### **API Endpoints Needed:**
```typescript
POST /v1/projects/:id/subtitles
{
  captionStyle: "karaoke" | "deep_diver" | "pod_p" | ...,
  customization: {
    primaryColor?: string,
    secondaryColor?: string,
    fontSize?: number,
    position?: "top" | "center" | "bottom"
  }
}
```

---

## 🏗️ IMPLEMENTATION PLAN

### **Phase 1: Backend API (2-3 hours)**

#### **Task 1.1: Create Reframe Endpoint**
- File: `apps/api/src/projects/projects.controller.ts`
- Add `POST /v1/projects/:id/reframe`
- Queue aspect ratio job only
- Return job ID

#### **Task 1.2: Create Subtitles Endpoint**
- File: `apps/api/src/projects/projects.controller.ts`
- Add `POST /v1/projects/:id/subtitles`
- Queue transcription + caption job
- Return job ID

#### **Task 1.3: Update Job Processors**
- File: `apps/api/src/queues/processors/*.processor.ts`
- Add "reframe-only" mode
- Add "subtitles-only" mode
- Skip unnecessary steps

---

### **Phase 2: Frontend UI (4-5 hours)**

#### **Task 2.1: Create ReframeModal Component**
```typescript
// apps/web/components/modals/ReframeModal.tsx
- Upload/Import video
- Aspect ratio selector (4 options)
- Framing strategy selector
- Preview (optional)
- Process button
```

#### **Task 2.2: Create SubtitlesModal Component**
```typescript
// apps/web/components/modals/SubtitlesModal.tsx
- Upload/Import video
- Caption style selector (10 styles)
- Color customization
- Preview
- Process button
```

#### **Task 2.3: Update Dashboard**
```typescript
// apps/web/app/dashboard/page.tsx
- Activate "AI Reframe" card
- Activate "AI Subtitles" card
- Wire up modal handlers
```

#### **Task 2.4: Create Simplified Upload Flow**
```typescript
// Reuse existing UploadModal but:
- Remove clip settings
- Remove transcription options (for reframe)
- Simplified UI
```

---

### **Phase 3: Testing (1-2 hours)**

#### **Test Cases:**

**AI Reframe:**
- [ ] Upload video → Select 9:16 → Smart crop → Download
- [ ] Import URL → Select 16:9 → Center crop → Download
- [ ] Upload video → Select 1:1 → Pad blur → Download
- [ ] Upload video → Select 4:5 → Pad color → Download

**AI Subtitles:**
- [ ] Upload video → Select Karaoke → Download
- [ ] Import URL → Select Deep Diver → Customize colors → Download
- [ ] Upload video → Select Viral Captions → Download
- [ ] Test all 10 caption styles

---

## 📁 FILES TO CREATE/MODIFY

### **Backend:**
```
apps/api/src/projects/projects.controller.ts     [MODIFY]
apps/api/src/projects/dto/reframe.dto.ts         [CREATE]
apps/api/src/projects/dto/subtitles.dto.ts       [CREATE]
apps/api/src/queues/processors/reframe.processor.ts [CREATE]
apps/api/src/queues/processors/subtitles.processor.ts [CREATE]
```

### **Frontend:**
```
apps/web/components/modals/ReframeModal.tsx      [CREATE]
apps/web/components/modals/SubtitlesModal.tsx    [CREATE]
apps/web/app/dashboard/page.tsx                  [MODIFY]
```

---

## 🎯 SUCCESS CRITERIA

### **Functional:**
- [ ] AI Reframe produces correct aspect ratio videos
- [ ] AI Subtitles generates captions correctly
- [ ] Both workflows skip unnecessary steps
- [ ] Downloads work properly

### **UX:**
- [ ] Clear, simple UI
- [ ] Fast processing (no unnecessary steps)
- [ ] Good error handling
- [ ] Progress indicators

### **Business:**
- [ ] 3 distinct products on dashboard
- [ ] Competitive parity with OpusClip/Podcastle
- [ ] More user entry points

---

## ⏱️ TIMELINE

### **Day 1 (4-6 hours):**
- ✅ Backend API endpoints
- ✅ Job processors
- ✅ Testing backend

### **Day 2 (4-6 hours):**
- ✅ Frontend modals
- ✅ Dashboard integration
- ✅ End-to-end testing

**Total: 8-12 hours (1-2 days)**

---

## 🚀 LAUNCH CHECKLIST

### **Before Launch:**
- [ ] All tests passing
- [ ] Error handling complete
- [ ] Progress indicators working
- [ ] Download links working
- [ ] Documentation updated

### **Launch:**
- [ ] Deploy to production
- [ ] Update dashboard
- [ ] Monitor for errors
- [ ] Gather user feedback

---

## 💡 FUTURE ENHANCEMENTS

### **AI Reframe:**
- Face detection for smart cropping
- Multi-person framing
- Custom crop regions
- Batch processing

### **AI Subtitles:**
- Multi-language support
- Custom fonts
- Animation styles
- Subtitle export (SRT/VTT)

---

## 📊 COMPETITIVE COMPARISON

| Feature | OpusClip | Podcastle | ClipForge |
|---------|----------|-----------|-----------|
| AI Clips | ✅ | ✅ | ✅ |
| AI Reframe | ✅ | ✅ | 🆕 |
| AI Subtitles | ✅ | ✅ | 🆕 |
| Self-Hosted | ❌ | ❌ | ✅ |
| Open Source | ❌ | ❌ | ✅ |

**After this: We match OpusClip/Podcastle feature-for-feature!** 🎉

---

## 🎯 NEXT STEPS

1. **Approve this plan**
2. **Start with backend** (2-3 hours)
3. **Build frontend** (4-5 hours)
4. **Test & deploy** (1-2 hours)
5. **Launch!** 🚀

**Ready to execute?** Let's win! 💪
