#!/bin/bash
# Commit transcription wiring changes

set -e

echo "🔗 Committing Transcription Wiring..."
echo ""

# Stage all changes
git add -A

# Create commit
git commit -m "feat: Complete transcription wiring (AssemblyAI integration)

TRANSCRIPTION WIRING COMPLETE

Part 1: AssemblyAI API Integration
✅ Added startTranscription() in IngestionService
  - Generates secure proxy URL with JWT
  - Submits audio to AssemblyAI API
  - Stores externalId in database
  - Updates status to PROCESSING
  - Graceful error handling

Part 2: Real Transcript Data in Worker
✅ Replaced sample data with real API calls
  - Fetches transcript from GET /v1/projects/:id/transcript
  - Uses real word timings for boundary detection
  - Falls back to original boundaries if unavailable

Part 3: Transcript API Endpoint
✅ Added GET /v1/projects/:id/transcript
  - Returns complete transcript with words[]
  - Includes segments[], language, WPM
  - Org/project access verification

Part 4: Module Dependencies
✅ Updated IngestionModule
  - Added HttpModule for API calls
  - Added ProxyModule for token generation

Complete End-to-End Flow:
1. Upload video → Create transcript record (PENDING)
2. Generate proxy URL → Submit to AssemblyAI
3. AssemblyAI processes → Sends webhook
4. Webhook stores data → Status COMPLETED
5. Worker fetches transcript → Uses real word timings
6. Boundary detection → Natural clip boundaries

Files Changed:
- apps/api/src/ingestion/ingestion.service.ts (+70 lines)
- apps/api/src/ingestion/ingestion.module.ts (+3 lines)
- apps/api/src/projects/projects.controller.ts (+9 lines)
- apps/api/src/projects/projects.service.ts (+22 lines)
- workers/routers/render.py (+30 lines)

Total: ~134 lines added

Benefits:
✅ No more sample/mock data
✅ Real transcription from AssemblyAI
✅ Natural clip boundaries (no mid-word cuts)
✅ Sentence + silence detection works
✅ Pre/post-roll applied correctly

Documentation: TRANSCRIPTION_WIRING_COMPLETE.md"

echo "✅ Transcription wiring committed!"
echo ""

# Show commit
git log -1 --oneline

echo ""
echo "📤 Ready to push!"
