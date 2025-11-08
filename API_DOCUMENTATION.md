# ClipForge API Documentation
**Last Updated:** November 8, 2025  
**Version:** 1.0.0  
**Base URL:** `http://localhost:3000`

---

## Authentication

All API requests require authentication using JWT tokens.

### Login
```http
POST /v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_123",
    "email": "user@example.com"
  }
}
```

### Using the Token
Include the token in the Authorization header:
```http
Authorization: Bearer {access_token}
```

---

## Projects API

### List Projects
```http
GET /v1/projects
Authorization: Bearer {token}
```

**Response:**
```json
[
  {
    "id": "proj_123",
    "title": "My Video",
    "status": "READY",
    "duration": 600,
    "createdAt": "2025-11-08T12:00:00Z",
    "moments": []
  }
]
```

### Get Project
```http
GET /v1/projects/:id
Authorization: Bearer {token}
```

**Response:**
```json
{
  "id": "proj_123",
  "title": "My Video",
  "status": "READY",
  "duration": 600,
  "sourceUrl": "https://...",
  "transcript": {
    "id": "trans_123",
    "text": "Full transcript...",
    "words": [...]
  },
  "moments": [
    {
      "id": "moment_123",
      "tStart": 10.5,
      "tEnd": 55.3,
      "duration": 44.8,
      "title": "Exploring Haunted Sites",
      "description": "Investigating paranormal energy...",
      "score": 82,
      "features": {
        "hook": 0.85,
        "emotion": 0.78,
        "clarity": 0.82,
        "segments": [...]
      }
    }
  ]
}
```

### Create Project
```http
POST /v1/projects
Authorization: Bearer {token}
Content-Type: multipart/form-data

file: (binary)
title: "My Video"
```

**Response:**
```json
{
  "id": "proj_123",
  "title": "My Video",
  "status": "UPLOADING"
}
```

### Update Project
```http
PUT /v1/projects/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Updated Title"
}
```

### Delete Project
```http
DELETE /v1/projects/:id
Authorization: Bearer {token}
```

---

## Clips API

### List Clips
```http
GET /v1/projects/:projectId/clips
Authorization: Bearer {token}
```

**Response:**
```json
[
  {
    "id": "moment_123",
    "projectId": "proj_123",
    "tStart": 10.5,
    "tEnd": 55.3,
    "duration": 44.8,
    "title": "Exploring Haunted Sites",
    "description": "Investigating paranormal energy...",
    "score": 82,
    "aspectRatio": "16:9",
    "features": {
      "hook": 0.85,
      "emotion": 0.78,
      "clarity": 0.82,
      "quote": 0.75,
      "novelty": 0.80,
      "structure": 0.88
    }
  }
]
```

### Get Clip Details
```http
GET /v1/projects/:projectId/clips/:id
Authorization: Bearer {token}
```

### Generate Basic Clips (FREE Tier)
```http
POST /v1/projects/:id/detect
Authorization: Bearer {token}
Content-Type: application/json

{
  "clipLength": 45,
  "clipCount": 5
}
```

**Response:**
```json
{
  "status": "processing",
  "message": "Clip detection started"
}
```

### Generate Pro Clips (PRO Tier) 🆕
```http
POST /v1/projects/:projectId/clips/pro
Authorization: Bearer {token}
Content-Type: application/json

{
  "numClips": 3,
  "withCrossfade": true
}
```

**Request Parameters:**
- `numClips` (optional): Number of Pro Clips to generate (default: 3)
- `withCrossfade` (optional): Add 300ms crossfade transitions (default: false)

**Response:**
```json
[
  {
    "id": "moment_456",
    "projectId": "proj_123",
    "tStart": 10.5,
    "tEnd": 135.8,
    "duration": 44.2,
    "title": "Pro Clip 1",
    "description": "Multi-segment clip with 3 high-value moments",
    "score": 85,
    "aspectRatio": "16:9",
    "features": {
      "hook": 0.87,
      "emotion": 0.82,
      "clarity": 0.85,
      "segments": [
        {
          "start": 10.5,
          "end": 25.3,
          "duration": 14.8,
          "score": 82,
          "text": "Opening hook about haunted locations...",
          "order": 1
        },
        {
          "start": 45.2,
          "end": 58.7,
          "duration": 13.5,
          "score": 85,
          "text": "Key insight about paranormal activity...",
          "order": 2
        },
        {
          "start": 120.1,
          "end": 135.8,
          "duration": 15.7,
          "score": 88,
          "text": "Powerful conclusion with evidence...",
          "order": 3
        }
      ],
      "isProClip": true,
      "withCrossfade": true
    }
  }
]
```

---

## Transcription API

### Start Transcription
```http
POST /v1/transcription/start
Authorization: Bearer {token}
Content-Type: application/json

{
  "projectId": "proj_123",
  "audioUrl": "https://..."
}
```

**Response:**
```json
{
  "transcriptId": "trans_123",
  "status": "processing"
}
```

### Get Transcript
```http
GET /v1/transcription/:id
Authorization: Bearer {token}
```

**Response:**
```json
{
  "id": "trans_123",
  "text": "Full transcript text...",
  "words": [
    {
      "text": "Hello",
      "start": 0.0,
      "end": 0.5,
      "confidence": 0.99
    }
  ],
  "utterances": [
    {
      "speaker": "A",
      "start": 0.0,
      "end": 5.0,
      "text": "Hello, welcome to my video..."
    }
  ]
}
```

---

## ML Worker API

### Detect Basic Clips
```http
POST http://localhost:8000/v1/ranker/detect
Content-Type: application/json

{
  "projectId": "proj_123",
  "transcriptId": "trans_123",
  "numClips": 5,
  "clipLength": 45
}
```

**Response:**
```json
{
  "projectId": "proj_123",
  "status": "success",
  "clips": [
    {
      "tStart": 10.5,
      "tEnd": 55.3,
      "duration": 44.8,
      "score": 82,
      "features": {
        "hook": 0.85,
        "emotion": 0.78,
        "clarity": 0.82,
        "quote": 0.75,
        "novelty": 0.80,
        "structure": 0.88
      },
      "reason": "Strong hook, Emotional, Well-structured",
      "text": "Full transcript of this clip..."
    }
  ]
}
```

### Detect Pro Clips 🆕
```http
POST http://localhost:8000/v1/ranker/detect-pro
Content-Type: application/json

{
  "projectId": "proj_123",
  "transcriptId": "trans_123",
  "numClips": 3,
  "targetDuration": 45.0
}
```

**Response:**
```json
[
  {
    "segments": [
      {
        "start": 10.5,
        "end": 25.3,
        "duration": 14.8,
        "score": 82,
        "text": "Opening hook...",
        "order": 1
      },
      {
        "start": 45.2,
        "end": 58.7,
        "duration": 13.5,
        "score": 85,
        "text": "Key insight...",
        "order": 2
      },
      {
        "start": 120.1,
        "end": 135.8,
        "duration": 15.7,
        "score": 88,
        "text": "Conclusion...",
        "order": 3
      }
    ],
    "total_duration": 44.0,
    "combined_score": 85.0,
    "features": {
      "hook": 0.87,
      "multi_segment": 1.0,
      "segment_count": 3
    },
    "reason": "Multi-segment clip with 3 high-value moments",
    "full_text": "Opening hook... [...] Key insight... [...] Conclusion..."
  }
]
```

---

## Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Invalid request parameters",
  "error": "Bad Request"
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Project not found",
  "error": "Not Found"
}
```

### 500 Internal Server Error
```json
{
  "statusCode": 500,
  "message": "Internal server error",
  "error": "Internal Server Error"
}
```

---

## Rate Limits

### Current Limits
- **FREE Tier:** 5 videos/month
- **PRO Tier:** 50 videos/month
- **BUSINESS Tier:** Unlimited

### Headers
```http
X-RateLimit-Limit: 50
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1699459200
```

---

## Webhooks (Future)

### Register Webhook
```http
POST /v1/webhooks/endpoints
Authorization: Bearer {token}
Content-Type: application/json

{
  "url": "https://your-app.com/webhook",
  "events": ["clip.created", "transcription.completed"]
}
```

### Webhook Events
- `project.created`
- `project.updated`
- `transcription.started`
- `transcription.completed`
- `clip.created`
- `clip.updated`
- `export.completed`

---

## SDK Examples

### JavaScript/TypeScript
```typescript
import { ClipForgeClient } from '@clipforge/sdk';

const client = new ClipForgeClient({
  apiKey: 'your_api_key',
  baseUrl: 'http://localhost:3000'
});

// Upload video
const project = await client.projects.create({
  file: videoFile,
  title: 'My Video'
});

// Generate Pro Clips
const proClips = await client.clips.generatePro(project.id, {
  numClips: 3,
  withCrossfade: true
});

console.log(proClips);
```

### Python
```python
from clipforge import ClipForgeClient

client = ClipForgeClient(
    api_key='your_api_key',
    base_url='http://localhost:3000'
)

# Upload video
project = client.projects.create(
    file=open('video.mp4', 'rb'),
    title='My Video'
)

# Generate Pro Clips
pro_clips = client.clips.generate_pro(
    project_id=project.id,
    num_clips=3,
    with_crossfade=True
)

print(pro_clips)
```

---

## Testing

### cURL Examples

#### Login
```bash
curl -X POST http://localhost:3000/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@clipforge.dev","password":"demo123"}'
```

#### List Projects
```bash
curl -X GET http://localhost:3000/v1/projects \
  -H "Authorization: Bearer {token}"
```

#### Generate Pro Clips
```bash
curl -X POST http://localhost:3000/v1/projects/proj_123/clips/pro \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"numClips":3,"withCrossfade":true}'
```

---

## Changelog

### v1.0.0 (Nov 8, 2025)
- ✅ Added Pro Clips generation endpoint
- ✅ Added multi-segment detection
- ✅ Added transcript visualization data
- ✅ Improved clip scoring
- ✅ Added AI-powered titles and descriptions

### v0.9.0 (Nov 6, 2025)
- ✅ Added clip customization (length, count)
- ✅ Added platform presets
- ✅ Improved boundary detection

### v0.8.0 (Nov 5, 2025)
- ✅ Initial release
- ✅ Basic clip detection
- ✅ Transcription integration
- ✅ Video upload and storage

---

## Support

### Documentation
- **Product Roadmap:** `PRODUCT_ROADMAP.md`
- **Architecture:** `ARCHITECTURE.md`
- **Current Status:** `CURRENT_STATUS.md`

### Contact
- **Email:** support@clipforge.dev
- **GitHub:** https://github.com/Gautamrajanand/clipforge
- **Issues:** https://github.com/Gautamrajanand/clipforge/issues

---

## Status

**API Status:** ✅ Production-Ready  
**FREE Tier:** ✅ Fully Functional  
**PRO Tier:** ✅ Core Complete, Ready for Testing  
**Documentation:** ✅ Up to Date
