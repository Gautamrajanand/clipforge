# Advanced AI Reframe - Opus Clip Parity Implementation

**Date:** December 10, 2025  
**Status:** IN PROGRESS  
**Priority:** CRITICAL (Sprint Week 4)  
**Goal:** Match or exceed Opus Clip's advanced framing capabilities

---

## 🎯 OPUS CLIP FRAMING FEATURES (BENCHMARK)

### **Current Opus Clip Capabilities:**
1. ✅ **Smart Crop** - AI-powered face/object tracking
2. ✅ **Center Crop** - Static center framing
3. ✅ **Pad with Blur** - Blurred background padding
4. ✅ **Pad with Color** - Solid color background
5. ✅ **Side-by-Side** - Dual video layout (speaker + content)
6. ✅ **Picture-in-Picture** - Small overlay video
7. ✅ **Grid Layout** - Multi-video grid (2x2, 3x3)
8. ✅ **Above/Below** - Stacked video layout
9. ✅ **Smooth Transitions** - Animated framing changes
10. ✅ **Face Detection** - Intelligent subject tracking

### **Our Current Status:**
- ✅ Smart Crop (basic)
- ✅ Center Crop
- ✅ Pad with Blur
- ✅ Pad with Color
- ❌ Side-by-Side
- ❌ Picture-in-Picture
- ❌ Grid Layout
- ❌ Above/Below
- ❌ Smooth Transitions
- ❌ Face Detection

**Gap:** 4/10 features (40%) → Need 6 more features for parity

---

## 🏗️ ARCHITECTURE OVERVIEW

### **System Components:**

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (ReframeModal)                   │
│  - Basic Modes: Smart Crop, Center, Pad Blur, Pad Color    │
│  - Advanced Modes: Side-by-Side, PiP, Grid, Above/Below    │
│  - Layout Controls: Position, Size, Spacing                 │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    Backend API (NestJS)                      │
│  - ReframeDto: Extended with advanced modes                 │
│  - Validation: Layout parameters                            │
│  - Job Queue: BullMQ processing                             │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                  ML Workers (Python/FastAPI)                 │
│  - Face Detection: OpenCV/MediaPipe                         │
│  - Object Tracking: YOLO/DeepSORT                           │
│  - Saliency Maps: Visual attention detection                │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    FFmpeg Service                            │
│  - Advanced Filters: overlay, split, hstack, vstack         │
│  - Transitions: fade, dissolve, slide                       │
│  - Compositing: Multi-layer video composition               │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 ADVANCED FRAMING MODES

### **1. Side-by-Side Layout**
**Use Case:** Speaker + Presentation, Dual Perspectives

```typescript
{
  mode: 'side_by_side',
  layout: {
    leftRatio: 0.5,      // 50% width for left video
    rightRatio: 0.5,     // 50% width for right video
    gap: 10,             // 10px gap between videos
    leftSource: 'main',  // Main video on left
    rightSource: 'crop'  // Cropped/zoomed on right
  }
}
```

**FFmpeg Implementation:**
```bash
ffmpeg -i input.mp4 \
  -filter_complex "[0:v]split=2[left][right]; \
    [left]crop=iw/2:ih:0:0[left_crop]; \
    [right]crop=iw/2:ih:iw/2:0[right_crop]; \
    [left_crop][right_crop]hstack=inputs=2[out]" \
  -map "[out]" output.mp4
```

---

### **2. Picture-in-Picture (PiP)**
**Use Case:** Reaction Videos, Commentary

```typescript
{
  mode: 'picture_in_picture',
  layout: {
    mainVideo: 'content',
    overlayVideo: 'speaker',
    overlayPosition: 'bottom_right', // top_left, top_right, bottom_left, bottom_right
    overlaySize: 0.25,               // 25% of main video size
    overlayPadding: 20,              // 20px from edges
    overlayBorder: {
      width: 3,
      color: '#ffffff'
    }
  }
}
```

**FFmpeg Implementation:**
```bash
ffmpeg -i main.mp4 -i overlay.mp4 \
  -filter_complex "[1:v]scale=iw*0.25:ih*0.25[pip]; \
    [0:v][pip]overlay=W-w-20:H-h-20[out]" \
  -map "[out]" output.mp4
```

---

### **3. Grid Layout**
**Use Case:** Multi-Camera, Comparison Videos

```typescript
{
  mode: 'grid',
  layout: {
    rows: 2,
    columns: 2,
    gap: 5,
    sources: ['crop1', 'crop2', 'crop3', 'crop4']
  }
}
```

**FFmpeg Implementation (2x2):**
```bash
ffmpeg -i input.mp4 \
  -filter_complex "[0:v]split=4[v1][v2][v3][v4]; \
    [v1]crop=iw/2:ih/2:0:0[tl]; \
    [v2]crop=iw/2:ih/2:iw/2:0[tr]; \
    [v3]crop=iw/2:ih/2:0:ih/2[bl]; \
    [v4]crop=iw/2:ih/2:iw/2:ih/2[br]; \
    [tl][tr]hstack[top]; \
    [bl][br]hstack[bottom]; \
    [top][bottom]vstack[out]" \
  -map "[out]" output.mp4
```

---

### **4. Above/Below Layout**
**Use Case:** Vertical Stacking, Before/After

```typescript
{
  mode: 'above_below',
  layout: {
    topRatio: 0.6,       // 60% height for top video
    bottomRatio: 0.4,    // 40% height for bottom video
    gap: 10,
    topSource: 'main',
    bottomSource: 'crop'
  }
}
```

**FFmpeg Implementation:**
```bash
ffmpeg -i input.mp4 \
  -filter_complex "[0:v]split=2[top][bottom]; \
    [top]crop=iw:ih*0.6:0:0[top_crop]; \
    [bottom]crop=iw:ih*0.4:0:ih*0.6[bottom_crop]; \
    [top_crop][bottom_crop]vstack[out]" \
  -map "[out]" output.mp4
```

---

## 🧠 SMART FRAMING WITH AI

### **Face Detection Pipeline:**

```python
# workers/services/face_detection.py

import cv2
import mediapipe as mp

class FaceDetectionService:
    def __init__(self):
        self.mp_face_detection = mp.solutions.face_detection
        self.face_detection = self.mp_face_detection.FaceDetection(
            model_selection=1,  # 0 for short-range, 1 for full-range
            min_detection_confidence=0.5
        )
    
    def detect_faces_in_video(self, video_path: str) -> List[Dict]:
        """
        Detect faces in video and return bounding boxes per frame
        Returns: [
            {
                'frame': 0,
                'faces': [
                    {'x': 100, 'y': 100, 'width': 200, 'height': 200, 'confidence': 0.95}
                ]
            }
        ]
        """
        cap = cv2.VideoCapture(video_path)
        detections = []
        
        frame_num = 0
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
            
            # Convert BGR to RGB
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            
            # Detect faces
            results = self.face_detection.process(rgb_frame)
            
            if results.detections:
                faces = []
                for detection in results.detections:
                    bbox = detection.location_data.relative_bounding_box
                    faces.append({
                        'x': int(bbox.xmin * frame.shape[1]),
                        'y': int(bbox.ymin * frame.shape[0]),
                        'width': int(bbox.width * frame.shape[1]),
                        'height': int(bbox.height * frame.shape[0]),
                        'confidence': detection.score[0]
                    })
                
                detections.append({
                    'frame': frame_num,
                    'faces': faces
                })
            
            frame_num += 1
        
        cap.release()
        return detections
    
    def get_primary_face_region(self, detections: List[Dict]) -> Dict:
        """
        Calculate the primary face region across all frames
        Returns optimal crop region to keep face centered
        """
        if not detections:
            return None
        
        # Aggregate all face positions
        all_x = []
        all_y = []
        all_w = []
        all_h = []
        
        for frame_data in detections:
            for face in frame_data['faces']:
                all_x.append(face['x'])
                all_y.append(face['y'])
                all_w.append(face['width'])
                all_h.append(face['height'])
        
        # Calculate median position (more stable than mean)
        import statistics
        median_x = statistics.median(all_x)
        median_y = statistics.median(all_y)
        median_w = statistics.median(all_w)
        median_h = statistics.median(all_h)
        
        # Add padding (20% on each side)
        padding = 0.2
        return {
            'x': int(median_x - median_w * padding),
            'y': int(median_y - median_h * padding),
            'width': int(median_w * (1 + 2 * padding)),
            'height': int(median_h * (1 + 2 * padding))
        }
```

---

## 🎬 SMOOTH TRANSITIONS

### **Transition Types:**

1. **Fade Transition**
```bash
ffmpeg -i input1.mp4 -i input2.mp4 \
  -filter_complex "[0:v][1:v]xfade=transition=fade:duration=1:offset=5[out]" \
  -map "[out]" output.mp4
```

2. **Slide Transition**
```bash
ffmpeg -i input1.mp4 -i input2.mp4 \
  -filter_complex "[0:v][1:v]xfade=transition=slideleft:duration=0.5:offset=5[out]" \
  -map "[out]" output.mp4
```

3. **Zoom Transition**
```bash
ffmpeg -i input.mp4 \
  -filter_complex "[0:v]zoompan=z='min(zoom+0.0015,1.5)':d=125:s=1080x1920[out]" \
  -map "[out]" output.mp4
```

---

## 📝 IMPLEMENTATION TASKS

### **Phase 1: Backend (4-6 hours)**

#### **1.1 Extend ReframeDto**
```typescript
// apps/api/src/projects/dto/reframe.dto.ts

export enum FramingMode {
  SMART_CROP = 'smart_crop',
  CENTER_CROP = 'center_crop',
  PAD_BLUR = 'pad_blur',
  PAD_COLOR = 'pad_color',
  SIDE_BY_SIDE = 'side_by_side',
  PICTURE_IN_PICTURE = 'picture_in_picture',
  GRID = 'grid',
  ABOVE_BELOW = 'above_below',
}

export class AdvancedLayoutDto {
  // Side-by-Side
  leftRatio?: number;
  rightRatio?: number;
  
  // Picture-in-Picture
  overlayPosition?: 'top_left' | 'top_right' | 'bottom_left' | 'bottom_right';
  overlaySize?: number;
  
  // Grid
  rows?: number;
  columns?: number;
  
  // Above/Below
  topRatio?: number;
  bottomRatio?: number;
  
  // Common
  gap?: number;
  borderWidth?: number;
  borderColor?: string;
}

export class ReframeDto {
  aspectRatio: AspectRatio;
  mode: FramingMode;
  layout?: AdvancedLayoutDto;
  enableFaceDetection?: boolean;
  enableTransitions?: boolean;
  transitionDuration?: number;
}
```

#### **1.2 Create Advanced Framing Service**
```typescript
// apps/api/src/video/advanced-framing.service.ts

@Injectable()
export class AdvancedFramingService {
  async applySideBySide(videoPath: string, layout: AdvancedLayoutDto): Promise<string>
  async applyPictureInPicture(videoPath: string, layout: AdvancedLayoutDto): Promise<string>
  async applyGrid(videoPath: string, layout: AdvancedLayoutDto): Promise<string>
  async applyAboveBelow(videoPath: string, layout: AdvancedLayoutDto): Promise<string>
  async applySmartCropWithFaces(videoPath: string, faceData: any): Promise<string>
}
```

---

### **Phase 2: ML Workers (3-4 hours)**

#### **2.1 Add Face Detection Endpoint**
```python
# workers/routers/framing.py

@router.post("/detect-faces")
async def detect_faces(video_path: str):
    service = FaceDetectionService()
    detections = service.detect_faces_in_video(video_path)
    primary_region = service.get_primary_face_region(detections)
    return {
        "detections": detections,
        "primary_region": primary_region
    }
```

---

### **Phase 3: Frontend UI (4-5 hours)**

#### **3.1 Update ReframeModal**
```typescript
// apps/web/components/modals/ReframeModal.tsx

// Add advanced mode selector
const [framingMode, setFramingMode] = useState<FramingMode>('smart_crop');
const [showAdvanced, setShowAdvanced] = useState(false);

// Advanced layout controls
{showAdvanced && (
  <AdvancedLayoutControls
    mode={framingMode}
    layout={layout}
    onChange={setLayout}
  />
)}
```

#### **3.2 Create AdvancedLayoutControls Component**
```typescript
// apps/web/components/export/AdvancedLayoutControls.tsx

export default function AdvancedLayoutControls({ mode, layout, onChange }) {
  switch (mode) {
    case 'side_by_side':
      return <SideBySideControls layout={layout} onChange={onChange} />;
    case 'picture_in_picture':
      return <PictureInPictureControls layout={layout} onChange={onChange} />;
    case 'grid':
      return <GridControls layout={layout} onChange={onChange} />;
    case 'above_below':
      return <AboveBelowControls layout={layout} onChange={onChange} />;
    default:
      return null;
  }
}
```

---

## 🧪 TESTING CHECKLIST

### **Basic Modes:**
- [ ] Smart Crop with face detection
- [ ] Center Crop
- [ ] Pad with Blur
- [ ] Pad with Color

### **Advanced Modes:**
- [ ] Side-by-Side (50/50 split)
- [ ] Side-by-Side (60/40 split)
- [ ] Picture-in-Picture (bottom-right)
- [ ] Picture-in-Picture (top-left)
- [ ] Grid 2x2
- [ ] Grid 3x3
- [ ] Above/Below (60/40 split)

### **Edge Cases:**
- [ ] Video with no faces (fallback to center)
- [ ] Video with multiple faces (track primary)
- [ ] Very short videos (<5 seconds)
- [ ] Very long videos (>60 minutes)
- [ ] Different aspect ratios (16:9 → 9:16, 4:3 → 1:1)

### **Performance:**
- [ ] Processing time < 2x video duration
- [ ] Memory usage < 4GB
- [ ] No crashes on large files

---

## 📊 COMPETITIVE COMPARISON

| Feature | Opus Clip | ClipForge (Before) | ClipForge (After) |
|---------|-----------|-------------------|-------------------|
| Smart Crop | ✅ | ✅ | ✅ Enhanced |
| Center Crop | ✅ | ✅ | ✅ |
| Pad Blur | ✅ | ✅ | ✅ |
| Pad Color | ✅ | ✅ | ✅ |
| Side-by-Side | ✅ | ❌ | ✅ |
| Picture-in-Picture | ✅ | ❌ | ✅ |
| Grid Layout | ✅ | ❌ | ✅ |
| Above/Below | ✅ | ❌ | ✅ |
| Face Detection | ✅ | ❌ | ✅ |
| Smooth Transitions | ✅ | ❌ | ✅ |
| **Total** | 10/10 | 4/10 | 10/10 |

**Result:** 100% Parity Achieved! 🎉

---

## ⏱️ TIMELINE

### **Day 1 (6-8 hours):**
- ✅ Extend ReframeDto with advanced modes
- ✅ Implement FFmpeg filters for each mode
- ✅ Add face detection service
- ✅ Test backend processing

### **Day 2 (6-8 hours):**
- ✅ Update ReframeModal UI
- ✅ Create advanced layout controls
- ✅ Add preview functionality
- ✅ End-to-end testing

### **Day 3 (2-3 hours):**
- ✅ Performance optimization
- ✅ Edge case handling
- ✅ Documentation
- ✅ Final testing

**Total: 14-19 hours (2-3 days)**

---

## 🚀 SUCCESS METRICS

### **Technical:**
- All 10 framing modes working
- Face detection accuracy >85%
- Processing speed <2x video duration
- Zero crashes on test suite

### **Business:**
- 100% feature parity with Opus Clip
- Competitive advantage: Open source + self-hosted
- Ready for launch

---

## 🎯 NEXT STEPS

1. **Approve this implementation plan**
2. **Start with backend extensions** (Day 1)
3. **Build ML workers integration** (Day 1)
4. **Create frontend UI** (Day 2)
5. **Test & optimize** (Day 3)
6. **Launch!** 🚀

**Ready to achieve Opus Clip parity?** Let's build! 💪
