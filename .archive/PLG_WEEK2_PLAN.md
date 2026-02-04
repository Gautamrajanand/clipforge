# 📋 Week 2 Implementation Plan: Dashboard & Unified Projects

**Timeline**: Days 6-10 (December 4-8, 2025)  
**Goal**: Show multi-service value in every interaction  
**Target**: PLG Score 6.4 → 6.9 (+0.5 points)

---

## 🎯 **WEEK 2 OBJECTIVES**

### **Primary Goal**: Unified Project Experience
Transform projects from "clip containers" to "content transformation hubs"

### **Key Outcomes**:
1. Users see all transformations in one place
2. Cross-service usage encouraged naturally
3. Platform value visible at every touchpoint
4. Service recommendations drive adoption

---

## 📅 **DAILY BREAKDOWN**

### **Day 6: Unified Project Cards** 🎴

**Goal**: Show all services used per project

**Tasks**:
1. **Project Card Redesign**
   - Show clips count
   - Show subtitles status
   - Show reframe status
   - Show export count
   - Visual badges for each service

2. **Service Status Indicators**
   - Blue badge: AI Clips (X clips)
   - Purple badge: AI Subtitles (Added/Not added)
   - Pink badge: AI Reframe (X formats)
   - Green badge: Exports (X shared)

3. **Quick Actions**
   - "Add Subtitles" if not added
   - "Reframe Video" if not reframed
   - "Create More Clips" if < 3 clips
   - "Export & Share" if no exports

**Expected Impact**: +0.1 points (6.4 → 6.5)

**Files to Modify**:
- `apps/web/components/cards/ProjectCard.tsx`
- `apps/api/src/projects/projects.service.ts` (add stats)

---

### **Day 7: Project Detail Page Enhancement** 📄

**Goal**: Show all transformations in project view

**Tasks**:
1. **Tabs for Each Service**
   - "Clips" tab (existing)
   - "Subtitles" tab (new)
   - "Reframes" tab (new)
   - "Exports" tab (new)

2. **Service Status Section**
   - Visual timeline of transformations
   - "What you've done" summary
   - "What you can still do" suggestions

3. **Cross-Service Recommendations**
   - "Add subtitles to your clips"
   - "Reframe for Instagram (1:1)"
   - "Try vertical format (9:16)"

**Expected Impact**: +0.1 points (6.5 → 6.6)

**Files to Modify**:
- `apps/web/app/project/[id]/page.tsx`
- Add new components for each tab

---

### **Day 8: Service Usage Analytics** 📊

**Goal**: Show users their platform usage

**Tasks**:
1. **Dashboard Stats Widget**
   - Total videos processed
   - Total clips created
   - Total videos captioned
   - Total videos reframed
   - Total exports/shares

2. **Service Breakdown Chart**
   - Pie chart: Service usage %
   - Bar chart: Usage over time
   - Comparison: You vs average user

3. **Achievement Badges**
   - "First Clip" badge
   - "Caption Master" (10+ videos)
   - "Multi-Format Pro" (5+ reframes)
   - "Platform Pro" (all 3 services)

**Expected Impact**: +0.1 points (6.6 → 6.7)

**Files to Create**:
- `apps/web/components/dashboard/StatsWidget.tsx`
- `apps/web/components/dashboard/ServiceChart.tsx`
- `apps/api/src/analytics/analytics.service.ts`

---

### **Day 9: Cross-Service Recommendations** 💡

**Goal**: Intelligently suggest next actions

**Tasks**:
1. **Recommendation Engine**
   - If clips created but no subtitles → Suggest subtitles
   - If subtitles added but no reframe → Suggest reframe
   - If only 1 service used → Suggest others
   - If no exports → Suggest sharing

2. **Smart Prompts**
   - In-app notifications
   - Dashboard cards
   - Project page suggestions
   - Email triggers

3. **A/B Testing Setup**
   - Test different messaging
   - Track conversion rates
   - Optimize prompts

**Expected Impact**: +0.05 points (6.7 → 6.75)

**Files to Create**:
- `apps/api/src/recommendations/recommendations.service.ts`
- `apps/web/components/recommendations/RecommendationCard.tsx`

---

### **Day 10: Roadmap Widget & Polish** 🎨

**Goal**: Show future value, polish Week 2 work

**Tasks**:
1. **Roadmap Widget**
   - Show upcoming features
   - "Coming in Q1 2026" section
   - Vote on features
   - Build excitement

2. **Polish & Testing**
   - Test all new components
   - Fix any bugs
   - Mobile responsiveness
   - Performance optimization

3. **Week 2 Review**
   - Measure PLG score
   - Review metrics
   - Plan Week 3

**Expected Impact**: +0.05 points (6.75 → 6.8-6.9)

**Files to Create**:
- `apps/web/components/dashboard/RoadmapWidget.tsx`
- `apps/api/src/roadmap/roadmap.service.ts`

---

## 📊 **SUCCESS METRICS**

### **Quantitative**:
- Services per user: 1.2 → 2.0
- Multi-service adoption: 20% → 40%
- Cross-service conversion: Track new metric
- Dashboard engagement: +30%
- Project page time: +50%

### **Qualitative**:
- Users understand platform value
- Users try multiple services
- Users see transformation possibilities
- Users feel guided, not lost

---

## 🎯 **ALIGNMENT WITH STRATEGY**

### **Platform Vision**:
- ✅ All services visible everywhere
- ✅ Unified project experience
- ✅ Cross-service recommendations
- ✅ Future roadmap visible

### **User Journey**:
1. Upload video
2. See all transformation options
3. Try multiple services
4. See results in one place
5. Get recommendations
6. Become power user

### **Competitive Advantage**:
- Opus Clip: Single service, siloed
- ClipForge: Multi-service, unified
- Clear platform differentiation

---

## 🚀 **TECHNICAL IMPLEMENTATION**

### **Backend Changes**:
1. **Project Stats Endpoint**
   ```typescript
   GET /v1/projects/:id/stats
   {
     clipsCount: number,
     hasSubtitles: boolean,
     reframeCount: number,
     exportCount: number,
     servicesUsed: string[]
   }
   ```

2. **Analytics Service**
   ```typescript
   GET /v1/analytics/dashboard
   {
     totalVideos: number,
     totalClips: number,
     totalSubtitled: number,
     totalReframed: number,
     totalExports: number,
     servicesBreakdown: {}
   }
   ```

3. **Recommendations Service**
   ```typescript
   GET /v1/recommendations
   {
     recommendations: [
       {
         type: 'add_subtitles',
         projectId: string,
         priority: number,
         message: string
       }
     ]
   }
   ```

### **Frontend Components**:
1. `ProjectCard` - Enhanced with service badges
2. `ProjectDetailTabs` - Tabs for each service
3. `StatsWidget` - Dashboard analytics
4. `ServiceChart` - Usage visualization
5. `RecommendationCard` - Smart suggestions
6. `RoadmapWidget` - Future features

---

## 💡 **KEY DESIGN PRINCIPLES**

### **1. Show, Don't Tell**
- Visual badges over text
- Charts over numbers
- Progress bars over percentages

### **2. Guide, Don't Push**
- Suggestions, not demands
- Helpful, not annoying
- Contextual, not random

### **3. Celebrate Progress**
- Badges for achievements
- Completion animations
- Positive reinforcement

### **4. Build Excitement**
- Roadmap visibility
- "Coming soon" features
- Vote on priorities

---

## 📋 **DEPENDENCIES**

### **Week 1 Complete** ✅
- Homepage repositioned
- Comparison page live
- Dashboard transformed
- Onboarding updated

### **Database Schema** ✅
- Project model has all fields
- User stats trackable
- Service usage logged

### **Backend APIs** ⚠️
- Need project stats endpoint
- Need analytics service
- Need recommendations engine

---

## 🎨 **DESIGN MOCKUPS NEEDED**

### **Priority 1** (Day 6):
- Enhanced project card with badges
- Service status indicators
- Quick action buttons

### **Priority 2** (Day 7):
- Project detail tabs
- Service timeline
- Recommendation cards

### **Priority 3** (Day 8):
- Stats widget
- Service breakdown chart
- Achievement badges

---

## ⚠️ **RISKS & MITIGATION**

### **Risk 1**: Too much information overwhelms users
**Mitigation**: Progressive disclosure, hide advanced features

### **Risk 2**: Recommendations feel pushy
**Mitigation**: Gentle suggestions, easy to dismiss

### **Risk 3**: Performance issues with stats
**Mitigation**: Cache aggressively, lazy load

### **Risk 4**: Users ignore recommendations
**Mitigation**: A/B test messaging, optimize placement

---

## 📈 **EXPECTED OUTCOMES**

### **By End of Week 2**:

**PLG Score**: 6.4 → 6.9 (+0.5)

**Category Improvements**:
- Engagement: 5 → 6 (+1)
- Activation: 7 → 8 (+1)
- Positioning: 5 → 6 (+1)

**User Behavior**:
- 40% try 2+ services (up from 20%)
- 15% try all 3 services (up from 5%)
- 50% return within 7 days (up from 30%)

**Business Metrics**:
- Services per user: 2.0 (up from 1.2)
- Session duration: +50%
- Feature discovery: +100%

---

## 🚀 **READY TO START**

**Day 6 begins now!**

**First task**: Enhance ProjectCard component with service badges

**Let's build the unified project experience!** 💪

---

**Questions? Feedback? Let's execute Week 2!** 🎯
