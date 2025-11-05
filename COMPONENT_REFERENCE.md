# 📦 Component Reference Guide

**ClipForge v0.2.0 - Component Library**

---

## 📋 Table of Contents

1. [Layout Components](#layout-components)
2. [Card Components](#card-components)
3. [Modal Components](#modal-components)
4. [Usage Examples](#usage-examples)
5. [Props Reference](#props-reference)

---

## Layout Components

### 1. Sidebar

**Location:** `components/layout/Sidebar.tsx`

**Description:** Left navigation sidebar with Create button and plan widget

**Features:**
- Fixed position (192px width)
- Navigation items with icons
- Teal "Create" button
- Plan usage widget at bottom
- Active state highlighting

**Usage:**
```tsx
import Sidebar from '@/components/layout/Sidebar';

<Sidebar />
```

**Visual:**
```
┌─────────────────┐
│   ClipForge ✨  │
│                 │
│  [+ Create]     │
│                 │
│  🏠 Home        │
│  📁 Projects    │
│  🎥 Recordings  │
│  📅 Planner     │
│  🎨 Brand Kit   │
│  ─────────────  │
│  🎙️ Studios     │
│  📻 Shows       │
│  ✨ AI Voices   │
│                 │
│  ┌───────────┐  │
│  │Your Basic │  │
│  │plan       │  │
│  │           │  │
│  │Video: 1hr │  │
│  │Audio: 1hr │  │
│  │Storage:   │  │
│  │100%       │  │
│  │           │  │
│  │[Upgrade]  │  │
│  └───────────┘  │
└─────────────────┘
```

---

### 2. TopBar

**Location:** `components/layout/TopBar.tsx`

**Description:** Top navigation bar with workspace selector and user menu

**Features:**
- Workspace selector
- "Try Premium" button
- Help icon
- Notifications icon
- User avatar with dropdown menu

**Usage:**
```tsx
import TopBar from '@/components/layout/TopBar';

<TopBar />
```

**Visual:**
```
┌────────────────────────────────────────────────────────┐
│ 👤 Personal Workspace ▼    [✨ Try Premium] ? 🔔 [G▼] │
│    Basic • 1 Premier limit                              │
└────────────────────────────────────────────────────────┘
```

---

## Card Components

### 3. FeatureCard

**Location:** `components/cards/FeatureCard.tsx`

**Description:** Large pastel background card for main features

**Features:**
- 6 color variants (pink, blue, mint, purple, yellow, peach)
- Icon + title layout
- Hover lift animation
- Rounded corners (24px)

**Props:**
```typescript
interface FeatureCardProps {
  title: string;
  icon: LucideIcon;
  color: 'pink' | 'blue' | 'mint' | 'purple' | 'yellow' | 'peach';
  onClick?: () => void;
}
```

**Usage:**
```tsx
import FeatureCard from '@/components/cards/FeatureCard';
import { Video } from 'lucide-react';

<FeatureCard
  title="Video Editor"
  icon={Video}
  color="blue"
  onClick={() => console.log('Clicked')}
/>
```

**Visual:**
```
┌────────────────────────────┐
│ ┌────┐                     │  (Blue background)
│ │ 🎥 │  Video Editor       │
│ └────┘                     │
└────────────────────────────┘
     ↑ Hover: lifts up
```

**Color Examples:**
- **pink:** `#FFE4E6` - Recording Studio
- **blue:** `#DBEAFE` - Video Editor
- **mint:** `#D1FAE5` - Audio Editor
- **purple:** `#E9D5FF` - Advanced features
- **yellow:** `#FEF3C7` - Premium features
- **peach:** `#FFEDD5` - AI features

---

### 4. AIToolCard

**Location:** `components/cards/AIToolCard.tsx`

**Description:** Small square card with gradient icon for AI tools

**Features:**
- Gradient icon background
- "Soon" badge support
- Hover shadow effect
- Compact design

**Props:**
```typescript
interface AIToolCardProps {
  title: string;
  icon: LucideIcon;
  gradientFrom: string;
  gradientTo: string;
  soon?: boolean;
  onClick?: () => void;
}
```

**Usage:**
```tsx
import AIToolCard from '@/components/cards/AIToolCard';
import { Sparkles } from 'lucide-react';

<AIToolCard
  title="AI Clips"
  icon={Sparkles}
  gradientFrom="from-purple-400"
  gradientTo="to-purple-600"
  soon={false}
  onClick={() => console.log('Clicked')}
/>
```

**Visual:**
```
┌──────────────┐
│ ┌──────────┐ │  Soon
│ │ Gradient │ │   ↑
│ │    ✨    │ │
│ └──────────┘ │
│              │
│  AI Clips    │
└──────────────┘
```

**Gradient Examples:**
- Purple: `from-purple-400 to-purple-600`
- Blue: `from-blue-400 to-blue-600`
- Green: `from-green-400 to-green-600`
- Indigo: `from-indigo-400 to-indigo-600`
- Yellow: `from-yellow-400 to-yellow-600`
- Pink: `from-pink-400 to-pink-600`

---

### 5. ProjectCard

**Location:** `components/cards/ProjectCard.tsx`

**Description:** Video project card with thumbnail and metadata

**Features:**
- Gradient thumbnail background
- "Video" badge overlay
- Play icon
- Project title and timestamp
- "empty" badge for new projects
- Hover lift animation

**Props:**
```typescript
interface ProjectCardProps {
  id: string;
  title: string;
  updatedAt: string;
  thumbnail?: string;
  isEmpty?: boolean;
}
```

**Usage:**
```tsx
import ProjectCard from '@/components/cards/ProjectCard';

<ProjectCard
  id="proj_123"
  title="My Project"
  updatedAt="Edited 2 hours ago"
  isEmpty={false}
/>
```

**Visual:**
```
┌────────────────────┐
│ Video              │
│  ┌──────────────┐  │
│  │  Gradient    │  │
│  │     ▶️       │  │ empty
│  │  Background  │  │  ↑
│  └──────────────┘  │
│                    │
│  My Project        │
│  Edited 2 hours ago│
└────────────────────┘
```

---

### 6. NewProjectCard

**Location:** `components/cards/NewProjectCard.tsx`

**Description:** Dashed border card for creating new projects

**Features:**
- Dashed border
- Plus icon
- Hover effect (border color change)
- Same aspect ratio as ProjectCard

**Props:**
```typescript
interface NewProjectCardProps {
  onClick?: () => void;
}
```

**Usage:**
```tsx
import NewProjectCard from '@/components/cards/NewProjectCard';

<NewProjectCard onClick={() => console.log('Create new')} />
```

**Visual:**
```
┌ ─ ─ ─ ─ ─ ─ ─ ─ ┐
│                  │
│      ┌────┐      │
│      │ +  │      │
│      └────┘      │
│                  │
│  New project     │
│                  │
└ ─ ─ ─ ─ ─ ─ ─ ─ ┘
```

---

## Modal Components

### 7. UploadModal

**Location:** `components/modals/UploadModal.tsx`

**Description:** Full-featured upload modal with drag-drop support

**Features:**
- Pink upload zone
- Drag and drop support
- File preview
- Project title input
- Upload progress
- Cancel/Upload buttons

**Props:**
```typescript
interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File, title: string) => void;
}
```

**Usage:**
```tsx
import UploadModal from '@/components/modals/UploadModal';

const [showModal, setShowModal] = useState(false);

const handleUpload = (file: File, title: string) => {
  console.log('Uploading:', file, title);
};

<UploadModal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  onUpload={handleUpload}
/>
```

**Visual:**
```
┌─────────────────────────────────────┐
│ 🎥 Upload Video              [X]    │
├─────────────────────────────────────┤
│                                     │
│  ┌───────────────────────────────┐ │
│  │                               │ │
│  │         📤                    │ │
│  │   Click to upload             │ │
│  │   or drag and drop            │ │
│  │                               │ │
│  └───────────────────────────────┘ │
│                                     │
│  Project Title                      │
│  ┌───────────────────────────────┐ │
│  │ Enter project title...        │ │
│  └───────────────────────────────┘ │
│                                     │
├─────────────────────────────────────┤
│          [Cancel] [Upload & Process]│
└─────────────────────────────────────┘
```

---

## Usage Examples

### Complete Dashboard Layout

```tsx
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import FeatureCard from '@/components/cards/FeatureCard';
import AIToolCard from '@/components/cards/AIToolCard';
import ProjectCard from '@/components/cards/ProjectCard';
import NewProjectCard from '@/components/cards/NewProjectCard';
import { Video, Mic2, Scissors, Sparkles } from 'lucide-react';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <TopBar />
      
      <main className="ml-48 pt-16">
        <div className="p-8">
          {/* Feature Cards */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Let's start with
            </h2>
            <div className="grid grid-cols-3 gap-6">
              <FeatureCard title="Recording Studio" icon={Video} color="pink" />
              <FeatureCard title="Video Editor" icon={Scissors} color="blue" />
              <FeatureCard title="Audio Editor" icon={Mic2} color="mint" />
            </div>
          </section>

          {/* AI Tools */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              AI Tools
            </h2>
            <div className="grid grid-cols-3 gap-4">
              <AIToolCard
                title="AI Clips"
                icon={Sparkles}
                gradientFrom="from-purple-400"
                gradientTo="to-purple-600"
              />
              {/* More AI tools... */}
            </div>
          </section>

          {/* Projects */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Recent
            </h2>
            <div className="grid grid-cols-4 gap-6">
              <NewProjectCard />
              <ProjectCard
                id="1"
                title="Project 1"
                updatedAt="Edited 2 hours ago"
              />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
```

---

## Props Reference

### Common Props

All interactive components support:

```typescript
onClick?: () => void;  // Click handler
className?: string;    // Additional CSS classes
disabled?: boolean;    // Disable interaction
```

### Icon Props

Components using Lucide icons:

```typescript
icon: LucideIcon;  // Import from 'lucide-react'
```

**Example:**
```tsx
import { Video, Sparkles, Home } from 'lucide-react';
```

### Color Props

Components with color variants:

```typescript
color: 'pink' | 'blue' | 'mint' | 'purple' | 'yellow' | 'peach';
```

### Gradient Props

Components with gradients:

```typescript
gradientFrom: string;  // e.g., 'from-purple-400'
gradientTo: string;    // e.g., 'to-purple-600'
```

---

## Styling Guidelines

### Do's ✅

1. **Use design tokens** from Tailwind config
2. **Follow spacing scale** (4, 8, 12, 16, 24, 32, 48px)
3. **Use consistent border radius** (8, 12, 16, 24px)
4. **Add hover states** to interactive elements
5. **Use transitions** for smooth animations
6. **Keep consistent typography** (Inter font)

### Don'ts ❌

1. **Don't use arbitrary values** (use design tokens)
2. **Don't mix different animation durations**
3. **Don't use inline styles** (use Tailwind classes)
4. **Don't create custom colors** (use palette)
5. **Don't skip hover states**
6. **Don't use system fonts**

---

## Component Checklist

When creating a new component:

- [ ] TypeScript interface for props
- [ ] Default export
- [ ] Proper prop types
- [ ] Hover states
- [ ] Transitions (200ms)
- [ ] Rounded corners
- [ ] Proper spacing
- [ ] Accessible (ARIA labels if needed)
- [ ] Responsive (if applicable)
- [ ] Documented in this file

---

## Testing Components

### Visual Testing

```tsx
// Create a test page
// apps/web/app/component-test/page.tsx

export default function ComponentTest() {
  return (
    <div className="p-8 space-y-8">
      <h1 className="text-2xl font-bold">Component Tests</h1>
      
      <section>
        <h2 className="text-xl font-semibold mb-4">Feature Cards</h2>
        <div className="grid grid-cols-3 gap-6">
          <FeatureCard title="Test" icon={Video} color="pink" />
          <FeatureCard title="Test" icon={Video} color="blue" />
          <FeatureCard title="Test" icon={Video} color="mint" />
        </div>
      </section>
    </div>
  );
}
```

### Interactive Testing

```tsx
const [clicked, setClicked] = useState(false);

<FeatureCard
  title="Click Me"
  icon={Video}
  color="blue"
  onClick={() => setClicked(!clicked)}
/>

{clicked && <p>Clicked!</p>}
```

---

## Performance Tips

1. **Use React.memo** for expensive components
2. **Lazy load** heavy components
3. **Optimize images** (use Next.js Image)
4. **Minimize re-renders** (use useCallback, useMemo)
5. **Code split** large components

---

## Accessibility

### Keyboard Navigation

All interactive components should support:
- **Tab:** Focus next element
- **Shift+Tab:** Focus previous element
- **Enter/Space:** Activate element
- **Escape:** Close modals

### Screen Readers

Add ARIA labels where needed:

```tsx
<button aria-label="Create new project">
  <Plus />
</button>
```

### Color Contrast

All text should meet WCAG AA standards:
- **Normal text:** 4.5:1 contrast ratio
- **Large text:** 3:1 contrast ratio

---

## Future Components

Components planned for future versions:

- [ ] Toast notifications
- [ ] Loading skeletons
- [ ] Progress indicators
- [ ] Dropdown menus
- [ ] Tabs
- [ ] Tooltips
- [ ] Badges
- [ ] Avatars
- [ ] Empty states
- [ ] Error states

---

**Component Library Version:** v0.2.0  
**Last Updated:** November 5, 2025  
**Maintained by:** Development Team
