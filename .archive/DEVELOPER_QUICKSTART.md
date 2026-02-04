# 🚀 Developer Quick Start Guide

**ClipForge v0.2.0 - Podcastle UI**

---

## ⚡ 5-Minute Setup

```bash
# 1. Clone and navigate
cd /Users/gautamrajanand/CascadeProjects/windsurf-project

# 2. Start Docker services
docker-compose up -d

# 3. Install API dependencies
cd apps/api
npm install

# 4. Run database migrations
npm run prisma:migrate

# 5. Start API server
npm run dev
# API running on http://localhost:3000

# 6. In new terminal: Install web dependencies
cd apps/web
npm install

# 7. Start web server
npm run dev
# Web running on http://localhost:3001
```

**Open:** http://localhost:3001/dashboard

---

## 📁 Project Structure

```
windsurf-project/
├── apps/
│   ├── api/                    # NestJS Backend
│   │   ├── src/
│   │   │   ├── auth/          # Authentication
│   │   │   ├── projects/      # Project management
│   │   │   ├── video/         # Video processing
│   │   │   └── storage/       # MinIO storage
│   │   └── prisma/
│   │       └── schema.prisma  # Database schema
│   │
│   └── web/                    # Next.js Frontend
│       ├── app/
│       │   ├── dashboard/     # Dashboard page
│       │   ├── project/[id]/  # Project detail page
│       │   └── layout.tsx     # Root layout
│       ├── components/
│       │   ├── layout/        # Sidebar, TopBar
│       │   ├── cards/         # Card components
│       │   └── modals/        # Modal components
│       └── tailwind.config.ts # Tailwind config
│
├── DESIGN_SYSTEM.md           # Design guidelines
├── TESTING_GUIDE.md           # Testing checklist
└── UI_REDESIGN_SUMMARY.md     # Redesign summary
```

---

## 🎨 Component Usage

### Sidebar Navigation

```tsx
import Sidebar from '@/components/layout/Sidebar';

// In your page
<Sidebar />
```

### Feature Card

```tsx
import FeatureCard from '@/components/cards/FeatureCard';
import { Video } from 'lucide-react';

<FeatureCard
  title="Video Editor"
  icon={Video}
  color="blue"
  onClick={() => console.log('Clicked!')}
/>
```

### AI Tool Card

```tsx
import AIToolCard from '@/components/cards/AIToolCard';
import { Sparkles } from 'lucide-react';

<AIToolCard
  title="AI Clips"
  icon={Sparkles}
  gradientFrom="from-purple-400"
  gradientTo="to-purple-600"
  soon={false}
  onClick={() => console.log('Clicked!')}
/>
```

### Upload Modal

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

---

## 🎨 Using Design Tokens

### Colors

```tsx
// Primary teal
className="bg-primary-500 text-white"

// Pastel cards
className="bg-card-pink"    // Pink
className="bg-card-blue"    // Blue
className="bg-card-mint"    // Mint
className="bg-card-purple"  // Purple
className="bg-card-yellow"  // Yellow
className="bg-card-peach"   // Peach

// Text colors
className="text-gray-800"   // Headings
className="text-gray-600"   // Body
className="text-gray-500"   // Secondary
```

### Spacing

```tsx
// Section gaps
className="mb-12"  // 48px

// Card gaps
className="gap-6"  // 24px

// Card padding
className="p-6"    // 24px

// Button padding
className="px-6 py-3"  // 24px x 12px
```

### Border Radius

```tsx
className="rounded-lg"   // 12px - Buttons, inputs
className="rounded-xl"   // 16px - Cards
className="rounded-2xl"  // 24px - Feature cards
className="rounded-full" // Pills, avatars
```

### Animations

```tsx
// Hover lift
className="hover:-translate-y-1 transition-all"

// Shadow on hover
className="hover:shadow-lg transition-all"

// Standard transition
className="transition-all duration-200"
```

---

## 🔧 Common Tasks

### Add a New Page

```tsx
// apps/web/app/my-page/page.tsx
'use client';

import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';

export default function MyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <TopBar />
      
      <main className="ml-48 pt-16">
        <div className="p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            My Page
          </h1>
          {/* Your content */}
        </div>
      </main>
    </div>
  );
}
```

### Add a New Card Component

```tsx
// apps/web/components/cards/MyCard.tsx
'use client';

interface MyCardProps {
  title: string;
  onClick?: () => void;
}

export default function MyCard({ title, onClick }: MyCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl p-6 hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer border border-gray-200"
    >
      <h3 className="font-semibold text-gray-800">{title}</h3>
    </div>
  );
}
```

### Add a New Color

```ts
// apps/web/tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        'my-color': {
          light: '#...',
          DEFAULT: '#...',
          dark: '#...',
        },
      },
    },
  },
};
```

### Make an API Call

```tsx
const [data, setData] = useState(null);
const [token, setToken] = useState('');

// Get token
useEffect(() => {
  const getToken = async () => {
    const response = await fetch('http://localhost:3000/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'demo@clipforge.dev',
        password: 'demo123',
      }),
    });
    const data = await response.json();
    setToken(data.access_token);
  };
  getToken();
}, []);

// Fetch data
useEffect(() => {
  if (!token) return;
  
  const fetchData = async () => {
    const response = await fetch('http://localhost:3000/v1/projects', {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    const data = await response.json();
    setData(data);
  };
  fetchData();
}, [token]);
```

---

## 🎯 Design Patterns

### Page Layout Pattern

```tsx
<div className="min-h-screen bg-gray-50">
  <Sidebar />
  <TopBar />
  
  <main className="ml-48 pt-16">
    <div className="p-8">
      {/* Content */}
    </div>
  </main>
</div>
```

### Section Pattern

```tsx
<section className="mb-12">
  <h2 className="text-2xl font-bold text-gray-900 mb-6">
    Section Title
  </h2>
  <div className="grid grid-cols-3 gap-6">
    {/* Cards */}
  </div>
</section>
```

### Card Pattern

```tsx
<div className="bg-white rounded-xl p-6 hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer border border-gray-200">
  {/* Card content */}
</div>
```

### Button Pattern

```tsx
// Primary
<button className="bg-primary-500 hover:bg-primary-600 text-white font-medium px-6 py-3 rounded-lg transition-colors">
  Primary Action
</button>

// Secondary
<button className="border border-gray-300 text-gray-700 font-medium px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors">
  Secondary Action
</button>
```

### Modal Pattern

```tsx
{isOpen && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-2xl max-w-3xl w-full">
      {/* Modal content */}
    </div>
  </div>
)}
```

---

## 🐛 Debugging Tips

### Check API Connection

```bash
# Test API health
curl http://localhost:3000/api/docs

# Test authentication
curl -X POST http://localhost:3000/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@clipforge.dev","password":"demo123"}'
```

### Check Docker Services

```bash
# Check running containers
docker-compose ps

# Check logs
docker-compose logs postgres
docker-compose logs minio

# Restart services
docker-compose restart
```

### Clear Cache

```bash
# Clear Next.js cache
cd apps/web
rm -rf .next

# Clear node_modules
rm -rf node_modules
npm install
```

### Check Browser Console

1. Open DevTools (F12)
2. Check Console tab for errors
3. Check Network tab for failed requests
4. Check Application tab for storage

---

## 📚 Useful Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server

# Database
npm run prisma:migrate   # Run migrations
npm run prisma:studio    # Open Prisma Studio
npm run prisma:generate  # Generate Prisma Client

# Docker
docker-compose up -d     # Start services
docker-compose down      # Stop services
docker-compose logs -f   # Follow logs
docker-compose restart   # Restart services

# Git
git status               # Check status
git add .                # Stage all changes
git commit -m "message"  # Commit changes
git push                 # Push to remote
```

---

## 🎨 Design Resources

### Fonts
- **Inter:** https://fonts.google.com/specimen/Inter

### Icons
- **Lucide React:** https://lucide.dev/

### Colors
- **Tailwind Colors:** https://tailwindcss.com/docs/customizing-colors

### Inspiration
- **Podcastle:** https://podcastle.ai/

---

## 📖 Further Reading

- **Design System:** `DESIGN_SYSTEM.md`
- **Testing Guide:** `TESTING_GUIDE.md`
- **Roadmap:** `ROADMAP.md`
- **Architecture:** `ARCHITECTURE.md`
- **API Docs:** http://localhost:3000/api/docs

---

## 💡 Pro Tips

1. **Use the design system** - Don't create custom styles, use design tokens
2. **Keep components small** - One component, one responsibility
3. **Test as you build** - Don't wait until the end
4. **Follow naming conventions** - Be consistent
5. **Document your code** - Future you will thank you
6. **Use TypeScript** - Catch errors early
7. **Check console** - Always check for errors
8. **Use React DevTools** - Debug component state
9. **Profile performance** - Use Chrome DevTools
10. **Ask for help** - Check documentation first

---

## 🆘 Getting Help

### Documentation
1. Check `DESIGN_SYSTEM.md` for design questions
2. Check `TESTING_GUIDE.md` for testing help
3. Check `API_VERIFICATION.md` for API questions

### Common Issues
1. Check `TESTING_GUIDE.md` "Common Issues" section
2. Search GitHub issues
3. Check Stack Overflow

### Contact
- **Email:** dev@clipforge.dev
- **GitHub:** [Repository Issues]
- **Slack:** #clipforge-dev

---

**Happy Coding!** 🚀

Remember: **Clean code is better than clever code.**
