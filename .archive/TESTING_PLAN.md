# Testing Plan - Week 2 Day 7

**Date:** November 22, 2025  
**Status:** In Progress

---

## Testing Strategy

### **Testing Pyramid**

```
        /\
       /  \      E2E Tests (10%)
      /____\     - Critical user flows
     /      \    - Payment flow
    /        \   - Project creation
   /__________\  
  /            \ Integration Tests (30%)
 /              \ - API endpoints
/________________\ - Database operations
|                | Unit Tests (60%)
|________________| - Business logic
                   - Utilities
                   - Validators
```

---

## Test Coverage Goals

| Layer | Target | Current | Priority |
|-------|--------|---------|----------|
| **Unit Tests** | 60% | TBD | High |
| **Integration Tests** | 30% | TBD | High |
| **E2E Tests** | 10% | TBD | Medium |
| **Overall** | 70%+ | TBD | High |

---

## Critical Test Areas

### **1. Payment Flow** 🔴 **CRITICAL**
- [ ] Stripe checkout session creation
- [ ] Webhook signature verification
- [ ] Credit addition on subscription
- [ ] Tier upgrade logic
- [ ] Payment failure handling
- [ ] Subscription cancellation

### **2. Credit System** 🔴 **CRITICAL**
- [ ] Credit calculation (1 credit/min)
- [ ] Credit deduction on upload
- [ ] URL import 1.5x multiplier
- [ ] Insufficient credits blocking
- [ ] Monthly credit renewal
- [ ] Credit transaction logging

### **3. Project Expiry** 🟡 **HIGH**
- [ ] Expiry calculation (FREE: 48h, STARTER: 90d)
- [ ] Cron job execution
- [ ] Project deletion on expiry
- [ ] Expiry warning display

### **4. Authentication** 🔴 **CRITICAL**
- [ ] Clerk token validation
- [ ] ClerkAuthGuard functionality
- [ ] Unauthorized access blocking
- [ ] Token refresh

### **5. File Upload** 🟡 **HIGH**
- [ ] Video file validation
- [ ] File size limits
- [ ] MIME type checking
- [ ] Upload progress tracking
- [ ] MinIO storage

### **6. AI Processing** 🟡 **HIGH**
- [ ] Clip detection
- [ ] Transcription
- [ ] Caption generation
- [ ] Reframe processing
- [ ] Export with watermark (FREE tier)

---

## Test Files to Create

### **Backend (NestJS + Jest)**

#### **Unit Tests**
```
apps/api/src/
├── credits/
│   ├── credits.service.spec.ts ✅ (Create)
│   └── credits-cron.service.spec.ts ✅ (Create)
├── payments/
│   ├── payments.service.spec.ts ✅ (Create)
│   └── stripe-webhook.spec.ts ✅ (Create)
├── projects/
│   ├── projects.service.spec.ts ✅ (Create)
│   └── project-expiry.spec.ts ✅ (Create)
└── auth/
    └── clerk-auth.guard.spec.ts ✅ (Create)
```

#### **Integration Tests**
```
apps/api/test/
├── payments.e2e-spec.ts ✅ (Create)
├── credits.e2e-spec.ts ✅ (Create)
└── projects.e2e-spec.ts ✅ (Create)
```

### **Frontend (React + Jest + React Testing Library)**

```
apps/web/
├── __tests__/
│   ├── components/
│   │   ├── Sidebar.test.tsx ✅ (Create)
│   │   ├── TopBar.test.tsx ✅ (Create)
│   │   └── ProjectCard.test.tsx ✅ (Create)
│   ├── pages/
│   │   ├── Dashboard.test.tsx ✅ (Create)
│   │   └── Pricing.test.tsx ✅ (Create)
│   └── utils/
│       └── api.test.ts ✅ (Create)
```

---

## Test Scenarios

### **Payment Flow E2E Test**

```typescript
describe('Payment Flow', () => {
  it('should complete full payment flow', async () => {
    // 1. User clicks upgrade button
    // 2. Stripe checkout session created
    // 3. User completes payment (mock)
    // 4. Webhook received
    // 5. Credits added
    // 6. Tier updated
    // 7. User redirected to success page
  });
});
```

### **Credit System Tests**

```typescript
describe('Credit System', () => {
  it('should calculate credits correctly', () => {
    // 10 min video = 10 credits
    expect(calculateCredits(600)).toBe(10);
  });

  it('should apply 1.5x multiplier for URL imports', () => {
    // 10 min URL import = 15 credits
    expect(calculateCreditsForUrlImport(600)).toBe(15);
  });

  it('should block upload when insufficient credits', async () => {
    // User has 5 credits, tries to upload 10 min video
    await expect(uploadVideo(10min)).rejects.toThrow('Insufficient credits');
  });
});
```

### **Project Expiry Tests**

```typescript
describe('Project Expiry', () => {
  it('should set 48h expiry for FREE tier', () => {
    const expiry = calculateExpiry('FREE');
    expect(expiry).toBe(Date.now() + 48 * 60 * 60 * 1000);
  });

  it('should delete expired projects', async () => {
    // Create expired project
    // Run cron job
    // Verify project deleted
  });
});
```

---

## Testing Tools

### **Backend**
- ✅ **Jest** - Test runner
- ✅ **Supertest** - HTTP assertions
- ✅ **@nestjs/testing** - NestJS test utilities
- 📦 **Stripe Mock** - Mock Stripe API (install)
- 📦 **Prisma Mock** - Mock database (install)

### **Frontend**
- ✅ **Jest** - Test runner
- 📦 **React Testing Library** - Component testing (install)
- 📦 **MSW** - Mock Service Worker for API mocking (install)
- 📦 **@testing-library/user-event** - User interactions (install)

### **E2E**
- 📦 **Playwright** - Browser automation (install)
- 📦 **Cypress** - Alternative E2E framework (optional)

---

## Test Commands

```bash
# Backend
cd apps/api
npm run test              # Run all tests
npm run test:watch        # Watch mode
npm run test:cov          # Coverage report
npm run test:e2e          # E2E tests

# Frontend
cd apps/web
npm run test              # Run all tests
npm run test:watch        # Watch mode
npm run test:coverage     # Coverage report

# All
npm run test:all          # Run all tests (backend + frontend)
```

---

## CI/CD Integration

### **GitHub Actions Workflow**

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run test:all
      - run: npm run test:cov
      - uses: codecov/codecov-action@v3
```

---

## Mock Data

### **Test Users**
```typescript
const testUsers = {
  free: { tier: 'FREE', credits: 60 },
  starter: { tier: 'STARTER', credits: 150 },
  pro: { tier: 'PRO', credits: 300 },
};
```

### **Test Projects**
```typescript
const testProjects = {
  expired: { expiresAt: new Date(Date.now() - 1000) },
  expiringSoon: { expiresAt: new Date(Date.now() + 3600000) },
  valid: { expiresAt: new Date(Date.now() + 86400000) },
};
```

---

## Test Execution Plan

### **Day 7 - Today**
1. ✅ Create testing plan document
2. 🔄 Install testing dependencies
3. 🔄 Create critical unit tests (credits, payments)
4. 🔄 Create integration tests (API endpoints)
5. 🔄 Run tests and fix failures
6. 🔄 Generate coverage report

### **Day 8-10 - Ongoing**
- Add more test coverage
- Set up CI/CD pipeline
- Monitor test failures
- Refactor based on test insights

---

## Success Criteria

- ✅ All critical flows have tests
- ✅ Test coverage > 70%
- ✅ All tests passing
- ✅ CI/CD pipeline configured
- ✅ Coverage reports generated
- ✅ No flaky tests

---

## Notes

- Focus on **critical business logic** first
- Don't test framework code (NestJS, React)
- Mock external services (Stripe, Clerk, MinIO)
- Keep tests fast (< 5 seconds per test)
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)

---

**Status:** Ready to implement tests
**Next:** Install dependencies and create test files
