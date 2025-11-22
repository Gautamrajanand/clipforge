'use client';

import { X, Upload, Video as VideoIcon, Settings, Link2, Youtube } from 'lucide-react';
import { useState, useRef } from 'react';
import UploadProgress from '../progress/UploadProgress';
import ClipSettingsModal from './ClipSettingsModal';
import { ClipSettings } from '@/lib/platform-presets';
import { analytics, AnalyticsEvents } from '@/lib/analytics';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File, title: string, clipSettings?: ClipSettings) => void;
  onImportUrl?: (url: string, title: string, clipSettings?: ClipSettings) => void;
  isUploading?: boolean;
  uploadProgress?: number;
  uploadStage?: 'uploading' | 'processing' | 'transcribing' | 'detecting' | 'complete' | 'error';
  uploadMessage?: string;
  uploadEta?: string;
  uploadError?: string;
}

type TabType = 'upload' | 'url';

export default function UploadModal({ 
  isOpen, 
  onClose, 
  onUpload,
  onImportUrl,
  isUploading = false,
  uploadProgress = 0,
  uploadStage = 'uploading',
  uploadMessage,
  uploadEta,
  uploadError,
}: UploadModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [videoDuration, setVideoDuration] = useState<number | null>(null);
  const [estimatedCredits, setEstimatedCredits] = useState<number | null>(null);
  const [showClipSettings, setShowClipSettings] = useState(false);
  const [clipSettings, setClipSettings] = useState<ClipSettings>({
    clipLength: 45,
    numberOfClips: 5,
    aspectRatio: '16:9',
    targetPlatform: 'youtube',
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    if (!title) {
      setTitle(selectedFile.name.replace(/\.[^/.]+$/, ''));
    }
    
    // Get video duration to calculate credits
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src);
      const durationMinutes = video.duration / 60;
      setVideoDuration(video.duration);
      // Calculate credits: 1 credit per minute, round down, minimum 1
      const credits = Math.max(1, Math.floor(durationMinutes));
      setEstimatedCredits(credits);
    };
    video.src = URL.createObjectURL(selectedFile);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith('video/')) {
      handleFileSelect(droppedFile);
    }
  };

  const handleSubmit = () => {
    console.log('🎬 handleSubmit called', { activeTab, url, title, hasOnImportUrl: !!onImportUrl });
    
    if (activeTab === 'upload' && file && title) {
      console.log('📤 Calling onUpload');
      
      // Track video upload
      analytics.track(AnalyticsEvents.VIDEO_UPLOADED, {
        method: 'file_upload',
        fileSize: file.size,
        fileName: file.name,
        estimatedCredits: estimatedCredits || 0,
        videoDuration: videoDuration || 0,
        clipSettings: clipSettings,
      });
      
      onUpload(file, title, clipSettings);
      // Don't close modal or clear form during upload
      // The parent component will handle closing after upload completes
    } else if (activeTab === 'url' && url && onImportUrl) {
      // Use title if provided, otherwise pass empty string to let backend auto-fill from video metadata
      console.log('📥 Calling onImportUrl with:', { url, title: title || '' });
      
      // Track URL import
      analytics.track(AnalyticsEvents.VIDEO_IMPORTED_FROM_URL, {
        method: 'url_import',
        url: url,
        platform: detectPlatform(url),
        clipSettings: clipSettings,
      });
      
      onImportUrl(url, title || '', clipSettings);
    } else {
      console.warn('⚠️ Submit conditions not met', { 
        activeTab, 
        hasUrl: !!url, 
        hasFile: !!file, 
        hasTitle: !!title,
        hasOnImportUrl: !!onImportUrl 
      });
    }
  };

  const detectPlatform = (url: string): string => {
    const urlLower = url.toLowerCase();
    if (urlLower.includes('youtube.com') || urlLower.includes('youtu.be')) return 'YouTube';
    if (urlLower.includes('vimeo.com')) return 'Vimeo';
    if (urlLower.includes('rumble.com')) return 'Rumble';
    if (urlLower.includes('twitter.com') || urlLower.includes('x.com')) return 'Twitter';
    if (urlLower.includes('tiktok.com')) return 'TikTok';
    return '';
  };

  const handleSaveSettings = (settings: ClipSettings) => {
    setClipSettings(settings);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center">
              <VideoIcon className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Upload Video</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Progress Indicator */}
          {isUploading && (
            <div className="mb-6">
              <UploadProgress
                stage={uploadStage}
                progress={uploadProgress}
                message={uploadMessage}
                eta={uploadEta}
                error={uploadError}
              />
            </div>
          )}

          {/* Tabs */}
          {!isUploading && (
            <div className="flex gap-2 mb-6 border-b border-gray-200">
              <button
                onClick={() => setActiveTab('upload')}
                className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 ${
                  activeTab === 'upload'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-600 hover:text-gray-800'
                }`}
              >
                <Upload className="w-4 h-4" />
                Upload File
              </button>
              <button
                onClick={() => setActiveTab('url')}
                className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 ${
                  activeTab === 'url'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-600 hover:text-gray-800'
                }`}
              >
                <Link2 className="w-4 h-4" />
                Import from URL
              </button>
            </div>
          )}

          {/* Upload Area */}
          {!isUploading && activeTab === 'upload' && (
            <>
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`bg-card-pink rounded-xl p-12 flex flex-col items-center justify-center min-h-[300px] cursor-pointer transition-all ${
                  isDragging ? 'border-2 border-primary-500 bg-card-pink/50' : 'border-2 border-transparent'
                }`}
              >
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4">
                  <Upload className="w-10 h-10 text-gray-400" />
                </div>
                {file ? (
                  <div className="text-center">
                    <p className="text-lg font-semibold text-gray-800 mb-2">{file.name}</p>
                    <p className="text-sm text-gray-600">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                      }}
                      className="mt-4 text-sm text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Choose different file
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-lg font-semibold text-gray-800 mb-2">Click to upload</p>
                    <p className="text-sm text-gray-600">or drag and drop your video here</p>
                    <p className="text-xs text-gray-500 mt-2">MP4, MOV, AVI up to 500MB</p>
                  </div>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={(e) => {
                  const selectedFile = e.target.files?.[0];
                  if (selectedFile) handleFileSelect(selectedFile);
                }}
                className="hidden"
              />

              {/* Project Title */}
              <div className="mt-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Project Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter project title"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Credit Cost Preview */}
              {file && estimatedCredits !== null && (
                <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">💳</span>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">Estimated Cost</p>
                        <p className="text-xs text-gray-600">
                          {Math.floor(videoDuration! / 60)}:{String(Math.floor(videoDuration! % 60)).padStart(2, '0')} video duration
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-purple-600">{estimatedCredits}</p>
                      <p className="text-xs text-gray-600">credits</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Clip Settings Button */}
              {file && (
                <div className="mt-4">
                  <button
                    onClick={() => setShowClipSettings(true)}
                    className="w-full px-4 py-3 border-2 border-dashed border-gray-300 text-gray-700 font-medium rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <Settings className="w-5 h-5" />
                    {clipSettings ? 'Edit Clip Settings' : 'Customize Clip Settings'}
                    {clipSettings && (
                      <span className="ml-2 px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full">
                        {clipSettings.aspectRatio} • {clipSettings.clipLength}s • {clipSettings.numberOfClips} clips
                      </span>
                    )}
                  </button>
                </div>
              )}
            </>
          )}

          {/* URL Import Area */}
          {!isUploading && activeTab === 'url' && (
            <>
              <div className="bg-card-pink rounded-xl p-8">
                <div className="flex items-center gap-3 mb-4">
                  <Link2 className="w-6 h-6 text-primary-600" />
                  <h3 className="text-lg font-semibold text-gray-800">Paste Video URL</h3>
                </div>
                
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent mb-3"
                />

                {url && detectPlatform(url) && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Youtube className="w-4 h-4 text-red-600" />
                    <span>Detected: <strong>{detectPlatform(url)}</strong></span>
                  </div>
                )}

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="text-xs text-gray-600">Supported:</span>
                  <span className="px-2 py-1 bg-white rounded text-xs font-medium text-gray-700">YouTube</span>
                  <span className="px-2 py-1 bg-white rounded text-xs font-medium text-gray-700">Vimeo</span>
                  <span className="px-2 py-1 bg-white rounded text-xs font-medium text-gray-700">Rumble</span>
                  <span className="px-2 py-1 bg-white rounded text-xs font-medium text-gray-700">Twitter</span>
                  <span className="px-2 py-1 bg-white rounded text-xs font-medium text-gray-700">TikTok</span>
                </div>
              </div>

              {/* Project Title */}
              <div className="mt-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Project Title <span className="text-gray-400 font-normal">(optional - will auto-fill from video)</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Leave blank to use video title"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Clip Settings Button */}
              {url && (
                <div className="mt-4">
                  <button
                    onClick={() => setShowClipSettings(true)}
                    className="w-full px-4 py-3 border-2 border-dashed border-gray-300 text-gray-700 font-medium rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <Settings className="w-5 h-5" />
                    {clipSettings ? 'Edit Clip Settings' : 'Customize Clip Settings'}
                    {clipSettings && (
                      <span className="ml-2 px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full">
                        {clipSettings.aspectRatio} • {clipSettings.clipLength}s • {clipSettings.numberOfClips} clips
                      </span>
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={(activeTab === 'upload' && (!file || !title)) || (activeTab === 'url' && !url)}
            className="flex-1 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {activeTab === 'upload' ? 'Upload & Process' : 'Import & Process'}
          </button>
        </div>
      </div>

      {/* Clip Settings Modal */}
      <ClipSettingsModal
        isOpen={showClipSettings}
        onClose={() => setShowClipSettings(false)}
        onSave={handleSaveSettings}
        videoDuration={300}
      />
    </div>
  );
}
