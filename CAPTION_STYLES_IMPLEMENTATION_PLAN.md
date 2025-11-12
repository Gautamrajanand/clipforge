# 🎬 Caption Styles Feature - Implementation Plan

**Feature:** Phase 1.5 Priority 2  
**Timeline:** 2-3 weeks  
**Value:** ⭐⭐⭐⭐⭐ (Critical)  
**Status:** 🚧 Planning

---

## 🎯 Why Caption Styles?

### Business Impact
- **80% of social videos** are watched without sound
- **Accessibility requirement** (legal in some jurisdictions)
- **Engagement boost** - Captions increase watch time by 40%+
- **Competitive necessity** - Opus Clip's key feature
- **Premium pricing justification** - High perceived value

### User Value
- One-click caption generation
- Professional styling options
- Platform-optimized formats
- Accessibility compliance
- Time-saving automation

---

## 📋 Feature Scope

### Phase 1: Basic Caption Burning (Week 1)
**Goal:** Get captions working end-to-end

**Features:**
- ✅ Word-level timestamps (already have from AssemblyAI)
- Generate SRT files from transcript
- Burn captions into video using FFmpeg
- Basic styling (white text, black background)
- Position control (top, center, bottom)

**Technical Tasks:**
1. Create SRT generator service
2. Add FFmpeg subtitle burning
3. Update export pipeline
4. Test with real videos

**Deliverables:**
- Working caption generation
- Basic burn-in functionality
- SRT file export option

---

### Phase 2: Style Presets (Week 2, Days 1-3)
**Goal:** Multiple professional styles

**Style Presets:**
1. **Minimal** - Simple white text, clean
2. **Bold** - Large text, high contrast
3. **Elegant** - Serif font, subtle shadow
4. **Modern** - Sans-serif, clean lines
5. **Karaoke** - Word-by-word highlighting (Opus Clip style)
6. **Podcast** - Speaker names, professional

**Technical Tasks:**
1. Create style template system
2. Implement FFmpeg ASS/SSA styling
3. Add preset selector UI
4. Test all presets

**Deliverables:**
- 6 professional style presets
- Style template system
- Preset selector UI

---

### Phase 3: Customization UI (Week 2, Days 4-7)
**Goal:** User customization options

**Customization Options:**
- Font family (Google Fonts integration)
- Font size (adjustable slider)
- Text color (color picker)
- Background (none, box, shadow, gradient)
- Position (top, center, bottom)
- Alignment (left, center, right)
- Animation (fade in/out, slide, pop, none)
- Stroke/outline (color, width)

**Technical Tasks:**
1. Build customization UI
2. Implement FFmpeg style generation
3. Add real-time preview
4. Save custom styles

**Deliverables:**
- Full customization UI
- Custom style generation
- Style saving/loading

---

### Phase 4: Preview & Editing (Week 3)
**Goal:** Preview and edit captions

**Features:**
- Live preview with captions
- Scrub through timeline
- Edit caption text
- Adjust timing
- Export options (burn-in, SRT, VTT, ASS)

**Technical Tasks:**
1. Build preview player
2. Add caption editor
3. Implement timing adjustment
4. Add export options

**Deliverables:**
- Caption preview player
- Caption text editor
- Timing adjustment UI
- Multiple export formats

---

## 🏗️ Technical Architecture

### Backend Components

#### 1. Caption Service (`caption.service.ts`)
```typescript
class CaptionService {
  // Generate SRT from transcript
  generateSRT(words: Word[]): string
  
  // Generate VTT from transcript
  generateVTT(words: Word[]): string
  
  // Generate ASS/SSA with styling
  generateASS(words: Word[], style: CaptionStyle): string
  
  // Apply style template
  applyStyleTemplate(template: string, style: CaptionStyle): string
}
```

#### 2. FFmpeg Caption Burning
```typescript
class FFmpegService {
  // Burn captions into video
  async burnCaptions(
    inputPath: string,
    outputPath: string,
    captionFile: string,
    style: CaptionStyle
  ): Promise<void>
  
  // Generate caption file
  async generateCaptionFile(
    words: Word[],
    style: CaptionStyle,
    format: 'srt' | 'vtt' | 'ass'
  ): Promise<string>
}
```

#### 3. Style Templates
```typescript
interface CaptionStyle {
  preset: 'minimal' | 'bold' | 'elegant' | 'modern' | 'karaoke' | 'podcast';
  fontFamily: string;
  fontSize: number;
  textColor: string;
  backgroundColor: string;
  position: 'top' | 'center' | 'bottom';
  alignment: 'left' | 'center' | 'right';
  animation: 'none' | 'fade' | 'slide' | 'pop';
  stroke: {
    color: string;
    width: number;
  };
}
```

### Frontend Components

#### 1. Caption Style Selector
```typescript
<CaptionStyleSelector
  selectedStyle={style}
  onStyleChange={setStyle}
  presets={CAPTION_PRESETS}
/>
```

#### 2. Caption Customization Panel
```typescript
<CaptionCustomization
  style={style}
  onStyleChange={setStyle}
  showPreview={true}
/>
```

#### 3. Caption Preview Player
```typescript
<CaptionPreview
  videoUrl={videoUrl}
  captions={captions}
  style={style}
  onEdit={handleEdit}
/>
```

---

## 🎨 Style Preset Specifications

### 1. Minimal
```css
font-family: Arial, sans-serif
font-size: 24px
color: #FFFFFF
background: rgba(0, 0, 0, 0.7)
position: bottom
alignment: center
animation: none
stroke: none
```

### 2. Bold
```css
font-family: Impact, sans-serif
font-size: 36px
color: #FFFFFF
background: rgba(0, 0, 0, 0.9)
position: center
alignment: center
animation: pop
stroke: 2px black
```

### 3. Elegant
```css
font-family: Georgia, serif
font-size: 28px
color: #F5F5F5
background: none
position: bottom
alignment: center
animation: fade
stroke: none
shadow: 2px 2px 4px rgba(0,0,0,0.8)
```

### 4. Modern
```css
font-family: Helvetica Neue, sans-serif
font-size: 26px
color: #FFFFFF
background: rgba(0, 0, 0, 0.6)
position: bottom
alignment: center
animation: slide
stroke: none
```

### 5. Karaoke (Opus Clip Style)
```css
font-family: Montserrat, sans-serif
font-size: 32px
color: #FFFFFF (inactive), #FFD700 (active)
background: rgba(0, 0, 0, 0.8)
position: center
alignment: center
animation: word-highlight
stroke: 2px black
```

### 6. Podcast
```css
font-family: Open Sans, sans-serif
font-size: 24px
color: #FFFFFF
background: rgba(0, 0, 0, 0.75)
position: bottom
alignment: left
animation: none
stroke: none
speaker-label: true
```

---

## 🔧 FFmpeg Implementation

### Basic Caption Burning
```bash
ffmpeg -i input.mp4 -vf "subtitles=captions.srt" output.mp4
```

### Advanced Styling (ASS/SSA)
```bash
ffmpeg -i input.mp4 -vf "ass=captions.ass" output.mp4
```

### ASS Style Format
```
[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Arial,24,&H00FFFFFF,&H000000FF,&H00000000,&H80000000,0,0,0,0,100,100,0,0,1,2,2,2,10,10,10,1
```

---

## 📊 Data Flow

### Caption Generation Flow
```
1. User selects clips to export
2. User chooses caption style
3. Backend fetches transcript with word-level timestamps
4. Generate caption file (SRT/VTT/ASS) with styling
5. FFmpeg burns captions into video
6. Upload final video to MinIO
7. Return download URL to user
```

### Caption Preview Flow
```
1. User opens caption preview
2. Frontend generates WebVTT from transcript
3. Video player loads with captions
4. User can edit text/timing
5. Changes saved to database
6. Re-generate caption file for export
```

---

## 🗄️ Database Schema

### Caption Styles Table
```prisma
model CaptionStyle {
  id            String   @id @default(cuid())
  name          String
  preset        String?  // 'minimal', 'bold', etc.
  fontFamily    String   @default("Arial")
  fontSize      Int      @default(24)
  textColor     String   @default("#FFFFFF")
  backgroundColor String @default("rgba(0,0,0,0.7)")
  position      String   @default("bottom")
  alignment     String   @default("center")
  animation     String   @default("none")
  stroke        Json?    // { color, width }
  
  userId        String?
  user          User?    @relation(fields: [userId], references: [id])
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

### Update Export Model
```prisma
model Export {
  // ... existing fields
  
  captionStyle      String?  @default("minimal")
  captionsEnabled   Boolean  @default(true)
  burnCaptions      Boolean  @default(false)
  captionFile       String?  // URL to SRT/VTT file if not burned in
}
```

---

## 🎯 Success Metrics

### Technical
- ✅ Caption generation < 2 seconds
- ✅ Burn-in adds < 5 seconds to export
- ✅ All 6 presets working
- ✅ Custom styles working
- ✅ Preview loads < 1 second

### User Experience
- ✅ One-click caption generation
- ✅ Beautiful style presets
- ✅ Easy customization
- ✅ Fast preview
- ✅ Multiple export formats

### Business
- ✅ Matches Opus Clip feature
- ✅ Justifies premium pricing
- ✅ Increases engagement
- ✅ Accessibility compliance
- ✅ Competitive advantage

---

## 🚀 Implementation Phases

### Week 1: Foundation
- [ ] Create CaptionService
- [ ] Implement SRT generation
- [ ] Add FFmpeg caption burning
- [ ] Test basic functionality
- [ ] Update export pipeline

### Week 2: Styling
- [ ] Create style template system
- [ ] Implement 6 presets
- [ ] Build style selector UI
- [ ] Add customization panel
- [ ] Test all styles

### Week 3: Polish
- [ ] Build preview player
- [ ] Add caption editor
- [ ] Implement timing adjustment
- [ ] Add export options
- [ ] Final testing & bug fixes

---

## 📝 Testing Plan

### Unit Tests
- SRT generation from words
- VTT generation from words
- ASS generation with styling
- Style template application

### Integration Tests
- End-to-end caption generation
- FFmpeg burn-in process
- Export with captions
- Multiple format exports

### User Testing
- Test all 6 presets
- Test customization options
- Test preview functionality
- Test caption editing
- Test export formats

---

## 🎉 Ready to Start!

**Decision:** Begin with Week 1 - Foundation

**First Steps:**
1. Create CaptionService
2. Implement SRT generation
3. Add FFmpeg caption burning
4. Test with real videos

**Let's build!** 🚀
