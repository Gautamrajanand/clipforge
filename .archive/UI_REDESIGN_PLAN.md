# ClipForge UI Redesign Plan
**Inspired by Podcastle**

## 📋 Summary of Changes

### ✅ Completed
- [x] Documented design philosophy in ROADMAP.md
- [x] Created comprehensive DESIGN_SYSTEM.md
- [x] Updated Tailwind config with Podcastle colors
- [x] Added pastel card colors (pink, blue, mint, purple, yellow, peach)
- [x] Added primary teal color palette
- [x] Added lime-cta color for CTAs
- [x] Added dark-bg colors for hero sections

### 🎯 To Implement

#### 1. Dashboard Page (`/dashboard`)
**Current State:** Basic list layout  
**Target State:** Podcastle-inspired with sidebar

**Changes:**
- [ ] Add left sidebar navigation (192px width)
- [ ] Teal "Create" button at top of sidebar
- [ ] Feature cards at top (Recording Studio, Video Editor, Audio Editor)
  - Pink background for Recording
  - Blue background for Video
  - Mint background for Audio
- [ ] Project grid below feature cards
- [ ] "New project" card with dashed border
- [ ] Plan widget in bottom-left corner
- [ ] Clean typography with Inter font
- [ ] Generous spacing throughout

**Components to Create:**
- `Sidebar.tsx` - Left navigation
- `FeatureCard.tsx` - Pastel feature cards
- `ProjectCard.tsx` - Individual project cards
- `PlanWidget.tsx` - Usage/plan display
- `CreateButton.tsx` - Teal create button

#### 2. Project Detail Page (`/project/[id]`)
**Current State:** Functional but basic styling  
**Target State:** Clean editor-style interface

**Changes:**
- [ ] Add top toolbar with project name and actions
- [ ] Clean video player with rounded corners
- [ ] Clip cards with pastel backgrounds based on score
- [ ] Export panel with clean styling
- [ ] Better spacing and typography
- [ ] Soft shadows on cards

#### 3. Global Layout
**Changes:**
- [ ] Add consistent sidebar across all pages
- [ ] Top navigation bar with workspace selector
- [ ] User menu in top-right
- [ ] Consistent padding and spacing
- [ ] White background (#FFFFFF)
- [ ] Light gray for subtle backgrounds (#F9FAFB)

#### 4. Components Library
**To Create:**
- [ ] Button variants (primary-teal, secondary, outline)
- [ ] Card variants (feature, project, info)
- [ ] Input fields with focus states
- [ ] Modal/dialog components
- [ ] Empty states with illustrations
- [ ] Loading states
- [ ] Toast notifications

---

## 🎨 Color Mapping

### Feature Cards
- **Video Clipping:** `bg-card-blue` (#DBEAFE)
- **AI Detection:** `bg-card-mint` (#D1FAE5)
- **Export:** `bg-card-purple` (#E9D5FF)
- **Analytics:** `bg-card-yellow` (#FEF3C7)
- **Brand Kit:** `bg-card-pink` (#FFE4E6)
- **AI Voices:** `bg-card-peach` (#FFEDD5)

### Buttons
- **Primary CTA:** `bg-primary-500` (#14B8A6) - Teal
- **Secondary CTA:** `bg-lime-cta` (#C4F82A) - Lime/yellow-green
- **Tertiary:** `border border-gray-300` - Outlined

### Text
- **Headings:** `text-gray-800` (#1F2937)
- **Body:** `text-gray-600` (#4B5563)
- **Secondary:** `text-gray-500` (#6B7280)
- **Muted:** `text-gray-400` (#9CA3AF)

---

## 📐 Spacing System

### Container Padding
- Desktop: `px-8` (32px)
- Mobile: `px-4` (16px)

### Section Spacing
- Between major sections: `my-16` (64px)
- Between cards: `gap-6` (24px)
- Card internal padding: `p-6` (24px)

### Component Spacing
- Button padding: `px-6 py-3` (24px x 12px)
- Input padding: `px-4 py-3` (16px x 12px)
- Card title margin: `mb-4` (16px)

---

## 🔤 Typography Scale

### Headings
- **H1 (Page Title):** `text-3xl font-bold` (30px)
- **H2 (Section):** `text-2xl font-bold` (24px)
- **H3 (Card Title):** `text-xl font-semibold` (20px)
- **H4 (Subsection):** `text-lg font-semibold` (18px)

### Body Text
- **Large:** `text-lg` (18px)
- **Base:** `text-base` (16px)
- **Small:** `text-sm` (14px)
- **Tiny:** `text-xs` (12px)

---

## 🎯 Implementation Priority

### Phase 1: Core Layout (Day 1)
1. Create Sidebar component
2. Update Dashboard layout
3. Add feature cards
4. Style project cards

### Phase 2: Components (Day 2)
1. Button components
2. Input components
3. Card components
4. Modal components

### Phase 3: Pages (Day 3)
1. Redesign Dashboard
2. Redesign Project Detail
3. Add empty states
4. Polish interactions

### Phase 4: Polish (Day 4)
1. Animations and transitions
2. Hover states
3. Loading states
4. Responsive design
5. Accessibility

---

## 📱 Responsive Breakpoints

```css
sm: 640px   /* Mobile landscape */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
2xl: 1536px /* Extra large */
```

### Mobile Adaptations
- Hide sidebar, show hamburger menu
- Stack feature cards vertically
- Reduce padding and spacing
- Smaller typography
- Full-width cards

---

## ✨ Animations

### Hover Effects
```css
/* Card lift */
hover:-translate-y-1 hover:shadow-lg transition-all duration-200

/* Button press */
active:scale-98 transition-transform duration-100

/* Fade in */
animate-fadeIn
```

### Transitions
- Default: `transition-all duration-200 ease-in-out`
- Fast: `transition-all duration-150 ease-in-out`
- Slow: `transition-all duration-300 ease-in-out`

---

## 🎨 Example Components

### Feature Card
```tsx
<div className="bg-card-blue p-8 rounded-2xl hover:-translate-y-1 hover:shadow-lg transition-all cursor-pointer">
  <div className="flex items-center gap-4">
    <div className="w-14 h-14 bg-blue-200 rounded-xl flex items-center justify-center">
      <Video className="w-7 h-7 text-blue-600" />
    </div>
    <div>
      <h3 className="text-xl font-semibold text-gray-800">Video Editor</h3>
      <p className="text-sm text-gray-600">Edit videos at lightning speed</p>
    </div>
  </div>
</div>
```

### Project Card
```tsx
<div className="bg-white border border-gray-200 rounded-lg p-6 hover:border-primary-500 hover:shadow-md transition-all cursor-pointer">
  <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg mb-4" />
  <h4 className="font-semibold text-gray-800 mb-2">Project Title</h4>
  <p className="text-sm text-gray-500">Edited 2 hours ago</p>
</div>
```

### Create Button
```tsx
<button className="w-full bg-primary-500 hover:bg-primary-600 text-white font-medium px-6 py-3 rounded-lg flex items-center justify-center gap-2 transition-all hover:shadow-md">
  <Plus className="w-5 h-5" />
  Create
</button>
```

---

## 🚀 Next Steps

1. **Review this plan** with the team
2. **Start with Dashboard** redesign
3. **Create reusable components** as we go
4. **Test on different screen sizes**
5. **Gather feedback** and iterate

---

**Status:** Ready to implement  
**Estimated Time:** 3-4 days  
**Priority:** High
