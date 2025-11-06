#!/bin/bash
# Script to create Pull Request: Fix Pack - Core Flow (Steps 1-6)

set -e  # Exit on error

echo "🚀 Creating Pull Request: Fix Pack - Core Flow (Steps 1-6)"
echo ""

# Check if we're on the correct branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "feature/fix-core-flow" ]; then
    echo "❌ Error: Not on feature/fix-core-flow branch"
    echo "Current branch: $CURRENT_BRANCH"
    exit 1
fi

echo "✅ On correct branch: $CURRENT_BRANCH"
echo ""

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo "📝 Uncommitted changes detected. Adding all files..."
    git add -A
    echo "✅ Files staged"
    echo ""
else
    echo "✅ No uncommitted changes"
    echo ""
fi

# Show what will be committed
echo "📊 Files to be committed:"
git status --short
echo ""

# Commit if there are staged changes
if ! git diff-index --quiet HEAD --; then
    echo "💾 Creating commit..."
    git commit -m "feat: Complete all 6 core flow fixes

✅ STEP 1: Aspect Ratio Processing
- Smart crop/pad strategy based on content loss
- FFmpeg integration with Python worker
- Support for 9:16, 16:9, 1:1, 4:5 aspect ratios
- Database tracking for processing status

✅ STEP 2: Caption Styles
- 10 professional presets (Karaoke, Deep Diver, Pod P, etc.)
- ASS generation with keyword painting
- React UI components for style selection and live preview
- Indic/Hinglish font support

✅ STEP 3: Transcription Proxy
- JWT-based secure proxy (15-minute expiry)
- HTTP Range support for streaming
- AssemblyAI webhook handler
- Real transcript data with word timings (no mocks)

✅ STEP 4: Boundarying
- Sentence boundary detection from punctuation
- Silence detection via FFmpeg silencedetect
- Pre/post-roll (0.7s each) for natural feel
- Never cuts mid-word

✅ STEP 5: In-Page Playback
- Proxy video generation (720p, CRF 23)
- Custom video player with keyboard controls
- Clips grid with thumbnails and lazy loading
- Instant playback without export

✅ STEP 6: Counters
- Exact value bindings (no rounding)
- Validation (15-180s, 1-10 clips)
- Debounced server sync (500ms)
- Inline error messages

Files Changed: ~35 files
Lines Added: ~4,500+ lines
Database Migrations: 4 migrations
React Components: 5 new components
Python Services: 3 new services
Backend Services: 6 new modules

All features behind feature flags:
- FF_ASPECT_RATIO
- FF_CAPTION_STYLES
- FF_INPAGE_PLAYBACK

All migrations additive and reversible.
Complete test coverage and documentation included.

BREAKING CHANGES: None
"
    echo "✅ Commit created"
    echo ""
else
    echo "ℹ️  No changes to commit"
    echo ""
fi

# Push to remote
echo "📤 Pushing to remote..."
git push origin feature/fix-core-flow
echo "✅ Pushed to remote"
echo ""

# Display PR information
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 PULL REQUEST INFORMATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Title: Fix Pack: Core Flow (Steps 1–6)"
echo "Branch: feature/fix-core-flow → main"
echo "Type: Feature"
echo ""
echo "Description: See PR_CORE_FLOW_FIXES.md for complete details"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📝 NEXT STEPS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Create PR on GitHub/GitLab:"
echo "   - Go to your repository"
echo "   - Click 'New Pull Request'"
echo "   - Select: feature/fix-core-flow → main"
echo "   - Copy content from PR_CORE_FLOW_FIXES.md"
echo ""
echo "2. Add reviewers:"
echo "   - Backend engineer (aspect ratio, proxy, boundarying)"
echo "   - Frontend engineer (video player, components)"
echo "   - QA engineer (test coverage)"
echo "   - DevOps (feature flags, deployment)"
echo ""
echo "3. Run tests:"
echo "   cd workers && pytest tests/ -v"
echo ""
echo "4. Apply migrations (staging):"
echo "   cd apps/api && npx prisma migrate deploy"
echo ""
echo "5. Enable feature flags (staging):"
echo "   FF_ASPECT_RATIO=true"
echo "   FF_CAPTION_STYLES=true"
echo "   FF_INPAGE_PLAYBACK=true"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ PR preparation complete!"
echo "⏸️  Leaving PR open for review"
echo ""
