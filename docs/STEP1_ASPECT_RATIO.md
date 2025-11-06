# Step 1: Aspect Ratio Processing

## Overview

Implements real video aspect ratio conversion using FFmpeg. Videos are actually cropped or padded to target aspect ratios, not just metadata changes.

## Strategy

### Content Loss Analysis
```python
source_aspect = source_width / source_height
target_aspect = target_width / target_height

if source_aspect > target_aspect:
    content_loss = 1 - (target_aspect / source_aspect)  # Lose width
else:
    content_loss = 1 - (source_aspect / target_aspect)  # Lose height

# Decision
if content_loss < 0.3:  # < 30% loss
    use_crop()
else:
    use_pad()
```

### Crop Strategy
Used when content loss is acceptable (< 30%).

**FFmpeg Filter:**
```bash
scale={cover_width}:{cover_height}:force_original_aspect_ratio=increase,
crop={target_width}:{target_height},
fps=30,
format=yuv420p
```

**Example:** 1920x1080 → 1080x1080
- Scale to cover 1080x1080 (becomes 1920x1080)
- Crop center to 1080x1080
- Result: Center-cropped square

### Pad Strategy
Used when content loss is too high (>= 30%).

**FFmpeg Filter:**
```bash
scale={target_width}:{target_height}:force_original_aspect_ratio=decrease,
pad={target_width}:{target_height}:(ow-iw)/2:(oh-ih)/2:black,
fps=30,
format=yuv420p
```

**Example:** 1080x1920 → 1920x1080
- Scale to fit inside 1920x1080 (becomes 607x1080)
- Pad sides with black bars
- Result: Pillarboxed video

## Supported Aspect Ratios

| Ratio | Dimensions | Use Case |
|-------|------------|----------|
| 9:16 | 1080x1920 | TikTok, Shorts, Reels |
| 16:9 | 1920x1080 | YouTube, LinkedIn |
| 1:1 | 1080x1080 | Instagram Square |
| 4:5 | 1080x1350 | Instagram Portrait |

## Architecture

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│   NestJS    │─────▶│ Python Worker│─────▶│   FFmpeg    │
│     API     │ HTTP │   (FastAPI)  │ exec │ Processing  │
└─────────────┘      └──────────────┘      └─────────────┘
       │                     │                      │
       │ Update              │ Upload               │
       ▼                     ▼                      ▼
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│  PostgreSQL │      │    MinIO     │      │  Processed  │
│   Export    │      │   Storage    │      │    Video    │
└─────────────┘      └──────────────┘      └─────────────┘
```

## API Usage

### Create Export with Aspect Ratio
```bash
POST /api/exports
Content-Type: application/json

{
  "momentId": "moment-123",
  "format": "MP4",
  "aspectRatio": "9:16"
}
```

### Response
```json
{
  "id": "export-456",
  "status": "PENDING",
  "processingStatus": "QUEUED",
  "aspectRatio": "9:16"
}
```

### Check Processing Status
```bash
GET /api/exports/export-456
```

```json
{
  "id": "export-456",
  "status": "COMPLETED",
  "processingStatus": "COMPLETED",
  "processedUrl": "https://cdn.example.com/exports/export-456.mp4",
  "processingStartedAt": "2025-11-06T10:00:00Z",
  "processingCompletedAt": "2025-11-06T10:00:45Z"
}
```

## Worker API

### Render Export Endpoint
```bash
POST http://localhost:8000/v1/render/export
Content-Type: application/json

{
  "exportId": "export-456",
  "projectId": "project-123",
  "momentId": "moment-789",
  "sourceUrl": "https://minio.example.com/videos/source.mp4",
  "tStart": 10.0,
  "tEnd": 25.0,
  "aspectRatio": "9:16"
}
```

## Feature Flag

Control aspect ratio processing with feature flag:

```env
# .env
FF_ASPECT_RATIO=true
```

```typescript
// Check in code
import { FeatureFlags } from './config/feature-flags';

if (FeatureFlags.ASPECT_RATIO) {
  // Process aspect ratio
} else {
  // Skip processing
}
```

## Database Schema

```prisma
model Export {
  id                    String   @id @default(cuid())
  // ... existing fields ...
  
  // Processing fields
  processingStatus      String?  // PENDING, PROCESSING, COMPLETED, FAILED
  processedUrl          String?  // URL to processed video
  processingError       String?  // Error message if failed
  processingStartedAt   DateTime?
  processingCompletedAt DateTime?
}
```

## Testing

### Run Unit Tests
```bash
cd workers
pytest tests/test_aspect_ratio.py -v
```

### Run Integration Tests
```bash
cd workers
pytest tests/test_aspect_ratio_integration.py -v -s
```

### Manual Testing
```bash
# Create test video
ffmpeg -f lavfi -i testsrc=duration=10:size=1920x1080:rate=30 \
  -pix_fmt yuv420p test_landscape.mp4

# Test conversion
python3 << EOF
from services.render_pipeline import RenderPipeline, AspectRatio

pipeline = RenderPipeline()
pipeline.reframe_video(
    "test_landscape.mp4",
    "output_vertical.mp4",
    AspectRatio.VERTICAL
)
EOF

# Verify output
ffprobe -v error -select_streams v:0 \
  -show_entries stream=width,height \
  -of csv=p=0 output_vertical.mp4
# Should output: 1080,1920
```

## Performance

### Processing Times (approximate)
- 30s video @ 1080p: ~15-20 seconds
- 60s video @ 1080p: ~30-40 seconds
- 120s video @ 1080p: ~60-80 seconds

### Optimizations
- Uses `preset=fast` for faster encoding
- Copies audio without re-encoding (`-c:a copy`)
- Variable frame rate (`fps_mode=vfr`)
- Parallel processing via worker queue

## Troubleshooting

### Issue: Video distorted
**Cause:** Incorrect aspect ratio calculation  
**Fix:** Check `_should_use_crop()` logic and content loss threshold

### Issue: Black bars too large
**Cause:** Using pad strategy when crop would be better  
**Fix:** Adjust content loss threshold (currently 30%)

### Issue: Processing fails
**Cause:** FFmpeg not installed or invalid input  
**Fix:** Check FFmpeg installation and input video format

### Issue: Slow processing
**Cause:** Using slow preset or large video  
**Fix:** Use `preset=fast` or `preset=veryfast` for speed

## Rollback

If issues occur, disable feature flag:

```env
FF_ASPECT_RATIO=false
```

Or revert database migration:

```bash
cd apps/api
npx prisma migrate resolve --rolled-back 20251106164126_add_export_processing_fields
```

## Next Steps

1. Add face detection for ROI-aware cropping
2. Implement custom crop positions (top, center, bottom)
3. Add preview before processing
4. Support more aspect ratios (2:3, 3:4, etc.)
5. Optimize for batch processing
