# QA Matrix - Core Flow Fixes

**Branch:** `feature/fix-core-flow`  
**Date:** November 6, 2025  
**Status:** Ready for QA

---

## 🎯 Testing Strategy

All features must pass QA before deployment. If any test fails, fix within its step before proceeding.

---

## ✅ STEP 1: ASPECT RATIO PROCESSING

### Test Fixtures
Create 3 test videos with different aspect ratios:

1. **Landscape** (1920x1080, 16:9)
2. **Portrait** (1080x1920, 9:16)
3. **Square** (1080x1080, 1:1)

### Test Cases

#### TC1.1: Landscape → 9:16 (Vertical)
```yaml
Input: landscape.mp4 (1920x1080)
Target: 9:16 (1080x1920)
Expected: 
  - Strategy: CROP (content loss < 30%)
  - Output: 1080x1920 exact
  - No distortion
  - Center-cropped
Verification:
  ffprobe -v error -select_streams v:0 -show_entries stream=width,height output.mp4
  # Should show: 1080x1920
```

#### TC1.2: Landscape → 1:1 (Square)
```yaml
Input: landscape.mp4 (1920x1080)
Target: 1:1 (1080x1080)
Expected:
  - Strategy: CROP (content loss < 30%)
  - Output: 1080x1080 exact
  - No distortion
  - Center-cropped
Verification:
  ffprobe -v error -select_streams v:0 -show_entries stream=width,height output.mp4
  # Should show: 1080x1080
```

#### TC1.3: Landscape → 16:9 (Horizontal)
```yaml
Input: landscape.mp4 (1920x1080)
Target: 16:9 (1920x1080)
Expected:
  - Strategy: No change (already 16:9)
  - Output: 1920x1080 exact
  - No processing needed
Verification:
  ffprobe -v error -select_streams v:0 -show_entries stream=width,height output.mp4
  # Should show: 1920x1080
```

#### TC1.4: Portrait → 16:9 (Horizontal)
```yaml
Input: portrait.mp4 (1080x1920)
Target: 16:9 (1920x1080)
Expected:
  - Strategy: PAD (content loss > 30%)
  - Output: 1920x1080 exact
  - Black bars on sides
  - No distortion
Verification:
  ffprobe -v error -select_streams v:0 -show_entries stream=width,height output.mp4
  # Should show: 1920x1080
  # Visual: Check for black bars
```

#### TC1.5: Square → 9:16 (Vertical)
```yaml
Input: square.mp4 (1080x1080)
Target: 9:16 (1080x1920)
Expected:
  - Strategy: PAD (content loss > 30%)
  - Output: 1080x1920 exact
  - Black bars on top/bottom
  - No distortion
Verification:
  ffprobe -v error -select_streams v:0 -show_entries stream=width,height output.mp4
  # Should show: 1080x1920
  # Visual: Check for black bars
```

### Acceptance Criteria
- [ ] All outputs match exact target dimensions
- [ ] No video distortion (aspect ratio preserved)
- [ ] Crop strategy used when content loss < 30%
- [ ] Pad strategy used when content loss >= 30%
- [ ] Processing status tracked in database
- [ ] Feature flag `FF_ASPECT_RATIO` controls behavior

### Test Script
```bash
# Enable feature flag
export FF_ASPECT_RATIO=true

# Test each fixture
curl -X POST http://localhost:3000/api/exports \
  -H "Content-Type: application/json" \
  -d '{
    "momentId": "test-moment-id",
    "format": "MP4",
    "aspectRatio": "9:16"
  }'

# Verify output dimensions
ffprobe -v error -select_streams v:0 -show_entries stream=width,height output.mp4

# Check database
psql -d clipforge_dev -c "SELECT processingStatus, processedUrl FROM \"Export\" WHERE id='export-id';"
```

---

## ✅ STEP 2: CAPTION STYLES

### Test Cases

#### TC2.1: All 10 Presets Render
```yaml
Presets to Test:
  1. karaoke
  2. deep_diver
  3. pod_p
  4. popline
  5. seamless_bounce
  6. beasty
  7. youshaei
  8. mozi
  9. glitch_infinite
  10. baby_earthquake

For Each Preset:
  - Generate ASS file
  - Verify ASS syntax valid
  - Render video with captions
  - Visual inspection: captions appear correctly
  - Check positioning (top/center/bottom)
  - Verify font size and styling
```

#### TC2.2: Keyword Painting
```yaml
Input Text: "Amazing product with 100 users and great results"
Presets with Keyword Paint: youshaei, deep_diver, popline, beasty, baby_earthquake

Expected:
  - Numbers colored (100)
  - Proper nouns colored (if any)
  - Emphasis words colored (Amazing, great)

Verification:
  - Check ASS file for color tags: {\c&HXXXXXX}
  - Visual: Keywords appear in different color
```

#### TC2.3: Karaoke Effect
```yaml
Preset: karaoke
Input: "Hello world this is a test"

Expected:
  - Word-by-word progressive highlight
  - k-timing tags in ASS file
  - Each word highlights at correct time

Verification:
  - Check ASS for {\kXX} tags
  - Visual: Words highlight sequentially
  - Timing matches word boundaries
```

#### TC2.4: Indic/Hinglish Font Fallback
```yaml
Input Text: "Hello नमस्ते مرحبا"
Fonts: Manrope, Noto Sans, Noto Sans Devanagari

Expected:
  - All characters render correctly
  - No missing glyphs (□)
  - Font fallback chain works

Verification:
  - Visual inspection of rendered video
  - Check ASS file for font chain
  - Verify Devanagari characters visible
```

#### TC2.5: Preview Matches Render
```yaml
For Each Preset:
  1. Open caption style selector
  2. Select preset
  3. View live preview
  4. Render video with same preset
  5. Compare preview vs render

Expected:
  - Font size matches (scaled appropriately)
  - Colors match
  - Positioning matches
  - Styling matches (outline, shadow, etc.)
```

### Acceptance Criteria
- [ ] All 10 presets generate valid ASS files
- [ ] All presets render without errors
- [ ] Keyword painting works (numbers, proper nouns, emphasis)
- [ ] Karaoke effect shows progressive highlight
- [ ] Indic/Hinglish characters render correctly
- [ ] Preview matches final render
- [ ] Feature flag `FF_CAPTION_STYLES` controls behavior

### Test Script
```bash
# Enable feature flag
export FF_CAPTION_STYLES=true

# Test each preset
for preset in karaoke deep_diver pod_p popline seamless_bounce beasty youshaei mozi glitch_infinite baby_earthquake; do
  echo "Testing preset: $preset"
  
  # Generate ASS file
  curl -X POST http://localhost:8000/v1/render/export \
    -H "Content-Type: application/json" \
    -d "{
      \"captionStyle\": \"$preset\",
      \"captionsEnabled\": true
    }"
  
  # Verify ASS syntax
  cat /tmp/export-id/captions.ass | head -20
  
  # Render and inspect
  ffplay output.mp4
done
```

---

## ✅ STEP 3: TRANSCRIPTION PROXY

### Test Cases

#### TC3.1: Proxy Token Generation
```yaml
Test: Generate proxy token
Expected:
  - Token generated successfully
  - Expires in 15 minutes
  - Contains assetId, projectId, orgId
  - Issuer: clipforge-api
  - Audience: assemblyai-proxy

Verification:
  const token = proxyTokenService.generateToken(assetId, projectId, orgId);
  const decoded = jwt.decode(token);
  console.log(decoded);
  // Check exp, iat, iss, aud fields
```

#### TC3.2: Token Validation
```yaml
Test: Validate tokens
Cases:
  1. Valid token → Success
  2. Expired token → UnauthorizedException
  3. Invalid signature → UnauthorizedException
  4. Wrong issuer → UnauthorizedException
  5. Wrong audience → UnauthorizedException

Verification:
  try {
    const payload = proxyTokenService.validateToken(token);
    console.log('Valid:', payload);
  } catch (error) {
    console.log('Invalid:', error.message);
  }
```

#### TC3.3: Proxy Streaming
```yaml
Test: Stream video via proxy
URL: GET /internal/assemblyai/pull/:assetId?token=xxx

Cases:
  1. Full file download
  2. Range request (bytes=0-1023)
  3. Range request (bytes=1024-2047)
  4. Invalid token → 401
  5. Wrong org → 404

Expected:
  - Correct Content-Type (video/mp4)
  - Correct Content-Length
  - Accept-Ranges: bytes
  - Cache-Control headers
  - 206 for range requests

Verification:
  curl -v "http://localhost:3000/internal/assemblyai/pull/asset-id?token=xxx"
  curl -v -H "Range: bytes=0-1023" "http://localhost:3000/internal/assemblyai/pull/asset-id?token=xxx"
```

#### TC3.4: AssemblyAI Integration
```yaml
Test: Real AssemblyAI transcription
Steps:
  1. Upload video to MinIO
  2. Generate proxy URL
  3. Submit to AssemblyAI with proxy URL
  4. Wait for webhook callback
  5. Verify transcript in database

Expected:
  - AssemblyAI can access video via proxy
  - Webhook received with transcript data
  - words[] array populated
  - segments[] array populated
  - language detected
  - WPM calculated
  - Project marked as TRANSCRIBED

Verification:
  psql -d clipforge_dev -c "SELECT status, data FROM \"Transcript\" WHERE projectId='project-id';"
  # Check words[], segments[], language, wpm fields
```

#### TC3.5: Webhook Signature Verification
```yaml
Test: Webhook security
Cases:
  1. Valid signature → Accept
  2. Invalid signature → 400
  3. Missing signature → 400

Expected:
  - HMAC SHA256 verification
  - Only valid webhooks processed

Verification:
  # Valid webhook
  curl -X POST http://localhost:3000/webhooks/assemblyai \
    -H "x-assemblyai-signature: valid-signature" \
    -H "Content-Type: application/json" \
    -d '{"transcript_id": "xxx", "status": "completed"}'
  
  # Invalid signature
  curl -X POST http://localhost:3000/webhooks/assemblyai \
    -H "x-assemblyai-signature: invalid" \
    -H "Content-Type: application/json" \
    -d '{"transcript_id": "xxx", "status": "completed"}'
```

### Acceptance Criteria
- [ ] Tokens generated with 15-min expiry
- [ ] Token validation works correctly
- [ ] Proxy streams video with Range support
- [ ] AssemblyAI can access videos via proxy
- [ ] Webhook receives and processes transcripts
- [ ] words[] array populated with timings
- [ ] Signature verification works
- [ ] No mocks used (real AssemblyAI data)

### Test Script
```bash
# Test proxy access
TOKEN=$(curl -s http://localhost:3000/api/proxy/token/asset-id | jq -r .token)
curl -v "http://localhost:3000/internal/assemblyai/pull/asset-id?token=$TOKEN"

# Test webhook
curl -X POST http://localhost:3000/webhooks/assemblyai \
  -H "x-assemblyai-signature: $(echo -n '{"transcript_id":"xxx"}' | openssl dgst -sha256 -hmac "$WEBHOOK_SECRET" -binary | base64)" \
  -H "Content-Type: application/json" \
  -d '{"transcript_id": "xxx", "status": "completed", "words": [...]}'
```

---

## ✅ STEP 4: BOUNDARYING

### Test Fixtures
Create test videos with:
1. **Dense Speech**: Continuous talking, minimal pauses
2. **Sparse Speech**: Long pauses between sentences
3. **Mixed**: Some pauses, some continuous

### Test Cases

#### TC4.1: No Mid-Word Cuts
```yaml
Test: Verify clips never cut mid-word
Input: Transcript with word timings
Clip: 10s-20s

Expected:
  - Start time >= first word.start
  - End time <= last word.end
  - Never cuts during a word

Verification:
  # Check adjusted boundaries
  adjusted_start, adjusted_end = boundary_detector.adjust_boundaries(...)
  
  # Find words in window
  words_in_clip = [w for w in words if adjusted_start <= w.start and w.end <= adjusted_end]
  
  # Verify first word fully included
  assert adjusted_start <= words_in_clip[0].start
  
  # Verify last word fully included
  assert words_in_clip[-1].end <= adjusted_end
```

#### TC4.2: Sentence Boundary Snapping
```yaml
Test: Clips snap to sentence boundaries
Input: "Hello world. This is a test. Amazing results."
Clip: 2s-8s (mid-sentence)

Expected:
  - Start snaps to sentence start or previous sentence end
  - End snaps to sentence end or next sentence start
  - Sentence boundaries detected from punctuation (.!?;:)

Verification:
  # Check for sentence boundaries in adjusted times
  sentences = find_sentence_boundaries(words)
  
  # Start should be near a sentence boundary
  assert any(abs(adjusted_start - s.time) < 1.0 for s in sentences)
  
  # End should be near a sentence boundary
  assert any(abs(adjusted_end - s.time) < 1.0 for s in sentences)
```

#### TC4.3: Silence Detection
```yaml
Test: Clips snap to silences
Input: Video with clear pauses
Clip: 5s-15s

Expected:
  - FFmpeg silencedetect runs successfully
  - Silences detected (threshold: -40dB, min: 0.3s)
  - Boundaries snap to silence midpoints
  - Priority: silence > sentence > word

Verification:
  # Check silence detection
  silences = boundary_detector._detect_silences(video_path, start, end)
  assert len(silences) > 0
  
  # Check boundary snapped to silence
  assert any(abs(adjusted_start - s.time) < 0.5 for s in silences) or \
         any(abs(adjusted_end - s.time) < 0.5 for s in silences)
```

#### TC4.4: Pre/Post-Roll Applied
```yaml
Test: Lead-in and lead-out added
Input: First word at 10.0s, last word at 20.0s
Expected Pre-roll: 0.7s
Expected Post-roll: 0.7s

Expected:
  - adjusted_start ≈ 9.3s (10.0 - 0.7)
  - adjusted_end ≈ 20.7s (20.0 + 0.7)
  - Smooth transitions

Verification:
  first_word_start = 10.0
  last_word_end = 20.0
  
  assert adjusted_start <= first_word_start - 0.5  # At least 0.5s pre-roll
  assert adjusted_end >= last_word_end + 0.5  # At least 0.5s post-roll
```

#### TC4.5: Duration Constraints
```yaml
Test: Min/max duration enforced
Cases:
  1. Clip too short (< 15s) → Extended
  2. Clip too long (> 180s) → Trimmed
  3. Clip within range → No change

Expected:
  - All clips between 15-180 seconds
  - Balanced adjustment (split difference)

Verification:
  duration = adjusted_end - adjusted_start
  assert 15.0 <= duration <= 180.0
```

### Acceptance Criteria
- [ ] No clips cut mid-word
- [ ] Sentence boundaries detected and used
- [ ] Silences detected via FFmpeg
- [ ] Pre-roll (0.7s) applied before first word
- [ ] Post-roll (0.7s) applied after last word
- [ ] Duration constraints enforced (15-180s)
- [ ] Natural-feeling starts and ends

### Test Script
```bash
# Test boundary detection
python3 << EOF
from workers.services.boundary_detector import BoundaryDetector

detector = BoundaryDetector()

# Test with sample data
words = [
    {"text": "Hello", "start": 10.0, "end": 10.5, "confidence": 0.95},
    {"text": "world.", "start": 10.5, "end": 11.0, "confidence": 0.92},
    {"text": "This", "start": 12.0, "end": 12.3, "confidence": 0.98},
]

adjusted_start, adjusted_end = detector.adjust_boundaries(
    "test.mp4",
    start_time=10.0,
    end_time=12.5,
    transcript_words=words
)

print(f"Original: 10.0 - 12.5")
print(f"Adjusted: {adjusted_start:.2f} - {adjusted_end:.2f}")
print(f"Duration: {adjusted_end - adjusted_start:.2f}s")

# Verify no mid-word cuts
assert adjusted_start <= 10.0
assert adjusted_end >= 12.3
print("✅ No mid-word cuts")
EOF
```

---

## ✅ STEP 5: IN-PAGE PLAYBACK

### Test Cases

#### TC5.1: Proxy Video Generation
```yaml
Test: Generate lightweight proxy
Input: Full quality video (1080p+)
Expected Output: 720p, CRF 23, faststart

Expected:
  - Max height: 720px
  - Aspect ratio maintained
  - File size < original
  - Streamable (faststart flag)
  - AAC audio, 128k bitrate

Verification:
  ffprobe -v error -select_streams v:0 -show_entries stream=height,codec_name proxy.mp4
  # Should show: height=720, codec_name=h264
  
  ffprobe -v error -show_entries format=bit_rate proxy.mp4
  # Should be lower than original
```

#### TC5.2: Clips Grid Display
```yaml
Test: Grid shows all clips
Input: Project with 5 clips

Expected:
  - Grid displays all 5 clips
  - Thumbnails load
  - Duration badges show correct time
  - Score badges show percentage
  - Play buttons visible

Verification:
  # Visual inspection
  # Check network tab for thumbnail requests
  # Verify duration formatting (MM:SS)
```

#### TC5.3: Video Player Functionality
```yaml
Test: Player controls work
Controls to Test:
  - Play/Pause button
  - Space bar (play/pause)
  - Progress bar seeking
  - Volume control
  - Mute button (M key)
  - Fullscreen button (F key)
  - Close button (Esc key)
  - Time display

Expected:
  - All controls responsive
  - Keyboard shortcuts work
  - Time updates correctly
  - Seeking works smoothly

Verification:
  # Manual testing in browser
  # Check console for errors
  # Test all keyboard shortcuts
```

#### TC5.4: Lazy Loading
```yaml
Test: Players load on demand
Input: Grid with 10 clips

Expected:
  - Video elements not loaded initially
  - Player loads only when play button clicked
  - Modal appears with player
  - Video starts playing automatically
  - Other videos remain unloaded

Verification:
  # Check network tab
  # Only clicked video should load
  # No preloading of other videos
```

#### TC5.5: Export Optional
```yaml
Test: Playback without export
Steps:
  1. Generate clips
  2. View clips grid
  3. Play clip
  4. Verify no export created

Expected:
  - Clips playable immediately
  - No export record in database
  - Export button available but not required
  - Proxy URL populated on Moment

Verification:
  psql -d clipforge_dev -c "SELECT proxyUrl, thumbnailUrl FROM \"Moment\" WHERE id='moment-id';"
  # proxyUrl should be populated
  
  psql -d clipforge_dev -c "SELECT COUNT(*) FROM \"Export\" WHERE momentId='moment-id';"
  # Should be 0 (no export yet)
```

### Acceptance Criteria
- [ ] Proxy videos generated at 720p
- [ ] Clips grid displays all clips with thumbnails
- [ ] Video player works with all controls
- [ ] Keyboard shortcuts functional
- [ ] Lazy loading implemented
- [ ] Clips playable without export
- [ ] Export optional for download/publish
- [ ] Feature flag `FF_INPAGE_PLAYBACK` controls behavior

### Test Script
```bash
# Enable feature flag
export FF_INPAGE_PLAYBACK=true

# Generate proxy video
ffmpeg -i input.mp4 \
  -vf "scale=-2:720:force_original_aspect_ratio=decrease" \
  -c:v libx264 \
  -preset fast \
  -crf 23 \
  -c:a aac \
  -b:a 128k \
  -movflags +faststart \
  proxy.mp4

# Verify dimensions
ffprobe -v error -select_streams v:0 -show_entries stream=height proxy.mp4

# Test in browser
open http://localhost:3001/projects/project-id
```

---

## ✅ STEP 6: COUNTERS

### Test Cases

#### TC6.1: Exact Value Display
```yaml
Test: Values match exactly
Cases:
  - Set length to 45s → Display shows "45s"
  - Set count to 6 → Display shows "6"
  - Set length to 15s → Display shows "15s"
  - Set length to 180s → Display shows "180s"
  - Set count to 1 → Display shows "1"
  - Set count to 10 → Display shows "10"

Expected:
  - No rounding
  - No off-by-one errors
  - Display matches state exactly

Verification:
  # In React DevTools
  # Check clipLength and clipCount state
  # Compare to displayed values
  assert displayedLength === clipLength
  assert displayedCount === clipCount
```

#### TC6.2: Range Validation
```yaml
Test: Values clamped to valid ranges
Cases:
  - Input 10s → Clamped to 15s (min)
  - Input 200s → Clamped to 180s (max)
  - Input 0 clips → Clamped to 1 (min)
  - Input 15 clips → Clamped to 10 (max)

Expected:
  - Values automatically clamped
  - Error message shown for invalid values
  - No submission of invalid values

Verification:
  # Try to set invalid values
  setClipLength(10)  // Should become 15
  setClipCount(15)   // Should become 10
  
  # Check error messages
  assert errors.length === "Minimum clip length is 15s"
```

#### TC6.3: Slider-Input Sync
```yaml
Test: Slider and input stay in sync
Actions:
  1. Move slider to 60s
  2. Check input shows 60
  3. Type 90 in input
  4. Check slider moves to 90

Expected:
  - Bidirectional binding
  - No lag or desync
  - Both update simultaneously

Verification:
  # Move slider
  fireEvent.change(slider, { target: { value: 60 } })
  expect(input.value).toBe('60')
  
  # Type in input
  fireEvent.change(input, { target: { value: '90' } })
  expect(slider.value).toBe('90')
```

#### TC6.4: Debounced Server Sync
```yaml
Test: Changes debounced before API call
Actions:
  1. Change length to 30s
  2. Wait 400ms
  3. Change length to 45s
  4. Wait 600ms

Expected:
  - Only one API call made (after 500ms)
  - API receives final value (45s)
  - No intermediate calls

Verification:
  # Mock API
  const mockOnChange = jest.fn()
  
  # Rapid changes
  setClipLength(30)
  await wait(400)
  setClipLength(45)
  await wait(600)
  
  # Should only call once with final value
  expect(mockOnChange).toHaveBeenCalledTimes(1)
  expect(mockOnChange).toHaveBeenCalledWith({ length: 45, count: 5 })
```

#### TC6.5: Summary Calculation
```yaml
Test: Summary shows correct totals
Cases:
  - 5 clips × 45s = 225s ≈ 4 minutes
  - 10 clips × 30s = 300s = 5 minutes
  - 1 clip × 180s = 180s = 3 minutes

Expected:
  - Total time calculated correctly
  - Rounded to nearest minute
  - Display updates immediately

Verification:
  setClipLength(45)
  setClipCount(5)
  
  totalSeconds = 45 * 5  // 225
  totalMinutes = Math.round(225 / 60)  // 4
  
  expect(summary).toContain('~4 minutes')
```

### Acceptance Criteria
- [ ] Displayed values match state exactly (no rounding)
- [ ] Values clamped to valid ranges (15-180s, 1-10 clips)
- [ ] Slider and input stay in sync
- [ ] Changes debounced (500ms) before API call
- [ ] Error messages show for invalid values
- [ ] Summary calculates total time correctly
- [ ] No off-by-one errors

### Test Script
```tsx
// Unit test
import { render, fireEvent, waitFor } from '@testing-library/react';
import ClipSettings from './ClipSettings';

test('exact value display', () => {
  const { getByLabelText } = render(<ClipSettings initialLength={45} initialCount={6} />);
  
  const lengthInput = getByLabelText('Clip Length');
  const countInput = getByLabelText('Number of Clips');
  
  expect(lengthInput.value).toBe('45');
  expect(countInput.value).toBe('6');
});

test('range validation', () => {
  const { getByLabelText } = render(<ClipSettings />);
  
  const lengthInput = getByLabelText('Clip Length');
  
  // Try invalid value
  fireEvent.change(lengthInput, { target: { value: '10' } });
  
  // Should clamp to minimum
  expect(lengthInput.value).toBe('15');
});

test('debounced sync', async () => {
  const mockOnChange = jest.fn();
  const { getByLabelText } = render(
    <ClipSettings onSettingsChange={mockOnChange} />
  );
  
  const lengthInput = getByLabelText('Clip Length');
  
  // Rapid changes
  fireEvent.change(lengthInput, { target: { value: '30' } });
  fireEvent.change(lengthInput, { target: { value: '45' } });
  
  // Wait for debounce
  await waitFor(() => {
    expect(mockOnChange).toHaveBeenCalledTimes(1);
  }, { timeout: 600 });
  
  expect(mockOnChange).toHaveBeenCalledWith({ length: 45, count: 5 });
});
```

---

## 📊 QA Summary Checklist

### Step 1: Aspect Ratio
- [ ] Landscape → 9:16 correct
- [ ] Landscape → 1:1 correct
- [ ] Landscape → 16:9 correct
- [ ] Portrait → 16:9 correct (padded)
- [ ] Square → 9:16 correct (padded)
- [ ] No distortion in any output

### Step 2: Caption Styles
- [ ] All 10 presets render
- [ ] Keyword painting works
- [ ] Karaoke effect works
- [ ] Indic/Hinglish fonts work
- [ ] Preview matches render

### Step 3: Transcription
- [ ] Proxy tokens generate
- [ ] Token validation works
- [ ] Proxy streams video
- [ ] Range requests work
- [ ] AssemblyAI integration works
- [ ] words[] populated
- [ ] Webhook signature verified

### Step 4: Boundarying
- [ ] No mid-word cuts
- [ ] Sentence boundaries detected
- [ ] Silences detected
- [ ] Pre-roll applied (0.7s)
- [ ] Post-roll applied (0.7s)
- [ ] Duration constraints enforced

### Step 5: In-Page Playback
- [ ] Proxy videos generated (720p)
- [ ] Clips grid displays
- [ ] Video player works
- [ ] Keyboard shortcuts work
- [ ] Lazy loading works
- [ ] Export optional

### Step 6: Counters
- [ ] Exact values displayed
- [ ] Range validation works
- [ ] Slider-input sync works
- [ ] Debouncing works
- [ ] Summary calculates correctly
- [ ] No off-by-one errors

---

## 🐛 Bug Tracking

If any test fails, document here:

```yaml
Bug ID: BUG-001
Step: [1-6]
Test Case: [TC number]
Description: [What failed]
Expected: [What should happen]
Actual: [What actually happened]
Fix: [How to fix]
Status: [Open/Fixed/Verified]
```

---

## ✅ Sign-Off

Once all tests pass:

- [ ] All test cases executed
- [ ] All acceptance criteria met
- [ ] No critical bugs remaining
- [ ] Documentation updated
- [ ] Ready for deployment

**QA Engineer:** _______________  
**Date:** _______________  
**Approved:** ☐ Yes ☐ No

---

**If any test fails, fix within its step before proceeding to the next step!**
