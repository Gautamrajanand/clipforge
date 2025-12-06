'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import Link from 'next/link';
import { ArrowLeft, Download, Share2, Sparkles, Type, Wand2 } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import ClipsGrid from '@/components/clips/ClipsGrid';
import VideoPlayer from '@/components/video/VideoPlayer';
import ClipSettings from '@/components/clips/ClipSettings';
import ExportModal, { ExportOptions } from '@/components/export/ExportModal';
import SuccessCelebration from '@/components/SuccessCelebration';
import { fetchWithAuth } from '@/lib/api';
import { analytics, AnalyticsEvents } from '@/lib/analytics';
import { usePageTracking } from '@/hooks/useAnalytics';

export default function ProjectDetail({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { getToken: getClerkToken, isLoaded, isSignedIn } = useAuth();
  
  // Track project page view
  usePageTracking('Project Detail', { projectId: params.id });
  
  const [project, setProject] = useState<any>(null);
  const [clips, setClips] = useState<any[]>([]);
  const [selectedClips, setSelectedClips] = useState<string[]>([]);
  const [token, setToken] = useState<string>('');
  const [isExporting, setIsExporting] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportedClips, setExportedClips] = useState<any[]>([]);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [exportVideoUrls, setExportVideoUrls] = useState<Record<string, string>>({});
  const [selectedClipForPlayback, setSelectedClipForPlayback] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [clipSettings, setClipSettings] = useState({
    clipLength: 45,
    clipCount: 5,
    minLength: 15,
    maxLength: 180,
  });
  const [isDetecting, setIsDetecting] = useState(false);
  const [transcript, setTranscript] = useState<any>(null);
  const [credits, setCredits] = useState(0);
  const [creditsAllocation, setCreditsAllocation] = useState(60);
  const [resetDate, setResetDate] = useState<string>('');
  const [tier, setTier] = useState<string>('FREE');
  const [showCelebration, setShowCelebration] = useState(false);
  const [isFirstClip, setIsFirstClip] = useState(false);

  const fetchExistingExports = async () => {
    try {
      const response = await fetchWithAuth(`http://localhost:3001/v1/projects/${params.id}/exports`, {
        getToken: getClerkToken,
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.exports && data.exports.length > 0) {
          setExportedClips(data.exports);
          
          // Load video URLs for each export
          const urls: Record<string, string> = {};
          for (const exp of data.exports) {
            const url = await loadExportVideoBlob(exp.id);
            if (url) urls[exp.id] = url;
          }
          setExportVideoUrls(urls);
          console.log(`✅ Loaded ${data.exports.length} existing exports`);
        }
      }
    } catch (error) {
      console.error('Failed to fetch existing exports:', error);
    }
  };

  const fetchCredits = async () => {
    try {
      const response = await fetchWithAuth('http://localhost:3001/v1/credits/balance', {
        getToken: getClerkToken,
      });
      if (response.ok) {
        const data = await response.json();
        setCredits(data.balance);
        setCreditsAllocation(data.allocation);
        setResetDate(data.resetDate);
        setTier(data.tier || 'FREE');
      }
    } catch (error) {
      console.error('Failed to fetch credits:', error);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      if (!isLoaded) return;
      
      if (!isSignedIn) {
        router.push('/sign-in');
        return;
      }

      try {
        const clerkToken = await getClerkToken();
        if (clerkToken) {
          console.log('✅ Clerk token obtained');
          setToken(clerkToken);
          fetchProjectData();
        }
      } catch (error) {
        console.error('❌ Auth error:', error);
        router.push('/sign-in');
      }
    };
    initAuth();
  }, [isLoaded, isSignedIn, getClerkToken, router]);

  const fetchProjectData = async (silent = false) => {
    try {
      const response = await fetchWithAuth(`http://localhost:3001/v1/projects/${params.id}`, {
        getToken: getClerkToken,
      });
      if (response.ok) {
        const data = await response.json();
        if (!silent) {
          console.log('📊 Project data:', data);
          console.log('🎬 Clip settings:', data.clipSettings);
        }
        
        setProject(data);
        setClips(data.moments || []);
        setTranscript(data.transcript || null);
        
        // Fetch credits data
        fetchCredits();
        
        // Fetch existing exports
        fetchExistingExports();
        
        // Check if this is a subtitles or reframe project
        const isSubtitlesMode = data.clipSettings?.subtitlesMode;
        const isReframeMode = data.clipSettings?.reframeMode;
        
        console.log('🎯 Project mode:', { isSubtitlesMode, isReframeMode });
        
        // Skip Smart Clips generation for subtitles/reframe modes
        if (isSubtitlesMode || isReframeMode) {
          console.log('⏭️  Skipping Smart Clips generation (subtitles/reframe mode)');
          
          // Poll for status updates if still processing
          if (data.status === 'TRANSCRIBING' || data.status === 'IMPORTING' || data.status === 'INGESTING' || data.status === 'DETECTING') {
            console.log(`🔄 Project status: ${data.status} - will poll for updates`);
            // Start polling
            setTimeout(() => fetchProjectData(true), 5000);
          } else if (isReframeMode && data.status === 'READY') {
            // For reframe projects, check if reframed asset exists
            // If not, poll until it's ready (reframe processing happens async after transcription)
            const hasReframedAsset = data.assets?.some((a: any) => a.url?.includes('reframed.mp4'));
            
            if (!hasReframedAsset) {
              console.log('📐 Reframe project but no reframed asset yet - polling...');
              setTimeout(() => fetchProjectData(true), 2000);
            } else {
              console.log('✅ Reframed asset found - loading reframed video');
              // Load the reframed video
              if (data?.sourceUrl) {
                await loadVideoBlob();
              }
            }
          } else if (data?.sourceUrl) {
            // For subtitles mode or other cases, load video normally
            await loadVideoBlob();
          }
          
          return;
        }
        
        // Load video for normal AI Clips mode
        if (data?.sourceUrl) {
          await loadVideoBlob();
        }
        
        // Auto-generate Smart Clips if none exist and transcript is available
        // Only do this once per session to avoid duplicate generations
        const hasSmartClips = data.moments?.some((m: any) => m.features?.isProClip);
        const hasAttemptedGeneration = sessionStorage.getItem(`smart-clips-generated-${params.id}`);
        
        if (!hasSmartClips && !hasAttemptedGeneration && data.transcript && data.moments?.length > 0) {
          console.log('No Smart Clips found, auto-generating...');
          sessionStorage.setItem(`smart-clips-generated-${params.id}`, 'true');
          // Generate Smart Clips in background (don't await)
          generateSmartClipsInBackground();
        }
      }
    } catch (error) {
      console.error('Failed to fetch project:', error);
    }
  };
  
  const generateSmartClipsInBackground = async () => {
    try {
      const response = await fetchWithAuth(`http://localhost:3001/v1/projects/${params.id}/clips/pro`, {
        method: 'POST',
        getToken: getClerkToken,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          numClips: 10, // Try to generate up to 10, but return however many are actually found
          targetDuration: clipSettings.clipLength,
          withCrossfade: false,
        }),
      });
      
      if (response.ok) {
        console.log('Smart Clips generated in background');
        // Refresh to show new Smart Clips
        await fetchProjectData();
      }
    } catch (error) {
      console.error('Background Smart Clips generation failed:', error);
    }
  };

  const loadVideoBlob = async () => {
    try {
      // Clear old video URL and revoke blob
      setVideoUrl(prev => {
        if (prev) {
          URL.revokeObjectURL(prev);
          console.log('🗑️  Revoked old video blob URL');
        }
        return null; // Clear the URL immediately
      });

      // Add cache-busting parameter to force fresh fetch
      const cacheBuster = Date.now();
      console.log(`📥 Fetching video with cache buster: ${cacheBuster}`);
      const resp = await fetchWithAuth(`http://localhost:3001/v1/projects/${params.id}/video?t=${cacheBuster}`, {
        getToken: getClerkToken,
      });
      if (!resp.ok) {
        console.error('Failed to fetch video stream');
        return;
      }
      const blob = await resp.blob();
      console.log(`✅ Received video blob: ${blob.size} bytes, type: ${blob.type}`);
      const url = URL.createObjectURL(blob);
      setVideoUrl(url);
    } catch (e) {
      console.error('Error loading video blob:', e);
    }
  };

  const loadExportVideoBlob = async (exportId: string) => {
    try {
      const resp = await fetchWithAuth(`http://localhost:3001/v1/projects/exports/${exportId}/download`, {
        getToken: getClerkToken,
      });
      if (!resp.ok) return null;
      const blob = await resp.blob();
      return URL.createObjectURL(blob);
    } catch (e) {
      console.error('Error loading export video blob:', e);
      return null;
    }
  };

  const toggleClip = (clipId: string) => {
    setSelectedClips(prev =>
      prev.includes(clipId) ? prev.filter(id => id !== clipId) : [...prev, clipId]
    );
  };

  const handleExportClick = () => {
    if (selectedClips.length === 0) {
      alert('Please select at least one clip to export');
      return;
    }
    setShowExportModal(true);
  };

  const handleExport = async (options: ExportOptions) => {
    setIsExporting(true);
    
    // Track export initiation
    analytics.track(AnalyticsEvents.CLIP_EXPORTED, {
      projectId: params.id,
      clipCount: selectedClips.length,
      aspectRatio: options.aspectRatio,
      cropMode: options.cropMode,
      burnCaptions: options.burnCaptions,
      captionStyle: options.captionStyle,
    });
    
    try {
      // Get a fresh token immediately before export to avoid expiration
      const freshToken = await getClerkToken();
      if (!freshToken) {
        alert('Authentication failed. Please refresh the page and try again.');
        setIsExporting(false);
        return;
      }

      const response = await fetchWithAuth(`http://localhost:3001/v1/projects/${params.id}/export`, {
        method: 'POST',
        getToken: async () => freshToken, // Use the fresh token we just got
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          momentIds: selectedClips,
          aspectRatio: options.aspectRatio,
          cropMode: options.cropMode,
          cropPosition: options.cropPosition,
          burnCaptions: options.burnCaptions,
          captionStyle: options.captionStyle,
          primaryColor: options.primaryColor,
          secondaryColor: options.secondaryColor,
          fontSize: options.fontSize,
          position: options.position,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Check if export is processing in background
        if (data.status === 'processing') {
          alert(data.message || 'Export started. Your clip will appear below when ready (usually 2-3 minutes).');
          setIsExporting(false);
          
          // Track initial export count
          const initialExportCount = exportedClips.length;
          
          // Start polling for new exports every 10 seconds
          const pollInterval = setInterval(async () => {
            try {
              const response = await fetchWithAuth(`http://localhost:3001/v1/projects/${params.id}/exports`, {
                getToken: getClerkToken,
              });
              
              if (response.ok) {
                const pollData = await response.json();
                // Stop polling if we have new exports
                if (pollData.exports && pollData.exports.length > initialExportCount) {
                  clearInterval(pollInterval);
                  // Refresh exports one final time
                  await fetchExistingExports();
                }
              }
            } catch (error) {
              console.error('Polling error:', error);
            }
          }, 10000); // Poll every 10 seconds
          
          // Stop polling after 5 minutes regardless
          setTimeout(() => clearInterval(pollInterval), 5 * 60 * 1000);
          
          return;
        }
        
        setExportedClips(data.exports);
        
        const urls: Record<string, string> = {};
        for (const exp of data.exports) {
          const url = await loadExportVideoBlob(exp.id);
          if (url) urls[exp.id] = url;
        }
        setExportVideoUrls(urls);
        
        // Track successful export
        analytics.track('clip_export_success', {
          projectId: params.id,
          clipCount: data.exports.length,
          aspectRatio: options.aspectRatio,
        });
        
        alert(`Successfully exported ${data.exports.length} clips with ${options.aspectRatio} aspect ratio!`);
      } else {
        // Track export failure
        analytics.track('clip_export_failed', {
          projectId: params.id,
          clipCount: selectedClips.length,
          statusCode: response.status,
        });
        
        // Better error messages based on status code
        if (response.status === 402) {
          alert('Insufficient credits. Please upgrade your plan.');
        } else {
          const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
          alert(`Failed to export clips: ${errorData.message || response.statusText}`);
        }
      }
    } catch (error) {
      console.error('Export error:', error);
      analytics.track('clip_export_error', {
        projectId: params.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      alert('Failed to export clips');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDetectClips = async () => {
    setIsDetecting(true);
    const hadNoClipsBefore = clips.length === 0;
    
    try {
      const response = await fetchWithAuth(`http://localhost:3001/v1/projects/${params.id}/detect`, {
        method: 'POST',
        getToken: getClerkToken,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clipLength: clipSettings.clipLength,
          clipCount: clipSettings.clipCount,
        }),
      });

      if (response.ok) {
        // Refresh project data to get new clips
        await fetchProjectData();
        
        // Check if this was the first clip creation (aha moment!)
        if (hadNoClipsBefore && clips.length > 0) {
          setIsFirstClip(true);
          setShowCelebration(true);
          
          // Track aha moment
          analytics.track(AnalyticsEvents.AHA_MOMENT, {
            feature: 'ai_clips',
            projectId: params.id,
            clipCount: clips.length,
          });
          
          console.log('🎉 First clip created - Aha moment!');
        } else {
          alert('Clips detected successfully!');
        }
      } else {
        alert('Failed to detect clips');
      }
    } catch (error) {
      console.error('Detection error:', error);
      alert('Failed to detect clips');
    } finally {
      setIsDetecting(false);
    }
  };


  const handleDownloadExport = async (exportId: string) => {
    try {
      // Prefer the already-loaded blob URL used for the preview video to avoid
      // an extra network call and any auth/header issues
      const existingUrl = exportVideoUrls[exportId];
      if (existingUrl) {
        const a = document.createElement('a');
        a.href = existingUrl;
        a.download = `clip-${exportId}.mp4`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        return;
      }

      // Fallback: fetch from API if for some reason we don't have the blob URL cached
      const response = await fetchWithAuth(`http://localhost:3001/v1/projects/exports/${exportId}/download`, {
        getToken: getClerkToken,
      });
      if (!response.ok) {
        console.error('Download failed with status', response.status);
        alert('Failed to download clip. Please try again.');
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `clip-${exportId}.mp4`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download clip. Please try again.');
    }
  };

  useEffect(() => {
    return () => {
      if (videoUrl) URL.revokeObjectURL(videoUrl);
      Object.values(exportVideoUrls).forEach(url => URL.revokeObjectURL(url));
    };
  }, [videoUrl, exportVideoUrls]);

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading project...</p>
        </div>
      </div>
    );
  }

  // Check project mode
  const isSubtitlesMode = project?.clipSettings?.subtitlesMode;
  const isReframeMode = project?.clipSettings?.reframeMode;
  const projectMode = isSubtitlesMode ? 'subtitles' : isReframeMode ? 'reframe' : 'clips';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Success Celebration for First Clip */}
      <SuccessCelebration
        isOpen={showCelebration}
        onClose={() => setShowCelebration(false)}
        title="Your First AI Clip! 🎉"
        message="You just created your first viral clip in seconds. That's the power of AI!"
      />
      
      <Sidebar 
        credits={credits}
        creditsAllocation={creditsAllocation}
        resetDate={resetDate}
        tier={tier}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <TopBar onMenuClick={() => setIsSidebarOpen(true)} />
      
      <main className="lg:ml-64 pt-16">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3 lg:gap-4 w-full lg:w-auto">
              <Link href="/dashboard">
                <button className="w-10 h-10 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors">
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
              </Link>
              <div className="flex-1 lg:flex-none">
                <h1 className="text-lg lg:text-2xl font-bold text-gray-900 truncate">{project.title}</h1>
                <p className="text-xs lg:text-sm text-gray-500">
                  {projectMode === 'subtitles' && '🎬 AI Subtitles Project'}
                  {projectMode === 'reframe' && '📐 AI Reframe Project'}
                  {projectMode === 'clips' && (
                    <>
                      <span className="hidden sm:inline">{clips.length} clips detected • {selectedClips.length} selected</span>
                      <span className="sm:hidden">{clips.length} clips • {selectedClips.length} selected</span>
                    </>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 lg:gap-3 w-full lg:w-auto">
              <button className="hidden sm:flex px-3 lg:px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors items-center gap-2 text-sm lg:text-base">
                <Share2 className="w-4 h-4" />
                <span className="hidden lg:inline">Share</span>
              </button>
              
              {/* Show Export button for subtitles/reframe, Export button for clips */}
              {projectMode === 'subtitles' ? (
                <button
                  onClick={async () => {
                    // Export captioned video (like AI Clips flow)
                    try {
                      setIsExporting(true);
                      console.log('🎬 Exporting captioned video...');
                      
                      // Check if captioned video is ready
                      if (project?.status !== 'READY') {
                        alert('Subtitles are still processing. Please wait a few more minutes and try again.');
                        setIsExporting(false);
                        return;
                      }
                      
                      // Create a fake export record for the captioned video (matching AI Clips structure)
                      const exportItem = {
                        id: `subtitle-export-${project.id}`,
                        projectId: project.id,
                        title: project.title,
                        captionStyle: project.clipSettings?.captionStyle,
                        primaryColor: project.clipSettings?.primaryColor,
                        secondaryColor: project.clipSettings?.secondaryColor,
                        fontSize: project.clipSettings?.fontSize,
                        position: project.clipSettings?.position,
                      };
                      
                      // Add to exported clips
                      setExportedClips([exportItem]);
                      
                      // Load the captioned video as a blob
                      const response = await fetchWithAuth(`http://localhost:3001/v1/projects/${params.id}/download-captioned`, {
                        getToken: getClerkToken,
                      });
                      
                      if (!response.ok) {
                        if (response.status === 404) {
                          alert('Captioned video is still being generated. Please wait a few more minutes.');
                        } else {
                          throw new Error(`Failed to load captioned video: ${response.status}`);
                        }
                        setExportedClips([]);
                        return;
                      }
                      
                      const blob = await response.blob();
                      const url = URL.createObjectURL(blob);
                      
                      // Store the blob URL for preview
                      setExportVideoUrls({ [exportItem.id]: url });
                      
                      console.log('✅ Captioned video ready for preview');
                    } catch (error) {
                      console.error('❌ Export failed:', error);
                      alert('Failed to export video with captions. Please try again.');
                      setExportedClips([]);
                    } finally {
                      setIsExporting(false);
                    }
                  }}
                  disabled={!videoUrl || !project?.transcript || isExporting || project?.status !== 'READY'}
                  className="px-6 py-2 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  {isExporting ? 'Exporting...' : project?.status !== 'READY' ? 'Processing...' : 'Export'}
                </button>
              ) : projectMode === 'reframe' ? (
                <button
                  onClick={async () => {
                    // Download the reframed video from storage
                    try {
                      console.log('📐 Starting AI Reframe download...');
                      
                      // Fetch the reframed video from the API
                      const response = await fetchWithAuth(`http://localhost:3001/v1/projects/${params.id}/video`, {
                        getToken: getClerkToken,
                      });
                      
                      if (!response.ok) {
                        console.error('Download failed:', response.status);
                        throw new Error(`Download failed: ${response.status}`);
                      }
                      
                      console.log('📥 Downloading blob...');
                      const blob = await response.blob();
                      console.log('✅ Blob received:', blob.size, 'bytes');
                      
                      const url = URL.createObjectURL(blob);
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = `${project.title}-reframe.mp4`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      URL.revokeObjectURL(url);
                      
                      console.log('✅ Download complete');
                    } catch (error) {
                      console.error('❌ Download failed:', error);
                      alert('Failed to download reframed video. Please try again.');
                    }
                  }}
                  disabled={!videoUrl}
                  className="px-6 py-2 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download Video
                </button>
              ) : (
                <button
                  onClick={handleExportClick}
                  disabled={selectedClips.length === 0 || isExporting}
                  className="px-6 py-2 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  {isExporting ? 'Exporting...' : `Export ${selectedClips.length > 0 ? `(${selectedClips.length})` : ''}`}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Video Player */}
          {videoUrl && (
            <div className="bg-white rounded-2xl p-6 mb-8 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Source Video</h2>
              {(() => {
                console.log('🎥 Video Player Render Check:', {
                  projectMode,
                  hasTranscript: !!transcript,
                  transcriptData: transcript,
                  shouldShowCaptions: false // Never show captions in source video preview
                });
                
                // Always show plain video player for source video
                // Captions are only shown in export preview
                return (
                  <div className="aspect-video bg-black rounded-xl overflow-hidden">
                    <video
                      controls
                      className="w-full h-full"
                      src={videoUrl}
                      preload="metadata"
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Mode-specific content */}
          {projectMode === 'subtitles' && (
            <div className="bg-white rounded-2xl p-8 mb-8 shadow-sm text-center">
              <div className="max-w-2xl mx-auto">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Type className="w-8 h-8 text-purple-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">AI Subtitles Processing</h2>
                <p className="text-gray-600 mb-6">
                  Your video is being processed with AI-generated subtitles using the <strong>{project.clipSettings?.captionStyle || 'Karaoke'}</strong> style.
                </p>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-left">
                  <h3 className="font-semibold text-purple-900 mb-2">Subtitle Settings:</h3>
                  <ul className="space-y-1 text-sm text-purple-800">
                    <li>• Style: {project.clipSettings?.captionStyle || 'Karaoke'}</li>
                    <li>• Primary Color: {project.clipSettings?.primaryColor || '#FFFFFF'}</li>
                    <li>• Secondary Color: {project.clipSettings?.secondaryColor || '#FFD700'}</li>
                    <li>• Font Size: {project.clipSettings?.fontSize || 48}px</li>
                  </ul>
                </div>
                <p className="text-sm text-gray-500 mt-4">
                  Subtitle editor coming soon! For now, your video will be processed with these settings.
                </p>
              </div>
            </div>
          )}

          {projectMode === 'reframe' && (
            <div className="bg-white rounded-2xl p-8 mb-8 shadow-sm text-center">
              <div className="max-w-2xl mx-auto">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Wand2 className="w-8 h-8 text-yellow-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">AI Reframe Processing</h2>
                <p className="text-gray-600 mb-6">
                  Your video is being reframed to <strong>{project.clipSettings?.aspectRatio || '9:16'}</strong> aspect ratio using AI.
                </p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-left">
                  <h3 className="font-semibold text-yellow-900 mb-2">Reframe Settings:</h3>
                  <ul className="space-y-1 text-sm text-yellow-800">
                    <li>• Aspect Ratio: {project.clipSettings?.aspectRatio || '9:16'}</li>
                    <li>• Strategy: {project.clipSettings?.framingStrategy || 'Smart Crop'}</li>
                    {project.clipSettings?.backgroundColor && (
                      <li>• Background: {project.clipSettings.backgroundColor}</li>
                    )}
                  </ul>
                </div>
                <p className="text-sm text-gray-500 mt-4">
                  Reframe editor coming soon! For now, your video will be processed with these settings.
                </p>
              </div>
            </div>
          )}

          {/* AI-Detected Clips Grid */}
          {projectMode === 'clips' && clips.length > 0 && (
            <div className="mb-8">
              <ClipsGrid
                clips={clips}
                selectedClips={selectedClips}
                onClipSelect={toggleClip}
                onClipPlay={(clip: any) => setSelectedClipForPlayback(clip)}
              />
            </div>
          )}

          {/* Video Player Modal */}
          {selectedClipForPlayback && (
            <VideoPlayer
              src={selectedClipForPlayback.proxyUrl || videoUrl || ''}
              onClose={() => setSelectedClipForPlayback(null)}
            />
          )}

          {/* Exported Clips */}
          {exportedClips.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Exported Clips</h2>
              <div className="grid grid-cols-2 gap-6">
                {exportedClips.map((exportItem) => {
                  // Find the corresponding moment to get its title (for AI Clips)
                  // Or use the provided title (for AI Subtitles)
                  const moment = clips.find(c => c.id === exportItem.momentId);
                  const clipTitle = exportItem.title || moment?.title || `Clip ${exportItem.momentId?.slice(-6)}`;
                  
                  return (
                  <div key={exportItem.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200">
                    <div className="aspect-video bg-black">
                      <video
                        controls
                        className="w-full h-full"
                        src={exportVideoUrls[exportItem.id] || ''}
                        preload="metadata"
                      >
                        Your browser does not support the video tag.
                      </video>
                    </div>
                    <div className="p-4">
                      <div className="flex flex-col gap-2 mb-3">
                        <span className="text-sm font-semibold text-gray-800">
                          {clipTitle}
                        </span>
                        {exportItem.captionStyle && (
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded font-medium">
                              {exportItem.captionStyle}
                            </span>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => handleDownloadExport(exportItem.id)}
                        className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                    </div>
                  </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        selectedClips={selectedClips}
        onExport={handleExport}
      />
    </div>
  );
}
