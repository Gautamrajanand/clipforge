# ClipForge Architecture

## System Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                         CLIPFORGE SYSTEM ARCHITECTURE                         │
└──────────────────────────────────────────────────────────────────────────────┘

                              ┌─────────────────────┐
                              │  End Users / SDKs   │
                              │  (Web, Mobile, API) │
                              └──────────┬──────────┘
                                         │
                    ┌────────────────────┼────────────────────┐
                    │                    │                    │
        ┌───────────▼──────────┐  ┌──────▼────────┐  ┌──────▼──────────┐
        │   Next.js Web App    │  │  TS SDK       │  │  Python SDK     │
        │   (3001)             │  │  (npm pkg)    │  │  (pip pkg)      │
        │ ┌─────────────────┐  │  └───────────────┘  └─────────────────┘
        │ │ Dashboard       │  │
        │ │ Upload UI       │  │
        │ │ Export Builder  │  │
        │ │ Analytics       │  │
        │ └─────────────────┘  │
        └──────────┬───────────┘
                   │ HTTP/REST
                   │
        ┌──────────▼──────────────────────────────────────────────┐
        │      NestJS Control Plane API (3000)                    │
        │  ┌────────────────────────────────────────────────────┐ │
        │  │ • Auth (JWT + API Keys + OAuth2)                  │ │
        │  │ • Projects & Assets Management                    │ │
        │  │ • Ingestion (file upload, URL parsing)            │ │
        │  │ • Clips & Moments (ranking, scoring)              │ │
        │  │ • Exports (render jobs, status)                   │ │
        │  │ • Brand Kits (org styling)                        │ │
        │  │ • Webhooks (event delivery)                       │ │
        │  │ • Usage Metering & Rate Limits                    │ │
        │  │ • Job Orchestration (via Redis queue)             │ │
        │  └────────────────────────────────────────────────────┘ │
        └──────────┬───────────────────────────────────────────────┘
                   │
        ┌──────────┴──────────┬────────────────────┬──────────────┐
        │                     │                    │              │
        │                     │                    │              │
   ┌────▼────┐          ┌─────▼──────┐      ┌─────▼──────┐  ┌───▼────┐
   │ Postgres │          │   Redis    │      │  S3/R2     │  │ Stripe │
   │ (Data)   │          │   (Queue)  │      │  (Storage) │  │(Billing)
   └──────────┘          └────────────┘      └────────────┘  └────────┘
                              │
                              │ Job Queue
                              │
        ┌─────────────────────▼──────────────────────────┐
        │   FastAPI ML Worker Services (8000+)           │
        │  ┌──────────────────────────────────────────┐  │
        │  │ ASR Worker (Whisper/AssemblyAI)         │  │
        │  │ • Transcription                         │  │
        │  │ • Diarization                           │  │
        │  │ • Language detection                    │  │
        │  └──────────────────────────────────────────┘  │
        │  ┌──────────────────────────────────────────┐  │
        │  │ Ranker Worker (Highlight Detection)     │  │
        │  │ • Feature extraction                    │  │
        │  │ • Scoring (heuristic + ML)              │  │
        │  │ • Windowing & segmentation              │  │
        │  └──────────────────────────────────────────┘  │
        │  ┌──────────────────────────────────────────┐  │
        │  │ Render Worker (FFmpeg + Styling)        │  │
        │  │ • Video composition                     │  │
        │  │ • Caption rendering                    │  │
        │  │ • Reframing (9:16, 1:1, 16:9)          │  │
        │  │ • Audio normalization                  │  │
        │  │ • Watermark & branding                 │  │
        │  └──────────────────────────────────────────┘  │
        │  ┌──────────────────────────────────────────┐  │
        │  │ Publish Worker (YouTube Shorts v1)      │  │
        │  │ • Video upload                          │  │
        │  │ • Metadata + thumbnails                 │  │
        │  │ • Scheduling                            │  │
        │  └──────────────────────────────────────────┘  │
        └──────────────────────────────────────────────────┘
                              │
                              │ GPU (Runpod/Modal)
                              │
        ┌─────────────────────▼──────────────────────────┐
        │   GPU Compute (Optional - for heavy models)    │
        │  • Whisper large models                       │
        │  • Vision models (face detection)             │
        │  • LightGBM ranker inference                  │
        └──────────────────────────────────────────────────┘

        ┌──────────────────────────────────────────────────┐
        │  CDN (CloudFront / Cloudflare)                  │
        │  • Presigned URLs (upload/download)            │
        │  • Video delivery (MP4, SRT)                    │
        │  • Thumbnail caching                           │
        └──────────────────────────────────────────────────┘
```

## Data Flow Diagram

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                         CLIPFORGE DATA FLOW (E2E)                             │
└──────────────────────────────────────────────────────────────────────────────┘

1. UPLOAD & INGESTION
   ┌─────────────┐
   │ User Upload │
   │ (file/URL)  │
   └──────┬──────┘
          │
          ▼
   ┌──────────────────────┐
   │ API: POST /ingest    │
   │ • Validate input     │
   │ • Generate presigned │
   │   upload URL         │
   │ • Create Project     │
   └──────┬───────────────┘
          │
          ▼
   ┌──────────────────────┐
   │ S3/R2 Storage        │
   │ (original video)     │
   └──────┬───────────────┘
          │
          │ Enqueue INGEST job
          ▼
   ┌──────────────────────┐
   │ Redis Queue          │
   │ (job: INGEST)        │
   └──────┬───────────────┘

2. TRANSCRIPTION (ASR)
          │
          ▼
   ┌──────────────────────┐
   │ ASR Worker           │
   │ • Download video     │
   │ • Run Whisper        │
   │ • Extract words[]    │
   │ • Diarization        │
   └──────┬───────────────┘
          │
          ▼
   ┌──────────────────────┐
   │ Postgres             │
   │ Store Transcript     │
   │ (words, speakers)    │
   └──────┬───────────────┘
          │
          │ Enqueue DETECT job
          ▼
   ┌──────────────────────┐
   │ Redis Queue          │
   │ (job: DETECT)        │
   └──────┬───────────────┘

3. HIGHLIGHT DETECTION (RANKER)
          │
          ▼
   ┌──────────────────────┐
   │ Ranker Worker        │
   │ • Fetch transcript   │
   │ • Extract features   │
   │   - Hook phrases     │
   │   - Audio energy     │
   │   - Speaker swaps    │
   │   - Emotion signals  │
   │ • Score windows      │
   │ • Rank top 6-12      │
   └──────┬───────────────┘
          │
          ▼
   ┌──────────────────────┐
   │ Postgres             │
   │ Store Moments        │
   │ (clips + scores)     │
   └──────┬───────────────┘
          │
          │ Webhook: job.completed
          ▼
   ┌──────────────────────┐
   │ User Notified        │
   │ (clips ready)        │
   └──────┬───────────────┘

4. STYLING & REFRAMING
          │
          ▼
   ┌──────────────────────┐
   │ User selects clip    │
   │ + brand kit + template
   └──────┬───────────────┘
          │
          ▼
   ┌──────────────────────┐
   │ API: POST /export    │
   │ • Idempotency check  │
   │ • Enqueue RENDER job │
   └──────┬───────────────┘
          │
          ▼
   ┌──────────────────────┐
   │ Redis Queue          │
   │ (job: RENDER)        │
   └──────┬───────────────┘

5. RENDERING & EXPORT
          │
          ▼
   ┌──────────────────────┐
   │ Render Worker        │
   │ • Download source    │
   │ • Extract clip       │
   │ • Apply captions     │
   │   (emoji/keyword)    │
   │ • Reframe (9:16)     │
   │ • Add watermark      │
   │ • Normalize audio    │
   │ • Generate SRT/VTT   │
   │ • FFmpeg pipeline    │
   └──────┬───────────────┘
          │
          ▼
   ┌──────────────────────┐
   │ S3/R2 Storage        │
   │ (MP4, SRT, thumb)    │
   └──────┬───────────────┘
          │
          ▼
   ┌──────────────────────┐
   │ Postgres             │
   │ Store Export record  │
   │ + artifact URLs      │
   └──────┬───────────────┘
          │
          │ Webhook: export.ready
          ▼
   ┌──────────────────────┐
   │ User Notified        │
   │ (export ready)       │
   └──────┬───────────────┘

6. PUBLISHING (YouTube Shorts v1)
          │
          ▼
   ┌──────────────────────┐
   │ User clicks Publish  │
   │ (YouTube Shorts)     │
   └──────┬───────────────┘
          │
          ▼
   ┌──────────────────────┐
   │ API: POST /publish   │
   │ • Enqueue PUBLISH job
   └──────┬───────────────┘
          │
          ▼
   ┌──────────────────────┐
   │ Publish Worker       │
   │ • Download MP4       │
   │ • Upload to YouTube  │
   │ • Set metadata       │
   │ • Schedule publish   │
   └──────┬───────────────┘
          │
          ▼
   ┌──────────────────────┐
   │ YouTube Shorts       │
   │ (published)          │
   └──────┬───────────────┘
          │
          ▼
   ┌──────────────────────┐
   │ Postgres             │
   │ Update Export        │
   │ publishedTo: [...]   │
   └──────┬───────────────┘

7. ANALYTICS LOOP
          │
          ▼
   ┌──────────────────────┐
   │ Periodic sync        │
   │ (YouTube Analytics)  │
   │ • Views              │
   │ • Engagement         │
   │ • Retention          │
   └──────┬───────────────┘
          │
          ▼
   ┌──────────────────────┐
   │ Postgres             │
   │ Update Export        │
   │ metrics: {...}       │
   └──────┬───────────────┘
          │
          ▼
   ┌──────────────────────┐
   │ Ranker v2 (future)   │
   │ • Learn from metrics │
   │ • Improve scoring    │
   └──────────────────────┘
```

## Key Components

### Web App (Next.js)
- Dashboard: project list, status, analytics
- Upload: drag-drop, URL input, script text
- Clip Builder: preview, select moments, customize
- Export: brand kit selection, template choice, render
- Analytics: performance tracking, insights

### Control Plane API (NestJS)
- RESTful endpoints (OpenAPI 3.1)
- Multi-tenant auth (JWT + API Keys + OAuth2)
- Job orchestration (Redis queue)
- Webhook delivery (HMAC-signed)
- Rate limiting & usage metering
- Idempotency for POST endpoints

### ML Workers (FastAPI)
- **ASR**: Whisper/AssemblyAI transcription + diarization
- **Ranker**: Feature extraction + scoring + windowing
- **Render**: FFmpeg video composition + styling
- **Publish**: YouTube Shorts upload (v1)

### Storage & CDN
- **S3/R2**: Original videos, clips, SRT files, thumbnails
- **CloudFront/CF**: Presigned URLs, video delivery, caching

### Database (Postgres)
- Users, orgs, memberships, RBAC
- Projects, assets, transcripts
- Moments (clips), exports, brand kits
- API keys, webhooks, usage ledger
- Jobs (async processing state)

### Queue (Redis)
- BullMQ (if TS) or RQ (if Py)
- Job states: PENDING → RUNNING → COMPLETED/FAILED
- Retries, backpressure, dead-letter handling

### Billing (Stripe)
- Metered billing: minutes processed + exports
- Usage tracking per org
- Rate limits enforced per API key

### Observability
- OpenTelemetry (traces)
- Sentry (error tracking)
- Prometheus/Grafana (metrics)
- Structured logging (JSON)
