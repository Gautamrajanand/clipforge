# A/B Testing Framework Specification

**Priority:** P2  
**Purpose:** Test and optimize PLG onboarding variations  
**Estimated Effort:** 1 week

---

## 📊 Overview

Build a lightweight A/B testing framework to experiment with onboarding flows, pricing, features, and messaging to optimize conversion rates.

**Goal:** Data-driven optimization of PLG funnel

---

## 🎯 Tests to Run (Priority Order)

### 1. Onboarding Survey (High Priority)

**Hypothesis:** Survey completion correlates with higher activation

**Variants:**
- **A (Control):** Current 3-step survey
- **B:** No survey, straight to welcome modal
- **C:** 1-step survey (just role)
- **D:** Survey after first upload (delayed)

**Metrics:**
- Survey completion rate
- Time to first upload
- Time to first clip (aha moment)
- Day 7 retention
- Trial to paid conversion

**Sample Size:** 1,000 users per variant  
**Duration:** 2 weeks  
**Success Criteria:** Variant improves aha moment time by 20%+

---

### 2. Welcome Modal Copy (High Priority)

**Hypothesis:** Clearer value proposition increases engagement

**Variants:**
- **A (Control):** "AI-powered Content OS..."
- **B:** "Turn Long Videos into Viral Clips in Seconds"
- **C:** "Create 10 Clips from 1 Video with AI"
- **D:** "Join 10,000+ Creators Making Viral Content"

**Metrics:**
- Modal CTA click rate
- Time to first upload
- Feature adoption rate
- User satisfaction (NPS)

**Sample Size:** 500 users per variant  
**Duration:** 1 week  
**Success Criteria:** Variant improves CTA click rate by 15%+

---

### 3. Credit Allocation (Medium Priority)

**Hypothesis:** More credits = higher activation, but lower conversion

**Variants:**
- **A (Control):** 60 credits
- **B:** 100 credits
- **C:** 150 credits
- **D:** Unlimited trial (7 days)

**Metrics:**
- Credits used
- Projects created
- Clips generated
- Trial to paid conversion
- Revenue per user

**Sample Size:** 1,000 users per variant  
**Duration:** 4 weeks (need conversion data)  
**Success Criteria:** Variant improves LTV by 10%+

---

### 4. Trial Length (Medium Priority)

**Hypothesis:** Longer trial = higher activation, but lower urgency

**Variants:**
- **A (Control):** 7 days
- **B:** 14 days
- **C:** 30 days
- **D:** No trial, freemium forever

**Metrics:**
- Feature usage during trial
- Trial to paid conversion
- Time to conversion
- Churn rate (first 30 days)

**Sample Size:** 1,000 users per variant  
**Duration:** 6 weeks  
**Success Criteria:** Variant improves conversion by 25%+

---

### 5. Checklist Order (Low Priority)

**Hypothesis:** Checklist order affects completion rate

**Variants:**
- **A (Control):** Upload → Clips → Subtitles → Reframe → Export
- **B:** Clips → Subtitles → Reframe → Export (no upload)
- **C:** Clips → Export → Subtitles → Reframe (quick wins first)
- **D:** No checklist, just tooltips

**Metrics:**
- Checklist completion rate
- Time to complete
- Feature adoption
- User satisfaction

**Sample Size:** 500 users per variant  
**Duration:** 2 weeks  
**Success Criteria:** Variant improves completion by 30%+

---

### 6. Pricing Page Layout (Low Priority)

**Hypothesis:** Different layouts affect upgrade rate

**Variants:**
- **A (Control):** 4 tiers horizontal
- **B:** 3 tiers (remove FREE)
- **C:** 2 tiers (Starter + Pro)
- **D:** Annual pricing prominent

**Metrics:**
- Pricing page views
- Upgrade button clicks
- Checkout completion
- Average order value

**Sample Size:** 500 users per variant  
**Duration:** 2 weeks  
**Success Criteria:** Variant improves conversion by 20%+

---

## 🛠️ Technical Implementation

### Architecture

```
┌─────────────┐
│   User      │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│  A/B Test Service   │
│  - Assign variant   │
│  - Track events     │
│  - Calculate stats  │
└──────┬──────────────┘
       │
       ├─────────────┐
       ▼             ▼
┌──────────┐  ┌──────────┐
│ Variant A│  │ Variant B│
└──────────┘  └──────────┘
```

---

### Database Schema

```sql
-- A/B Tests table
CREATE TABLE ab_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'draft', -- draft, running, paused, completed
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Test Variants table
CREATE TABLE ab_test_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID REFERENCES ab_tests(id),
  name VARCHAR(255) NOT NULL, -- 'A', 'B', 'C', etc.
  description TEXT,
  config JSONB, -- Variant-specific configuration
  traffic_allocation DECIMAL(5,2) DEFAULT 50.00, -- Percentage
  created_at TIMESTAMP DEFAULT NOW()
);

-- User Assignments table
CREATE TABLE ab_test_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID REFERENCES ab_tests(id),
  variant_id UUID REFERENCES ab_test_variants(id),
  user_id VARCHAR(255) NOT NULL,
  assigned_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(test_id, user_id)
);

-- Test Events table
CREATE TABLE ab_test_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID REFERENCES ab_tests(id),
  variant_id UUID REFERENCES ab_test_variants(id),
  user_id VARCHAR(255) NOT NULL,
  event_name VARCHAR(255) NOT NULL,
  event_data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_ab_test_assignments_user ON ab_test_assignments(user_id);
CREATE INDEX idx_ab_test_events_test_variant ON ab_test_events(test_id, variant_id);
CREATE INDEX idx_ab_test_events_user ON ab_test_events(user_id);
```

---

### API Endpoints

```typescript
// Get user's variant for a test
GET /api/ab-test/:testName/variant
Response: {
  testId: 'uuid',
  variantId: 'uuid',
  variantName: 'B',
  config: { /* variant config */ }
}

// Track event for A/B test
POST /api/ab-test/:testName/event
Body: {
  eventName: 'button_clicked',
  eventData: { /* optional data */ }
}
Response: {
  success: true
}

// Get test results (admin only)
GET /api/admin/ab-test/:testId/results
Response: {
  test: { name, status, startDate, endDate },
  variants: [
    {
      name: 'A',
      users: 500,
      conversions: 50,
      conversionRate: 10.0,
      confidence: 95
    },
    {
      name: 'B',
      users: 500,
      conversions: 75,
      conversionRate: 15.0,
      confidence: 95
    }
  ],
  winner: 'B',
  improvement: 50.0 // % improvement
}
```

---

### Frontend Hook

```typescript
// hooks/useABTest.ts
import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';

interface ABTestConfig {
  testName: string;
  defaultVariant?: string;
}

export function useABTest({ testName, defaultVariant = 'A' }: ABTestConfig) {
  const { user } = useUser();
  const [variant, setVariant] = useState(defaultVariant);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    // Fetch variant assignment
    fetch(`/api/ab-test/${testName}/variant`, {
      headers: {
        'Authorization': `Bearer ${await getToken()}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        setVariant(data.variantName);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('AB test error:', err);
        setIsLoading(false);
      });
  }, [user?.id, testName]);

  const trackEvent = async (eventName: string, eventData?: any) => {
    if (!user?.id) return;

    await fetch(`/api/ab-test/${testName}/event`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await getToken()}`,
      },
      body: JSON.stringify({ eventName, eventData }),
    });
  };

  return { variant, isLoading, trackEvent };
}
```

---

### Usage Example

```typescript
// app/dashboard/page.tsx
'use client';

import { useABTest } from '@/hooks/useABTest';

export default function Dashboard() {
  const { variant, isLoading, trackEvent } = useABTest({
    testName: 'welcome_modal_copy',
    defaultVariant: 'A',
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const welcomeMessages = {
    A: 'AI-powered Content OS for video editing',
    B: 'Turn Long Videos into Viral Clips in Seconds',
    C: 'Create 10 Clips from 1 Video with AI',
    D: 'Join 10,000+ Creators Making Viral Content',
  };

  const handleCTAClick = () => {
    trackEvent('welcome_cta_clicked');
    // Continue with normal flow
  };

  return (
    <div>
      <WelcomeModal
        message={welcomeMessages[variant]}
        onCTAClick={handleCTAClick}
      />
    </div>
  );
}
```

---

## 📊 Statistical Analysis

### Sample Size Calculator

```typescript
// utils/abTestStats.ts

/**
 * Calculate required sample size for A/B test
 * @param baselineRate - Current conversion rate (e.g., 0.10 for 10%)
 * @param minimumDetectableEffect - Minimum effect to detect (e.g., 0.20 for 20% improvement)
 * @param significance - Significance level (default 0.05 for 95% confidence)
 * @param power - Statistical power (default 0.80 for 80% power)
 */
export function calculateSampleSize(
  baselineRate: number,
  minimumDetectableEffect: number,
  significance: number = 0.05,
  power: number = 0.80
): number {
  const z_alpha = 1.96; // 95% confidence
  const z_beta = 0.84; // 80% power
  
  const p1 = baselineRate;
  const p2 = baselineRate * (1 + minimumDetectableEffect);
  const p_avg = (p1 + p2) / 2;
  
  const numerator = Math.pow(z_alpha + z_beta, 2) * 2 * p_avg * (1 - p_avg);
  const denominator = Math.pow(p2 - p1, 2);
  
  return Math.ceil(numerator / denominator);
}

/**
 * Calculate statistical significance using Z-test
 */
export function calculateSignificance(
  conversionsA: number,
  usersA: number,
  conversionsB: number,
  usersB: number
): {
  pValue: number;
  isSignificant: boolean;
  confidence: number;
} {
  const p1 = conversionsA / usersA;
  const p2 = conversionsB / usersB;
  const p_pool = (conversionsA + conversionsB) / (usersA + usersB);
  
  const se = Math.sqrt(p_pool * (1 - p_pool) * (1/usersA + 1/usersB));
  const z = (p2 - p1) / se;
  
  // Calculate p-value (two-tailed)
  const pValue = 2 * (1 - normalCDF(Math.abs(z)));
  
  return {
    pValue,
    isSignificant: pValue < 0.05,
    confidence: (1 - pValue) * 100,
  };
}
```

---

### Results Dashboard

```typescript
// components/admin/ABTestResults.tsx

interface ABTestResultsProps {
  testId: string;
}

export function ABTestResults({ testId }: ABTestResultsProps) {
  const { data, isLoading } = useQuery(['ab-test-results', testId], () =>
    fetch(`/api/admin/ab-test/${testId}/results`).then(res => res.json())
  );

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">{data.test.name}</h2>
      
      {/* Variants Comparison */}
      <div className="grid grid-cols-2 gap-4">
        {data.variants.map(variant => (
          <div key={variant.name} className="border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">
              Variant {variant.name}
              {variant.name === data.winner && (
                <span className="ml-2 text-green-600">🏆 Winner</span>
              )}
            </h3>
            
            <div className="space-y-2">
              <div>
                <span className="text-gray-600">Users:</span>
                <span className="ml-2 font-semibold">{variant.users}</span>
              </div>
              <div>
                <span className="text-gray-600">Conversions:</span>
                <span className="ml-2 font-semibold">{variant.conversions}</span>
              </div>
              <div>
                <span className="text-gray-600">Conversion Rate:</span>
                <span className="ml-2 font-semibold">{variant.conversionRate}%</span>
              </div>
              <div>
                <span className="text-gray-600">Confidence:</span>
                <span className="ml-2 font-semibold">{variant.confidence}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Statistical Significance */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold mb-2">Statistical Significance</h4>
        <p>
          Variant {data.winner} shows a{' '}
          <strong>{data.improvement}% improvement</strong> over the control
          with <strong>{data.variants[1].confidence}% confidence</strong>.
        </p>
        {data.variants[1].confidence >= 95 ? (
          <p className="text-green-600 mt-2">
            ✅ Results are statistically significant. Safe to implement.
          </p>
        ) : (
          <p className="text-orange-600 mt-2">
            ⚠️ Results not yet significant. Continue test or increase sample size.
          </p>
        )}
      </div>
    </div>
  );
}
```

---

## ✅ Best Practices

### 1. Test One Thing at a Time
❌ **Bad:** Test survey + welcome modal + credits together  
✅ **Good:** Test survey variations first, then welcome modal

### 2. Run Tests Long Enough
- Minimum 1 week (capture weekly patterns)
- Minimum 100 conversions per variant
- Wait for statistical significance (95% confidence)

### 3. Avoid Peeking
- Don't stop test early because one variant is winning
- Let test run to completion
- Use sequential testing if you must peek

### 4. Segment Analysis
- Analyze by user segment (new vs returning)
- Check for novelty effect
- Look for interaction effects

### 5. Document Everything
- Hypothesis
- Test design
- Results
- Learnings
- Next steps

---

## 🚀 Implementation Timeline

### Week 1: Infrastructure
- [ ] Database schema
- [ ] API endpoints
- [ ] Frontend hook
- [ ] Admin dashboard

### Week 2: First Test
- [ ] Onboarding survey A/B test
- [ ] Track events
- [ ] Monitor results
- [ ] Analyze data

### Week 3: Optimization
- [ ] Statistical analysis
- [ ] Results dashboard
- [ ] Winner implementation
- [ ] Documentation

### Week 4: Scale
- [ ] Additional tests
- [ ] Automated analysis
- [ ] Reporting
- [ ] Team training

---

## 📚 Resources

- [A/B Testing Guide](https://www.optimizely.com/optimization-glossary/ab-testing/)
- [Statistical Significance Calculator](https://www.evanmiller.org/ab-testing/sample-size.html)
- [PostHog Experimentation](https://posthog.com/docs/experiments)
- [Mixpanel A/B Testing](https://docs.mixpanel.com/docs/analysis/reports/experiments)

---

**Status:** Specification complete  
**Next Steps:** Review with team, build infrastructure, run first test  
**Owner:** Growth/Engineering team  
**Timeline:** 4 weeks for full framework + first test
