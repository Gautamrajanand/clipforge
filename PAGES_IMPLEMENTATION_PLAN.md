# 📄 Pages Implementation Plan - Opus Clip Style

**Goal**: Build all sidebar pages with proper free/pro gating  
**Approach**: Free users can ONLY use Calendar, everything else redirects to pricing

---

## 🎯 Pages to Build

### ✅ Free Tier (Accessible)
1. **Home/Dashboard** - Upload and view projects
2. **Calendar** - Schedule posts (full functionality)

### 🔒 Pro Tier (Paywalled)
3. **Analytics** - Redirect to pricing
4. **Social Accounts** - Redirect to pricing  
5. **Brand Kit** - Redirect to pricing
6. **Brand Template** - Redirect to pricing
7. **Asset Library** - Redirect to pricing
8. **Recording Planner** - Redirect to pricing

### 💳 Always Accessible
9. **Subscription** - Manage plan
10. **Pricing** - Upgrade page

---

## 📋 Implementation Order

### **PHASE 1: Sidebar + Navigation** (Day 1)
Build the sidebar with all menu items and pro badges

### **PHASE 2: Calendar Page** (Day 2-3)
Full calendar functionality for free users

### **PHASE 3: Paywalled Pages** (Day 4)
Empty states that redirect to pricing

### **PHASE 4: Pricing Page** (Day 5)
Three-tier pricing with upgrade flow

### **PHASE 5: Subscription Page** (Day 6)
Current plan display and management

---

## 🏗️ Detailed Implementation

### PHASE 1: Sidebar Navigation

**File**: `apps/web/components/Sidebar.tsx`

**Structure**:
```
[Logo] ClipForge

[Create Button] +

Create
  🏠 Home
  📁 Projects  
  🎙️ Brand template (Pro badge)
  📚 Asset library (Pro badge)

Post
  📅 Calendar
  📊 Analytics (Pro badge)
  🔗 Social accounts (Pro badge)

[Bottom Section]
  💳 Subscription
  🎓 Learning center
  ❓ Help center
```

**Behavior**:
- Free users see "Pro" badge on locked items
- Clicking Pro items → Navigate to `/pricing`
- Active state highlighting
- Collapsible on mobile

**Component**:
```tsx
interface SidebarItem {
  name: string;
  icon: React.ComponentType;
  href: string;
  requiresPro: boolean;
}

const CREATE_ITEMS: SidebarItem[] = [
  { name: 'Home', icon: Home, href: '/dashboard', requiresPro: false },
  { name: 'Projects', icon: Folder, href: '/projects', requiresPro: false },
  { name: 'Brand template', icon: Palette, href: '/brand-template', requiresPro: true },
  { name: 'Asset library', icon: Library, href: '/asset-library', requiresPro: true },
];

const POST_ITEMS: SidebarItem[] = [
  { name: 'Calendar', icon: Calendar, href: '/calendar', requiresPro: false },
  { name: 'Analytics', icon: BarChart, href: '/analytics', requiresPro: true },
  { name: 'Social accounts', icon: Share2, href: '/social', requiresPro: true },
];
```

---

### PHASE 2: Calendar Page (FREE - Full Functionality)

**File**: `apps/web/app/calendar/page.tsx`

**Features**:
1. Monthly calendar view
2. "Schedule post" button
3. "Upload local video" button
4. Select project modal
5. Select clip modal
6. Clip preview with metrics
7. Schedule post flow
8. Social account connection

**Layout**:
```
┌─────────────────────────────────────────────────┐
│ Calendar          [Schedule post] [Upload video]│
├─────────────────────────────────────────────────┤
│                                                  │
│  Sun    Mon    Tue    Wed    Thu    Fri    Sat  │
│                                                  │
│   26     27     28     29     30     31      1   │
│                                                  │
│    2      3      4      5      6      7      8   │
│                                                  │
│    9     10     11     12     13     14     15   │
│                                                  │
│   16    •17     18     19     20     21     22   │
│                                                  │
│   23     24     25     26     27     28     29   │
│                                                  │
└─────────────────────────────────────────────────┘
```

**Modals**:

1. **Select Project Modal**
   - Grid of projects with thumbnails
   - Duration badge (00:55)
   - "Upload own video" button
   - Tabs: Projects | Likes

2. **Select Clip Modal**
   - Single clip preview
   - Duration (00:00 / 00:58)
   - Title: "#1 US-India Trade: Potential Unlocked?"
   - Virality score: /100
   - Metrics: Hook, Flow, Engagement, Trend (undefined for now)
   - "Select Clip" button

3. **Schedule Post Modal**
   - "No social media accounts connected"
   - "Add one now to get started with the scheduler!"
   - "+ Add account" button

**API Endpoints Needed**:
- `GET /v1/calendar/posts` - Get scheduled posts
- `POST /v1/calendar/schedule` - Schedule a post
- `GET /v1/projects/:id/clips` - Get clips for project
- `GET /v1/social/accounts` - Get connected accounts
- `POST /v1/social/connect` - Connect social account

---

### PHASE 3: Paywalled Pages

All these pages show an upgrade prompt and redirect to pricing.

#### **Analytics Page** (Pro Only)

**File**: `apps/web/app/analytics/page.tsx`

**Content**:
```tsx
export default function AnalyticsPage() {
  const { user } = useAuth();
  
  if (user.planType === 'FREE') {
    return <UpgradePrompt feature="Analytics" />;
  }
  
  return (
    <div>
      {/* Analytics dashboard */}
      <h1>Analytics</h1>
      <p>Currently only available for TikTok and YouTube accounts</p>
      
      {/* Account views chart */}
      {/* Audience insights */}
    </div>
  );
}
```

**Upgrade Prompt Component**:
```tsx
function UpgradePrompt({ feature }: { feature: string }) {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
      <div className="max-w-md text-center">
        <div className="mb-6">
          <Lock className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">
            {feature} is a Pro Feature
          </h2>
          <p className="text-gray-400">
            Upgrade your account now to access powerful {feature.toLowerCase()} 
            for all your social platforms
          </p>
        </div>
        
        <div className="space-y-3">
          <Link
            href="/pricing"
            className="block w-full px-6 py-3 bg-primary-500 hover:bg-primary-600 
                     text-white font-medium rounded-lg transition-colors"
          >
            Upgrade Plan
          </Link>
          
          <button
            onClick={() => router.back()}
            className="block w-full px-6 py-3 bg-gray-800 hover:bg-gray-700 
                     text-gray-300 font-medium rounded-lg transition-colors"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}
```

#### **Social Accounts Page** (Pro Only)

**File**: `apps/web/app/social/page.tsx`

Same upgrade prompt, but when unlocked shows:
- Connected accounts grid
- Platform cards: YouTube, TikTok, Instagram, Facebook, Twitter, LinkedIn
- "Pro" badge on some platforms
- Connect/disconnect buttons

#### **Brand Kit Page** (Pro Only)

**File**: `apps/web/app/brand-kit/page.tsx`

Same upgrade prompt, but when unlocked shows:
- Logo upload section (4 variants)
- Colors section (color picker)
- Fonts section (font upload)
- Videos section (intro/outro)
- Backgrounds section
- Images section
- Audio section

#### **Asset Library Page** (Pro Only)

**File**: `apps/web/app/asset-library/page.tsx`

Same upgrade prompt, but when unlocked shows:
- Censored words list (Beta)
- Brand vocabulary
- Fonts (0/0)
- Media tabs: All, Images, Videos, Audio

#### **Brand Template Page** (Pro Only)

**File**: `apps/web/app/brand-template/page.tsx`

Same upgrade prompt.

#### **Recording Planner Page** (Pro Only)

**File**: `apps/web/app/recording-planner/page.tsx`

Same upgrade prompt, but when unlocked shows:
- Google Calendar integration
- Empty state: "You haven't scheduled any recording yet"
- "Schedule" button

---

### PHASE 4: Pricing Page

**File**: `apps/web/app/pricing/page.tsx`

**Layout** (from screenshot):
```
┌─────────────────────────────────────────────────┐
│           Upgrade your plan                      │
│                                                  │
│         [Monthly]  [Yearly (up to 50% off)]     │
│                                                  │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐         │
│  │ Starter │  │   Pro   │  │Business │         │
│  │ $15 USD │  │$20 USD  │  │Let's talk│        │
│  │         │  │Most     │  │         │         │
│  │         │  │popular  │  │         │         │
│  └─────────┘  └─────────┘  └─────────┘         │
│                                                  │
│  Features comparison...                         │
└─────────────────────────────────────────────────┘
```

**Three Tiers**:

1. **Starter** - $9 USD/mo
   - Up to 1 Brand template
   - 150 credits
   - AI clipping with Virality Score
   - AI animated captions in 20+ languages
   - Auto-post to YouTube Shorts, TikTok, IG Reels
   - Powerful editor
   - 1 brand template
   - Filler & silence removal
   - Remove Watermark

2. **Pro** - $9.5 USD/mo (Most popular)
   - Up to 2 Brand template
   - 3,600 credits per year, available instantly
   - Team workspace with 2 seats
   - 2 brand templates
   - 5 social media connections
   - AI B-Roll
   - Input from 10+ sources
   - Export to Adobe Premiere Pro & DaVinci Resolve
   - Multiple aspect ratios (9:16, 1:1, 16:9)
   - Social media scheduler
   - Custom fonts
   - Speech enhancement

3. **Business** - Let's talk
   - Custom solutions for brand template
   - Everything in Pro plan, plus:
   - Priority project processing
   - Customized credits and team seats
   - Tailored business assets
   - Dedicated storage
   - API & custom integrations
   - Master Service Agreement (MSA)
   - Priority support with dedicated Slack channel
   - Enterprise-level security

**Buttons**:
- Starter: "Get Starter"
- Pro: "Get Pro"
- Business: "Contact us"

---

### PHASE 5: Subscription Page

**File**: `apps/web/app/subscription/page.tsx`

**Layout** (from screenshot):
```
┌─────────────────────────────────────────────────┐
│ Subscription                                     │
├─────────────────────────────────────────────────┤
│                                                  │
│ Free Plan                    [Active]           │
│                                                  │
│ Email account: gautam@hubhopper.com             │
│ Current balance: 🔥 2                           │
│ Next cycle credits: 💡 60                       │
│                                                  │
│ Packs: 1                                        │
│ Seats: 1/1                                      │
│ Brand Templates: 1/1                            │
│                                                  │
│              [Upgrade]                          │
│                                                  │
├─────────────────────────────────────────────────┤
│ Features                    [Compare plans]     │
├─────────────────────────────────────────────────┤
│ ✓ 60 processing credits per month               │
│ ✓ Up to 1080p rendered clips                   │
│ ✓ Auto reframe                                  │
│ ✓ AI captions with emoji and keyword           │
│ ⊗ Has watermark                                 │
│ ⊗ No editing                                    │
│ ⊗ After 3 days, clips no longer exportable     │
│                                                  │
├─────────────────────────────────────────────────┤
│ Billing & Payment                               │
├─────────────────────────────────────────────────┤
│ Next payment: $0 / mo                           │
│ Renewal period: Monthly                         │
│ Renew date: Nov 5, 2025                        │
└─────────────────────────────────────────────────┘
```

**For Paid Users**:
- Show current plan (Starter/Pro/Business)
- Billing history
- Payment method
- Cancel subscription button
- Upgrade/downgrade options

---

## 🎨 Shared Components

### 1. UpgradePrompt Component
```tsx
// components/UpgradePrompt.tsx
interface UpgradePromptProps {
  feature: string;
  description?: string;
}

export function UpgradePrompt({ feature, description }: UpgradePromptProps) {
  // ... (shown above)
}
```

### 2. ProBadge Component
```tsx
// components/ProBadge.tsx
export function ProBadge() {
  return (
    <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-primary-500/20 
                   text-primary-400 rounded">
      Pro
    </span>
  );
}
```

### 3. PlanGuard Component
```tsx
// components/PlanGuard.tsx
interface PlanGuardProps {
  requiredPlan: 'STARTER' | 'PRO' | 'BUSINESS';
  feature: string;
  children: React.ReactNode;
}

export function PlanGuard({ requiredPlan, feature, children }: PlanGuardProps) {
  const { user } = useAuth();
  
  const planHierarchy = { FREE: 0, STARTER: 1, PRO: 2, BUSINESS: 3 };
  
  if (planHierarchy[user.planType] < planHierarchy[requiredPlan]) {
    return <UpgradePrompt feature={feature} />;
  }
  
  return <>{children}</>;
}
```

---

## 📁 File Structure

```
apps/web/
├── app/
│   ├── dashboard/
│   │   └── page.tsx                 # Home (FREE)
│   ├── calendar/
│   │   └── page.tsx                 # Calendar (FREE)
│   ├── analytics/
│   │   └── page.tsx                 # Analytics (PRO)
│   ├── social/
│   │   └── page.tsx                 # Social Accounts (PRO)
│   ├── brand-kit/
│   │   └── page.tsx                 # Brand Kit (PRO)
│   ├── brand-template/
│   │   └── page.tsx                 # Brand Template (PRO)
│   ├── asset-library/
│   │   └── page.tsx                 # Asset Library (PRO)
│   ├── recording-planner/
│   │   └── page.tsx                 # Recording Planner (PRO)
│   ├── pricing/
│   │   └── page.tsx                 # Pricing (ALL)
│   └── subscription/
│       └── page.tsx                 # Subscription (ALL)
│
├── components/
│   ├── Sidebar.tsx                  # Main navigation
│   ├── UpgradePrompt.tsx            # Paywall screen
│   ├── ProBadge.tsx                 # "Pro" badge
│   ├── PlanGuard.tsx                # Route protection
│   ├── Calendar/
│   │   ├── CalendarView.tsx
│   │   ├── SelectProjectModal.tsx
│   │   ├── SelectClipModal.tsx
│   │   └── SchedulePostModal.tsx
│   └── Pricing/
│       ├── PricingCard.tsx
│       └── FeatureComparison.tsx
```

---

## 🚀 Implementation Steps

### Day 1: Sidebar + Navigation
1. Create `Sidebar.tsx` with all menu items
2. Add Pro badges to locked items
3. Implement navigation logic
4. Add active state highlighting

### Day 2-3: Calendar Page
1. Create calendar view component
2. Build "Select Project" modal
3. Build "Select Clip" modal with metrics
4. Build "Schedule Post" modal
5. Implement social account connection flow

### Day 4: Paywalled Pages
1. Create `UpgradePrompt` component
2. Create all paywalled page files
3. Add `PlanGuard` wrapper
4. Test redirect flow

### Day 5: Pricing Page
1. Create three pricing cards
2. Add feature comparison table
3. Implement monthly/yearly toggle
4. Add "Get Started" buttons

### Day 6: Subscription Page
1. Display current plan
2. Show credit balance
3. Show features list
4. Add upgrade button
5. Show billing info (for paid users)

---

## ✅ Success Criteria

- [ ] Sidebar shows all menu items with Pro badges
- [ ] Free users can access Home and Calendar only
- [ ] Clicking Pro items redirects to pricing
- [ ] Calendar page fully functional for free users
- [ ] All paywalled pages show upgrade prompt
- [ ] Pricing page displays all three tiers
- [ ] Subscription page shows current plan

---

Ready to start building? Should I begin with the Sidebar component?
