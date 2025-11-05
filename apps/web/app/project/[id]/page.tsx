'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Share2, Zap } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function ProjectDetail({ params }: { params: { id: string } }) {
  const [project, setProject] = useState<any>(null);
  const [clips, setClips] = useState<any[]>([]);
  const [selectedClips, setSelectedClips] = useState<string[]>([]);
  const [token, setToken] = useState<string>('');
  const [isExporting, setIsExporting] = useState(false);
  const [exportedClips, setExportedClips] = useState<any[]>([]);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [exportVideoUrls, setExportVideoUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    // Get token from login
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
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        console.log('Project data:', data);
        setProject(data);
        setClips(data.moments || []);
        // Attempt to load the video blob once project data is available
        if (data?.sourceUrl) {
          await loadVideoBlob(authToken);
        }
      }
    } catch (error) {
      console.error('Failed to fetch project:', error);
    }
  };

  // Fetch video as blob using Authorization and convert to object URL
  const loadVideoBlob = async (authToken: string) => {
    try {
      // Revoke any previous object URL to prevent memory leaks
      setVideoUrl(prev => {
        if (prev) URL.revokeObjectURL(prev);
        return prev;
      });

      const resp = await fetch(`http://localhost:3000/v1/projects/${params.id}/video`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });
      if (!resp.ok) {
        console.error('Failed to fetch video stream:', await resp.text());
        return;
      }
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      setVideoUrl(url);
    } catch (e) {
      console.error('Error loading video blob:', e);
    }
  };

  // If token and project become available later (e.g., after export), ensure video is loaded
  useEffect(() => {
    if (token && project?.sourceUrl && !videoUrl) {
      loadVideoBlob(token);
    }
    // Cleanup on unmount
    return () => {
      if (videoUrl) URL.revokeObjectURL(videoUrl);
      // Cleanup export video URLs
      (Object.values(exportVideoUrls) as string[]).forEach(url => URL.revokeObjectURL(url));
    };
  }, [token, project?.sourceUrl]);

  const toggleClip = (clipId: string) => {
    setSelectedClips(prev =>
      prev.includes(clipId)
        ? prev.filter(id => id !== clipId)
        : [...prev, clipId]
    );
  };

  // Load export video as blob
  const loadExportVideoBlob = async (exportId: string) => {
    try {
      const resp = await fetch(`http://localhost:3000/v1/projects/exports/${exportId}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!resp.ok) {
        console.error('Failed to fetch export video:', await resp.text());
        return null;
      }
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      return url;
    } catch (e) {
      console.error('Error loading export video blob:', e);
      return null;
    }
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
        body: JSON.stringify({
          momentIds: selectedClips,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Export successful:', data);
        setExportedClips(data.exports);
        
        // Load blob URLs for all exported clips
        const urls: Record<string, string> = {};
        for (const exp of data.exports) {
          const url = await loadExportVideoBlob(exp.id);
          if (url) {
            urls[exp.id] = url;
          }
        }
        setExportVideoUrls(urls);
        
        alert(`Successfully exported ${data.exports.length} clips!`);
      } else {
        const error = await response.text();
        console.error('Export error:', error);
        alert('Failed to export clips. Check console for details.');
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export clips. Make sure the API is running.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadExport = async (exportId: string) => {
    try {
      const response = await fetch(`http://localhost:3000/v1/projects/exports/${exportId}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
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
      } else {
        alert('Failed to download clip');
      }
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download clip');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{project?.title || 'Loading...'}</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Clips List */}
          <div className="lg:col-span-2">
            {/* Video Player */}
            {project?.sourceUrl && (
              <div className="mb-8 bg-black rounded-lg overflow-hidden">
                <video
                  controls
                  className="w-full"
                  src={videoUrl ?? ''}
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            )}

            <h2 className="text-xl font-bold text-gray-900 mb-6">AI-Detected Clips</h2>
            <div className="space-y-4">
              {clips.length > 0 ? (
                clips.map((clip: any) => (
                  <div
                    key={clip.id}
                    onClick={() => toggleClip(clip.id)}
                    className={`p-5 rounded-lg border-2 cursor-pointer transition ${
                      selectedClips.includes(clip.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <input
                        type="checkbox"
                        checked={selectedClips.includes(clip.id)}
                        onChange={() => toggleClip(clip.id)}
                        className="w-5 h-5 mt-1 text-blue-600 rounded flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        {/* Header */}
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xl font-bold text-blue-600">{clip.score}%</span>
                              <span className="text-sm font-medium text-gray-700">{clip.reason}</span>
                            </div>
                            <p className="text-sm text-gray-500">
                              {clip.tStart?.toFixed(1)}s - {clip.tEnd?.toFixed(1)}s • {clip.duration}s duration
                            </p>
                          </div>
                          <Zap className="w-6 h-6 text-yellow-500 flex-shrink-0" />
                        </div>

                        {/* Feature Breakdown */}
                        {clip.features && (
                          <div className="mb-3 pb-3 border-b border-gray-200">
                            <p className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">AI Analysis</p>
                            <div className="grid grid-cols-2 gap-2">
                              {Object.entries(clip.features).map(([key, value]: [string, any]) => {
                                const percentage = Math.round(value * 100);
                                const label = key.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
                                return (
                                  <div key={key} className="flex items-center gap-2">
                                    <div className="flex-1">
                                      <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs text-gray-600">{label}</span>
                                        <span className="text-xs font-semibold text-gray-700">{percentage}%</span>
                                      </div>
                                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                                        <div 
                                          className={`h-1.5 rounded-full ${
                                            percentage >= 80 ? 'bg-green-500' : 
                                            percentage >= 60 ? 'bg-blue-500' : 
                                            'bg-gray-400'
                                          }`}
                                          style={{ width: `${percentage}%` }}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Why This Clip */}
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Why This Clip Stands Out</p>
                          <p className="text-sm text-gray-700">
                            {clip.score >= 90 && "Exceptional content with strong engagement potential. "}
                            {clip.score >= 80 && clip.score < 90 && "High-quality content that resonates well. "}
                            {clip.score < 80 && "Good content with solid fundamentals. "}
                            {clip.features?.hook > 0.8 && "Opens with a compelling hook that grabs attention. "}
                            {clip.features?.emotion > 0.8 && "Emotionally engaging and relatable. "}
                            {clip.features?.structure > 0.8 && "Well-structured narrative flow. "}
                            {clip.features?.novelty > 0.8 && "Presents unique or novel insights. "}
                            {clip.features?.clarity > 0.8 && "Clear and easy to understand. "}
                            {clip.features?.quote > 0.7 && "Contains memorable quotes. "}
                            {clip.features?.vision_focus > 0.7 && "Strong visual focus and composition. "}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No clips detected yet. Check back soon!</p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div>
            {/* Export Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-4">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Export</h3>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Aspect Ratio
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option>9:16 (Shorts)</option>
                    <option>1:1 (Square)</option>
                    <option>16:9 (Widescreen)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Template
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option>Default</option>
                    <option>Modern</option>
                    <option>Minimal</option>
                  </select>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-3 mb-6">
                <p className="text-sm text-blue-900">
                  <strong>{selectedClips.length}</strong> clip{selectedClips.length !== 1 ? 's' : ''} selected
                </p>
              </div>

              <Button
                onClick={handleExport}
                disabled={selectedClips.length === 0 || isExporting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
              >
                <Download className="w-4 h-4 mr-2" />
                {isExporting ? 'Exporting...' : 'Export Selected'}
              </Button>

              <Button
                variant="outline"
                className="w-full mt-2"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>

            {/* Exported Clips */}
            {exportedClips.length > 0 && (
              <div className="mt-6 bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Exported Clips ({exportedClips.length})</h3>
                <div className="space-y-4">
                  {exportedClips.map((exportItem: any) => {
                    // Find the corresponding moment to get details
                    const moment = clips.find(c => c.id === exportItem.momentId);
                    
                    return (
                      <div key={exportItem.id} className="border border-gray-200 rounded-lg overflow-hidden">
                        {/* Clip Preview Video */}
                        <div className="bg-black">
                          <video
                            controls
                            className="w-full"
                            src={exportVideoUrls[exportItem.id] || ''}
                            preload="metadata"
                          >
                            Your browser does not support the video tag.
                          </video>
                        </div>
                        
                        {/* Clip Info */}
                        <div className="p-4 bg-gray-50">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-lg font-bold text-blue-600">
                                  {moment?.score || 'N/A'}%
                                </span>
                                <span className="text-sm text-gray-600">
                                  {moment?.reason || 'Exported clip'}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500">
                                {moment?.tStart?.toFixed(1)}s - {moment?.tEnd?.toFixed(1)}s 
                                {moment?.duration && ` (${moment.duration}s)`}
                              </p>
                            </div>
                            <Zap className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="flex gap-2 mt-3">
                            <button
                              onClick={() => handleDownloadExport(exportItem.id)}
                              className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                              <Download className="w-4 h-4" />
                              Download
                            </button>
                            <button
                              className="px-3 py-2 border border-gray-300 hover:bg-gray-100 text-gray-700 text-sm font-medium rounded-lg transition-colors"
                            >
                              <Share2 className="w-4 h-4" />
                            </button>
                          </div>
                          
                          {/* Status Badge */}
                          <div className="mt-2">
                            <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                              {exportItem.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="mt-6 bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Stats</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Total Clips</p>
                  <p className="text-2xl font-bold text-gray-900">{clips.length}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p className="text-2xl font-bold text-gray-900">{project?.status || 'Loading...'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Created</p>
                  <p className="text-sm text-gray-900">{project?.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
