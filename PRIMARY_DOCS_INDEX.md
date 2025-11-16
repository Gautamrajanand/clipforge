# PRIMARY DOCUMENTATION INDEX

**Last Updated**: November 16, 2025  
**Purpose**: Single source of truth for all core documentation

---

## 📌 10 PRIMARY DOCUMENTS (Always Refer & Iterate)

### 1. **MISSION_CORE_PRINCIPLES.md** 🎯
**Purpose**: Single source of truth for all decisions  
**Contains**: 8 core principles, decision framework, red lines  
**Update**: Weekly (every Monday)  
**Owner**: Product Team  
**Status**: ACTIVE

**Key Sections**:
- Core Principle #1: Industry Parity (Non-Negotiable)
- Core Principle #2: Product-Led Growth
- Core Principle #3: Scale-First Architecture
- Decision Checklist
- Success Criteria

---

### 2. **INDUSTRY_PARITY_BENCHMARK.md** 📊
**Purpose**: Competitive analysis and performance standards  
**Contains**: Benchmarks vs Opus Clip, Podcastle, Descript  
**Update**: Weekly (every Monday)  
**Owner**: Product Team  
**Status**: ACTIVE

**Key Sections**:
- Performance Benchmarks (AI Clips, Subtitles, Reframe)
- Speed Comparison
- Critical Gaps to Close
- Competitive Positioning
- 30/60/90 Day Targets

---

### 3. **PRODUCT_ROADMAP.md** 🗺️
**Purpose**: Feature roadmap and release schedule  
**Contains**: Current features, planned features, timeline  
**Update**: Monthly (1st of each month)  
**Owner**: Product Team  
**Status**: TO BE CREATED

**Key Sections**:
- Current Features (FREE, PRO, BUSINESS)
- Phase 1: Launch (Q1 2026)
- Phase 2: Growth (Q2 2026)
- Phase 3: Scale (Q3-Q4 2026)
- Feature Prioritization Matrix

---

### 4. **ARCHITECTURE.md** 🏗️
**Purpose**: System architecture and technical decisions  
**Contains**: Tech stack, services, data flow, scaling strategy  
**Update**: As needed (major changes only)  
**Owner**: Engineering Team  
**Status**: TO BE CREATED

**Key Sections**:
- System Overview (API, Workers, Database, Storage)
- Tech Stack (NestJS, Prisma, BullMQ, FFmpeg, AssemblyAI)
- Job Queue Architecture
- Scaling Strategy
- Security & Authentication
- Deployment Pipeline

---

### 5. **API_REFERENCE.md** 📡
**Purpose**: Complete API documentation  
**Contains**: All endpoints, request/response formats, examples  
**Update**: With each API change  
**Owner**: Engineering Team  
**Status**: TO BE CREATED

**Key Sections**:
- Authentication
- Projects API
- Clips API
- Transcription API
- Exports API
- Webhooks
- Error Codes

---

### 6. **SCALABILITY_PLAN.md** 🚀
**Purpose**: Scaling strategy and performance targets  
**Contains**: Current capacity, bottlenecks, optimization plan  
**Update**: Monthly  
**Owner**: Engineering Team  
**Status**: EXISTS (needs iteration)

**Key Sections**:
- Current Capacity (~100 concurrent users)
- Phase 1: Job Queues (DONE)
- Phase 2: Horizontal Scaling
- Phase 3: CDN & Caching
- Phase 4: Auto-Scaling
- Performance Monitoring

---

### 7. **PLG_STRATEGY.md** 💰
**Purpose**: Product-led growth strategy and metrics  
**Contains**: Pricing, upgrade triggers, viral loops, metrics  
**Update**: Quarterly  
**Owner**: Product & Marketing Team  
**Status**: EXISTS (needs iteration)

**Key Sections**:
- Pricing Tiers (FREE, PRO, BUSINESS, ENTERPRISE)
- Upgrade Triggers
- Viral Growth Mechanisms
- Onboarding Flow
- Conversion Funnel
- Key Metrics (Activation, Conversion, Retention)

---

### 8. **QA_TESTING_MATRIX.md** ✅
**Purpose**: Testing standards and QA checklist  
**Contains**: Test cases, acceptance criteria, regression tests  
**Update**: With each feature  
**Owner**: QA Team  
**Status**: EXISTS (needs consolidation)

**Key Sections**:
- Feature Testing Checklist
- Performance Testing
- Load Testing
- Security Testing
- Regression Testing
- User Acceptance Testing

---

### 9. **DEPLOYMENT_RUNBOOK.md** 🚢
**Purpose**: Deployment procedures and rollback plans  
**Contains**: Deploy steps, monitoring, rollback, incident response  
**Update**: With each deployment change  
**Owner**: DevOps Team  
**Status**: TO BE CREATED (consolidate from ROLLBACK_INSTRUCTIONS.md)

**Key Sections**:
- Pre-Deployment Checklist
- Deployment Steps
- Post-Deployment Verification
- Rollback Procedures
- Incident Response
- Monitoring & Alerts

---

### 10. **CURRENT_STATUS.md** 📈
**Purpose**: Real-time project status and metrics  
**Contains**: What's working, what's broken, current priorities  
**Update**: Daily (or as needed)  
**Owner**: Product Team  
**Status**: EXISTS (needs iteration)

**Key Sections**:
- System Health
- Feature Status (Working, In Progress, Broken)
- Current Priorities
- Known Issues
- Recent Changes
- Next Steps

---

## 📁 SUPPORTING DOCUMENTS (Reference Only)

### Feature-Specific Docs
- `AI_REFRAME_SUBTITLES_PLAN.md` - AI Reframe & Subtitles implementation
- `ASYNC_SUBTITLE_EXPORT.md` - Async subtitle export details
- `AI_SUBTITLES_ISSUES.md` - Subtitle issues and fixes

### Bug Fixes & Sessions
- `BUG_FIXES_NOV16.md` - Daily bug fix log
- `SESSION_NOTES_*.md` - Session-specific notes
- `QUICK_WIN_COMPLETE.md` - Completed quick wins

### Historical Reference
- `PROJECT_STATUS_SUMMARY.md` - Historical status
- `README_COMMIT_INSTRUCTIONS.md` - Git workflow
- `ROLLBACK_INSTRUCTIONS.md` - Emergency rollback (to be merged into #9)

---

## 🔄 Document Lifecycle

### When to Create a NEW Supporting Doc
- Feature-specific implementation details
- Bug fix logs (daily/weekly)
- Session notes
- One-time analysis
- Historical reference

### When to UPDATE a Primary Doc
- New competitive analysis (weekly)
- Feature launches (add to roadmap)
- Architecture changes (major only)
- Performance targets change
- Strategy pivots

### When to ARCHIVE a Supporting Doc
- Feature is launched (merge into primary docs)
- Bug is fixed (keep for reference, mark as archived)
- Session is complete (archive after 30 days)
- Information is outdated (archive, don't delete)

---

## 📋 Weekly Review Checklist (Every Monday)

### Must Review & Update
1. ✅ `MISSION_CORE_PRINCIPLES.md` - Verify principles still apply
2. ✅ `INDUSTRY_PARITY_BENCHMARK.md` - Update competitive analysis
3. ✅ `CURRENT_STATUS.md` - Update system health & priorities

### Should Review
4. ⚠️ `PRODUCT_ROADMAP.md` - Check progress on features
5. ⚠️ `SCALABILITY_PLAN.md` - Review capacity & bottlenecks
6. ⚠️ `PLG_STRATEGY.md` - Check metrics & conversion rates

### Review as Needed
7. 📋 `ARCHITECTURE.md` - Only if major changes
8. 📋 `API_REFERENCE.md` - Only if API changes
9. 📋 `QA_TESTING_MATRIX.md` - Only if new features
10. 📋 `DEPLOYMENT_RUNBOOK.md` - Only if deployment changes

---

## 🎯 Decision Framework

### Before Making ANY Decision:

**Step 1**: Check Primary Docs
1. Does this align with `MISSION_CORE_PRINCIPLES.md`?
2. Does this meet `INDUSTRY_PARITY_BENCHMARK.md` standards?
3. Is this on the `PRODUCT_ROADMAP.md`?
4. Does this fit the `ARCHITECTURE.md`?

**Step 2**: Check Supporting Docs
- Is there a feature-specific doc with more details?
- Are there known issues documented?
- Is there a session note with context?

**Step 3**: Update Docs
- Update relevant PRIMARY doc (if strategic)
- Create/update SUPPORTING doc (if tactical)
- Never create a new PRIMARY doc without approval

---

## 🚨 Red Flags

### Too Many Docs (Confusion)
- ❌ Multiple docs covering same topic
- ❌ Conflicting information across docs
- ❌ Unclear which doc is source of truth
- ❌ Docs not updated regularly

### Solution
- Consolidate into PRIMARY docs
- Archive outdated supporting docs
- Clear hierarchy (PRIMARY vs SUPPORTING)
- Weekly review cadence

---

## 📊 Document Health Metrics

### Primary Docs
- **Update Frequency**: Weekly (3 docs), Monthly (4 docs), As Needed (3 docs)
- **Last Updated**: Must be within update frequency
- **Completeness**: All key sections filled
- **Accuracy**: Reflects current state

### Supporting Docs
- **Relevance**: Still applicable?
- **Age**: >30 days = consider archiving
- **Duplication**: Covered in primary docs?
- **Clarity**: Easy to understand?

---

## 🎯 Next Actions

### Immediate (This Week)
1. ✅ Create `PRODUCT_ROADMAP.md`
2. ✅ Create `ARCHITECTURE.md`
3. ✅ Create `API_REFERENCE.md`
4. ✅ Create `DEPLOYMENT_RUNBOOK.md`
5. ✅ Consolidate `QA_TESTING_MATRIX.md`
6. ✅ Update `SCALABILITY_PLAN.md`
7. ✅ Update `PLG_STRATEGY.md`
8. ✅ Update `CURRENT_STATUS.md`

### Ongoing
- Archive outdated supporting docs
- Merge feature-specific docs into primary docs after launch
- Keep PRIMARY_DOCS_INDEX.md updated
- Weekly review every Monday

---

## 📚 Quick Reference

**Need to make a decision?**  
→ Start with `MISSION_CORE_PRINCIPLES.md`

**Need competitive benchmarks?**  
→ Check `INDUSTRY_PARITY_BENCHMARK.md`

**Need to know what to build next?**  
→ Check `PRODUCT_ROADMAP.md`

**Need technical details?**  
→ Check `ARCHITECTURE.md` or `API_REFERENCE.md`

**Need to deploy?**  
→ Check `DEPLOYMENT_RUNBOOK.md`

**Need current status?**  
→ Check `CURRENT_STATUS.md`

**Need feature-specific details?**  
→ Check supporting docs (but verify against primary docs first)

---

**Remember**: 10 PRIMARY docs are the source of truth. All others are supporting files. When in doubt, refer to PRIMARY docs first.

**Last Updated**: November 16, 2025  
**Next Review**: November 23, 2025 (Monday)  
**Owner**: Product Team
