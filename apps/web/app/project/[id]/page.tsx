'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Download, Share2, Sparkles } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import ClipsGrid from '@/components/clips/ClipsGrid';
import VideoPlayer from '@/components/video/VideoPlayer';
import ClipSettings from '@/components/clips/ClipSettings';

export default function ProjectDetail({ params }: { params: { id: string } }) {
  const [project, setProject] = useState<any>(null);
  const [clips, setClips] = useState<any[]>([]);
  const [selectedClips, setSelectedClips] = useState<string[]>([]);
  const [token, setToken] = useState<string>('');
  const [isExporting, setIsExporting] = useState(false);
  const [exportedClips, setExportedClips] = useState<any[]>([]);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [exportVideoUrls, setExportVideoUrls] = useState<Record<string, string>>({});
  const [selectedClipForPlayback, setSelectedClipForPlayback] = useState<any>(null);
  const [clipSettings, setClipSettings] = useState({
    clipLength: 45,
    clipCount: 5,
    minLength: 15,
    maxLength: 180,
  });
  const [isDetecting, setIsDetecting] = useState(false);
  const [isGeneratingSmartClips, setIsGeneratingSmartClips] = useState(false);

  useEffect(() => {
    const getToken = async () => {
      try {
        const loginResponse = await fetch('http://localhost:3000/v1/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'demo@clipforge.dev',
            password: 'demo123',
          }),
        });

        if (loginResponse.ok) {
          const data = await loginResponse.json();
          setToken(data.access_token);
          fetchProjectData(data.access_token);
        }
      } catch (error) {
        console.error('Auth error:', error);
      }
    };
    getToken();
  }, []);

  const fetchProjectData = async (authToken: string) => {
    try {
      const response = await fetch(`http://localhost:3000/v1/projects/${params.id}`, {
        headers: { 'Authorization': `Bearer ${authToken}` },
      });
      if (response.ok) {
        const data = await response.json();
        setProject(data);
        setClips(data.moments || []);
        if (data?.sourceUrl) {
          await loadVideoBlob(authToken);
        }
      }
    } catch (error) {
      console.error('Failed to fetch project:', error);
    }
  };

  const loadVideoBlob = async (authToken: string) => {
    try {
      setVideoUrl(prev => {
        if (prev) URL.revokeObjectURL(prev);
        return prev;
      });

      const resp = await fetch(`http://localhost:3000/v1/projects/${params.id}/video`, {
        headers: { 'Authorization': `Bearer ${authToken}` },
      });
      if (!resp.ok) {
        console.error('Failed to fetch video stream');
        return;
      }
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      setVideoUrl(url);
    } catch (e) {
      console.error('Error loading video blob:', e);
    }
  };

  const loadExportVideoBlob = async (exportId: string) => {
    try {
      const resp = await fetch(`http://localhost:3000/v1/projects/exports/${exportId}/download`, {
        headers: { 'Authorization': `Bearer ${token}` },
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

  const handleExport = async () => {
    if (selectedClips.length === 0) {
      alert('Please select at least one clip to export');
      return;
    }

    setIsExporting(true);
    try {
      const response = await fetch(`http://localhost:3000/v1/projects/${params.id}/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ momentIds: selectedClips }),
      });

      if (response.ok) {
        const data = await response.json();
        setExportedClips(data.exports);
        
        const urls: Record<string, string> = {};
        for (const exp of data.exports) {
          const url = await loadExportVideoBlob(exp.id);
          if (url) urls[exp.id] = url;
        }
        setExportVideoUrls(urls);
        
        alert(`Successfully exported ${data.exports.length} clips!`);
      } else {
        alert('Failed to export clips');
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export clips');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDetectClips = async () => {
    setIsDetecting(true);
    try {
      const response = await fetch(`http://localhost:3000/v1/projects/${params.id}/detect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          clipLength: clipSettings.clipLength,
          clipCount: clipSettings.clipCount,
        }),
      });

      if (response.ok) {
        // Refresh project data to get new clips
        await fetchProjectData(token);
        alert('Clips detected successfully!');
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

  const handleGenerateSmartClips = async () => {
    setIsGeneratingSmartClips(true);
    try {
      const response = await fetch(`http://localhost:3000/v1/projects/${params.id}/clips/pro`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          numClips: clipSettings.clipCount,
          targetDuration: clipSettings.clipLength, // Use the actual clip length from settings
          withCrossfade: false, // Disable crossfade (FFmpeg complex filter issues)
        }),
      });

      if (response.ok) {
        const proClips = await response.json();
        console.log('Smart Clips generated:', proClips);
        // Refresh project data to get new Smart Clips
        await fetchProjectData(token);
        alert(`✨ ${proClips.length} Smart Clips generated successfully!`);
      } else {
        const error = await response.text();
        alert(`Failed to generate Smart Clips: ${error}`);
      }
    } catch (error) {
      console.error('Smart Clips generation error:', error);
      alert('Failed to generate Smart Clips');
    } finally {
      setIsGeneratingSmartClips(false);
    }
  };

  const handleDownloadExport = async (exportId: string) => {
    try {
      const response = await fetch(`http://localhost:3000/v1/projects/exports/${exportId}/download`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `clip-${exportId}.mp4`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Download error:', error);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <TopBar />
      
      <main className="ml-48 pt-16">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <button className="w-10 h-10 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors">
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{project.title}</h1>
                <p className="text-sm text-gray-500">
                  {clips.length} clips detected • {selectedClips.length} selected
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
                <Share2 className="w-4 h-4" />
                Share
              </button>
              <button
                onClick={handleGenerateSmartClips}
                disabled={isGeneratingSmartClips || !project?.transcript}
                className="px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                title="Generate Smart Clips with multi-segment stitching"
              >
                <Sparkles className="w-4 h-4" />
                {isGeneratingSmartClips ? 'Generating Smart Clips...' : '✨ Smart Clips'}
              </button>
              <button
                onClick={handleExport}
                disabled={selectedClips.length === 0 || isExporting}
                className="px-6 py-2 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                {isExporting ? 'Exporting...' : `Export ${selectedClips.length > 0 ? `(${selectedClips.length})` : ''}`}
              </button>
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Video Player */}
          {videoUrl && (
            <div className="bg-white rounded-2xl p-6 mb-8 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Source Video</h2>
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
            </div>
          )}

          {/* Clip Detection Settings */}
          <div className="mb-8">
            <ClipSettings
              settings={clipSettings}
              onChange={setClipSettings}
              onDetect={handleDetectClips}
              isDetecting={isDetecting}
            />
          </div>

          {/* AI-Detected Clips Grid */}
          {clips.length > 0 && (
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
                {exportedClips.map((exportItem) => (
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
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-800">
                          Clip {exportItem.momentId?.slice(-6)}
                        </span>
                        <span className="text-xs text-gray-500">{exportItem.format}</span>
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
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
