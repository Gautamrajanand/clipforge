# Core Flow Fixes - Implementation Summary

**Branch:** `feature/fix-core-flow`  
**Date:** November 6, 2025  
**Status:** Steps 1-4 Complete, Step 5-6 In Progress

---

## ✅ STEP 1: ASPECT RATIO PROCESSING

### Implementation
- **Smart Crop/Pad Strategy**: Analyzes content loss to decide between cropping and padding
- **Content Loss Threshold**: < 30% = crop, >= 30% = pad
- **FFmpeg Filters**: Production-ready filters for precise aspect ratio conversion

### Architecture
```
NestJS API → Python Worker → FFmpeg
```

### Key Files
- `workers/services/render_pipeline.py` - Enhanced with smart cropping logic
- `apps/api/src/exports/exports.service.ts` - Calls ML worker for processing
- `apps/api/prisma/migrations/20251106164126_add_export_processing_fields/`

### Supported Aspect Ratios
- **9:16** (1080x1920) - TikTok, Shorts, Reels
- **16:9** (1920x1080) - YouTube, LinkedIn
- **1:1** (1080x1080) - Instagram Square
- **4:5** (1080x1350) - Instagram Portrait

### Database Changes
```sql
ALTER TABLE "Export" ADD COLUMN "processingStatus" VARCHAR;
ALTER TABLE "Export" ADD COLUMN "processedUrl" VARCHAR;
ALTER TABLE "Export" ADD COLUMN "processingError" VARCHAR;
ALTER TABLE "Export" ADD COLUMN "processingStartedAt" TIMESTAMP;
ALTER TABLE "Export" ADD COLUMN "processingCompletedAt" TIMESTAMP;
```

---

## ✅ STEP 2: CAPTION STYLES

### Implementation
- **10 Preset Styles**: Inspired by OpusClip/Podcastle
- **ASS Generation**: Full styling with FFmpeg burn-in
- **Live Preview**: HTML/CSS overlay on video player
- **Keyword Painting**: Automatic color highlighting for numbers, proper nouns, emphasis

### Presets
1. **Karaoke** - Word-by-word highlight, big caps, bottom
2. **Deep Diver** - Centered, bold, large lines
3. **Pod P** - Bottom, clean blocks, minimal
4. **Popline** - Upper third, strong outline
5. **Seamless Bounce** - Subtle bounce entrance
6. **Beasty** - Heavy stroke, high contrast
7. **Youshaei** - Thin stroke, keyword paint
8. **Mozi** - Rounded pill backgrounds
9. **Glitch Infinite** - Short glitch-in effect
10. **Baby Earthquake** - Micro shake on emphasized words

### Key Files
- `workers/services/caption_presets.py` - 10 preset definitions
- `workers/services/caption_engine.py` - Enhanced with `generate_ass_with_preset()`
- `apps/web/components/captions/CaptionStyleSelector.tsx` - UI selector
- `apps/web/components/captions/CaptionPreview.tsx` - Live preview overlay

### Database Changes
```sql
ALTER TABLE "Export" ADD COLUMN "captionStyle" VARCHAR DEFAULT 'karaoke';
ALTER TABLE "Export" ADD COLUMN "captionsEnabled" BOOLEAN DEFAULT true;
```

### Features
- Karaoke progressive highlight with k-timings
- Keyword color painting (configurable)
- Indic/Hinglish font fallback chain
- Brand kit font override support
- Fade in/out animations
- Position control (top/center/bottom)

---

## ✅ STEP 3: TRANSCRIPTION PROXY

### Implementation
- **Secure Proxy**: JWT-based time-limited access (15min expiry)
- **Range Support**: HTTP Range requests for streaming
- **Webhook Handler**: AssemblyAI completion events
- **Real Transcripts**: No mocks, actual word timings

### Architecture
```
AssemblyAI → Proxy Endpoint (JWT) → MinIO
AssemblyAI → Webhook → NestJS → Database
```

### Key Files
- `apps/api/src/proxy/proxy-token.service.ts` - JWT generation/validation
- `apps/api/src/proxy/proxy.controller.ts` - Secure streaming endpoint
- `apps/api/src/webhooks/assemblyai-webhook.controller.ts` - Webhook handler
- `apps/api/src/storage/storage.service.ts` - Range request support

### Endpoints
```
GET /internal/assemblyai/pull/:assetId?token=xxx
POST /webhooks/assemblyai
```

### Database Changes
```sql
ALTER TABLE "Transcript" ADD COLUMN "externalId" VARCHAR UNIQUE;
ALTER TABLE "Transcript" ADD COLUMN "status" VARCHAR DEFAULT 'PENDING';
ALTER TABLE "Transcript" ADD COLUMN "completedAt" TIMESTAMP;
CREATE INDEX "Transcript_externalId_idx" ON "Transcript"("externalId");
CREATE INDEX "Transcript_status_idx" ON "Transcript"("status");
```

### Security
- JWT tokens with 15-minute expiry
- Org/project access verification
- HMAC SHA256 webhook signature verification
- Issuer/audience validation

### Transcript Data Structure
```json
{
  "text": "Full transcript text",
  "words": [
    {"text": "word", "start": 0.0, "end": 0.5, "confidence": 0.95}
  ],
  "segments": [
    {"text": "sentence", "start": 0.0, "end": 2.0, "speaker": "A"}
  ],
  "language": "en",
  "wpm": 150,
  "confidence": 0.92
}
```

---

## ✅ STEP 4: BOUNDARYING

### Implementation
- **Sentence Detection**: Punctuation-based boundary detection
- **Silence Detection**: FFmpeg silencedetect (-40dB, 0.3s min)
- **Smart Snapping**: Priority: silence > sentence > word boundary
- **Pre/Post-Roll**: 0.7s lead-in/out for natural feel
- **Duration Constraints**: 15-180s with balanced adjustment

### Algorithm
```
1. Find first/last words in clip window
2. Search for silences within ±1.0s
3. Search for sentence boundaries within ±1.0s
4. Apply pre-roll (0.7s) and post-roll (0.7s)
5. Enforce min/max duration constraints
6. Never cut mid-word
```

### Key Files
- `workers/services/boundary_detector.py` - Complete boundary detection logic
- `workers/routers/render.py` - Integrated into render pipeline

### Features
- **Sentence Boundaries**: Detects `.!?;:` punctuation
- **Silence Detection**: FFmpeg silencedetect with configurable thresholds
- **Search Window**: ±1.0s from target time
- **Pre-Roll**: 0.7s before first word
- **Post-Roll**: 0.7s after last word
- **Guardrails**: Never mid-word, respects duration limits

### Configuration
```python
SENTENCE_ENDINGS = r'[.!?;:]'
PRE_ROLL = 0.7  # seconds
POST_ROLL = 0.7  # seconds
BOUNDARY_SEARCH_WINDOW = 1.0  # ±1.0s
SILENCE_THRESHOLD = -40  # dB
SILENCE_MIN_DURATION = 0.3  # seconds
```

---

## 🚧 STEP 5: IN-PAGE PLAYBACK (TODO)

### Plan
- Generate lightweight proxy MP4 (720p, CRF 23)
- Add `proxyUrl` field to Moment model
- Build video player UI component
- Grid view with thumbnails and play buttons
- Lazy-load players for performance

### Database Changes Needed
```sql
ALTER TABLE "Moment" ADD COLUMN "proxyUrl" VARCHAR;
ALTER TABLE "Moment" ADD COLUMN "thumbnailUrl" VARCHAR;
```

---

## 🚧 STEP 6: COUNTERS (TODO)

### Plan
- Fix clip length/count bindings
- Add validation: length 15-180s, count 1-10
- Remove off-by-one errors
- Debounced server sync
- Inline validation messages

### Constraints
- Clip length: 15-180 seconds
- Clip count: 1-10
- Min ≤ Max validation
- Exact value display (no rounding)

---

## Feature Flags

All new features are behind feature flags:

```env
# Aspect ratio processing
FF_ASPECT_RATIO=false

# Caption styles
FF_CAPTION_STYLES=false

# In-page playback
FF_INPAGE_PLAYBACK=false
```

---

## Testing Strategy

### Unit Tests Needed
- [ ] Aspect ratio crop/pad math
- [ ] Caption preset ASS generation
- [ ] Boundary snapping logic
- [ ] Token expiry validation
- [ ] Counter validation edge cases

### Integration Tests Needed
- [ ] End-to-end render pipeline
- [ ] Proxy streaming with Range requests
- [ ] Webhook signature verification
- [ ] Transcript data persistence

### E2E Tests Needed
- [ ] Upload → transcribe → detect → render flow
- [ ] Caption style preview matches render
- [ ] Clips playable without export
- [ ] Counter values match backend

---

## Rollback Steps

1. **Disable Feature Flags**
   ```env
   FF_ASPECT_RATIO=false
   FF_CAPTION_STYLES=false
   FF_INPAGE_PLAYBACK=false
   ```

2. **Revert Database Migrations**
   ```bash
   cd apps/api
   npx prisma migrate resolve --rolled-back 20251106164126_add_export_processing_fields
   npx prisma migrate resolve --rolled-back 20251106183247_add_caption_style_fields
   npx prisma migrate resolve --rolled-back 20251106183718_add_transcript_status_fields
   ```

3. **Revert Git Commits**
   ```bash
   git revert <commit-hash>
   ```

---

## Deployment Checklist

- [ ] Set JWT_SECRET in production
- [ ] Configure ASSEMBLYAI_WEBHOOK_SECRET
- [ ] Set ML_WORKER_URL for production worker
- [ ] Enable feature flags progressively
- [ ] Monitor worker logs for errors
- [ ] Test proxy token expiry
- [ ] Verify webhook signature validation
- [ ] Check FFmpeg availability in worker container

---

## Performance Considerations

### Aspect Ratio Processing
- Uses `preset=fast` for FFmpeg encoding
- Copies audio without re-encoding
- Variable frame rate for efficiency

### Caption Rendering
- UTF-8 encoding for Indic/Hinglish support
- ASS format for advanced styling
- Efficient keyword painting with regex

### Transcription Proxy
- HTTP Range support for large files
- 15-minute token expiry for security
- Cache-Control headers for CDN

### Boundarying
- 30-second timeout for silence detection
- Efficient FFmpeg silencedetect filter
- Minimal transcript processing

---

## Known Limitations

1. **Aspect Ratio**: Face detection not yet implemented (uses center crop)
2. **Captions**: Custom presets UI not implemented (coming soon)
3. **Transcription**: Whisper fallback not implemented
4. **Boundarying**: Uses sample transcript data (needs real transcript integration)
5. **Playback**: Not yet implemented
6. **Counters**: Not yet implemented

---

## Next Steps

1. **Complete Step 5**: In-page playback
2. **Complete Step 6**: Fix counters
3. **Add Tests**: Unit, integration, E2E
4. **Real Transcript Integration**: Replace sample data
5. **Face Detection**: Implement ROI-aware cropping
6. **Custom Caption Presets**: Allow users to save styles
7. **Whisper Fallback**: Local transcription option
8. **Performance Optimization**: Profile and optimize worker

---

## Commits

- `f376b0c` - feat(step1): Implement aspect ratio processing
- `dc21724` - feat(step2): Add caption style presets and ASS generation
- `fab7a53` - feat(step2): Add UI components and database schema
- `494fe0a` - feat(step3): Implement transcription proxy and webhook handler
- (pending) - feat(step4): Implement intelligent clip boundarying
- (pending) - feat(step5): Add in-page playback
- (pending) - feat(step6): Fix counters

---

**Total Files Changed**: ~30 files  
**Total Lines Added**: ~3000+ lines  
**Migrations**: 3 database migrations  
**New Services**: 5 new services/modules  
**UI Components**: 2 new React components
