# ClipForge Design System

**Version:** 1.0.0  
**Inspired by:** Podcastle  
**Last Updated:** November 5, 2025

---

## 🎨 Color Palette

### Primary Colors
```css
--primary-teal: #14B8A6;        /* Primary actions, Create button */
--primary-teal-hover: #0D9488;  /* Hover state */
--primary-teal-light: #5EEAD4;  /* Light accents */
```

### Pastel Feature Cards
```css
--card-pink: #FDE2E4;           /* Recording Studio card */
--card-blue: #DBEAFE;           /* Video Editor card */
--card-mint: #D1FAE5;           /* Audio Editor card */
--card-purple: #E9D5FF;         /* Additional feature */
--card-yellow: #FEF3C7;         /* Additional feature */
```

### Neutrals
```css
--gray-50: #F9FAFB;             /* Background */
--gray-100: #F3F4F6;            /* Subtle backgrounds */
--gray-200: #E5E7EB;            /* Borders */
--gray-300: #D1D5DB;            /* Disabled */
--gray-400: #9CA3AF;            /* Placeholder */
--gray-500: #6B7280;            /* Secondary text */
--gray-600: #4B5563;            /* Body text */
--gray-700: #374151;            /* Headings */
--gray-800: #1F2937;            /* Dark headings */
--gray-900: #111827;            /* Darkest */
```

### Semantic Colors
```css
--success: #10B981;             /* Success states */
--warning: #F59E0B;             /* Warnings */
--error: #EF4444;               /* Errors */
--info: #3B82F6;                /* Info */
```

---

## 📐 Spacing Scale

```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
```

---

## 🔤 Typography

### Font Family
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

### Font Sizes
```css
--text-xs: 0.75rem;     /* 12px */
--text-sm: 0.875rem;    /* 14px */
--text-base: 1rem;      /* 16px */
--text-lg: 1.125rem;    /* 18px */
--text-xl: 1.25rem;     /* 20px */
--text-2xl: 1.5rem;     /* 24px */
--text-3xl: 1.875rem;   /* 30px */
--text-4xl: 2.25rem;    /* 36px */
```

### Font Weights
```css
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### Line Heights
```css
--leading-tight: 1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.75;
```

---

## 🔘 Border Radius

```css
--radius-sm: 0.375rem;   /* 6px - Small elements */
--radius-md: 0.5rem;     /* 8px - Buttons, inputs */
--radius-lg: 0.75rem;    /* 12px - Cards */
--radius-xl: 1rem;       /* 16px - Large cards */
--radius-2xl: 1.5rem;    /* 24px - Feature cards */
--radius-full: 9999px;   /* Circular */
```

---

## 🌑 Shadows

```css
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
```

---

## 🎯 Components

### Buttons

#### Primary Button (Teal)
```css
background: var(--primary-teal);
color: white;
padding: 0.75rem 1.5rem;
border-radius: var(--radius-md);
font-weight: var(--font-medium);
transition: all 0.2s;

&:hover {
  background: var(--primary-teal-hover);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}
```

#### Secondary Button
```css
background: white;
color: var(--gray-700);
border: 1px solid var(--gray-300);
padding: 0.75rem 1.5rem;
border-radius: var(--radius-md);
font-weight: var(--font-medium);

&:hover {
  background: var(--gray-50);
  border-color: var(--gray-400);
}
```

#### Icon Button
```css
width: 2.5rem;
height: 2.5rem;
border-radius: var(--radius-md);
display: flex;
align-items: center;
justify-content: center;

&:hover {
  background: var(--gray-100);
}
```

### Cards

#### Feature Card
```css
background: var(--card-pink); /* or blue, mint */
padding: 1.5rem;
border-radius: var(--radius-2xl);
display: flex;
align-items: center;
gap: 1rem;
transition: all 0.2s;

&:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}
```

#### Project Card
```css
background: white;
border: 1px solid var(--gray-200);
border-radius: var(--radius-lg);
padding: 1.5rem;
transition: all 0.2s;

&:hover {
  border-color: var(--primary-teal);
  box-shadow: var(--shadow-md);
}
```

#### Plan Widget
```css
background: white;
border: 1px solid var(--gray-200);
border-radius: var(--radius-lg);
padding: 1.5rem;
position: fixed;
bottom: 1.5rem;
left: 1.5rem;
width: 14rem;
```

### Navigation

#### Sidebar
```css
width: 12rem;
background: white;
border-right: 1px solid var(--gray-200);
padding: 1.5rem;
display: flex;
flex-direction: column;
gap: 0.5rem;
```

#### Nav Item
```css
display: flex;
align-items: center;
gap: 0.75rem;
padding: 0.75rem 1rem;
border-radius: var(--radius-md);
color: var(--gray-700);
font-weight: var(--font-medium);
transition: all 0.2s;

&:hover {
  background: var(--gray-100);
}

&.active {
  background: var(--gray-100);
  color: var(--primary-teal);
}
```

### Inputs

#### Text Input
```css
background: white;
border: 1px solid var(--gray-300);
border-radius: var(--radius-md);
padding: 0.75rem 1rem;
font-size: var(--text-base);
transition: all 0.2s;

&:focus {
  outline: none;
  border-color: var(--primary-teal);
  box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.1);
}
```

#### Search Input
```css
background: var(--gray-50);
border: 1px solid transparent;
border-radius: var(--radius-md);
padding: 0.75rem 1rem 0.75rem 2.5rem;
font-size: var(--text-sm);

&:focus {
  background: white;
  border-color: var(--gray-300);
}
```

---

## 📱 Layout

### Container
```css
max-width: 1280px;
margin: 0 auto;
padding: 0 2rem;
```

### Grid
```css
display: grid;
grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
gap: 1.5rem;
```

### Sidebar Layout
```css
display: grid;
grid-template-columns: 12rem 1fr;
height: 100vh;
```

---

## 🎭 Animations

### Transitions
```css
--transition-fast: 150ms ease;
--transition-base: 200ms ease;
--transition-slow: 300ms ease;
```

### Hover Effects
```css
/* Card Lift */
transform: translateY(-2px);
box-shadow: var(--shadow-lg);

/* Button Press */
transform: scale(0.98);

/* Fade In */
opacity: 0;
animation: fadeIn 0.3s ease forwards;

@keyframes fadeIn {
  to { opacity: 1; }
}
```

---

## 🖼️ Icons

### Icon Sizes
```css
--icon-xs: 1rem;    /* 16px */
--icon-sm: 1.25rem; /* 20px */
--icon-md: 1.5rem;  /* 24px */
--icon-lg: 2rem;    /* 32px */
--icon-xl: 3rem;    /* 48px */
```

### Icon Colors
- Primary actions: `var(--primary-teal)`
- Navigation: `var(--gray-500)`
- Active nav: `var(--primary-teal)`
- Disabled: `var(--gray-300)`

---

## 📋 Usage Guidelines

### Do's ✅
- Use generous white space
- Maintain consistent spacing
- Use soft pastel colors for feature differentiation
- Keep rounded corners consistent
- Use teal for primary actions
- Provide clear visual hierarchy
- Use icons with labels for clarity

### Reference Screenshots
- Dashboard with project cards
- Sidebar navigation
- Editor interface
- Brand Kit page
- Empty states
- Marketing/landing page sections
- Feature showcase cards with illustrations
- Testimonial cards with soft yellow backgrounds
- Dark hero sections with white text
- Large feature cards with screenshots/mockups inside

### Additional Design Elements Observed

#### Large Feature Cards with Mockups
- Cards contain actual UI screenshots/mockups inside
- Soft gradient backgrounds on cards
- Cards are clickable with arrow indicators
- Mockups have subtle shadows and depth
- Text overlay on images with good contrast

#### Marketing/Landing Page Style
- **Dark Sections:** Dark gray/charcoal backgrounds (#2D3748 or similar)
- **Hero Text:** Large, bold white text on dark backgrounds
- **CTA Buttons:** 
  - Primary: Bright lime/yellow-green (#C4F82A or similar)
  - Secondary: Outlined with border, transparent background
- **Testimonial Cards:** Soft yellow/cream backgrounds (#FFFBEB)
- **Logo Showcase:** Clean, spaced logos on dark background

#### Typography Hierarchy
- **Hero Headings:** Very large (48px+), bold, centered
- **Section Headings:** Large (36px+), bold, good spacing
- **Card Titles:** Medium-large (24px), bold
- **Body Text:** Regular weight, good line height (1.6-1.8)
- **Descriptions:** Smaller, gray text for secondary info

#### Illustration Style
- Simple, clean illustrations inside cards
- Pastel color schemes matching card backgrounds
- Minimalist, geometric shapes
- Icons are simple and recognizable
- White circular backgrounds for icons/illustrations

#### Button Styles
- **Primary CTA:** Lime/yellow-green, rounded, bold text
- **Secondary CTA:** Outlined, transparent, rounded
- **Dark Button:** Black/dark gray, white text, rounded
- All buttons have generous padding
- Hover states with subtle transforms

#### Card Variations
1. **Simple Feature Card:** Pastel background + icon + title + description
2. **Large Feature Card:** Pastel background + mockup/screenshot + title + description
3. **Testimonial Card:** Yellow/cream background + quote + attribution
4. **AI Tool Card:** Pastel background + illustration + title + description + arrow

#### Spacing Patterns
- Very generous white space between sections
- Cards have consistent internal padding (24-32px)
- Section margins are large (64-96px)
- Grid gaps are consistent (24px)

#### Color Usage Patterns
- **Mint/Green:** Recording, audio features
- **Yellow/Lime:** Video editing, new features
- **Peach/Orange:** AI voices, creative tools
- **Pink/Purple:** Filler word removal, editing tools
- **Blue/Cyan:** Transcription, text features
- **Yellow/Cream:** Testimonials, social proof

#### Modal/Dialog Design
- **Large modals** with generous padding
- **Pink background** for upload/drop zones
- **White content area** with rounded corners
- **Close button** (X) in top-right
- **Section dividers** with clear headings
- **Icon + text** for integration options (Google Drive, Dropbox)
- **Settings panel** on right side of modal
- **Preview area** on left side
- **Generate/Action button** at bottom (dark, full-width)

#### AI Tools Grid
- **Small square cards** with rounded corners
- **Gradient icon backgrounds** matching feature color
- **Icon + label** layout
- **2-3 columns** on desktop
- **"Soon" badge** for upcoming features
- **Consistent sizing** across all tool cards

#### Use Case Pills/Tags
- **Rounded pill shape** (fully rounded)
- **Soft pastel backgrounds** (yellow, mint, blue)
- **Centered text**
- **Horizontal scrolling** on mobile
- **Even spacing** between pills
- **Hover state** with slight scale

#### Hero Section Typography
- **Mixed font weights** (light + bold)
- **Large hero text** (60px+)
- **Light gray** for secondary words
- **Black/dark** for primary words
- **Centered alignment**
- **Pill badge** above hero text
- **Rating display** with stars below CTA

#### Recent Projects Section
- **"Recent" heading** with clear hierarchy
- **Large project cards** with video thumbnail
- **Badge overlays** ("Video", "empty")
- **Project title** below thumbnail
- **Timestamp** in gray text
- **Soft purple/blue** gradient backgrounds for empty states

---

## 🎨 Component Examples

### Create Button
```tsx
<button className="bg-teal-500 hover:bg-teal-600 text-white font-medium px-6 py-3 rounded-lg flex items-center gap-2 transition-all hover:shadow-md hover:-translate-y-0.5">
  <Plus className="w-5 h-5" />
  Create
</button>
```

### Feature Card
```tsx
<div className="bg-pink-100 p-6 rounded-2xl flex items-center gap-4 hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer">
  <div className="w-12 h-12 bg-pink-200 rounded-xl flex items-center justify-center">
    <Video className="w-6 h-6 text-pink-600" />
  </div>
  <span className="font-semibold text-gray-800">Video Editor</span>
</div>
```

### Nav Item
```tsx
<a className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
  <Home className="w-5 h-5" />
  <span className="font-medium">Home</span>
</a>
```

### AI Tool Card
```tsx
<div className="bg-white rounded-xl p-4 hover:shadow-md transition-all cursor-pointer">
  <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center mb-3">
    <Sparkles className="w-6 h-6 text-white" />
  </div>
  <h4 className="font-semibold text-gray-800">AI Clips</h4>
</div>
```

### Use Case Pill
```tsx
<div className="inline-flex items-center px-6 py-3 bg-card-mint rounded-full text-gray-800 font-medium hover:scale-105 transition-transform cursor-pointer">
  Social Media Clips
</div>
```

### Upload Modal
```tsx
<div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
  <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
    {/* Header */}
    <div className="flex items-center justify-between p-6 border-b">
      <h2 className="text-2xl font-bold text-gray-800">AI Clips</h2>
      <button className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center">
        <X className="w-5 h-5" />
      </button>
    </div>
    
    {/* Content */}
    <div className="grid grid-cols-2 gap-6 p-6">
      {/* Left: Upload Area */}
      <div className="bg-card-pink rounded-xl p-8 flex flex-col items-center justify-center min-h-[400px]">
        <Upload className="w-12 h-12 text-gray-400 mb-4" />
        <p className="text-gray-600 mb-2">Click to upload</p>
        <p className="text-sm text-gray-500">Choose a file or drag and drop it here</p>
      </div>
      
      {/* Right: Settings */}
      <div>
        <h3 className="font-semibold text-gray-800 mb-4">Settings</h3>
        {/* Settings content */}
      </div>
    </div>
    
    {/* Footer */}
    <div className="p-6 border-t">
      <button className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-3 rounded-lg">
        Generate
      </button>
    </div>
  </div>
</div>
```

### Recent Project Card
```tsx
<div className="bg-white rounded-lg overflow-hidden hover:shadow-lg transition-all cursor-pointer">
  <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 relative">
    <div className="absolute top-3 left-3 bg-gray-900 text-white text-xs px-2 py-1 rounded-md">
      Video
    </div>
    <div className="absolute inset-0 flex items-center justify-center">
      <Play className="w-12 h-12 text-gray-400" />
    </div>
  </div>
  <div className="p-4">
    <h4 className="font-semibold text-gray-800 mb-1">Project 1</h4>
    <p className="text-sm text-gray-500">Edited less than a minute ago</p>
  </div>
</div>
```

### Hero Section
```tsx
<div className="text-center py-20">
  <div className="inline-flex items-center px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-600 mb-6">
    #1 AI Studio for long-form content
  </div>
  <h1 className="text-6xl font-bold mb-4">
    <span className="text-gray-300">Instant long-form</span>{' '}
    <span className="text-gray-900">audio & video creation</span>
  </h1>
  <p className="text-xl text-gray-600 mb-8">
    One platform, no multiple subscriptions.
  </p>
  <button className="bg-gray-900 hover:bg-gray-800 text-lime-cta font-medium px-8 py-4 rounded-full inline-flex items-center gap-2">
    Get Started Free
    <ChevronRight className="w-5 h-5" />
  </button>
  <div className="flex items-center justify-center gap-2 mt-4">
    <Star className="w-5 h-5 text-orange-500 fill-orange-500" />
    <span className="font-semibold">4.9/5</span>
  </div>
</div>
```

---

**Note:** This design system is a living document and will evolve as the product grows.
