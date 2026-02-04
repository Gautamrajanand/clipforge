# ClipForge Testing Guide

**Version:** v0.2.0 (UI Redesign)  
**Date:** November 5, 2025

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# Install web dependencies
cd apps/web
npm install

# Install API dependencies
cd ../api
npm install
```

### 2. Start Services

```bash
# Terminal 1: Start Docker services (PostgreSQL, MinIO)
docker-compose up -d

# Terminal 2: Start API
cd apps/api
npm run dev

# Terminal 3: Start Web
cd apps/web
npm run dev
```

### 3. Access Application

- **Web UI:** http://localhost:3001
- **API:** http://localhost:3000
- **API Docs:** http://localhost:3000/api/docs

---

## ✅ Testing Checklist

### Initial Setup
- [ ] Docker services running (postgres, minio)
- [ ] API server running on port 3000
- [ ] Web server running on port 3001
- [ ] No console errors on page load

### Dashboard Page (`http://localhost:3001/dashboard`)

#### Layout & Design
- [ ] Sidebar visible on left (192px width)
- [ ] Top bar visible with workspace selector
- [ ] "ClipForge" logo in sidebar
- [ ] Teal "Create" button in sidebar
- [ ] Plan widget at bottom of sidebar
- [ ] Inter font loaded correctly
- [ ] Background is light gray (#F9FAFB)

#### Feature Cards Section
- [ ] "Let's start with" heading visible
- [ ] 3 feature cards displayed in row:
  - [ ] Recording Studio (pink background)
  - [ ] Video Editor (blue background)
  - [ ] Audio Editor (mint background)
- [ ] Icons visible in each card
- [ ] Cards have rounded corners (24px)
- [ ] Hover effect: card lifts up
- [ ] Hover effect: shadow appears

#### AI Tools Section
- [ ] "AI Tools" heading visible
- [ ] 6 tool cards in 3-column grid:
  - [ ] AI Clips (purple gradient)
  - [ ] AI Text to Speech (blue gradient, "Soon" badge)
  - [ ] AI Transcription (green gradient, "Soon" badge)
  - [ ] AI Subtitles (indigo gradient, "Soon" badge)
  - [ ] AI Reframe (yellow gradient, "Soon" badge)
  - [ ] AI Avatar (pink gradient, "Soon" badge)
- [ ] Gradient backgrounds visible
- [ ] "Soon" badges display correctly
- [ ] Hover effect on cards

#### Recent Projects Section
- [ ] "Recent" heading visible
- [ ] "New project" card with dashed border
- [ ] Plus icon in center
- [ ] Existing projects display (if any)
- [ ] Project cards show:
  - [ ] Gradient thumbnail background
  - [ ] "Video" badge in top-left
  - [ ] Play icon in center
  - [ ] Project title
  - [ ] "Edited X ago" timestamp
- [ ] Empty state shows if no projects

#### Upload Modal
- [ ] Click "Create" button opens modal
- [ ] Click "Video Editor" card opens modal
- [ ] Click "AI Clips" card opens modal
- [ ] Modal has:
  - [ ] Purple gradient icon
  - [ ] "Upload Video" title
  - [ ] Close button (X) in top-right
  - [ ] Pink upload zone
  - [ ] Upload icon
  - [ ] "Click to upload" text
  - [ ] Project title input
  - [ ] Cancel button
  - [ ] "Upload & Process" button (disabled initially)

#### Upload Functionality
- [ ] Click upload zone opens file picker
- [ ] Drag and drop works
- [ ] Selected file name displays
- [ ] File size displays
- [ ] Project title auto-fills from filename
- [ ] Can edit project title
- [ ] "Upload & Process" enables when file + title present
- [ ] Click "Upload & Process" starts upload
- [ ] Loading overlay appears
- [ ] Redirects to project page after upload
- [ ] New project appears in "Recent" section

### Project Detail Page (`http://localhost:3001/project/[id]`)

#### Layout & Design
- [ ] Sidebar visible
- [ ] Top bar visible
- [ ] White header bar below top bar
- [ ] Back button (arrow) in header
- [ ] Project title in header
- [ ] Clip count in header subtitle
- [ ] Share button in header
- [ ] Export button in header (teal)

#### Source Video Section
- [ ] "Source Video" heading
- [ ] White card with rounded corners
- [ ] Video player visible
- [ ] Video player has black background
- [ ] Video controls work
- [ ] Video plays correctly

#### AI-Detected Clips Section
- [ ] "AI-Detected Clips" heading
- [ ] "Select clips to export" subtitle
- [ ] Clips display as cards
- [ ] Each clip card shows:
  - [ ] Custom checkbox (rounded square)
  - [ ] Score percentage (large, teal)
  - [ ] Reason text (bold)
  - [ ] Timestamp range
  - [ ] Duration
  - [ ] Sparkles icon (yellow)
  - [ ] "AI Analysis" section
  - [ ] Feature progress bars
  - [ ] Feature percentages
  - [ ] Color-coded bars (green 80%+, teal 60%+, gray <60%)
  - [ ] "Why This Clip Stands Out" section
  - [ ] Gray background explanation box

#### Clip Selection
- [ ] Click anywhere on card selects/deselects
- [ ] Checkbox fills with teal when selected
- [ ] Check icon appears when selected
- [ ] Card border changes to teal when selected
- [ ] Card shadow increases when selected
- [ ] Export button shows count: "Export (2)"
- [ ] Export button disabled when no clips selected

#### Export Functionality
- [ ] Select 1-3 clips
- [ ] Click "Export" button
- [ ] Button shows "Exporting..." during process
- [ ] Alert shows success message
- [ ] Exported clips section appears below

#### Exported Clips Section
- [ ] "Exported Clips" heading appears
- [ ] Clips display in 2-column grid
- [ ] Each exported clip shows:
  - [ ] Video player with controls
  - [ ] Video plays correctly
  - [ ] Clip ID below video
  - [ ] Format (MP4) displayed
  - [ ] Black "Download" button
  - [ ] Download icon in button

#### Download Functionality
- [ ] Click "Download" button
- [ ] File downloads as MP4
- [ ] Filename is "clip-[id].mp4"
- [ ] Video file is valid and playable

### Navigation
- [ ] Click back button returns to dashboard
- [ ] Click "Home" in sidebar goes to dashboard
- [ ] Click "Projects" in sidebar goes to dashboard
- [ ] Click "ClipForge" logo goes to dashboard
- [ ] Browser back button works

### Responsive Behavior
- [ ] Page scrolls smoothly
- [ ] No horizontal scroll
- [ ] Content doesn't overflow
- [ ] Cards maintain aspect ratios

---

## 🐛 Common Issues & Solutions

### Issue: "Cannot find module" errors
**Solution:** Run `npm install` in both `apps/web` and `apps/api`

### Issue: API not connecting
**Solution:** 
1. Check API is running on port 3000
2. Check Docker services are running
3. Check CORS is enabled in API

### Issue: Video not playing
**Solution:**
1. Check video uploaded successfully
2. Check MinIO is running
3. Check browser console for errors
4. Try different video format (MP4 recommended)

### Issue: Styles not loading
**Solution:**
1. Check Tailwind config is correct
2. Run `npm run dev` (not `npm start`)
3. Clear browser cache
4. Check `globals.css` is imported

### Issue: Upload fails
**Solution:**
1. Check file size (< 500MB recommended)
2. Check video format (MP4, MOV, AVI)
3. Check API logs for errors
4. Check MinIO is accessible

### Issue: Export fails
**Solution:**
1. Check FFmpeg is installed in API container
2. Check API logs for FFmpeg errors
3. Check disk space
4. Try shorter clips first

---

## 🎨 Visual Verification

### Colors to Check
- **Primary Teal:** Buttons, selected states, scores
- **Pink Cards:** Recording Studio feature card
- **Blue Cards:** Video Editor feature card
- **Mint Cards:** Audio Editor feature card
- **Gray Background:** Page background (#F9FAFB)
- **White Cards:** All content cards
- **Yellow:** "Try Premium" button

### Typography to Check
- **Font:** Inter (should be smooth, not system font)
- **Headings:** Bold, clear hierarchy
- **Body Text:** Regular weight, readable
- **Small Text:** Metadata, timestamps

### Spacing to Check
- **Generous padding:** Cards should have breathing room
- **Consistent gaps:** 24px between cards
- **Section spacing:** 48px between sections
- **No cramped areas:** Everything should feel spacious

### Animations to Check
- **Hover lift:** Cards move up slightly
- **Shadow on hover:** Subtle shadow appears
- **Smooth transitions:** 200ms duration
- **No jank:** Animations should be smooth

---

## 📊 Performance Checks

### Load Times
- [ ] Dashboard loads < 2 seconds
- [ ] Project page loads < 3 seconds
- [ ] Video starts playing < 5 seconds
- [ ] Upload modal opens instantly
- [ ] Navigation is instant

### Memory
- [ ] No memory leaks (check DevTools)
- [ ] Object URLs are cleaned up
- [ ] No growing memory usage

### Network
- [ ] Videos stream efficiently
- [ ] No unnecessary API calls
- [ ] Proper caching headers

---

## 🔍 Browser Testing

### Chrome/Edge
- [ ] All features work
- [ ] Styles render correctly
- [ ] Videos play
- [ ] No console errors

### Firefox
- [ ] All features work
- [ ] Styles render correctly
- [ ] Videos play
- [ ] No console errors

### Safari
- [ ] All features work
- [ ] Styles render correctly
- [ ] Videos play
- [ ] No console errors

---

## 📝 Test Scenarios

### Scenario 1: First Time User
1. Open http://localhost:3001/dashboard
2. See empty state
3. Click "Create Project" or "+ Create Project"
4. Upload a video file
5. Enter project title
6. Click "Upload & Process"
7. Wait for processing
8. See project detail page
9. See AI-detected clips
10. Select clips
11. Export clips
12. Download clips

### Scenario 2: Returning User
1. Open dashboard
2. See existing projects
3. Click on a project
4. See project details
5. Select different clips
6. Export new combination
7. Download exports
8. Go back to dashboard
9. See updated project

### Scenario 3: Multiple Projects
1. Create 3-4 projects
2. See all in "Recent" section
3. Click through each project
4. Verify data is correct
5. Export from different projects
6. Verify exports are separate

---

## ✅ Sign-Off Checklist

Before considering the redesign complete:

- [ ] All visual elements match Podcastle design
- [ ] All functionality works as before
- [ ] No regressions in existing features
- [ ] Performance is acceptable
- [ ] No console errors
- [ ] No TypeScript errors (runtime)
- [ ] Code is clean and documented
- [ ] Components are reusable
- [ ] Design system is consistent
- [ ] Ready for user testing

---

## 🚀 Next Steps After Testing

1. **Gather Feedback**
   - Show to team
   - Get user feedback
   - Note improvement areas

2. **Fix Issues**
   - Address bugs found
   - Improve performance
   - Polish rough edges

3. **Enhance**
   - Add mobile responsive
   - Add dark mode
   - Add more animations

4. **Deploy**
   - Test in staging
   - Deploy to production
   - Monitor for issues

---

**Happy Testing!** 🎉

If you find any issues, document them with:
- Screenshot
- Steps to reproduce
- Expected vs actual behavior
- Browser and OS version
