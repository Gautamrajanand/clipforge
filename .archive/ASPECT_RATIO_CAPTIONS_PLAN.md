# 🎬 Aspect Ratio + Captions Implementation Plan

## 🎯 Mission
Build industry-leading aspect ratio conversion and caption styling that matches or exceeds Opus Clip and Podcastle quality.

---

## 📐 PART 1: ASPECT RATIO (Week 1-2)

### Key Insights from Opus Clip:
- ✅ 9:16 vertical is default for social media
- ✅ Smart cropping focuses on the speaking subject
- ✅ Face detection and tracking keeps speaker centered
- ✅ Preview shows crop before processing
- ✅ "Actual video quality will be higher" messaging

### Implementation Strategy:

#### Phase 1.1: Basic Aspect Ratio Support (Days 1-3)
**Goal:** Get basic cropping/padding working

**Tasks:**
1. **Update FFmpeg Service**
   - Implement `convertAspectRatio()` method
   - Support 4 ratios: 9:16, 16:9, 1:1, 4:5
   - Two modes: crop (zoom) and pad (letterbox)
   - Use existing feature flag: `FF_ASPECT_RATIO`

2. **Database Schema**
   - Add `aspectRatio` field to Export model
   - Add `cropMode` field (crop/pad/smart)
   - Add `cropPosition` field (center/top/bottom/custom)

3. **API Endpoint**
   - Update export endpoint to accept aspect ratio
   - Pass through to FFmpeg service
   - Store in export metadata

4. **Basic UI**
   - Add aspect ratio selector to export modal
   - 4 buttons with icons (9:16, 16:9, 1:1, 4:5)
   - Default to 9:16 for social media

**FFmpeg Commands:**
```bash
# 9:16 (Vertical) - Crop from 16:9
ffmpeg -i input.mp4 -vf "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920" output.mp4

# 9:16 (Vertical) - Pad from 16:9
ffmpeg -i input.mp4 -vf "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2" output.mp4

# 1:1 (Square)
ffmpeg -i input.mp4 -vf "scale=1080:1080:force_original_aspect_ratio=increase,crop=1080:1080" output.mp4

# 4:5 (Portrait)
ffmpeg -i input.mp4 -vf "scale=1080:1350:force_original_aspect_ratio=increase,crop=1080:1350" output.mp4
```

**Success Criteria:**
- ✅ Can export clips in all 4 aspect ratios
- ✅ Crop mode works (zooms to fill)
- ✅ Pad mode works (letterbox/pillarbox)
- ✅ Quality preserved (no pixelation)

---

#### Phase 1.2: Smart Cropping with Face Detection (Days 4-7)
**Goal:** Intelligent cropping that keeps speaker in frame (like Opus Clip)

**Tasks:**
1. **Face Detection Integration**
   - Option A: OpenCV (local, free, fast)
   - Option B: AWS Rekognition (cloud, accurate, costs $)
   - Option C: Google Cloud Vision (cloud, accurate, costs $)
   - **Decision:** Start with OpenCV, upgrade to cloud if needed

2. **Face Tracking Algorithm**
   - Detect faces in first frame
   - Track face position throughout clip
   - Calculate optimal crop position
   - Smooth transitions (no jittery movement)

3. **Smart Crop Modes**
   - **Center:** Default, center of frame
   - **Face:** Center on detected face
   - **Motion:** Follow movement
   - **Top:** Keep top portion (for presentations)
   - **Bottom:** Keep bottom portion

4. **FFmpeg Integration**
   - Generate crop coordinates from face detection
   - Apply crop with smooth transitions
   - Use `crop` filter with dynamic coordinates

**OpenCV Face Detection:**
```python
import cv2
import numpy as np

def detect_face_position(video_path):
    """Detect primary face position in video"""
    cap = cv2.VideoCapture(video_path)
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    
    face_positions = []
    frame_count = 0
    sample_rate = 30  # Sample every 30 frames
    
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
            
        if frame_count % sample_rate == 0:
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            faces = face_cascade.detectMultiScale(gray, 1.1, 4)
            
            if len(faces) > 0:
                # Get largest face (primary speaker)
                largest_face = max(faces, key=lambda f: f[2] * f[3])
                x, y, w, h = largest_face
                center_x = x + w // 2
                center_y = y + h // 2
                face_positions.append((center_x, center_y))
        
        frame_count += 1
    
    cap.release()
    
    # Calculate average face position
    if face_positions:
        avg_x = sum(p[0] for p in face_positions) // len(face_positions)
        avg_y = sum(p[1] for p in face_positions) // len(face_positions)
        return (avg_x, avg_y)
    
    return None  # No face detected, use center crop

def calculate_crop_coordinates(video_width, video_height, target_ratio, face_position=None):
    """Calculate optimal crop coordinates"""
    target_width, target_height = target_ratio
    
    # Calculate target dimensions
    if video_width / video_height > target_width / target_height:
        # Video is wider, crop width
        new_height = video_height
        new_width = int(video_height * target_width / target_height)
    else:
        # Video is taller, crop height
        new_width = video_width
        new_height = int(video_width * target_height / target_width)
    
    # Calculate crop position
    if face_position:
        # Center crop on face
        crop_x = max(0, min(face_position[0] - new_width // 2, video_width - new_width))
        crop_y = max(0, min(face_position[1] - new_height // 2, video_height - new_height))
    else:
        # Center crop
        crop_x = (video_width - new_width) // 2
        crop_y = (video_height - new_height) // 2
    
    return (crop_x, crop_y, new_width, new_height)
```

**FFmpeg with Smart Crop:**
```bash
# Apply crop with calculated coordinates
ffmpeg -i input.mp4 -vf "crop=w:h:x:y,scale=1080:1920" output.mp4
```

**Success Criteria:**
- ✅ Detects faces in video
- ✅ Crops to keep speaker centered
- ✅ Smooth, no jittery movement
- ✅ Falls back to center crop if no face
- ✅ Works with multiple speakers (focuses on primary)

---

#### Phase 1.3: Preview & UI Polish (Days 8-10)
**Goal:** Beautiful UI like Opus Clip

**Tasks:**
1. **Aspect Ratio Selector UI**
   - Visual buttons with icons
   - Show preview of crop
   - Highlight selected ratio
   - Show dimensions (1080x1920, etc.)

2. **Preview Generation**
   - Generate thumbnail with crop applied
   - Show before/after comparison
   - Real-time preview (if possible)
   - "Actual video quality will be higher" message

3. **Crop Position Adjuster**
   - Drag to adjust crop position
   - Visual crop overlay on preview
   - Reset to auto/center button

4. **Batch Processing**
   - Apply same settings to multiple clips
   - Queue-based processing
   - Progress indicator

**UI Components:**
```typescript
// AspectRatioSelector.tsx
interface AspectRatio {
  id: string;
  label: string;
  ratio: string; // "9:16"
  width: number;
  height: number;
  icon: ReactNode;
  description: string;
}

const aspectRatios: AspectRatio[] = [
  {
    id: '9:16',
    label: 'Vertical',
    ratio: '9:16',
    width: 1080,
    height: 1920,
    icon: <SmartphoneIcon />,
    description: 'TikTok, Reels, Shorts'
  },
  {
    id: '16:9',
    label: 'Horizontal',
    ratio: '16:9',
    width: 1920,
    height: 1080,
    icon: <MonitorIcon />,
    description: 'YouTube, LinkedIn'
  },
  {
    id: '1:1',
    label: 'Square',
    ratio: '1:1',
    width: 1080,
    height: 1080,
    icon: <SquareIcon />,
    description: 'Instagram Feed'
  },
  {
    id: '4:5',
    label: 'Portrait',
    ratio: '4:5',
    width: 1080,
    height: 1350,
    icon: <RectangleVerticalIcon />,
    description: 'Instagram Feed'
  }
];
```

**Success Criteria:**
- ✅ Beautiful, intuitive UI
- ✅ Preview shows crop accurately
- ✅ Easy to adjust crop position
- ✅ Batch processing works
- ✅ Matches Opus Clip quality

---

## 💬 PART 2: CAPTIONS (Week 2-4)

### Key Insights from Opus Clip & Podcastle:
- ✅ Multiple style presets (Karaoke, Deep Diver, Pod P, etc.)
- ✅ Word-by-word highlighting (karaoke effect)
- ✅ Bold, high-contrast text
- ✅ Various positions (top, center, bottom)
- ✅ Customizable colors and fonts
- ✅ Preview before generating

### Implementation Strategy:

#### Phase 2.1: Caption Generation & SRT Export (Days 1-3)
**Goal:** Generate captions from transcript

**Tasks:**
1. **Word-Level Timestamps**
   - AssemblyAI already provides word-level timestamps
   - Parse and store in database
   - Format for SRT/VTT export

2. **SRT/VTT Generation**
   - Convert transcript to SRT format
   - Convert transcript to VTT format
   - Support line breaks (max 2 lines, ~40 chars per line)
   - Export as downloadable file

3. **Caption Text Processing**
   - Smart line breaks (don't break mid-phrase)
   - Capitalize properly
   - Remove filler words (um, uh, like)
   - Add punctuation

**SRT Format:**
```srt
1
00:00:00,000 --> 00:00:02,500
Welcome to our podcast

2
00:00:02,500 --> 00:00:05,000
Today we're talking about AI
```

**VTT Format:**
```vtt
WEBVTT

00:00:00.000 --> 00:00:02.500
Welcome to our podcast

00:00:02.500 --> 00:00:05.000
Today we're talking about AI
```

**Success Criteria:**
- ✅ Generate SRT from transcript
- ✅ Generate VTT from transcript
- ✅ Proper timing and line breaks
- ✅ Downloadable files

---

#### Phase 2.2: Caption Style Presets (Days 4-7)
**Goal:** 6+ beautiful caption styles like Opus Clip

**Caption Styles:**

1. **Karaoke** (Like Opus Clip default)
   - Large, bold text
   - Word-by-word highlighting (yellow/green)
   - Black background box
   - Center position
   - High contrast

2. **Deep Diver**
   - White text on black box
   - Subtle, professional
   - Bottom position
   - Clean sans-serif font

3. **Pod P** (Podcast style)
   - Magenta/pink highlight
   - Bold text
   - Center position
   - Modern, energetic

4. **Popline**
   - White text
   - Thin black outline
   - No background
   - Center position
   - Clean, minimal

5. **Minimal**
   - Simple white text
   - No background
   - Bottom position
   - Small, unobtrusive

6. **Bold**
   - Large text
   - High contrast
   - Thick outline
   - Top position
   - Attention-grabbing

**FFmpeg Caption Burning:**
```bash
# Basic subtitles
ffmpeg -i input.mp4 -vf "subtitles=captions.srt:force_style='FontName=Arial,FontSize=24,PrimaryColour=&HFFFFFF,OutlineColour=&H000000,Outline=2'" output.mp4

# Karaoke style (word-by-word highlighting)
# Requires ASS format with karaoke effects
ffmpeg -i input.mp4 -vf "ass=captions.ass" output.mp4
```

**ASS Format for Karaoke:**
```ass
[Script Info]
Title: Karaoke Captions
ScriptType: v4.00+

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Karaoke,Arial,48,&H00FFFFFF,&H00FFFF00,&H00000000,&H80000000,-1,0,0,0,100,100,0,0,1,3,0,2,10,10,10,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
Dialogue: 0,0:00:00.00,0:00:02.50,Karaoke,,0,0,0,karaoke,{\k50}Welcome {\k50}to {\k50}our {\k50}podcast
```

**Tasks:**
1. **Style Template System**
   - Define style presets in config
   - Font, size, color, position, background
   - Store as JSON templates

2. **ASS File Generation**
   - Convert transcript to ASS format
   - Apply style template
   - Add karaoke effects for word highlighting

3. **FFmpeg Integration**
   - Burn captions into video
   - Use ASS for advanced styling
   - Maintain video quality

**Success Criteria:**
- ✅ 6+ beautiful caption styles
- ✅ Karaoke word highlighting works
- ✅ Styles match Opus Clip quality
- ✅ Easy to add new styles

---

#### Phase 2.3: Caption Customization UI (Days 8-12)
**Goal:** User-friendly caption editor like Opus Clip

**UI Components:**

1. **Style Selector**
   - Grid of style presets with thumbnails
   - Click to select
   - Preview updates in real-time

2. **Customization Panel**
   - Font family dropdown (20+ fonts)
   - Font size slider
   - Text color picker
   - Background color picker
   - Position selector (top/center/bottom)
   - Alignment (left/center/right)

3. **Preview Player**
   - Video player with captions overlay
   - Scrub through timeline
   - See captions in real-time
   - Toggle captions on/off

4. **Caption Editor**
   - Edit caption text
   - Adjust timing
   - Add/remove lines
   - Fix errors

**React Components:**
```typescript
// CaptionStyleSelector.tsx
interface CaptionStyle {
  id: string;
  name: string;
  thumbnail: string;
  config: {
    fontFamily: string;
    fontSize: number;
    primaryColor: string;
    outlineColor: string;
    backgroundColor: string;
    position: 'top' | 'center' | 'bottom';
    alignment: 'left' | 'center' | 'right';
    outline: number;
    shadow: number;
    karaoke: boolean;
  };
}

const captionStyles: CaptionStyle[] = [
  {
    id: 'karaoke',
    name: 'Karaoke',
    thumbnail: '/styles/karaoke.png',
    config: {
      fontFamily: 'Arial Black',
      fontSize: 48,
      primaryColor: '#FFFFFF',
      outlineColor: '#000000',
      backgroundColor: '#000000CC',
      position: 'center',
      alignment: 'center',
      outline: 3,
      shadow: 0,
      karaoke: true
    }
  },
  // ... more styles
];
```

**Success Criteria:**
- ✅ Beautiful style selector UI
- ✅ Real-time preview
- ✅ Easy customization
- ✅ Caption editor works
- ✅ Matches Opus Clip UX

---

#### Phase 2.4: Advanced Features (Days 13-14)
**Goal:** Polish and advanced features

**Tasks:**
1. **Speaker Labels**
   - Different colors per speaker
   - Show speaker name
   - Auto-detect speaker changes

2. **Emoji Support**
   - Render emojis in captions
   - Emoji picker
   - Auto-suggest emojis

3. **Multi-Language**
   - Support non-English captions
   - Unicode support
   - RTL languages

4. **Performance Optimization**
   - Fast caption burning
   - Parallel processing
   - Queue management

5. **Quality Assurance**
   - Test all styles
   - Test all aspect ratios
   - Test combinations
   - Fix bugs

**Success Criteria:**
- ✅ All features work perfectly
- ✅ Fast processing (<30s per clip)
- ✅ No bugs
- ✅ Production-ready

---

## 📊 Technical Architecture

### Database Schema Updates:

```prisma
model Export {
  id            String   @id @default(cuid())
  momentId      String
  projectId     String
  format        String   // "mp4", "srt", "vtt"
  status        String   // "pending", "processing", "completed", "failed"
  artifacts     Json     // { mp4_url, srt_url, vtt_url }
  
  // NEW: Aspect Ratio
  aspectRatio   String?  // "9:16", "16:9", "1:1", "4:5"
  cropMode      String?  // "crop", "pad", "smart"
  cropPosition  Json?    // { x, y, width, height }
  
  // NEW: Captions
  captionStyle  String?  // "karaoke", "minimal", "bold", etc.
  captionConfig Json?    // Full style configuration
  burnCaptions  Boolean  @default(false)
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  moment        Moment   @relation(fields: [momentId], references: [id])
  project       Project  @relation(fields: [projectId], references: [id])
}

// NEW: Caption style templates
model CaptionStyle {
  id          String   @id @default(cuid())
  name        String
  description String?
  thumbnail   String?
  config      Json     // Style configuration
  isDefault   Boolean  @default(false)
  isPublic    Boolean  @default(true)
  orgId       String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### API Endpoints:

```typescript
// Aspect Ratio
POST /v1/clips/:clipId/export
Body: {
  format: "mp4",
  aspectRatio: "9:16",
  cropMode: "smart",
  burnCaptions: true,
  captionStyle: "karaoke"
}

// Caption Styles
GET /v1/caption-styles
Response: [{ id, name, thumbnail, config }]

POST /v1/caption-styles
Body: { name, config }

// Preview
POST /v1/clips/:clipId/preview
Body: { aspectRatio, captionStyle }
Response: { previewUrl }

// SRT/VTT Export
GET /v1/clips/:clipId/captions.srt
GET /v1/clips/:clipId/captions.vtt
```

### Worker Services:

```python
# workers/services/aspect_ratio_service.py
class AspectRatioService:
    def convert_aspect_ratio(self, input_path, output_path, ratio, mode, crop_position=None):
        """Convert video to target aspect ratio"""
        pass
    
    def detect_face_position(self, video_path):
        """Detect primary face position for smart cropping"""
        pass
    
    def calculate_crop_coordinates(self, video_info, ratio, face_position):
        """Calculate optimal crop coordinates"""
        pass

# workers/services/caption_service.py
class CaptionService:
    def generate_srt(self, transcript, output_path):
        """Generate SRT file from transcript"""
        pass
    
    def generate_vtt(self, transcript, output_path):
        """Generate VTT file from transcript"""
        pass
    
    def generate_ass(self, transcript, style, output_path):
        """Generate ASS file with styling"""
        pass
    
    def burn_captions(self, video_path, caption_path, output_path):
        """Burn captions into video"""
        pass
```

---

## 🎯 Success Metrics

### Quality Metrics:
- ✅ Aspect ratio conversion maintains quality (no pixelation)
- ✅ Smart cropping keeps speaker in frame 95%+ of the time
- ✅ Captions are readable and well-timed
- ✅ Karaoke highlighting is smooth and accurate
- ✅ Processing time <30s per clip

### User Experience:
- ✅ UI is intuitive and beautiful
- ✅ Preview is accurate
- ✅ Customization is easy
- ✅ Matches or exceeds Opus Clip quality

### Technical:
- ✅ All tests pass
- ✅ No memory leaks
- ✅ Handles errors gracefully
- ✅ Scales to 100+ concurrent exports

---

## 📅 Timeline

### Week 1: Aspect Ratio
- Days 1-3: Basic aspect ratio support
- Days 4-7: Smart cropping with face detection
- Days 8-10: Preview & UI polish

### Week 2: Captions Foundation
- Days 1-3: SRT/VTT generation
- Days 4-7: Caption style presets

### Week 3: Captions UI
- Days 8-12: Customization UI
- Days 13-14: Advanced features & polish

### Week 4: Testing & Launch
- Days 1-3: QA and bug fixes
- Days 4-5: Documentation
- Days 6-7: Launch prep and deployment

---

## 🚀 Let's Build!

Ready to start with **Phase 1.1: Basic Aspect Ratio Support**?

I'll begin by:
1. Implementing the FFmpeg aspect ratio conversion
2. Updating the database schema
3. Creating the API endpoint
4. Building the basic UI

Let's go! 🎬
