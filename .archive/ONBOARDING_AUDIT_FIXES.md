# Onboarding Flow Audit & Fixes - December 4, 2025

## 🔍 Issues Identified from User Testing

### Critical Issues

1. **✅ 401 Unauthorized Errors**
   - **Problem:** Backend API calls failing with 401
   - **Root Cause:** Authentication token not being passed correctly to backend
   - **Impact:** Onboarding progress not loading, projects not fetching
   - **Fix:** Ensure `fetchWithAuth` properly passes Clerk token

2. **✅ Welcome Modal Flashing & Disappearing**
   - **Problem:** Modal appears briefly then vanishes
   - **Root Cause:** Multiple re-renders and localStorage check timing
   - **Impact:** User misses important onboarding context
   - **Fix:** Improve modal state management and timing

3. **✅ "FREE" Should Say "FREE TRIAL"**
   - **Problem:** Sidebar shows "FREE Plan" instead of "FREE TRIAL"
   - **Root Cause:** Not checking trial status in tier display
   - **Impact:** User doesn't understand they're on a trial
   - **Fix:** Update Sidebar to show "FREE TRIAL" when user has active trial

4. **✅ Duplicate Upload Prompts**
   - **Problem:** "Create Your First Viral Clip" (EmptyProjects) and "Upload your first video" (OnboardingChecklist) both visible
   - **Root Cause:** Both components showing simultaneously for new users
   - **Impact:** Confusing UX, unclear which to click
   - **Fix:** Hide EmptyProjects when OnboardingChecklist is visible

5. **✅ Onboarding Checklist Items Not Clickable**
   - **Problem:** "Upload your first video" step in checklist not clickable
   - **Root Cause:** Action button only shows when `action` prop is defined
   - **Impact:** User can't interact with checklist
   - **Fix:** Ensure all checklist items have proper action handlers

---

## 🎯 Expected Flow (According to Documentation)

### New User Journey:
1. **Sign Up** → Redirect to dashboard
2. **Welcome Modal** → Shows once, explains platform
3. **Onboarding Checklist** → Visible, shows 5 steps
4. **Empty State** → Hidden when checklist is active
5. **Trial Banner** → Shows "7-day FREE TRIAL" with countdown
6. **Sidebar** → Shows "FREE TRIAL" not "FREE Plan"
7. **First Upload** → Clicking checklist item opens upload modal
8. **Progress Tracking** → Backend tracks completion via API

---

## 🔧 Fixes Applied

### 1. Fix Sidebar to Show "FREE TRIAL"

**File:** `apps/web/components/layout/Sidebar.tsx`

**Change:**
```typescript
// BEFORE:
<div className="...">
  {tier} Plan
</div>

// AFTER:
<div className="...">
  {tier === 'FREE' && trialInfo?.isActive ? 'FREE TRIAL' : `${tier} Plan`}
</div>
```

**Props Update:**
```typescript
interface SidebarProps {
  credits?: number | null;
  creditsAllocation?: number;
  resetDate?: string;
  tier?: string;
  trialInfo?: any; // ADD THIS
  isOpen?: boolean;
  onClose?: () => void;
}
```

---

### 2. Fix Duplicate Upload Prompts

**File:** `apps/web/app/dashboard/page.tsx`

**Change:**
```typescript
// Show EmptyProjects ONLY if:
// - No projects exist
// - AND onboarding checklist is complete or hidden

{projects.length === 0 && !showOnboardingChecklist && (
  <EmptyProjects onUploadClick={handleOpenUploadModal} />
)}
```

**Logic:**
- If user has 0 projects AND hasn't completed onboarding → Show checklist only
- If user has 0 projects AND completed onboarding → Show EmptyProjects
- If user has projects → Show project grid

---

### 3. Fix Onboarding Checklist Clickability

**File:** `apps/web/components/onboarding/OnboardingChecklist.tsx`

**Change:**
```typescript
// Ensure all items have action handlers
const items: ChecklistItem[] = [
  {
    id: 'upload',
    title: 'Upload your first video',
    description: 'Get started by uploading a video or pasting a URL',
    completed: progress.hasUploadedVideo,
    icon: <Upload className="w-5 h-5" />,
    actionText: 'Upload Video',
    action: () => {
      // Trigger upload modal via data attribute
      const uploadBtn = document.querySelector('[data-upload-trigger]') as HTMLButtonElement;
      if (uploadBtn) {
        uploadBtn.click();
      } else {
        // Fallback: dispatch custom event
        window.dispatchEvent(new CustomEvent('open-upload-modal'));
      }
    },
  },
  // ... other items with proper actions
];
```

---

### 4. Fix Welcome Modal Timing

**File:** `apps/web/app/dashboard/page.tsx`

**Change:**
```typescript
// Welcome Modal Logic - Show on first visit with delay
useEffect(() => {
  if (!isAuthReady) return;
  
  const hasVisited = localStorage.getItem('hasVisitedDashboard');
  if (!hasVisited) {
    // Add small delay to prevent flash
    setTimeout(() => {
      setShowWelcomeModal(true);
      localStorage.setItem('hasVisitedDashboard', 'true');
    }, 500); // 500ms delay
  }
}, [isAuthReady]);
```

---

### 5. Fix 401 Errors - Backend Auth

**Problem:** Backend not receiving/validating Clerk token properly

**Files to Check:**
- `apps/api/src/auth/clerk-sync.service.ts`
- `apps/api/src/onboarding/onboarding-progress.controller.ts`
- `apps/api/src/projects/projects.controller.ts`

**Verify:**
1. Clerk webhook is set up correctly
2. User is synced to database on signup
3. JWT validation middleware is working
4. Token is being extracted from Authorization header

**Test:**
```bash
# Check if user exists in database
docker exec -it clipforge-postgres-1 psql -U postgres -d clipforge

SELECT * FROM "User" WHERE email = 'gautamranand@gmail.com';
```

---

## 📋 Testing Checklist

### Pre-Test Setup
- [ ] Delete test user from admin console
- [ ] Clear browser localStorage
- [ ] Clear browser cookies
- [ ] Use incognito/private window

### Test Flow
1. [ ] **Sign Up**
   - Navigate to `/sign-up`
   - Sign up with `gautamranand+test@gmail.com`
   - Verify redirect to dashboard

2. [ ] **Welcome Modal**
   - [ ] Modal appears after 500ms delay
   - [ ] Content is clear and engaging
   - [ ] "Get Started" button works
   - [ ] Modal doesn't flash/disappear

3. [ ] **Dashboard State**
   - [ ] Trial banner shows "7-day FREE TRIAL"
   - [ ] Sidebar shows "FREE TRIAL" not "FREE Plan"
   - [ ] Credits show "150 / 150"
   - [ ] Onboarding checklist visible
   - [ ] EmptyProjects NOT visible (hidden)

4. [ ] **Onboarding Checklist**
   - [ ] All 5 steps visible
   - [ ] "Upload your first video" is clickable
   - [ ] Clicking opens upload modal
   - [ ] Progress tracked correctly

5. [ ] **Upload Flow**
   - [ ] Upload modal opens
   - [ ] Can upload video
   - [ ] Processing starts
   - [ ] Checklist updates after upload

6. [ ] **No Console Errors**
   - [ ] No 401 errors
   - [ ] No "No authentication token" errors
   - [ ] Analytics events firing
   - [ ] Intercom boots successfully

---

## 🐛 Known Non-Critical Issues (Acknowledged)

1. **404 Errors:**
   - `/icon-192.png` - Missing PWA icon (cosmetic)
   - `/admin/dashboard` - Expected 404 (route doesn't exist)

2. **Clerk Deprecation Warning:**
   - `afterSignInUrl` prop deprecated
   - Use `fallbackRedirectUrl` instead (low priority)

3. **Intercom 403:**
   - Launcher disabled in settings (working as configured)

4. **React Key Warning:**
   - Duplicate `/admin/plg` keys in AdminNav (dev only)

---

## 🚀 Implementation Order

1. **CRITICAL (Do First):**
   - Fix 401 errors (backend auth)
   - Fix sidebar "FREE TRIAL" display
   - Fix duplicate upload prompts

2. **HIGH (Do Next):**
   - Fix checklist clickability
   - Fix welcome modal timing

3. **MEDIUM (Do After):**
   - Add data-upload-trigger attribute
   - Improve error handling
   - Add loading states

4. **LOW (Nice to Have):**
   - Fix Clerk deprecation warnings
   - Add PWA icons
   - Fix React key warnings

---

## 📊 Success Metrics

### Must Pass:
- ✅ No 401 errors in console
- ✅ Welcome modal shows once and stays visible
- ✅ Sidebar shows "FREE TRIAL" for trial users
- ✅ Only ONE upload prompt visible at a time
- ✅ Checklist items are clickable
- ✅ Upload modal opens from checklist

### Nice to Have:
- ✅ Smooth animations
- ✅ No console warnings
- ✅ Fast page loads
- ✅ Analytics tracking working

---

## 🔍 Debug Commands

### Check User in Database:
```bash
docker exec -it clipforge-postgres-1 psql -U postgres -d clipforge -c "SELECT * FROM \"User\" WHERE email = 'gautamranand@gmail.com';"
```

### Check Onboarding Progress:
```bash
docker exec -it clipforge-postgres-1 psql -U postgres -d clipforge -c "SELECT * FROM \"OnboardingProgress\" ORDER BY \"createdAt\" DESC LIMIT 5;"
```

### Check Trial Info:
```bash
docker exec -it clipforge-postgres-1 psql -U postgres -d clipforge -c "SELECT email, tier, \"trialEndsAt\" FROM \"User\" WHERE email = 'gautamranand@gmail.com';"
```

### Restart Backend:
```bash
docker-compose restart api
```

### View Backend Logs:
```bash
docker-compose logs -f api | grep -i "auth\|401\|token"
```

---

## 📝 Notes

- User signed up at: Dec 4, 2025 2:34pm IST
- Email: gautamranand@gmail.com
- Expected trial end: Dec 11, 2025 2:34pm IST
- Initial credits: 150
- Tier: FREE (with active trial)

---

## ✅ Status

- [x] Issues identified
- [ ] Fixes implemented
- [ ] Testing complete
- [ ] Deployed to production
