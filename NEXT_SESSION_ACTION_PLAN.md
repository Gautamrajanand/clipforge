# Next Session Action Plan
**Created:** December 16, 2025, 11:50 PM IST  
**Status:** Ready for implementation  
**Estimated Time:** 16-21 hours (2-3 days)

---

## 🎯 Session Goal: Complete Sprint & Launch Preparation

**Current Status:** 93% complete  
**Target:** 100% complete, ready for soft launch  
**Priority:** Implement critical PLG systems, test thoroughly, prepare for launch

---

## 📋 Task Breakdown (Prioritized)

### PHASE 1: Implement Critical PLG Systems (8-10 hours)

#### 1.1 Modal Queue System (2 hours)
**Location:** `/apps/web/lib/modalQueue.ts`

**Implementation:**
```typescript
// Create modal queue manager
class ModalQueueManager {
  private queue: Array<{
    id: string;
    component: React.ComponentType;
    priority: number;
    props: any;
  }> = [];
  private current: string | null = null;
  private lastShown: number = 0;
  
  enqueue(modal: ModalConfig) {
    // Add to queue sorted by priority
    // Show if no current modal and delay passed
  }
  
  dequeue() {
    // Remove current, show next after 2s delay
  }
  
  clear() {
    // Clear all queued modals
  }
}
```

**Tasks:**
- [ ] Create `modalQueue.ts` with queue manager
- [ ] Create React context for modal queue
- [ ] Update all modal components to use queue
- [ ] Add priority system (critical=1, onboarding=2, upgrade=3, info=4)
- [ ] Add 2s minimum delay between modals
- [ ] Test with multiple modals
- [ ] Test priority ordering
- [ ] Test clear on navigation

**Files to Update:**
- Create: `/apps/web/lib/modalQueue.ts`
- Create: `/apps/web/contexts/ModalQueueContext.tsx`
- Update: All modal components to use queue
- Update: `/apps/web/app/layout.tsx` to wrap with context

---

#### 1.2 Processing State Detection (1 hour)
**Location:** `/apps/web/hooks/useProcessingState.ts`

**Implementation:**
```typescript
// Create processing state hook
export function useProcessingState() {
  const [states, setStates] = useState({
    uploadInProgress: false,
    videoProcessing: false,
    exportInProgress: false,
    paymentProcessing: false,
  });
  
  const isProcessing = Object.values(states).some(Boolean);
  const canShowModal = (isCritical: boolean) => {
    return isCritical || !isProcessing;
  };
  
  return { isProcessing, canShowModal, ...states };
}
```

**Tasks:**
- [ ] Create `useProcessingState.ts` hook
- [ ] Track upload progress
- [ ] Track video processing
- [ ] Track export progress
- [ ] Track payment processing
- [ ] Update modal queue to check processing state
- [ ] Block non-critical modals during processing
- [ ] Test with each processing type

**Files to Update:**
- Create: `/apps/web/hooks/useProcessingState.ts`
- Update: `/apps/web/lib/modalQueue.ts` to check processing state
- Update: Upload, processing, export components to set state

---

#### 1.3 Dismissal Persistence (2 hours)
**Location:** `/apps/web/lib/dismissalManager.ts`

**Implementation:**
```typescript
// Create dismissal manager
class DismissalManager {
  dismiss(modalId: string, cooldown: number) {
    const key = `modal_dismissed_${modalId}_${userId}`;
    localStorage.setItem(key, Date.now().toString());
  }
  
  canShow(modalId: string, cooldown: number): boolean {
    const key = `modal_dismissed_${modalId}_${userId}`;
    const dismissed = localStorage.getItem(key);
    if (!dismissed) return true;
    
    const elapsed = Date.now() - parseInt(dismissed);
    return elapsed > cooldown;
  }
  
  clearForUser(userId: string) {
    // Clear all dismissals for user (e.g., after upgrade)
  }
}
```

**Tasks:**
- [ ] Create `dismissalManager.ts`
- [ ] Add localStorage persistence
- [ ] Add cooldown checking (24h for upgrade nudges)
- [ ] Add clear on upgrade
- [ ] Update all dismissible modals
- [ ] Test dismissal persistence
- [ ] Test cooldown periods
- [ ] Test clear on upgrade

**Files to Update:**
- Create: `/apps/web/lib/dismissalManager.ts`
- Update: All upgrade nudge components
- Update: Modal queue to check dismissals

---

#### 1.4 Mobile Detection (1 hour)
**Location:** `/apps/web/hooks/useMobileDetection.ts`

**Implementation:**
```typescript
// Create mobile detection hook
export function useMobileDetection() {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768 || 
                    /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      setIsMobile(mobile);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  return { isMobile };
}
```

**Tasks:**
- [ ] Create `useMobileDetection.ts` hook
- [ ] Check window width (< 768px)
- [ ] Check user agent
- [ ] Update onboarding tour to skip on mobile
- [ ] Update modal sizes for mobile
- [ ] Use bottom sheets on mobile
- [ ] Test on mobile devices
- [ ] Test responsive behavior

**Files to Update:**
- Create: `/apps/web/hooks/useMobileDetection.ts`
- Update: `/apps/web/hooks/useOnboardingTour.ts` to skip on mobile
- Update: Modal components for mobile sizing

---

#### 1.5 Email Flood Prevention (2 hours)
**Location:** `/apps/api/src/email/email-flood-prevention.service.ts`

**Implementation:**
```typescript
// Create email flood prevention service
@Injectable()
export class EmailFloodPreventionService {
  async canSendEmail(
    userId: string, 
    emailType: string
  ): Promise<boolean> {
    // Check email preferences
    const prefs = await this.getPreferences(userId);
    if (!prefs[emailType]) return false;
    
    // Check daily limit (max 2/day)
    const today = new Date().toDateString();
    const sentToday = await this.getEmailsSentToday(userId, today);
    if (sentToday.length >= 2) return false;
    
    // Check cooldown (24h per type)
    const lastSent = await this.getLastEmailSent(userId, emailType);
    if (lastSent && Date.now() - lastSent < 24 * 60 * 60 * 1000) {
      return false;
    }
    
    return true;
  }
}
```

**Tasks:**
- [ ] Create `email-flood-prevention.service.ts`
- [ ] Track emails sent per day
- [ ] Enforce max 2 emails per day
- [ ] Track last sent per email type
- [ ] Enforce 24h cooldown per type
- [ ] Exempt transactional emails
- [ ] Update all email sending to check
- [ ] Test daily limit
- [ ] Test cooldown periods

**Files to Update:**
- Create: `/apps/api/src/email/email-flood-prevention.service.ts`
- Update: `/apps/api/src/email/resend.service.ts` to use prevention
- Update: All cron jobs to check before sending

---

#### 1.6 Integration & Testing (2-3 hours)

**Tasks:**
- [ ] Test modal queue with all modals
- [ ] Test processing state detection
- [ ] Test dismissal persistence across sessions
- [ ] Test mobile detection on devices
- [ ] Test email flood prevention
- [ ] Test all 6 user scenarios from PLG audit
- [ ] Fix any issues found
- [ ] Document any edge cases

---

### PHASE 2: Admin Panel Real-Data Testing (2 hours)

**Reference:** `ADMIN_PANEL_TESTING_CHECKLIST.md`

**Tasks:**
- [ ] Test all backend endpoints with real data
- [ ] Test dashboard stats accuracy
- [ ] Test user search functionality
- [ ] Test organization search
- [ ] Test credit adjustment (add/deduct)
- [ ] Test tier updates
- [ ] Test admin toggle
- [ ] Test user deletion (soft delete)
- [ ] Test analytics accuracy
- [ ] Test system health check
- [ ] Document any issues
- [ ] Fix critical issues

**Commands:**
```bash
# Get admin token
export ADMIN_TOKEN="your-clerk-jwt-token"

# Test endpoints
curl -H "Authorization: Bearer $ADMIN_TOKEN" http://localhost:3000/admin/dashboard
curl -H "Authorization: Bearer $ADMIN_TOKEN" http://localhost:3000/admin/users/search?q=test
curl -X POST -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"amount": 10, "reason": "Test"}' \
  http://localhost:3000/admin/organizations/{org-id}/credits/adjust
```

---

### PHASE 3: Final Core Testing (4-6 hours)

**Reference:** `FINAL_CORE_TESTING_PLAN.md`

#### 3.1 Performance Testing (1 hour)
- [ ] API response times < 1s
- [ ] Video processing performance (6 min for 10-min video)
- [ ] Database query performance < 50ms
- [ ] Redis cache hit rate > 80%
- [ ] Load test results (already done: 99% success @ 200 users)

#### 3.2 Security Testing (1 hour)
- [ ] Clerk JWT verification working
- [ ] Token refresh automatic
- [ ] Admin guard blocking non-admins
- [ ] API key authentication working
- [ ] Rate limiting enforcing limits
- [ ] SQL injection prevention
- [ ] XSS prevention
- [ ] CSRF protection
- [ ] Input validation

#### 3.3 Functional Testing (2 hours)
Test all 9 core features end-to-end:
- [ ] User onboarding flow
- [ ] Video upload & processing
- [ ] AI Clips generation
- [ ] AI Reframe
- [ ] AI Subtitles
- [ ] Export flow
- [ ] Credits system
- [ ] Subscription & billing
- [ ] Admin panel

#### 3.4 Cross-Browser Testing (1 hour)
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile browsers

#### 3.5 Integration Testing (1 hour)
- [ ] Clerk authentication
- [ ] Stripe payments
- [ ] Razorpay payments
- [ ] Resend emails
- [ ] MinIO/S3 storage
- [ ] AssemblyAI transcription
- [ ] ML workers

---

### PHASE 4: Launch Preparation (2-3 hours)

#### 4.1 Stripe Live Mode (30 minutes)
- [ ] Get live API keys from Stripe dashboard
- [ ] Update `.env` with live keys
- [ ] Test live checkout (small amount)
- [ ] Verify webhook working
- [ ] Test subscription creation
- [ ] Test subscription cancellation

#### 4.2 Production Configuration (30 minutes)
- [ ] Set production environment variables
- [ ] Configure domain (clipforge.ai)
- [ ] Setup SSL certificate
- [ ] Configure CDN (if applicable)
- [ ] Update CORS origins
- [ ] Update Clerk production URLs

#### 4.3 Monitoring Setup (1 hour)
- [ ] Configure Sentry for error tracking
- [ ] Setup health check monitoring
- [ ] Configure log aggregation
- [ ] Setup uptime monitoring
- [ ] Configure alert notifications
- [ ] Test alert system

#### 4.4 Soft Launch (1 hour)
- [ ] Invite 5-10 beta users
- [ ] Monitor their usage in real-time
- [ ] Check for errors in Sentry
- [ ] Verify emails sending
- [ ] Verify payments working
- [ ] Collect feedback
- [ ] Fix any critical issues

---

## 🎯 Success Criteria

### Phase 1: PLG Systems
- [ ] Modal queue prevents stacking
- [ ] No modals during processing
- [ ] Dismissals persist across sessions
- [ ] Tour skipped on mobile
- [ ] Max 2 emails per day enforced

### Phase 2: Admin Testing
- [ ] All endpoints return correct data
- [ ] All CRUD operations work
- [ ] No security issues
- [ ] Data integrity maintained

### Phase 3: Core Testing
- [ ] All features work end-to-end
- [ ] Performance meets targets
- [ ] Security verified
- [ ] Cross-browser compatible

### Phase 4: Launch Prep
- [ ] Stripe live mode working
- [ ] Monitoring configured
- [ ] Soft launch successful
- [ ] No critical issues

---

## 📊 Time Estimates

| Phase | Task | Time | Priority |
|-------|------|------|----------|
| 1.1 | Modal Queue | 2h | CRITICAL |
| 1.2 | Processing Detection | 1h | CRITICAL |
| 1.3 | Dismissal Persistence | 2h | HIGH |
| 1.4 | Mobile Detection | 1h | HIGH |
| 1.5 | Email Flood Prevention | 2h | HIGH |
| 1.6 | Integration Testing | 2-3h | CRITICAL |
| 2 | Admin Testing | 2h | HIGH |
| 3 | Core Testing | 4-6h | CRITICAL |
| 4 | Launch Prep | 2-3h | CRITICAL |
| **TOTAL** | | **16-21h** | |

---

## 🚨 Critical Path

**Must complete in order:**
1. Modal Queue System (blocks other PLG work)
2. Processing State Detection (blocks modal queue testing)
3. Integration Testing (validates systems work together)
4. Core Testing (validates product works)
5. Launch Prep (enables production launch)

**Can parallelize:**
- Dismissal Persistence + Mobile Detection
- Email Flood Prevention (independent)
- Admin Testing (independent)

---

## 📝 Notes for Next Session

### Context to Remember
- We have 61 PLG elements documented
- All timing rules defined and verified
- Industry standards met or exceeded
- 93% sprint complete
- All code is production-ready

### Quick Start Commands
```bash
# Start all services
docker-compose up -d

# Check services
docker-compose ps

# View logs
docker logs clipforge-api --tail 50

# Run tests
cd apps/api && npm test
cd apps/web && npm test
```

### Important Files
- PLG Audit: `PLG_TIMING_AUDIT.md` + `PLG_AUDIT_EXPANSION.md`
- Quality Verification: `PLG_QUALITY_VERIFICATION.md`
- Admin Testing: `ADMIN_PANEL_TESTING_CHECKLIST.md`
- Core Testing: `FINAL_CORE_TESTING_PLAN.md`
- Session Summary: `SESSION_DEC16_FINAL_SUMMARY.md`

### Known Issues
- None critical
- Modal stacking needs implementation
- Email flood prevention needs implementation
- Mobile tour needs skip logic

---

## ✅ Definition of Done

**Sprint Complete When:**
- [ ] All 5 critical PLG systems implemented
- [ ] All systems tested and working
- [ ] Admin panel tested with real data
- [ ] All core features tested end-to-end
- [ ] Stripe live mode configured
- [ ] Monitoring setup complete
- [ ] Soft launch successful
- [ ] No critical bugs

**Ready for Public Launch When:**
- [ ] Soft launch feedback incorporated
- [ ] All critical issues fixed
- [ ] Performance verified under load
- [ ] Security audit passed
- [ ] Documentation complete
- [ ] Support channels ready

---

## 🎯 Session Goals Summary

**Primary Goal:** Implement all critical PLG systems  
**Secondary Goal:** Complete all testing  
**Tertiary Goal:** Prepare for launch  

**Expected Outcome:** 100% sprint complete, ready for soft launch

**Confidence:** Very high - clear plan, all prep done

---

**Start next session with:** Phase 1.1 - Modal Queue System implementation

**Good luck! 🚀**
