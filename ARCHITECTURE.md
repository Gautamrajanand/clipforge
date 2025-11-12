# ClipForge Architecture
**Last Updated:** November 12, 2025 (Phase 1 Complete)

---

## System Overview

ClipForge is a self-hosted, AI-powered video repurposing platform that transforms long-form videos into platform-optimized clips using multi-factor analysis and machine learning.

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        CLIPFORGE SYSTEM (v0.4.0)                        │
│                     Phase 1: Scalability Complete ✅                     │
└─────────────────────────────────────────────────────────────────────────┘

                         ┌──────────────────┐
                         │   End Users      │
                         │   (Web Browser)  │
                         └────────┬─────────┘
                                  │
                         ┌────────▼─────────┐
                         │  Next.js Web App │
                         │  (Port 3001)     │
                         │  ┌─────────────┐ │
                         │  │ Dashboard   │ │
                         │  │ Upload UI   │ │
                         │  │ Clips Grid  │ │
                         │  │ Settings    │ │
                         │  └─────────────┘ │
                         └────────┬─────────┘
                                  │ HTTP/REST
                         ┌────────▼─────────────────────┐
                         │  NestJS API (Port 3000)      │
                         │  ┌─────────────────────────┐ │
                         │  │ Auth & Projects         │ │
                         │  │ Clips & Transcripts     │ │
                         │  │ Exports & Brand Kits    │ │
                         │  │ ✨ Health Checks        │ │
                         │  │ ✨ Queue Monitoring     │ │
                         │  └─────────────────────────┘ │
                         └──┬────┬────┬────┬───────────┘
                            │    │    │    │
           ┌────────────────┘    │    │    └──────────────────┐
           │                     │    │                       │
      ┌────▼────┐          ┌─────▼────▼──────┐        ┌─────▼──────┐
      │FastAPI  │          │ ✨ Redis         │        │ PostgreSQL │
      │ML Worker│          │ (Job Queues)     │        │ (Database) │
      │(Port    │          │ ┌──────────────┐ │        │ + Pooling  │
      │8000)    │          │ │ BullMQ       │ │        │ (20 conn)  │
      │┌───────┐│          │ │ - video-     │ │        └────────────┘
      ││Ranker ││          │ │   import     │ │
      ││Engine ││          │ │ - transcribe │ │        ┌────────────┐
      │└───────┘│          │ │ - detect     │ │        │   MinIO    │
      └─────────┘          │ │ - export     │ │        │ (Storage)  │
                           │ └──────────────┘ │        └────────────┘
                           │ Rate Limiting    │
                           │ Caching          │        ┌────────────┐
                           └──────────────────┘        │ AssemblyAI │
                                                       │  (External)│
                                                       └────────────┘

✨ = Phase 1 Additions (Job Queues, Health Checks, Connection Pooling)
```

---

## Core Components

### 1. Web Application (Next.js)
**Port:** 3001  
**Technology:** Next.js 14, React, TypeScript, TailwindCSS

**Responsibilities:**
- User interface and experience
- Project management
- Clip visualization
- Settings configuration
- Real-time progress updates

**Key Files:**
- `apps/web/app/dashboard/page.tsx` - Main dashboard
- `apps/web/app/project/[id]/page.tsx` - Project detail view
- `apps/web/components/clips/ClipsGrid.tsx` - Clips display
- `apps/web/components/clips/TranscriptViewer.tsx` - Pro Clips visualization

---

### 2. API Server (NestJS)
**Port:** 3000  
**Technology:** NestJS, TypeScript, Prisma ORM

**Responsibilities:**
- REST API endpoints
- Authentication & authorization
- Business logic orchestration
- Database operations
- File upload handling
- ✨ **Job queue management (BullMQ)**
- ✨ **Health checks & monitoring**
- ✨ **Queue metrics API**

**Key Modules:**

#### Projects Module
- Create, read, update, delete projects
- Video upload and storage
- Project status management

#### Clips Module
- List clips for project
- Generate Basic Clips (FREE tier)
- **Generate Pro Clips (PRO tier)** 🆕
- Clip metadata management

#### Transcription Module
- Trigger transcription jobs
- Fetch transcripts from AssemblyAI
- Store transcript data

#### Video Module
- **FFmpeg video processing** 🆕
- **Multi-segment stitching** 🆕
- Aspect ratio conversion (future)
- Caption burning (future)

**Key Files:**
- `apps/api/src/clips/clips.service.ts` - Clip orchestration
- `apps/api/src/video/ffmpeg.service.ts` - Video processing
- `apps/api/src/transcription/transcription.service.ts` - Transcription
- ✨ `apps/api/src/queues/queues.module.ts` - Job queue configuration
- ✨ `apps/api/src/queues/queues.service.ts` - Queue management
- ✨ `apps/api/src/queues/processors/*.processor.ts` - Job processors
- ✨ `apps/api/src/health/health.controller.ts` - Health checks

#### ✨ Queues Module (Phase 1)
- **Video Import Queue** - Downloads videos from URLs
- **Transcription Queue** - Generates transcripts
- **Clip Detection Queue** - Analyzes transcripts for clips
- **Video Export Queue** - Renders final clips
- **Features:**
  - Job persistence in Redis
  - Automatic retry (3 attempts, exponential backoff)
  - Progress tracking (0-100%)
  - Concurrency control per queue
  - Job monitoring API

#### ✨ Health Module (Phase 1)
- **GET /health** - Overall system health
- **GET /health/live** - Liveness probe (Kubernetes)
- **GET /health/ready** - Readiness probe (Kubernetes)
- **Checks:** Database, Redis, Storage connectivity

#### ✨ Queue Monitoring (Phase 1)
- **GET /v1/queues/metrics** - All queue statistics
- **GET /v1/queues/:queue/metrics** - Specific queue metrics
- **GET /v1/queues/:queue/jobs/:id** - Job status & progress

---

### 3. ML Workers (FastAPI)
**Port:** 8000  
**Technology:** Python, FastAPI, scikit-learn, OpenAI

**Responsibilities:**
- AI-powered clip detection
- Multi-segment detection (Pro Clips)
- Feature extraction and scoring
- Title and description generation

**Key Endpoints:**

#### POST /v1/ranker/detect
Generate Basic Clips (single-segment)
```json
{
  "projectId": "...",
  "transcriptId": "...",
  "numClips": 5,
  "clipLength": 45
}
```

#### POST /v1/ranker/detect-pro 🆕
Generate Pro Clips (multi-segment)
```json
{
  "projectId": "...",
  "transcriptId": "...",
  "numClips": 3,
  "targetDuration": 45.0
}
```

**Key Files:**
- `workers/routers/ranker.py` - API endpoints
- `workers/services/ranker_engine.py` - Detection algorithms
- `workers/services/database.py` - Database access

---

### 4. Database (PostgreSQL)
**Port:** 5432  
**Technology:** PostgreSQL 15, Prisma ORM

**Key Tables:**

#### Project
- Video metadata
- Processing status
- Clip settings (JSON)
- Timestamps

#### Moment (Clips)
- Start/end times
- Score and features
- Title and description
- **Segment data (JSON)** 🆕
- **isProClip flag** 🆕
- Aspect ratio

#### Transcript
- Full transcript text
- Word-level data (JSON)
- Speaker diarization
- Timestamps

---

### 5. Storage (MinIO)
**Ports:** 9000 (API), 9001 (Console)  
**Technology:** MinIO (S3-compatible)

**Buckets:**
- `clipforge` - All video files and clips

**File Structure:**
```
clipforge/
  projects/
    {projectId}/
      original.mp4
      clips/
        clip_001.mp4
        clip_002.mp4
        pro_clip_001.mp4  🆕
```

---

### 6. Queue (Redis)
**Port:** 6379  
**Technology:** Redis 7

**Responsibilities:**
- Job queue for async processing
- Caching (future)
- Session storage (future)

---

## Data Flow

### Basic Clips Generation (FREE Tier)

```
1. User uploads video
   ↓
2. API stores in MinIO
   ↓
3. API triggers transcription (AssemblyAI)
   ↓
4. AssemblyAI returns transcript
   ↓
5. API calls ML Worker /v1/ranker/detect
   ↓
6. ML Worker:
   - Analyzes transcript
   - Scores segments
   - Generates AI titles/descriptions
   - Returns top clips
   ↓
7. API saves clips to database
   ↓
8. User sees clips in UI
```

### Pro Clips Generation (PRO Tier) 🆕

```
1. User clicks "✨ Pro Clips" button
   ↓
2. Frontend calls POST /v1/projects/:id/clips/pro
   ↓
3. API calls ML Worker /v1/ranker/detect-pro
   ↓
4. ML Worker:
   - Scores all segments
   - Finds 2-4 high-value segments
   - Ensures well-spaced (5s+ apart)
   - Returns segment combinations
   ↓
5. API receives segment data
   ↓
6. API calls FFmpegService.createMultiSegmentClip()
   ↓
7. FFmpeg Service:
   - Extracts each segment to temp file
   - Stitches segments together
   - Optionally adds crossfades
   - Outputs final clip
   ↓
8. API saves Pro Clip to database
   - Stores segment metadata
   - Sets isProClip = true
   ↓
9. Frontend refreshes clips list
   ↓
10. User sees Pro Clip with TranscriptViewer
```

---

## AI/ML Pipeline

### Feature Extraction

The RankerEngine analyzes transcripts using multiple factors:

1. **Hook (28%)** - Attention-grabbing elements
   - Questions
   - Numbers and statistics
   - Power words
   - Curiosity triggers

2. **Novelty (16%)** - Unique or surprising content
   - Rare words
   - Unexpected insights
   - New information

3. **Structure (14%)** - Well-organized content
   - Clear beginning/middle/end
   - Logical flow
   - Transitions

4. **Emotion (14%)** - Emotional resonance
   - Sentiment analysis
   - Emotional words
   - Intensity

5. **Clarity (12%)** - Easy to understand
   - Simple language
   - Clear explanations
   - Concise statements

6. **Quote (10%)** - Memorable quotes
   - Quotable phrases
   - Shareable content
   - Impact

7. **Vision Focus (6%)** - Visual elements (future)
   - Face detection
   - Action detection
   - Scene changes

### Scoring Formula

```python
score = (
    0.28 * hook +
    0.16 * novelty +
    0.14 * structure +
    0.14 * emotion +
    0.12 * clarity +
    0.10 * quote +
    0.06 * vision_focus
)
```

### Multi-Segment Detection 🆕

```python
def detect_multi_segment_clips():
    # 1. Score all segments
    segments = score_all_segments()
    
    # 2. Sort by score
    segments.sort(key=lambda s: s.score, reverse=True)
    
    # 3. Find combinations
    for num_segments in [3, 2, 4]:
        combination = find_best_combination(
            segments,
            num_segments,
            target_duration=45.0,
            min_gap=5.0
        )
        
        if combination:
            return combination
```

---

## Video Import System

### URL Import (v0.3.0)

ClipForge supports importing videos directly from URLs, eliminating the need for users to download videos locally first.

#### Supported Platforms
- **YouTube**: All formats, playlists, live streams
- **Vimeo**: Public and unlisted videos
- **Rumble**: All public videos
- **Twitter/X**: Video tweets
- **TikTok**: All public videos

#### Architecture

**VideoDownloadService** (`apps/api/src/video/video-download.service.ts`)
- Platform detection from URL
- Video metadata extraction using yt-dlp
- Async video download with progress tracking
- Temporary file management and cleanup

**Import Flow:**
1. User submits URL via frontend modal
2. Frontend creates project with temporary title
3. Backend validates URL and platform
4. yt-dlp extracts video metadata (title, duration, thumbnail)
5. Video downloaded to `/tmp/clipforge/downloads/`
6. File uploaded to MinIO storage
7. Project updated with video title and metadata
8. Temporary file cleaned up
9. Transcription and clip detection triggered automatically

**Project Status Flow:**
```
PENDING → IMPORTING → INGESTING → TRANSCRIBING → DETECTING → READY
```

**New Status Values:**
- `IMPORTING`: Downloading video from URL (1-3 minutes)
- `ERROR`: Import or processing failed

#### Technical Implementation

**Dependencies:**
- `yt-dlp`: Video download and metadata extraction
- `python3-pip`: Package manager for yt-dlp
- Installed in Docker container via `Dockerfile.api`

**API Endpoint:**
```
POST /v1/projects/:id/import-url
Body: { url: string, title?: string }
```

**Frontend Components:**
- `UploadModal.tsx`: Tabbed interface (Upload File | Import from URL)
- `dashboard/page.tsx`: Import handler with status polling

**Performance:**
- Async processing (non-blocking)
- 4-minute polling timeout
- Automatic cleanup of temp files
- Memory-efficient streaming

---

## Video Processing Pipeline

### FFmpeg Operations

#### 1. Extract Segment
```bash
ffmpeg -i input.mp4 \
  -ss {start_time} \
  -t {duration} \
  -c:v libx264 \
  -c:a aac \
  -preset fast \
  -crf 23 \
  segment.mp4
```

#### 2. Simple Concatenation (Fast)
```bash
# Create concat file
file 'segment1.mp4'
file 'segment2.mp4'
file 'segment3.mp4'

# Concat without re-encoding
ffmpeg -f concat -safe 0 \
  -i concat.txt \
  -c copy \
  output.mp4
```

#### 3. Crossfade Stitching (Professional)
```bash
ffmpeg -i segment1.mp4 -i segment2.mp4 -i segment3.mp4 \
  -filter_complex "
    [0:v][1:v]xfade=transition=fade:duration=0.3[v1];
    [v1][2:v]xfade=transition=fade:duration=0.3[vout];
    [0:a][1:a]acrossfade=d=0.3[a1];
    [a1][2:a]acrossfade=d=0.3[aout]
  " \
  -map "[vout]" -map "[aout]" \
  -c:v libx264 -c:a aac \
  output.mp4
```

---

## API Endpoints

### Projects

```
GET    /v1/projects              List all projects
POST   /v1/projects              Create project
GET    /v1/projects/:id          Get project details
PUT    /v1/projects/:id          Update project
DELETE /v1/projects/:id          Delete project
POST   /v1/projects/:id/detect   Generate Basic Clips
```

### Clips

```
GET    /v1/projects/:projectId/clips     List clips
GET    /v1/projects/:projectId/clips/:id Get clip details
POST   /v1/projects/:projectId/clips/pro Generate Pro Clips 🆕
```

### Transcription

```
POST   /v1/transcription/start   Start transcription
GET    /v1/transcription/:id     Get transcript
```

---

## Security

### Authentication
- JWT tokens
- Session management
- API key support (future)

### Authorization
- Role-based access control
- Organization-based permissions
- Resource ownership validation

### Data Protection
- Encrypted storage
- Secure file uploads
- HTTPS only
- CORS configuration

---

## Scalability

### Current Capacity
- Single server deployment
- Docker Compose orchestration
- Suitable for 100-1000 users

### Future Scaling
- Kubernetes deployment
- Horizontal scaling of ML workers
- CDN for video delivery
- Database read replicas
- Redis cluster for queue

---

## Monitoring & Logging

### Logging
- Structured JSON logs
- Log levels: ERROR, WARN, INFO, DEBUG
- Request/response logging
- Performance metrics

### Monitoring (Future)
- Prometheus metrics
- Grafana dashboards
- Alert management
- Error tracking (Sentry)

---

## Development Environment

### Prerequisites
- Docker & Docker Compose
- Node.js 18+
- Python 3.10+
- OpenAI API key
- AssemblyAI API key

### Setup
```bash
# Clone repository
git clone https://github.com/Gautamrajanand/clipforge.git

# Copy environment variables
cp .env.example .env

# Start services
docker compose up -d

# Access
Web: http://localhost:3001
API: http://localhost:3000
ML Workers: http://localhost:8000
MinIO Console: http://localhost:9001
```

---

## Technology Stack

### Frontend
- **Framework:** Next.js 14
- **Language:** TypeScript
- **Styling:** TailwindCSS
- **UI Components:** Custom + Lucide icons
- **State:** React hooks

### Backend
- **API:** NestJS
- **ML Workers:** FastAPI
- **Language:** TypeScript, Python
- **ORM:** Prisma
- **Validation:** class-validator

### Database & Storage
- **Database:** PostgreSQL 15
- **Cache/Queue:** Redis 7
- **Storage:** MinIO (S3-compatible)

### AI/ML
- **LLM:** OpenAI GPT-3.5-turbo
- **Transcription:** AssemblyAI
- **ML:** scikit-learn, numpy

### Video Processing
- **Engine:** FFmpeg
- **Library:** fluent-ffmpeg (Node.js)

### DevOps
- **Containers:** Docker
- **Orchestration:** Docker Compose
- **CI/CD:** GitHub Actions (future)

---

## Performance Metrics

### Current Performance

**Basic Clips:**
- Upload: ~5-10s for 100MB video
- Transcription: ~1min per 10min video
- Detection: ~2-5s
- Total: ~2-3min for 10min video

**Pro Clips:**
- Detection: ~3-5s
- Stitching (Simple): ~1-2s per clip
- Stitching (Crossfade): ~10-30s per clip
- Total: ~30-60s for 3 Pro Clips

### Optimization Targets
- Reduce transcription time (parallel processing)
- Optimize FFmpeg encoding (GPU acceleration)
- Cache common operations
- Batch processing

---

## Future Architecture

### Planned Improvements

1. **Microservices**
   - Separate transcription service
   - Dedicated video processing service
   - Independent scaling

2. **CDN Integration**
   - CloudFlare R2 or AWS CloudFront
   - Global video delivery
   - Reduced latency

3. **Real-time Updates**
   - WebSocket connections
   - Live progress updates
   - Collaborative editing

4. **Advanced ML**
   - Custom models for clip detection
   - Fine-tuned on user feedback
   - A/B testing framework

---

## Caption System Architecture

### Overview
ClipForge features a comprehensive caption burning system with 14 professional styles optimized for viral social media content.

### Components

**1. Caption Animator Service** (`caption-animator.service.ts`)
- Frame-by-frame rendering using `node-canvas`
- Supports 14 animated and static styles
- Dynamic positioning (55-60% height for optimal face framing)
- Memory-optimized batch processing (100 frames at a time)
- Chunk-aware rendering for long clips

**2. Chunk Manager Service** (`chunk-manager.service.ts`) ✨ NEW
- Splits long clips into 8-second chunks
- Smart boundary detection at sentence ends
- Word timing adjustment per chunk
- Chunk validation and metadata

**3. Video Merger Service** (`video-merger.service.ts`) ✨ NEW
- Seamless concatenation with FFmpeg concat demuxer
- Chunk validation (resolution, codec, FPS)
- Support for cut and fade transitions
- Automatic cleanup of temporary files

**2. Caption Styles** (`caption-styles.ts`)
```typescript
interface CaptionStylePreset {
  id: string;
  name: string;
  fontFamily: string;
  fontSize: number;
  textColor: string;
  backgroundColor: string;
  position: 'top' | 'center' | 'bottom';
  stroke: { color: string; width: number };
  shadow?: { offsetX: number; offsetY: number; blur: number; color: string };
}
```

**3. Available Styles**

| Style | Type | Animation | Font Size | Best For |
|-------|------|-----------|-----------|----------|
| Minimal | Static | None | 46px | Clean, simple |
| Bold | Animated | Pop-in | 56px | Attention-grabbing |
| Elegant | Animated | Slide-up | 48px | Professional |
| Modern | Animated | Fade-in | 50px | Contemporary |
| Karaoke | Animated | Word highlight | 48px | Sing-along |
| Podcast | Static | None | 48px | Interviews |
| MrBeast | Animated | Scale bounce | 95px | Viral TikTok |
| Neon | Animated | Glow pulse | 85px | Gen Z content |
| Highlight | Animated | Box slide | 90px | Hormozi style |
| Rainbow | Animated | Color rotation | 95px | Max engagement |
| Fill | Animated | Progressive fill | 90px | Dynamic reveals |
| 3D Shadow | Animated | Depth effect | 95px | Bold statements |
| Tricolor | Animated | Accent word | 90px | Emphasis |
| Bounce | Animated | Vertical bounce | 95px | Motivational |

**4. Technical Details**

**Frame Generation:**
- 30 FPS rendering
- PNG format with transparency
- 1-2 words per caption line (12 char max)
- Batch processing for memory efficiency

**Animation Parameters:**
- Duration: 15% of word duration
- Scale range: 0.3 → 1.5 (strong pop)
- Positioning: 58% height (below subject's head)
- Word spacing: 30px

**Memory Management:**
- Chunked rendering for clips >15 seconds
- 8-second chunks (240 frames @ 30fps)
- Batch processing (100 frames)
- Garbage collection hints
- 2-second recovery pause between chunks
- Frame cleanup after overlay

**FFmpeg Integration:**
```bash
ffmpeg -i input.mp4 -framerate 30 -i frames/caption_%06d.png \
  -filter_complex "[0:v][1:v]overlay=0:0" \
  -c:v libx264 -preset fast output.mp4
```

**5. Duration Support** ✅ UPDATED

| Style Type | Max Duration | Processing Method |
|------------|--------------|-------------------|
| Animated | 90+ seconds | Chunked rendering (8s chunks) |
| Karaoke | Unlimited | ASS subtitle burning (efficient) |
| Static | Unlimited | ASS subtitle burning (efficient) |

**Processing Flow:**
- **≤15s clips:** Single-pass rendering (fast, ~30-60 seconds)
- **>15s clips:** Automatic chunked rendering
  1. Split into 8-second chunks
  2. Process each chunk sequentially
  3. 2-second memory recovery between chunks
  4. Seamless concatenation
  5. Total time: ~5-10 minutes for 60-90s clips

**6. Future Enhancements**
- ✅ ~~Support for 60-90 second clips~~ **COMPLETE**
- WebSocket progress events for chunked rendering
- Parallel chunk processing
- Custom style editor
- Style presets per platform
- Multi-language support
- Real-time preview

---

## Summary

ClipForge is a modern, scalable platform built with:
- ✅ **Clean Architecture** - Separation of concerns
- ✅ **Modern Stack** - Latest technologies
- ✅ **AI-Powered** - GPT-3.5 + custom ML
- ✅ **Production-Ready** - Robust error handling
- ✅ **Extensible** - Easy to add features
- ✅ **Self-Hosted** - Full control

**Status:** Production-ready for FREE tier, PRO tier core complete and ready for testing.
