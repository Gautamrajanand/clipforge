# Path to Opus Clip Free Tier Parity

**Created:** February 4, 2026  
**Mission:** Achieve feature parity with Opus Clip's free tier, then execute full vision  
**Current Status:** 70% Complete

---

## 🎯 OPUS CLIP FREE TIER - WHAT WE NEED TO MATCH

### Core Features (Free Tier)
1. ✅ **AI Clip Generation** - Auto-detect viral moments
2. ✅ **Transcription** - Word-level accuracy with AssemblyAI
3. ⚠️ **Caption Burning** - MrBeast style with animations (BROKEN IN PROD)
4. ✅ **Virality Scoring** - Rank clips by engagement potential
5. ✅ **Multi-aspect Ratio** - 9:16, 1:1, 16:9, 4:5
6. ✅ **Export Quality** - 1080p minimum
7. ❌ **Watermark on Free Tier** - NOT IMPLEMENTED
8. ❌ **Usage Limits** - NOT ENFORCED (3 videos/month)
9. ❌ **Video Length Limits** - NOT ENFORCED (10 min max)
10. ❌ **Processing Queue** - Standard vs Priority NOT IMPLEMENTED

### UI/UX Features
1. ✅ **Clean Upload Flow** - Drag & drop, URL import
2. ✅ **Project Dashboard** - View all projects
3. ✅ **Clip Preview** - Play clips before export
4. ⚠️ **Export Download** - Working but captions broken
5. ❌ **Upgrade Prompts** - NOT IMPLEMENTED
6. ❌ **Usage Tracking** - NOT VISIBLE TO USER

---

## 🚨 CRITICAL ISSUES BLOCKING PARITY

### Issue #1: Export Captions Not Working (HIGHEST PRIORITY)
**Status:** IN PROGRESS (API deployment pending)  
**Impact:** Users cannot get properly styled clips  
**Root Cause:** Production using ML worker (basic ASS) instead of API's AdvancedAnimatorService  

**Fix Applied (Commits d5645ba, 86c59d2):**
- Re-enabled ClipExportProcessor for queue-based exports
- Switched from ML worker to API's AdvancedAnimatorService
- Uses frame-by-frame rendering with advanced animations
- Waiting for Render deployment

**Verification Needed:**
- [ ] Deploy completes successfully
- [ ] New export uses AdvancedAnimatorService
- [ ] MrBeast yellow captions (#FFD900) appear correctly
- [ ] 9:16 aspect ratio is correct
- [ ] Captions are burned into video frames

**Timeline:** 1-2 hours (deployment + testing)

---

### Issue #2: No Watermark on Free Tier
**Status:** NOT STARTED  
**Impact:** Cannot monetize free tier, no viral growth  
**Priority:** HIGH (required for launch)

**Implementation:**
```typescript
// apps/api/src/projects/projects.service.ts
// In exportMoments() method, check user tier:

const user = await this.prisma.user.findUnique({
  where: { clerkId: req.user.id },
  include: { subscription: true }
});

const addWatermark = !user.subscription || user.subscription.tier === 'FREE';

// Pass addWatermark to burnCaptionsForMoment()
```

**Watermark Specs (match Opus Clip):**
- Position: Bottom-right corner
- Text: "Made with ClipForge.ai"
- Style: Semi-transparent white text with dark background
- Size: 20% of video width

**Timeline:** 4-6 hours

---

### Issue #3: No Usage Limits Enforcement
**Status:** NOT STARTED  
**Impact:** Cannot control costs, no upgrade incentive  
**Priority:** HIGH (required for launch)

**Free Tier Limits (Opus Clip Parity):**
- 3 videos per month
- 10 minutes max video length
- 100 MB max file size
- 3 clips per video
- 720p exports (vs 1080p for paid)

**Implementation:**
```typescript
// apps/api/src/projects/projects.controller.ts
// In createProject() method:

const user = await this.prisma.user.findUnique({
  where: { clerkId: req.user.id },
  include: { 
    subscription: true,
    projects: {
      where: {
        createdAt: {
          gte: startOfMonth(new Date())
        }
      }
    }
  }
});

if (!user.subscription || user.subscription.tier === 'FREE') {
  if (user.projects.length >= 3) {
    throw new ForbiddenException('Free tier limit: 3 videos/month. Upgrade to continue.');
  }
  if (videoLengthMinutes > 10) {
    throw new ForbiddenException('Free tier limit: 10 minutes max. Upgrade for longer videos.');
  }
  if (fileSizeBytes > 100 * 1024 * 1024) {
    throw new ForbiddenException('Free tier limit: 100 MB max. Upgrade for larger files.');
  }
}
```

**Timeline:** 6-8 hours

---

### Issue #4: No Upgrade Prompts
**Status:** NOT STARTED  
**Impact:** No conversion from free to paid  
**Priority:** MEDIUM (can launch without, but needed for revenue)

**Implementation Points:**
1. **Usage Counter Widget** - Show "2/3 videos used this month"
2. **Limit Hit Modal** - "You've reached your free limit. Upgrade to continue."
3. **Feature Teaser** - "Unlock 4K exports with Pro" on export modal
4. **Watermark Removal CTA** - "Remove watermark with Pro" on export
5. **Processing Speed** - "Priority processing with Pro" during upload

**Timeline:** 8-10 hours

---

## 📊 CURRENT STATE ANALYSIS

### What's Working in Production ✅
1. **Upload Flow** - Users can upload videos via file or URL
2. **Transcription** - AssemblyAI integration working, 95%+ accuracy
3. **Clip Detection** - Heuristic ranking generating 3-10 clips per video
4. **Clip Preview** - Users can play clips in browser
5. **Multi-aspect Ratio** - Reframe working for 9:16, 1:1, 16:9, 4:5
6. **Project Management** - Dashboard showing all projects
7. **Authentication** - Clerk integration working
8. **Storage** - Cloudflare R2 for video storage

### What's Broken in Production ❌
1. **Export Captions** - Not using AdvancedAnimatorService (FIX IN PROGRESS)
2. **Watermark** - Not implemented
3. **Usage Limits** - Not enforced
4. **Tier Gating** - No free vs paid distinction
5. **Upgrade Prompts** - Not implemented

### What's Missing for Parity ⚠️
1. **Watermark on Free Tier**
2. **Usage Limit Enforcement**
3. **Upgrade Prompts**
4. **Processing Queue Priority**
5. **Export Quality Gating** (720p free, 1080p paid)

---

## 🛣️ PATH TO COMPLETION

### Phase 1: Fix Critical Export Issue (IN PROGRESS)
**Timeline:** 1-2 hours  
**Status:** Waiting for API deployment (commits d5645ba, 86c59d2)

**Tasks:**
- [x] Re-enable ClipExportProcessor
- [x] Switch to AdvancedAnimatorService
- [x] Fix response format for frontend
- [ ] Verify deployment completes
- [ ] Test new export with MrBeast captions
- [ ] Verify 9:16 aspect ratio
- [ ] Verify captions burned into frames

**Blocker:** None (deployment in progress)

---

### Phase 2: Implement Watermark (HIGH PRIORITY)
**Timeline:** 4-6 hours  
**Status:** NOT STARTED

**Tasks:**
1. Create watermark image asset (PNG with transparency)
2. Update FFmpeg overlay logic to add watermark
3. Add tier check in exportMoments()
4. Test watermark on free tier exports
5. Verify no watermark on paid tier exports

**Files to Modify:**
- `apps/api/src/projects/projects.service.ts` - Add tier check
- `apps/api/src/video/ffmpeg.service.ts` - Add watermark overlay
- `apps/api/src/video/video.service.ts` - Watermark asset management

**Blocker:** None

---

### Phase 3: Enforce Usage Limits (HIGH PRIORITY)
**Timeline:** 6-8 hours  
**Status:** NOT STARTED

**Tasks:**
1. Create subscription schema in Prisma
2. Add tier check middleware
3. Implement monthly usage counter
4. Add limit checks in upload flow
5. Create limit exceeded error responses
6. Update frontend to show usage counter
7. Test free tier limits

**Files to Modify:**
- `apps/api/prisma/schema.prisma` - Add subscription model
- `apps/api/src/projects/projects.controller.ts` - Add limit checks
- `apps/api/src/users/users.service.ts` - Usage tracking
- `apps/web/app/dashboard/page.tsx` - Usage counter widget

**Blocker:** None

---

### Phase 4: Add Upgrade Prompts (MEDIUM PRIORITY)
**Timeline:** 8-10 hours  
**Status:** NOT STARTED

**Tasks:**
1. Create upgrade modal component
2. Add usage counter widget to dashboard
3. Add limit hit modal on upload
4. Add feature teasers on export modal
5. Add watermark removal CTA
6. Track upgrade prompt views (analytics)

**Files to Modify:**
- `apps/web/components/modals/UpgradeModal.tsx` - New component
- `apps/web/components/dashboard/UsageWidget.tsx` - New component
- `apps/web/app/dashboard/page.tsx` - Add usage widget
- `apps/web/components/modals/UploadModal.tsx` - Add limit check
- `apps/web/components/export/ExportModal.tsx` - Add feature teasers

**Blocker:** Requires Phase 3 (usage limits) to be complete

---

### Phase 5: Quality Gating (OPTIONAL)
**Timeline:** 2-3 hours  
**Status:** NOT STARTED

**Tasks:**
1. Add resolution check in export flow
2. Limit free tier to 720p exports
3. Add "Upgrade for 1080p/4K" prompt

**Files to Modify:**
- `apps/api/src/projects/projects.service.ts` - Resolution gating
- `apps/web/components/export/ExportModal.tsx` - Resolution options

**Blocker:** None (can launch without this)

---

## 📅 TIMELINE TO PARITY

### Week 1 (Current Week)
**Goal:** Fix exports and implement watermark

- **Day 1 (Today):** 
  - [x] Fix export to use AdvancedAnimatorService
  - [ ] Verify deployment and test exports
  - [ ] Start watermark implementation

- **Day 2:**
  - [ ] Complete watermark implementation
  - [ ] Test watermark on free tier
  - [ ] Deploy watermark feature

- **Day 3:**
  - [ ] Start usage limits implementation
  - [ ] Create subscription schema
  - [ ] Add tier check middleware

### Week 2
**Goal:** Complete usage limits and upgrade prompts

- **Day 4-5:**
  - [ ] Complete usage limits enforcement
  - [ ] Add usage counter to frontend
  - [ ] Test free tier limits

- **Day 6-7:**
  - [ ] Implement upgrade prompts
  - [ ] Add usage widget to dashboard
  - [ ] Test upgrade flow

### Week 3
**Goal:** Polish and launch

- **Day 8-9:**
  - [ ] Quality gating (optional)
  - [ ] Bug fixes and polish
  - [ ] Performance optimization

- **Day 10:**
  - [ ] Final testing
  - [ ] Documentation update
  - [ ] Launch announcement

---

## 🎯 SUCCESS METRICS

### Technical Metrics
- [ ] Export success rate: >95%
- [ ] Caption accuracy: >95% (matches Opus Clip)
- [ ] Processing time: <6 min for 10-min video
- [ ] Uptime: >99.5%
- [ ] API response time: <1 second

### Feature Parity Checklist
- [ ] AI clip generation ✅ (already working)
- [ ] Transcription ✅ (already working)
- [ ] Caption burning with animations (IN PROGRESS)
- [ ] Virality scoring ✅ (already working)
- [ ] Multi-aspect ratio ✅ (already working)
- [ ] 1080p exports ✅ (already working)
- [ ] Watermark on free tier (NOT STARTED)
- [ ] Usage limits enforced (NOT STARTED)
- [ ] Upgrade prompts (NOT STARTED)

### User Experience
- [ ] Upload to first clip: <5 minutes
- [ ] Export download: <30 seconds
- [ ] No crashes or errors
- [ ] Clear upgrade path
- [ ] Usage limits clearly communicated

---

## 🚀 POST-PARITY ROADMAP

Once we achieve Opus Clip free tier parity, we execute the full vision:

### Phase 2: Content Generation (Q1 2026)
- Blog post generation from transcript
- Social media post generation
- Newsletter snippets
- SEO-optimized titles and descriptions

### Phase 3: Publishing & Scheduling (Q2 2026)
- Direct social media posting
- Multi-platform scheduling
- Cross-platform analytics
- Performance tracking

### Phase 4: Advanced Editing (Q2-Q3 2026)
- Video trimming and splitting
- Multi-segment clips (Pro Clips)
- B-roll insertion
- Transition effects

### Phase 5: Team & API (Q3 2026)
- Team collaboration features
- Role-based permissions
- API access for developers
- Webhook integrations

### Phase 6: Enterprise (Q4 2026)
- White-label platform
- Custom branding
- SSO integration
- On-premise deployment

---

## 💰 PRICING STRATEGY (POST-PARITY)

### Free Tier
- 3 videos/month
- 10 min max video length
- 100 MB max file size
- 3 clips per video
- 720p exports
- Basic captions
- ClipForge watermark

### Starter - $19/month
- 10 videos/month
- 30 min max video length
- 500 MB max file size
- 10 clips per video
- 1080p exports
- All caption styles
- No watermark

### Pro - $29/month (Opus Clip Parity)
- 50 videos/month
- 2 hour max video length
- 2 GB max file size
- Unlimited clips
- 4K exports
- Custom caption styles
- Priority processing
- API access (1,000 calls/month)

### Business - $99/month
- Unlimited videos
- Unlimited length
- Unlimited file size
- Unlimited clips
- Team collaboration (10 seats)
- API access (10,000 calls/month)
- Priority support

---

## 🎯 COMPETITIVE ADVANTAGES (POST-PARITY)

### vs Opus Clip
- ✅ **Lower Price:** $29 vs $39 for comparable tier
- ✅ **More Features:** Clips + Subtitles + Reframe vs just clips
- ✅ **More Caption Styles:** 14 vs 8
- ✅ **Better Quality:** 4K vs 1080p max
- ✅ **Longer Videos:** 2 hours vs 1 hour
- ✅ **Platform Vision:** Full content OS vs single tool

### vs Podcastle
- ✅ **Better AI Clips:** More accurate moment detection
- ✅ **More Caption Styles:** 14 vs 5
- ✅ **Better Pricing:** More features for same price
- ✅ **Faster Processing:** Optimized infrastructure

### vs Descript
- ✅ **Simpler UX:** Focused on repurposing, not full editing
- ✅ **Faster Time-to-Value:** Upload to clips in <5 min
- ✅ **Better Pricing:** $29 vs $50 for comparable features
- ✅ **AI-First:** Built for automation, not manual editing

---

## 📝 IMMEDIATE ACTION ITEMS

### Today (Next 4 Hours)
1. ✅ Wait for API deployment (commits d5645ba, 86c59d2)
2. [ ] Test new export with AdvancedAnimatorService
3. [ ] Verify MrBeast captions and 9:16 aspect ratio
4. [ ] Start watermark implementation if exports work

### Tomorrow (Day 2)
1. [ ] Complete watermark implementation
2. [ ] Test watermark on free tier exports
3. [ ] Deploy watermark feature
4. [ ] Start subscription schema design

### This Week (Days 3-7)
1. [ ] Implement usage limits enforcement
2. [ ] Add usage counter to frontend
3. [ ] Test free tier limits
4. [ ] Begin upgrade prompts implementation

---

## 🎯 DEFINITION OF DONE

**Opus Clip Free Tier Parity is achieved when:**

1. ✅ Users can upload videos (file or URL)
2. ✅ AI generates 3-10 clips automatically
3. ✅ Clips have virality scores
4. ✅ Users can preview clips before export
5. ⚠️ Exports have properly styled captions (IN PROGRESS)
6. ✅ Exports support multiple aspect ratios
7. ✅ Exports are 1080p quality minimum
8. ❌ Free tier exports have watermark
9. ❌ Free tier limited to 3 videos/month
10. ❌ Free tier limited to 10 min videos
11. ❌ Upgrade prompts shown at limits
12. ✅ No crashes or major bugs

**Current Progress: 70% Complete**

**Estimated Time to Parity: 2-3 weeks**

---

**Last Updated:** February 4, 2026  
**Status:** Active Development  
**Next Review:** After export fix verification
