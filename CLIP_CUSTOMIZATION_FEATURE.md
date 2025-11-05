# 🎬 Clip Customization Feature Implementation

**Date:** November 5, 2025 - 7:05 PM IST  
**Status:** Planning → Implementation  
**Priority:** 🔴 HIGH (Core UX Feature)

---

## 📋 **Feature Overview**

Give users control over clip generation with:
1. **Clip Length** - Duration control (15s, 30s, 60s, custom)
2. **Aspect Ratio** - Platform-specific formats (9:16, 16:9, 1:1, 4:5)
3. **Platform Presets** - Quick settings for TikTok, Instagram, YouTube, LinkedIn
4. **Processing Timeframe** - Select which part of video to analyze
5. **Number of Clips** - How many clips to generate (1-10)

---

## 🎯 **User Stories**

### **As a content creator, I want to:**
1. ✅ Generate clips optimized for specific platforms
2. ✅ Control clip length for different use cases
3. ✅ Choose aspect ratio for my target platform
4. ✅ Process only specific parts of my video
5. ✅ Get the right number of clips I need

---

## 🏗️ **Architecture**

### **Frontend Components:**
```
apps/web/components/
├── modals/
│   └── ClipSettingsModal.tsx (NEW)
├── forms/
│   ├── ClipLengthSelector.tsx (NEW)
│   ├── AspectRatioSelector.tsx (NEW)
│   └── PlatformPresets.tsx (NEW)
└── sliders/
    └── TimeframeSlider.tsx (NEW)
```

### **Backend Updates:**
```
apps/api/src/
├── projects/
│   ├── dto/
│   │   └── detect-clips.dto.ts (UPDATE)
│   └── projects.service.ts (UPDATE)
└── detection/
    └── detection.service.ts (UPDATE)
```

### **Database Schema:**
```prisma
model Project {
  // ... existing fields
  clipSettings Json? // Store user preferences
}

model Moment {
  // ... existing fields
  aspectRatio String @default("16:9")
  targetPlatform String?
}
```

---

## 📐 **Platform Specifications**

### **YouTube Shorts:**
- **Aspect Ratio:** 9:16 (vertical)
- **Duration:** 15-60 seconds
- **Optimal:** 30-45 seconds
- **Format:** MP4, H.264

### **TikTok:**
- **Aspect Ratio:** 9:16 (vertical)
- **Duration:** 15-60 seconds
- **Optimal:** 21-34 seconds
- **Format:** MP4, H.264

### **Instagram Reels:**
- **Aspect Ratio:** 9:16 (vertical)
- **Duration:** 15-90 seconds
- **Optimal:** 30-60 seconds
- **Format:** MP4, H.264

### **Instagram Feed:**
- **Aspect Ratio:** 1:1 (square) or 4:5 (portrait)
- **Duration:** 3-60 seconds
- **Optimal:** 15-30 seconds
- **Format:** MP4, H.264

### **LinkedIn:**
- **Aspect Ratio:** 16:9 (landscape) or 1:1 (square)
- **Duration:** 3-600 seconds
- **Optimal:** 30-90 seconds
- **Format:** MP4, H.264

### **YouTube (Standard):**
- **Aspect Ratio:** 16:9 (landscape)
- **Duration:** Any
- **Optimal:** 60-180 seconds
- **Format:** MP4, H.264

---

## 🎨 **UI Design**

### **Clip Settings Modal:**
```
┌─────────────────────────────────────────┐
│  🎬 Clip Settings                    ✕  │
├─────────────────────────────────────────┤
│                                         │
│  Platform Presets                       │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐   │
│  │ YT │ │ TT │ │ IG │ │ LI │ │Cust│   │
│  │Shrt│ │    │ │Reel│ │    │ │ om │   │
│  └────┘ └────┘ └────┘ └────┘ └────┘   │
│                                         │
│  Aspect Ratio                           │
│  ○ 9:16 (Vertical)   ● 16:9 (Landscape)│
│  ○ 1:1 (Square)      ○ 4:5 (Portrait)  │
│                                         │
│  Clip Length                            │
│  ┌─────────────────────────────────┐   │
│  │ ●────────────────────────────── │   │
│  │ 30 seconds                       │   │
│  └─────────────────────────────────┘   │
│  15s    30s    60s    90s    Custom    │
│                                         │
│  Number of Clips                        │
│  ┌─────────────────────────────────┐   │
│  │ ●──────────────                  │   │
│  │ 3 clips                          │   │
│  └─────────────────────────────────┘   │
│  1      3      5      10               │
│                                         │
│  Processing Timeframe                   │
│  ┌─────────────────────────────────┐   │
│  │ ●────────────────────────────●   │   │
│  │ 0:00                    43:35    │   │
│  └─────────────────────────────────┘   │
│  ☐ Process entire video                │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │      Generate Clips              │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

---

## 🔧 **Implementation Steps**

### **Phase 1: Database Schema (30 min)**
1. ✅ Add migration for clipSettings JSON field
2. ✅ Add aspectRatio to Moment model
3. ✅ Add targetPlatform to Moment model
4. ✅ Run migration

### **Phase 2: Backend API (1 hour)**
1. ✅ Update DetectClipsDto with new fields
2. ✅ Update detection service to use settings
3. ✅ Add aspect ratio conversion logic
4. ✅ Add timeframe filtering
5. ✅ Add clip count limiting

### **Phase 3: Frontend Components (2 hours)**
1. ✅ Create ClipSettingsModal component
2. ✅ Create PlatformPresets component
3. ✅ Create AspectRatioSelector component
4. ✅ Create ClipLengthSelector component
5. ✅ Create TimeframeSlider component
6. ✅ Integrate with upload flow

### **Phase 4: Testing & Polish (30 min)**
1. ✅ Test each platform preset
2. ✅ Verify aspect ratio conversion
3. ✅ Test timeframe selection
4. ✅ Polish UI/UX
5. ✅ Add tooltips and help text

---

## 📊 **Data Models**

### **ClipSettings Interface:**
```typescript
interface ClipSettings {
  aspectRatio: '9:16' | '16:9' | '1:1' | '4:5';
  clipLength: number; // seconds
  numberOfClips: number; // 1-10
  timeframe?: {
    start: number; // seconds
    end: number; // seconds
  };
  targetPlatform?: 'youtube-shorts' | 'tiktok' | 'instagram-reels' | 'instagram-feed' | 'linkedin' | 'youtube' | 'custom';
}
```

### **Platform Preset:**
```typescript
interface PlatformPreset {
  id: string;
  name: string;
  icon: string;
  aspectRatio: string;
  clipLength: number;
  numberOfClips: number;
  description: string;
}

const PLATFORM_PRESETS: PlatformPreset[] = [
  {
    id: 'youtube-shorts',
    name: 'YouTube Shorts',
    icon: '📺',
    aspectRatio: '9:16',
    clipLength: 45,
    numberOfClips: 3,
    description: 'Vertical videos up to 60s'
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    icon: '🎵',
    aspectRatio: '9:16',
    clipLength: 30,
    numberOfClips: 5,
    description: 'Short-form vertical videos'
  },
  {
    id: 'instagram-reels',
    name: 'Instagram Reels',
    icon: '📸',
    aspectRatio: '9:16',
    clipLength: 45,
    numberOfClips: 3,
    description: 'Vertical videos up to 90s'
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: '💼',
    aspectRatio: '16:9',
    clipLength: 60,
    numberOfClips: 2,
    description: 'Professional content'
  },
  {
    id: 'custom',
    name: 'Custom',
    icon: '⚙️',
    aspectRatio: '16:9',
    clipLength: 60,
    numberOfClips: 3,
    description: 'Customize all settings'
  }
];
```

---

## 🎯 **API Updates**

### **POST /v1/projects/:id/detect**

**Request Body:**
```json
{
  "settings": {
    "aspectRatio": "9:16",
    "clipLength": 30,
    "numberOfClips": 5,
    "timeframe": {
      "start": 0,
      "end": 300
    },
    "targetPlatform": "tiktok"
  }
}
```

**Response:**
```json
{
  "projectId": "abc123",
  "status": "DETECTING",
  "settings": {
    "aspectRatio": "9:16",
    "clipLength": 30,
    "numberOfClips": 5,
    "targetPlatform": "tiktok"
  },
  "message": "Detecting clips with custom settings..."
}
```

---

## 🔄 **User Flow**

### **Upload with Custom Settings:**
1. User clicks "+ Create"
2. Upload modal opens
3. User selects video file
4. **NEW:** "Clip Settings" button appears
5. User clicks "Clip Settings"
6. Settings modal opens
7. User selects platform preset (e.g., "TikTok")
8. Settings auto-fill (9:16, 30s, 5 clips)
9. User can customize further
10. User clicks "Save Settings"
11. User clicks "Upload & Process"
12. Video uploads with custom settings
13. Detection runs with settings
14. Clips generated match specifications

---

## ✅ **Acceptance Criteria**

### **Must Have:**
- ✅ Platform presets (YT Shorts, TikTok, IG Reels, LinkedIn)
- ✅ Aspect ratio selection (9:16, 16:9, 1:1, 4:5)
- ✅ Clip length control (15-90 seconds)
- ✅ Number of clips (1-10)
- ✅ Settings persist with project
- ✅ Visual feedback for selected preset

### **Should Have:**
- ✅ Timeframe selection slider
- ✅ Preview of settings
- ✅ Tooltips explaining each option
- ✅ Save as default preference

### **Nice to Have:**
- ⏳ Custom presets (save user settings)
- ⏳ Batch processing with different settings
- ⏳ A/B testing different settings

---

## 🎨 **Design Tokens**

### **Platform Colors:**
```css
--youtube-red: #FF0000
--tiktok-black: #000000
--instagram-gradient: linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)
--linkedin-blue: #0077B5
```

### **Aspect Ratio Icons:**
```
9:16  → 📱 (Phone vertical)
16:9  → 🖥️ (Desktop landscape)
1:1   → ⬜ (Square)
4:5   → 📐 (Portrait)
```

---

## 📈 **Success Metrics**

### **User Engagement:**
- % of users who customize settings
- Most popular platform preset
- Average clips per video
- Settings save rate

### **Quality Metrics:**
- Clip relevance score
- User satisfaction rating
- Re-generation rate
- Export completion rate

---

## 🚀 **Next Steps**

1. **Create database migration** (5 min)
2. **Update backend DTOs** (15 min)
3. **Build UI components** (2 hours)
4. **Integrate with upload flow** (30 min)
5. **Test all presets** (30 min)
6. **Deploy and monitor** (15 min)

**Total Estimated Time:** ~4 hours

---

## 📝 **Notes**

### **Technical Considerations:**
- Aspect ratio conversion may require FFmpeg processing
- Longer clips = more processing time
- Timeframe selection reduces processing load
- Settings should be optional (defaults work)

### **UX Considerations:**
- Presets should be one-click
- Custom settings for power users
- Visual preview helps understanding
- Tooltips explain technical terms

### **Business Considerations:**
- Platform-specific clips increase value
- Reduces manual editing time
- Competitive advantage
- Upsell opportunity (premium presets)

---

**Status:** 🟢 **READY TO IMPLEMENT**  
**Next:** Create database migration and start building!
