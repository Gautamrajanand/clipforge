# Frontend Integration Guide

## 🎯 Why You Don't See Changes

The UI components were **created but not integrated** into existing pages. They exist as standalone files but need to be:
1. Imported into pages
2. Wired up to API endpoints
3. Added to the routing

---

## 📦 Components Created (Not Yet Integrated)

### 1. Video Playback Components
- `apps/web/components/video/VideoPlayer.tsx` - Custom video player
- `apps/web/components/clips/ClipsGrid.tsx` - Clips grid with thumbnails

### 2. Caption Components
- `apps/web/components/captions/CaptionStyleSelector.tsx` - Style picker
- `apps/web/components/captions/CaptionPreview.tsx` - Live preview

### 3. Settings Components
- `apps/web/components/clips/ClipSettings.tsx` - Counter controls

---

## 🔧 Integration Steps

### Step 1: Update Project Page with ClipsGrid

**File:** `apps/web/app/projects/[id]/page.tsx`

Replace the existing clips section (lines 92-139) with our new ClipsGrid:

```tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from 'react-query';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import ClipsGrid from '@/components/clips/ClipsGrid';  // NEW
import ClipSettings from '@/components/clips/ClipSettings';  // NEW
import { Play, Loader2, Settings } from 'lucide-react';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const [isDetecting, setIsDetecting] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Fetch project
  const { data: project, isLoading: projectLoading } = useQuery(
    ['project', projectId],
    () => axios.get(`${API_URL}/v1/projects/${projectId}`),
    { select: (res) => res.data }
  );

  // Fetch moments (clips)
  const { data: moments, isLoading: momentsLoading, refetch: refetchMoments } = useQuery(
    ['moments', projectId],
    () => axios.get(`${API_URL}/v1/projects/${projectId}/moments`),
    { select: (res) => res.data }
  );

  // Start detection
  const handleDetect = async () => {
    try {
      setIsDetecting(true);
      await axios.post(`${API_URL}/v1/projects/${projectId}/detect`);
      toast.success('Highlight detection started');
      
      // Poll for results
      const interval = setInterval(async () => {
        const result = await axios.get(`${API_URL}/v1/projects/${projectId}/moments`);
        if (result.data.length > 0) {
          clearInterval(interval);
          refetchMoments();
          setIsDetecting(false);
        }
      }, 2000);
    } catch (error) {
      toast.error('Failed to start detection');
      setIsDetecting(false);
    }
  };

  // Handle export
  const handleExport = async (momentId: string) => {
    try {
      const response = await axios.post(`${API_URL}/v1/exports`, {
        momentId,
        format: 'MP4',
        aspectRatio: '9:16',
      });
      toast.success('Export started');
      // Optionally redirect to exports page
    } catch (error) {
      toast.error('Failed to start export');
    }
  };

  // Handle share
  const handleShare = async (momentId: string) => {
    // TODO: Implement share functionality
    toast.success('Share link copied to clipboard');
  };

  // Handle settings change
  const handleSettingsChange = async (settings: { length: number; count: number }) => {
    try {
      await axios.patch(`${API_URL}/v1/projects/${projectId}`, {
        clipSettings: settings,
      });
      toast.success('Settings updated');
    } catch (error) {
      toast.error('Failed to update settings');
    }
  };

  if (projectLoading) {
    return <div className="container py-8">Loading...</div>;
  }

  // Transform moments to clips format for ClipsGrid
  const clips = moments?.map((moment: any) => ({
    id: moment.id,
    title: moment.title,
    description: moment.description,
    duration: moment.duration,
    thumbnailUrl: moment.thumbnailUrl,
    proxyUrl: moment.proxyUrl,
    score: moment.score,
    aspectRatio: moment.aspectRatio,
    createdAt: moment.createdAt,
  })) || [];

  return (
    <div className="container py-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold mb-2">{project?.title}</h1>
            <p className="text-slate-600">
              Status: <span className="font-semibold capitalize">{project?.status}</span>
            </p>
          </div>
          <Button
            onClick={() => setShowSettings(!showSettings)}
            variant="outline"
            className="gap-2"
          >
            <Settings className="w-4 h-4" />
            Settings
          </Button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="mb-8 p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Clip Settings</h2>
          <ClipSettings
            initialLength={project?.clipSettings?.length || 45}
            initialCount={project?.clipSettings?.count || 5}
            onSettingsChange={handleSettingsChange}
          />
        </div>
      )}

      {/* Clips Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold">Generated Clips</h2>
            <p className="text-sm text-gray-600 mt-1">
              {clips.length} clips ready to view and export
            </p>
          </div>
          <Button
            onClick={handleDetect}
            disabled={isDetecting}
            className="bg-blue-600 hover:bg-blue-700 gap-2"
          >
            {isDetecting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Detecting...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Detect Highlights
              </>
            )}
          </Button>
        </div>

        {momentsLoading ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Loading clips...</p>
          </div>
        ) : (
          <ClipsGrid
            clips={clips}
            onExport={handleExport}
            onShare={handleShare}
          />
        )}
      </div>
    </div>
  );
}
```

---

### Step 2: Add Caption Style Selector to Clip Editor

**File:** Create `apps/web/app/projects/[id]/edit/[momentId]/page.tsx`

```tsx
'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from 'react-query';
import axios from 'axios';
import CaptionStyleSelector from '@/components/captions/CaptionStyleSelector';
import CaptionPreview from '@/components/captions/CaptionPreview';
import VideoPlayer from '@/components/video/VideoPlayer';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export default function ClipEditorPage() {
  const params = useParams();
  const momentId = params.momentId as string;
  const [captionStyle, setCaptionStyle] = useState('karaoke');
  const [currentTime, setCurrentTime] = useState(0);

  // Fetch moment
  const { data: moment } = useQuery(
    ['moment', momentId],
    () => axios.get(`${API_URL}/v1/moments/${momentId}`),
    { select: (res) => res.data }
  );

  // Fetch transcript
  const { data: transcript } = useQuery(
    ['transcript', moment?.projectId],
    () => axios.get(`${API_URL}/v1/projects/${moment?.projectId}/transcript`),
    { 
      enabled: !!moment?.projectId,
      select: (res) => res.data 
    }
  );

  const handleExport = async () => {
    try {
      await axios.post(`${API_URL}/v1/exports`, {
        momentId,
        format: 'MP4',
        aspectRatio: moment?.aspectRatio || '9:16',
        captionStyle,
        captionsEnabled: true,
      });
      toast.success('Export started with captions');
    } catch (error) {
      toast.error('Failed to start export');
    }
  };

  if (!moment) {
    return <div className="container py-8">Loading...</div>;
  }

  return (
    <div className="container py-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Edit Clip</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Video Preview */}
        <div className="lg:col-span-2">
          <div className="relative">
            {moment.proxyUrl && (
              <VideoPlayer
                src={moment.proxyUrl}
                poster={moment.thumbnailUrl}
                title={moment.title}
              />
            )}
            
            {/* Caption Preview Overlay */}
            {transcript && (
              <CaptionPreview
                transcript={transcript}
                currentTime={currentTime}
                styleId={captionStyle}
                className="absolute inset-0 pointer-events-none"
              />
            )}
          </div>

          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2">Clip Details</h3>
            <p className="text-sm text-gray-600">
              Duration: {moment.duration.toFixed(1)}s | 
              Aspect Ratio: {moment.aspectRatio} | 
              Score: {Math.round(moment.score * 100)}%
            </p>
          </div>
        </div>

        {/* Caption Styles */}
        <div className="lg:col-span-1">
          <div className="sticky top-8">
            <h2 className="text-xl font-semibold mb-4">Caption Style</h2>
            <CaptionStyleSelector
              selectedStyle={captionStyle}
              onStyleChange={setCaptionStyle}
            />

            <Button
              onClick={handleExport}
              className="w-full mt-6 bg-blue-600 hover:bg-blue-700"
            >
              Export with Captions
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

### Step 3: Update API Endpoints

**File:** `apps/web/lib/api.ts` (create if doesn't exist)

```typescript
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const api = axios.create({
  baseURL: API_URL,
});

// Add auth token interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Project API
export const projectsApi = {
  get: (id: string) => api.get(`/v1/projects/${id}`),
  list: () => api.get('/v1/projects'),
  create: (data: any) => api.post('/v1/projects', data),
  update: (id: string, data: any) => api.patch(`/v1/projects/${id}`, data),
  delete: (id: string) => api.delete(`/v1/projects/${id}`),
};

// Moments API
export const momentsApi = {
  list: (projectId: string) => api.get(`/v1/projects/${projectId}/moments`),
  get: (id: string) => api.get(`/v1/moments/${id}`),
  detect: (projectId: string) => api.post(`/v1/projects/${projectId}/detect`),
};

// Exports API
export const exportsApi = {
  create: (data: {
    momentId: string;
    format: string;
    aspectRatio: string;
    captionStyle?: string;
    captionsEnabled?: boolean;
  }) => api.post('/v1/exports', data),
  get: (id: string) => api.get(`/v1/exports/${id}`),
  list: () => api.get('/v1/exports'),
};

// Transcripts API
export const transcriptsApi = {
  get: (projectId: string) => api.get(`/v1/projects/${projectId}/transcript`),
};
```

---

### Step 4: Enable Feature Flags in Frontend

**File:** `apps/web/lib/feature-flags.ts` (create)

```typescript
export const FeatureFlags = {
  ASPECT_RATIO: process.env.NEXT_PUBLIC_FF_ASPECT_RATIO === 'true',
  CAPTION_STYLES: process.env.NEXT_PUBLIC_FF_CAPTION_STYLES === 'true',
  INPAGE_PLAYBACK: process.env.NEXT_PUBLIC_FF_INPAGE_PLAYBACK === 'true',
} as const;

export function useFeatureFlag(flag: keyof typeof FeatureFlags): boolean {
  return FeatureFlags[flag];
}
```

**File:** `apps/web/.env.local` (create)

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_FF_ASPECT_RATIO=true
NEXT_PUBLIC_FF_CAPTION_STYLES=true
NEXT_PUBLIC_FF_INPAGE_PLAYBACK=true
```

---

## 🚀 Quick Integration (Minimal Changes)

If you want to see changes immediately with minimal work:

### Option 1: Replace Project Page
```bash
# Backup current page
cp apps/web/app/projects/[id]/page.tsx apps/web/app/projects/[id]/page.tsx.backup

# Use the new implementation from Step 1 above
```

### Option 2: Add New Route for Testing
```bash
# Create new test page
mkdir -p apps/web/app/test-clips
```

Create `apps/web/app/test-clips/page.tsx`:
```tsx
'use client';

import ClipsGrid from '@/components/clips/ClipsGrid';

const mockClips = [
  {
    id: '1',
    title: 'Amazing Product Launch',
    description: 'Great moment from the keynote',
    duration: 45,
    thumbnailUrl: 'https://via.placeholder.com/640x360',
    proxyUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    score: 0.95,
    aspectRatio: '9:16',
    createdAt: new Date().toISOString(),
  },
  // Add more mock clips...
];

export default function TestClipsPage() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Test Clips Grid</h1>
      <ClipsGrid
        clips={mockClips}
        onExport={(id) => console.log('Export:', id)}
        onShare={(id) => console.log('Share:', id)}
      />
    </div>
  );
}
```

Then visit: `http://localhost:3001/test-clips`

---

## ✅ Verification Checklist

After integration:
- [ ] ClipsGrid displays on project page
- [ ] Video player opens in modal on click
- [ ] Keyboard shortcuts work (Space, M, F, Esc)
- [ ] Caption style selector shows 10 presets
- [ ] Caption preview overlays on video
- [ ] Clip settings shows sliders with exact values
- [ ] Export button creates export with selected options

---

## 🐛 Troubleshooting

### Components not found
```bash
# Check component paths
ls -la apps/web/components/video/
ls -la apps/web/components/clips/
ls -la apps/web/components/captions/
```

### Import errors
Make sure tsconfig paths are configured:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

### API not responding
Check feature flags are enabled and API is running:
```bash
# Check API
curl http://localhost:3000/health

# Check worker
curl http://localhost:8000/health
```

---

**Next:** Choose integration approach and implement!
