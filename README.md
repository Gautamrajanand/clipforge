# ClipForge

**Version:** 1.1.0  
**Status:** ✅ Production Ready (Week 3 Day 1 Complete)  
**Last Updated:** November 23, 2025

---

## 🎯 Vision

**"Democratize AI-powered video creation for every content creator"**

ClipForge is a Product-Led Growth (PLG) SaaS platform that transforms long-form videos into viral short clips using AI. Built for content creators, podcasters, marketers, and agencies.

### Mission: "One Input, Many Outputs"
Upload one video → Get viral clips, AI captions, multi-aspect ratios, and data-driven insights.

---

## ✨ Core Features

### 🎬 Video Input
- **File Upload:** Drag-and-drop with progress tracking (up to 1GB)
- **URL Import:** YouTube, Vimeo, Rumble, Twitter/X, TikTok
- **Auto-fill Metadata:** Extract title, duration, thumbnail
- **Format Support:** MP4, MOV, AVI, WebM, MKV

### 🤖 AI Processing
- **AI Transcription:** AssemblyAI or Whisper (multi-language)
- **AI Clip Detection:** Smart scene detection with virality scoring
- **AI Titles & Descriptions:** OpenAI-generated content
- **Smart Clips:** Automated moment detection
- **Virality Scoring:** Rank clips by engagement potential

### ✂️ Video Editing
- **AI Reframe:** Auto-crop to 9:16, 1:1, 16:9, 4:5
- **AI Subtitles:** 14 animated caption styles
- **Caption Customization:** Color, size (24-96px), position
- **Long-Form Clips:** 60-90+ seconds with chunked rendering
- **Professional Transitions:** Smooth cuts and fades

### 💾 Export & Download
- **High-Quality Export:** Up to 4K resolution
- **FFmpeg Processing:** Professional-grade encoding
- **Watermark System:** "Made with ClipForge" for FREE tier
- **Direct Download:** MP4 files ready for social media

### 💳 Credit System
- **Tier-Based Allocation:** FREE (60), STARTER (150), PRO (300)
- **Credit Rollover:** Unused credits roll over (2x cap: 120, 300, 600)
- **Transparent Pricing:** 1 credit = 1 minute of video
- **Cost Preview:** See estimated credits before processing
- **Auto Refund:** Credits returned if processing fails
- **Monthly Reset:** Automatic credit renewal with rollover

### 🎁 Free Trial System
- **7-Day Trial:** Auto-activated on signup
- **STARTER Tier Access:** 150 credits during trial
- **Auto-Expiry:** Cron job handles trial expiration
- **Seamless Downgrade:** Auto-downgrade to FREE after trial
- **Trial Tracking:** Banner with countdown on dashboard

### 💰 Billing & Payments
- **Stripe Integration:** Global payments
- **Razorpay Integration:** India payments
- **Multiple Plans:** FREE, STARTER ($29/mo), PRO ($79/mo), BUSINESS (Custom)
- **Billing Portal:** Self-service subscription management
- **Webhook Automation:** Real-time subscription updates
- **Downgrade Flow:** Cancel subscription with project expiry handling

### 📊 Analytics & Tracking
- **Mixpanel Integration:** Full event tracking
- **User Analytics:** Identify users, track behavior
- **Event Tracking:** Page views, uploads, exports, errors
- **Custom Properties:** Project metadata, user tier, credits
- **Real-time Insights:** Dashboard analytics

### 🔐 Authentication & Security
- **Clerk Integration:** OAuth (Google, LinkedIn), email/password
- **JWT Verification:** Secure JWKS-based auth
- **Auto Token Refresh:** Seamless 10-minute token renewal
- **Multi-Tenant:** Organization-based isolation
- **Secure Storage:** S3-compatible with signed URLs

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Next.js Web App (3001)                   │
│         Dashboard, Upload, Export, Billing UI               │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│              NestJS Control Plane API (3000)                 │
│    Auth, Projects, Credits, Payments, Webhooks              │
└────────────────┬─────────────────────────────┬──────────────┘
                 │                             │
    ┌────────────▼────────────┐    ┌──────────▼──────────┐
    │  FastAPI ML Workers     │    │  Postgres + Redis   │
    │  (ASR, Ranker, Render)  │    │  (Data & Jobs)      │
    │  (8000)                 │    └─────────────────────┘
    └────────────┬────────────┘
                 │
    ┌────────────▼────────────┐
    │  MinIO / S3 / R2        │
    │  (Storage & CDN)        │
    └─────────────────────────┘
```

### Tech Stack
- **Frontend:** Next.js 14, React 18, TypeScript, TailwindCSS, Clerk
- **Backend:** NestJS, Prisma, PostgreSQL, Redis
- **ML/AI:** Python FastAPI, Whisper, AssemblyAI, OpenAI
- **Payments:** Stripe, Razorpay
- **Storage:** MinIO (local), S3/R2 (production)
- **Infrastructure:** Docker Compose

---

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 18+
- Python 3.10+

### Setup

```bash
# Clone repository
git clone <repo>
cd clipforge

# Copy environment files
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.local.example apps/web/.env.local

# Start all services
docker-compose up -d

# Install dependencies
cd apps/api && npm install
cd ../web && npm install
cd ../../workers && pip install -r requirements.txt

# Run database migrations
cd apps/api && npx prisma migrate dev

# Start development servers
npm run dev  # from root
```

### Access Points
- **Web Dashboard:** http://localhost:3001
- **API:** http://localhost:3000
- **API Docs:** http://localhost:3000/api/docs
- **MinIO Console:** http://localhost:9001

---

## 📊 Project Structure

```
clipforge/
├── apps/
│   ├── api/                    # NestJS backend
│   │   ├── src/
│   │   │   ├── auth/          # Clerk authentication
│   │   │   ├── credits/       # Credit management
│   │   │   ├── payments/      # Stripe/Razorpay
│   │   │   ├── projects/      # Project CRUD
│   │   │   └── transcription/ # AI transcription
│   │   └── prisma/            # Database schema
│   └── web/                   # Next.js frontend
│       ├── app/               # App router pages
│       ├── components/        # React components
│       └── lib/               # Utilities
├── workers/                   # Python ML workers
│   ├── routers/
│   │   ├── asr.py            # Transcription
│   │   ├── ranker.py         # Clip detection
│   │   └── render.py         # Video rendering
│   └── utils/                # ML utilities
├── docs/                     # Documentation
├── docker-compose.yml        # Local development
└── README.md                 # This file
```

---

## 📖 Documentation

### Primary Docs
- **[VISION_MISSION.md](./VISION_MISSION.md)** - Vision, mission, values, strategy
- **[CURRENT_STATUS.md](./CURRENT_STATUS.md)** - Current development status
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Technical architecture
- **[COMPLETE_PRODUCT_ROADMAP.md](./COMPLETE_PRODUCT_ROADMAP.md)** - Product roadmap
- **[STRIPE_STATUS.md](./STRIPE_STATUS.md)** - Payment integration status

### Setup Guides
- **[DEVELOPER_QUICKSTART.md](./DEVELOPER_QUICKSTART.md)** - Developer setup
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Production deployment
- **[docs/PAYMENT_SETUP.md](./docs/PAYMENT_SETUP.md)** - Stripe/Razorpay setup

### API Documentation
- **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** - API reference
- **Swagger UI:** http://localhost:3000/api/docs (when running)

---

## 💡 Key Concepts

### Credit System
- **1 credit = 1 minute** of video processing
- Deducted on: upload, AI clips, reframe, subtitles, export
- **Automatic refund** if processing fails
- **Monthly reset** based on subscription tier

### Tier System
- **FREE:** 60 credits/mo (rollover to 120), watermarked, 48h project expiry
- **STARTER ($29/mo):** 150 credits (rollover to 300), no watermark, AI clipping, 7-day free trial
- **PRO ($79/mo):** 300 credits (rollover to 600), team workspace, brand templates
- **BUSINESS (Custom):** Unlimited credits, API access, SLA

### Product-Led Growth
- **Free tier** with watermark drives viral adoption
- **Self-service** onboarding (<5 min to first clip)
- **Contextual upgrades** based on usage patterns
- **Transparent pricing** with no hidden fees

---

## 🎨 Design Philosophy

**Inspired by:** Opus Clip, Podcastle, Loom, Descript

**Key Principles:**
1. **Simplicity** - Every feature is self-explanatory
2. **Speed** - Minimize clicks and loading times
3. **Delight** - Smooth animations, satisfying interactions
4. **Trust** - Clear feedback, no surprises
5. **Growth** - Built-in virality through watermarks

---

## 🏆 Competitive Advantages

### vs. Opus Clip
- ✅ More affordable ($29 vs $39)
- ✅ Better caption customization (14 styles)
- ✅ Multi-gateway payments (Stripe + Razorpay)
- ✅ Open architecture (self-hostable)

### vs. Podcastle
- ✅ Better AI clip detection
- ✅ More caption styles (14 vs 5)
- ✅ Faster processing
- ✅ Better virality scoring

### vs. Manual Editing
- ✅ 10x faster (5 min vs 2 hours)
- ✅ 20x cheaper ($5 vs $100)
- ✅ No skills required
- ✅ Consistent quality

---

## 📈 Current Status (Nov 23, 2025)

### ✅ Completed (Week 1-3 Day 1)

**Week 1: Foundation**
- Day 1-4: Clerk authentication & JWT verification
- Day 5-7: Payment integration (Stripe + Razorpay)

**Week 2: Core Features**
- Day 1-2: Credit system with rollover (2x cap)
- Day 3: Stripe product configuration
- Day 4-5: Watermark system implementation
- Day 6-7: Project expiry (48h for FREE tier)
- Day 8: Admin panel for user/credit management

**Week 3 Day 1: Growth & Analytics** ✅ COMPLETE
- ✅ 7-Day Free Trial System
  - Auto-activation on signup
  - STARTER tier access (150 credits)
  - Cron job for auto-expiry
  - Trial banner with countdown
- ✅ Credit Rollover System
  - 2x cap rollover (60→120, 150→300, 300→600)
  - Monthly reset with rollover
  - Transaction logging
- ✅ Downgrade Flow
  - Cancel subscription endpoint
  - Stripe webhook handling
  - Project expiry on downgrade
  - Trial-aware UI
- ✅ Mixpanel Analytics
  - Full event tracking
  - User identification
  - Page views, uploads, exports
  - Custom properties
- ✅ Bug Fixes
  - Dashboard video thumbnails (auth blob loading)
  - Project page credits API
  - Subscription page trial handling
  - Prisma enum updates

### 🔄 In Progress (Week 3 Day 2)
- API Documentation (Swagger/OpenAPI)
- Endpoint documentation
- Request/response schemas

### 📅 Next Steps (Week 3 Day 3-5)
- Day 3-4: Rate limiting & security
- Day 5: Caption styles expansion (14 → 20+)
- Day 6-7: Performance optimization

---

## �� Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

---

## 📄 License

Proprietary - All rights reserved

---

## 🔗 Links

- **Website:** https://clipforge.ai (coming soon)
- **Documentation:** https://docs.clipforge.ai (coming soon)
- **Support:** support@clipforge.ai
- **Twitter:** @clipforge_ai (coming soon)

---

## 🙏 Acknowledgments

Built with inspiration from:
- **Opus Clip** - Clean UI and virality scoring
- **Podcastle** - Creator-focused features
- **Loom** - Instant value and seamless sharing
- **Descript** - Accessible professional editing

Powered by:
- **OpenAI** - AI titles and descriptions
- **AssemblyAI** - Transcription
- **Stripe & Razorpay** - Payments
- **Clerk** - Authentication
- **Cloudflare** - CDN and storage

---

**Built with ❤️ for creators, by creators**

*Last updated: November 22, 2025*
