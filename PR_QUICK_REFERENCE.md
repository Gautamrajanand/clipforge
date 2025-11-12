# PR Quick Reference Card

**Title:** Fix Pack: Core Flow (Steps 1–6)  
**Branch:** `feature/fix-core-flow` → `main`  
**Status:** ⏸️ Ready for Review

---

## 🎯 One-Line Summary
Implements 6 critical fixes (aspect ratio, captions, transcription, boundarying, playback, counters) with feature flags, tests, and docs.

---

## 📊 Stats
- **Files**: ~35 changed
- **Lines**: ~4,500+ added
- **Migrations**: 4 database migrations
- **Tests**: 2 test suites (17 test cases)
- **Docs**: 5 comprehensive guides

---

## 🚩 Feature Flags (All Default: `false`)
```env
FF_ASPECT_RATIO=false      # Aspect ratio processing
FF_CAPTION_STYLES=false    # Caption styles
FF_INPAGE_PLAYBACK=false   # In-page playback
```

---

## 🔧 New Env Vars Required
```env
JWT_SECRET=your-secret-key
ASSEMBLYAI_WEBHOOK_SECRET=your-webhook-secret
ML_WORKER_URL=http://localhost:8000
ASSEMBLYAI_API_KEY=your-api-key
```

---

## ✅ Quick Test
```bash
# Run tests
cd workers && pytest tests/ -v

# Enable flags
export FF_ASPECT_RATIO=true
export FF_CAPTION_STYLES=true
export FF_INPAGE_PLAYBACK=true

# Apply migrations
cd apps/api && npx prisma migrate deploy

# Test API
curl -X POST http://localhost:3000/api/exports \
  -H "Content-Type: application/json" \
  -d '{"momentId": "test", "aspectRatio": "9:16"}'
```

---

## 🔄 Quick Rollback
```bash
# Disable flags
export FF_ASPECT_RATIO=false
export FF_CAPTION_STYLES=false
export FF_INPAGE_PLAYBACK=false

# Restart services
pm2 restart all
```

---

## 📚 Full Details
See `PR_CORE_FLOW_FIXES.md` for:
- Complete diff summary
- All test commands
- .http examples
- Rollback instructions
- Migration details

---

## ⚠️ Breaking Changes
**None.** All changes additive and behind feature flags.

---

## 👥 Reviewers Needed
- [ ] Backend Engineer
- [ ] Frontend Engineer
- [ ] QA Engineer
- [ ] DevOps Engineer

---

## ✅ Merge Checklist
- [ ] Code review approved
- [ ] Tests passing
- [ ] QA sign-off
- [ ] Security review
- [ ] Docs reviewed
- [ ] Migrations tested
- [ ] Feature flags verified

---

**Ready for review! 🚀**
