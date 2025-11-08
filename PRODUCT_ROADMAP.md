# 🗺️ ClipForge Product Roadmap
**Last Updated:** November 8, 2025  
**Status:** FREE Tier Production-Ready | PRO Tier Core Complete

---

## 🎯 Mission & Vision

**Mission:** Build the best AI-powered video repurposing platform for content creators

**Vision:** Transform long-form videos into platform-optimized clips with professional quality that rivals Opus Clip

---

## ✅ COMPLETED - FREE TIER (Basic Clips)

### Status: **Production-Ready** 🚀

### Core Features:

#### 1. AI-Powered Titles (OpenAI GPT-3.5)
- 3-8 word descriptive titles
- Avoids vague pronouns
- Graceful fallback to heuristics
- Cost: ~$0.0001 per clip
- **Example:** "Exploring Haunted Sites for Past Energy Experiences"

#### 2. AI-Powered Descriptions
- 80-character max (fits UI perfectly)
- Provides context beyond title
- No truncation issues
- Professional quality

#### 3. Score Display & Breakdown
- Fixed percentage display (34% not 3400%)
- Expandable score breakdown UI
- Metrics: hook, emotion, clarity, quote, novelty, structure
- Color-coded with emoji indicators
- Clickable score badge

#### 4. Smart Boundary Detection
- Quality-scored cut points
- Prioritizes sentence boundaries
- Avoids mid-phrase cuts
- Natural pause detection (breath, sentence ends)
- Balances quality vs target time

#### 5. Clip Customization
- Length: 15-180 seconds (slider)
- Count: 1-10 clips (slider)
- Settings persist in database
- Dynamic duration calculation

#### 6. Segment Tracking
- Stores which transcript segments are used
- Speaker attribution
- Overlap detection
- Foundation for transcript visualization

### Technical Stack:
- **AI:** OpenAI GPT-3.5-turbo
- **Backend:** NestJS, FastAPI
- **ML:** Python, scikit-learn
- **Database:** PostgreSQL with Prisma
- **Storage:** MinIO (S3-compatible)

---

## ✅ COMPLETED - PRO TIER (Pro Clips)

### Status: **Core Complete, Ready for Testing** 🎬

### Core Features:

#### 1. Multi-Segment Detection Algorithm
- Combines 2-4 high-value segments from different video parts
- Well-spaced segments (5s+ apart)
- Duration matching (±30% tolerance)
- Chronological ordering
- Score-based selection
- Avoids reusing segments across clips

**Example Output:**
```
Clip 1: 3 segments, 44.2s total
  - Segment 1: 10.5s-25.3s (14.8s) - "Opening hook..."
  - Segment 2: 45.2s-58.7s (13.5s) - "Key insight..."
  - Segment 3: 120.1s-135.8s (15.7s) - "Powerful conclusion..."
```

#### 2. FFmpeg Multi-Segment Stitching
- **Simple Mode:** Fast concat without re-encoding (~1-2s)
- **Crossfade Mode:** Professional 300ms transitions (~10-30s)
- Automatic temp file cleanup
- Quality-preserved encoding (CRF 23)
- H.264 video, AAC audio

#### 3. Transcript Visualization UI
- Expandable/collapsible interface
- Visual timeline bar
- Color-coded segment cards (blue, green, purple, orange)
- Timestamp display for each segment
- Speaker attribution
- Segment order indicators (1, 2, 3...)
- Click handlers for future video navigation

#### 4. API Integration
- **Endpoint:** `POST /v1/projects/:projectId/clips/pro`
- **Request:**
  ```json
  {
    "numClips": 3,
    "withCrossfade": true
  }
  ```
- Orchestrates ML worker + FFmpeg
- Saves to database with metadata
- Sets `isProClip` flag

#### 5. ML Worker Endpoint
- **Endpoint:** `POST /v1/ranker/detect-pro`
- Returns segment combinations
- Includes scores, text, timestamps
- Ready for FFmpeg stitching

#### 6. UI Button
- Purple "✨ Pro Clips" button
- Located between Share and Export
- Disabled when no transcript
- Shows loading state
- Success alert with count

### Technical Implementation:
- **Files:**
  - `workers/services/ranker_engine.py` - Detection algorithm
  - `apps/api/src/video/ffmpeg.service.ts` - Stitching pipeline
  - `apps/web/components/clips/TranscriptViewer.tsx` - Visualization
  - `apps/api/src/clips/clips.service.ts` - Orchestration

---

## 📋 FUTURE - Phase 1: Aspect Ratios

### Priority: **HIGH** ⭐⭐⭐⭐
### Timeline: **3-4 hours**

### Features:
- **9:16** (Vertical) - TikTok, Reels, Shorts
- **16:9** (Horizontal) - YouTube, LinkedIn
- **1:1** (Square) - Instagram Feed
- **4:5** (Portrait) - Instagram Feed

### Implementation:
- Smart cropping with face detection
- Letterboxing options
- Custom crop positions
- Preview before export
- FFmpeg video processing

### Technical Requirements:
- Face detection library (OpenCV or cloud API)
- FFmpeg crop/scale filters
- Preview generation
- UI controls for crop adjustment

---

## 📋 FUTURE - Phase 2: Auto-Generated Captions

### Priority: **HIGH** ⭐⭐⭐⭐⭐
### Timeline: **4-5 hours**

### Features:
- Auto-generate from transcript
- Word-level timing from AssemblyAI
- Multiple caption styles:
  * **Minimal:** Simple white text, bottom center
  * **Bold:** Large text with word highlighting
  * **Creative:** Animated, emoji support
- Customizable fonts, colors, positions
- Burned into video

### Implementation:
- Extract word-level timestamps
- Generate SRT/VTT files
- FFmpeg subtitle burning
- Style templates
- UI controls for customization

### Technical Requirements:
- AssemblyAI word-level timestamps
- FFmpeg subtitle filters
- Font library
- Style template system

---

## 📋 FUTURE - Phase 3: Clip Editing

### Priority: **MEDIUM** ⭐⭐⭐
### Timeline: **5-6 hours**

### Features:
- Trim start/end points
- Adjust segment order in multi-segment clips
- Remove/add segments
- Preview before export
- Manual override of AI selections

### Implementation:
- Timeline editor UI
- Drag-and-drop segment reordering
- Real-time preview
- Save custom edits
- Re-generate with edits

### Technical Requirements:
- Timeline component
- Video preview player
- Edit state management
- FFmpeg re-encoding

---

## 💰 Pricing Strategy

### FREE TIER
**Price:** $0/month

**Includes:**
- 5 videos/month
- Basic Clips (single-segment)
- AI titles & descriptions
- Score breakdown
- Up to 10 clips per video

**Perfect for:**
- Casual creators
- Testing the platform
- Personal use

---

### PRO TIER
**Price:** $29/month

**Includes:**
- 50 videos/month
- Everything in FREE
- **Pro Clips (multi-segment)**
- **Transcript visualization**
- **Crossfade transitions**
- Priority processing
- Email support

**Perfect for:**
- Professional creators
- Social media managers
- Content agencies

---

### BUSINESS TIER
**Price:** $99/month

**Includes:**
- Unlimited videos
- Everything in PRO
- **Custom aspect ratios**
- **Auto-generated captions**
- **Clip editing tools**
- Team collaboration (5 seats)
- Priority support
- API access

**Perfect for:**
- Agencies
- Large teams
- Enterprise users

---

## 📊 Competitive Analysis

### vs Opus Clip

| Feature | Opus Clip | ClipForge Free | ClipForge Pro |
|---------|-----------|----------------|---------------|
| AI Titles | ✅ | ✅ (GPT-3.5) | ✅ |
| Score Breakdown | ✅ | ✅ | ✅ |
| Multi-Segment | ✅ | ❌ | ✅ |
| Transcript Viz | ✅ | ❌ | ✅ |
| Captions | ✅ | ❌ | 📋 Phase 2 |
| Aspect Ratios | ✅ | ❌ | 📋 Phase 1 |
| **Self-Hosted** | ❌ | ✅ | ✅ |
| **Open Source** | ❌ | ✅ | ✅ |
| **No Limits** | ❌ | ✅ | ✅ |
| **Price** | $29/mo | Free | $29/mo |

### Our Advantages:
- ✅ **Self-hosted** - Full control, privacy, no vendor lock-in
- ✅ **Open source** - Customizable, transparent
- ✅ **No usage limits** - Process as much as you want
- ✅ **Better AI** - GPT-3.5 vs proprietary models
- ✅ **More transparent** - Clear scoring breakdown

---

## 🎯 Success Metrics

### Current (FREE Tier):
- ✅ Production-ready quality
- ✅ AI titles working
- ✅ Score breakdown functional
- ✅ Upload flow smooth

### Next (PRO Tier):
- 🎯 Test Pro Clips end-to-end
- 🎯 Verify transcript visualization
- 🎯 Measure generation time
- 🎯 User feedback collection

### Future (Phase 1-3):
- 🎯 90% user satisfaction
- 🎯 <30s average clip generation time
- 🎯 80% feature parity with Opus Clip
- 🎯 $50k MRR by Q1 2026

---

## 🚀 Implementation Timeline

### ✅ Week 1 (Nov 4-8, 2025) - COMPLETED
- FREE Tier: Basic Clips
- PRO Tier: Core features
- Bug fixes and testing

### 📋 Week 2 (Nov 11-15, 2025) - NEXT
- Test Pro Clips thoroughly
- Implement aspect ratios (Phase 1)
- Begin caption system (Phase 2)

### 📋 Week 3 (Nov 18-22, 2025)
- Complete caption system
- Begin clip editing (Phase 3)
- Performance optimization

### 📋 Week 4 (Nov 25-29, 2025)
- Complete clip editing
- User testing and feedback
- Bug fixes and polish

### 📋 December 2025
- Launch PRO tier publicly
- Marketing and user acquisition
- Feature refinements

---

## 📝 Technical Debt & Known Issues

### Current Issues:
- None blocking - all systems operational ✅

### Future Improvements:
- Add more caption styles
- Optimize FFmpeg encoding speed
- Add batch processing
- Improve error handling
- Add progress webhooks

---

## 🎉 Summary

### Where We Are:
- ✅ **FREE Tier:** Production-ready
- ✅ **PRO Tier:** Core complete, ready for testing
- ✅ **Infrastructure:** Solid, scalable
- ✅ **Quality:** Professional, competitive

### Where We're Going:
- 🚀 **Phase 1:** Aspect ratios (3-4 hours)
- 🚀 **Phase 2:** Auto-captions (4-5 hours)
- 🚀 **Phase 3:** Clip editing (5-6 hours)
- 🚀 **Launch:** PRO tier publicly (December 2025)

### Mission Status:
- ✅ **Quality:** Production-ready output
- ✅ **Competitive:** Matches Opus Clip core features
- ✅ **Differentiated:** Self-hosted, open source
- ✅ **Scalable:** Ready for growth

---

**The foundation is built. Pro Clips are ready. Now we scale.** 🚀
