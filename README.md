# ClipForge

**Version:** 0.1.0 (MVP)  
**Status:** ✅ Production Ready

**ClipForge** is an AI-powered platform that transforms long-form video/audio into engaging social clips. It exposes a multi-tenant B2B API for partners and includes a modern web dashboard.

> 🎉 **v0.1.0 Released!** Core video upload, AI clip detection, and export functionality is now live. See [CHANGELOG.md](./CHANGELOG.md) for details.

## ✨ Features (v0.1.0)

### ✅ Implemented
- **Video Upload**: Upload videos to MinIO storage with progress tracking
- **AI Clip Detection**: Simulated AI analysis with scoring (hook, emotion, structure, novelty, clarity, quote, vision_focus)
- **Video Streaming**: Authenticated blob-based video playback
- **Clip Export**: FFmpeg-powered video cutting with timestamp-based segmentation
- **Download Clips**: Download exported clips as MP4 files
- **Web Dashboard**: Modern UI with project management and detailed clip information
- **Authentication**: JWT-based auth + API keys for partners
- **Multi-tenancy**: Organization-based project isolation

### 🚧 Planned (See [ROADMAP.md](./ROADMAP.md))
- **Real AI Models**: Replace simulated detection with actual ML models (v0.2.0)
- **ASR**: Multilingual transcription + diarization (v0.2.0)
- **Advanced Styling**: Captions, brand kits, intro/outro, progress bars (v0.3.0)
- **Reframing**: Face-aware dynamic crop, multiple aspect ratios (v0.3.0)
- **Social Publishing**: Direct upload to YouTube Shorts, TikTok, Instagram (v0.4.0)
- **Analytics**: Track export performance and improve ranking (v0.4.0)

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Next.js Web App (3001)                   │
│              Dashboard, Upload, Export UI                    │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│              NestJS Control Plane API (3000)                 │
│    Auth, Projects, Ingestion, Jobs, Webhooks, Metering      │
└────────────────┬─────────────────────────────┬──────────────┘
                 │                             │
    ┌────────────▼────────────┐    ┌──────────▼──────────┐
    │  FastAPI ML Workers     │    │  Postgres + Redis   │
    │  (ASR, Ranker, Render)  │    │  (8000)             │
    │  (8000)                 │    └─────────────────────┘
    └────────────┬────────────┘
                 │
    ┌────────────▼────────────┐
    │  S3/R2 + CloudFront CDN │
    │  (Storage & Delivery)   │
    └─────────────────────────┘
```

## Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js 18+
- Python 3.10+
- PostgreSQL 14+
- Redis 7+

### Setup

```bash
# Clone and install
git clone <repo>
cd clipforge
cp .env.example .env

# Start services
docker-compose up -d

# Install dependencies
cd apps/api && npm install
cd ../web && npm install
cd ../../workers && pip install -r requirements.txt

# Run migrations
cd ../apps/api && npm run prisma:migrate

# Start dev servers
npm run dev  # from root
```

Visit:
- **Web**: http://localhost:3001
- **API**: http://localhost:3000
- **API Docs**: http://localhost:3000/api/docs

## Project Structure

```
clipforge/
├── apps/
│   ├── api/                    # NestJS control plane
│   │   ├── src/
│   │   │   ├── auth/
│   │   │   ├── projects/
│   │   │   ├── ingestion/
│   │   │   ├── clips/
│   │   │   ├── exports/
│   │   │   ├── brand-kits/
│   │   │   ├── webhooks/
│   │   │   └── usage/
│   │   ├── prisma/
│   │   │   └── schema.prisma
│   │   └── package.json
│   └── web/                    # Next.js dashboard
│       ├── app/
│       ├── components/
│       ├── lib/
│       └── package.json
├── workers/                    # FastAPI ML services
│   ├── asr/
│   ├── ranker/
│   ├── render/
│   └── requirements.txt
├── sdks/
│   ├── ts/                     # TypeScript SDK
│   └── python/                 # Python SDK
├── docker-compose.yml
├── Dockerfile.api
├── Dockerfile.workers
└── README.md
```

## API Overview

### Authentication

All API requests require an API key or OAuth2 token:

```bash
curl -H "X-Api-Key: your-api-key" http://localhost:3000/v1/projects
```

### Core Endpoints

- `POST /v1/uploads/sign` - Get presigned upload URL
- `POST /v1/projects` - Create project
- `POST /v1/projects/:id/ingest` - Attach source
- `POST /v1/projects/:id/detect` - Run highlight detection (async)
- `GET /v1/projects/:id/clips` - List ranked clips
- `POST /v1/clips/:clipId/export` - Render to MP4/SRT
- `GET /v1/exports/:id` - Get export status
- `POST /v1/brand-kits` - Create/update brand kit
- `GET /v1/usage` - Usage metering

See [OpenAPI spec](./openapi.json) for full details.

## Development

### Running Tests

```bash
# API tests
cd apps/api && npm test

# Worker tests
cd workers && pytest

# SDK tests
cd sdks/ts && npm test
cd sdks/python && pytest
```

### Database Migrations

```bash
cd apps/api
npm run prisma:migrate -- --name add_feature
npm run prisma:generate
```

### Building for Production

```bash
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up
```

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for Kubernetes, AWS, and GCP guides.

## 📚 Documentation

- **[ROADMAP.md](./ROADMAP.md)** - Product roadmap and future plans
- **[CHANGELOG.md](./CHANGELOG.md)** - Version history and changes
- **[PROGRESS.md](./PROGRESS.md)** - Development progress tracker
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System architecture details
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Deployment guides
- **[partners/INTEGRATION_GUIDE.md](./partners/INTEGRATION_GUIDE.md)** - Partner API integration

## 🤝 Contributing

We welcome contributions! Please see our roadmap and open issues.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 Version History

- **v0.1.0** (Nov 5, 2025) - Initial MVP release

See [CHANGELOG.md](./CHANGELOG.md) for detailed version history.

## 📞 Support

- **Documentation**: See `/docs` directory
- **Issues**: GitHub Issues
- **Email**: support@clipforge.dev

## License

MIT
