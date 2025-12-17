'use client';

import { useState } from 'react';
import { X, Upload, Link as LinkIcon, Wand2, Sparkles } from 'lucide-react';
import AspectRatioSelector from '../export/AspectRatioSelector';
import FramingModeSelector from '../export/FramingModeSelector';
import AdvancedLayoutControls from '../export/AdvancedLayoutControls';

interface ReframeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReframe: (url: string, settings: ReframeSettings) => Promise<void>;
  onUpload: (file: File, settings: ReframeSettings) => Promise<void>;
  isUploading?: boolean;
  uploadProgress?: number;
  uploadStage?: string;
  uploadMessage?: string;
  uploadError?: string;
  onFirstUse?: () => void;
}

type FramingMode = 'smart_crop' | 'center_crop' | 'pad_blur' | 'pad_color' | 'side_by_side' | 'picture_in_picture' | 'grid' | 'above_below';

interface AdvancedLayout {
  leftRatio?: number;
  rightRatio?: number;
  overlayPosition?: 'top_left' | 'top_right' | 'bottom_left' | 'bottom_right' | 'center';
  overlaySize?: number;
  overlayPadding?: number;
  rows?: number;
  columns?: number;
  topRatio?: number;
  bottomRatio?: number;
  gap?: number;
  borderWidth?: number;
  borderColor?: string;
}

interface ReframeSettings {
  aspectRatio: '9:16' | '16:9' | '1:1' | '4:5';
  strategy: FramingMode;
  backgroundColor?: string;
  layout?: AdvancedLayout;
  enableFaceDetection?: boolean;
  enableTransitions?: boolean;
  transitionDuration?: number;
}

export default function ReframeModal({ 
  isOpen, 
  onClose, 
  onReframe, 
  onUpload,
  isUploading = false,
  uploadProgress = 0,
  uploadStage = '',
  uploadMessage = '',
  uploadError = '',
  onFirstUse
}: ReframeModalProps) {
  // Default to Upload tab for symmetry with AI Clips
  const [tab, setTab] = useState<'upload' | 'url'>('upload');
  const [url, setUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [aspectRatio, setAspectRatio] = useState<'9:16' | '16:9' | '1:1' | '4:5'>('9:16');
  const [framingMode, setFramingMode] = useState<FramingMode>('smart_crop');
  const [layout, setLayout] = useState<AdvancedLayout>({});
  const [enableFaceDetection, setEnableFaceDetection] = useState(false);
  const [enableTransitions, setEnableTransitions] = useState(false);
  const [videoDuration, setVideoDuration] = useState<number | null>(null);
  const [estimatedCredits, setEstimatedCredits] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    
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

  const handleSubmit = async () => {
    // Validate input based on tab
    if (tab === 'url' && !url) {
      alert('Please enter a video URL');
      return;
    }
    if (tab === 'upload' && !file) {
      alert('Please select a video file');
      return;
    }

    try {
      const settings: ReframeSettings = {
        aspectRatio,
        strategy: framingMode,
        backgroundColor: '#000000',
        layout,
        enableFaceDetection,
        enableTransitions,
        transitionDuration: 0.5,
      };

      // Trigger first use celebration
      if (onFirstUse) {
        onFirstUse();
      }

      if (tab === 'url') {
        await onReframe(url, settings);
      } else {
        await onUpload(file!, settings);
      }
      // Modal will be closed by parent component
    } catch (error) {
      console.error('Reframe error:', error);
      alert('Failed to start reframe process');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center">
              <Wand2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">AI Reframe</h2>
              <p className="text-sm text-gray-600">Convert to any aspect ratio</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isUploading}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Upload Tabs */}
          <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
            {/* Upload on the left, default selected */}
            <button
              onClick={() => setTab('upload')}
              className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
                tab === 'upload'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Upload className="w-4 h-4 inline mr-2" />
              Upload Video
            </button>
            {/* Import from URL on the right */}
            <button
              onClick={() => setTab('url')}
              className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
                tab === 'url'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <LinkIcon className="w-4 h-4 inline mr-2" />
              Import from URL
            </button>
          </div>

          {/* URL Input */}
          {tab === 'url' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Video URL
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />
              <p className="mt-2 text-sm text-gray-500">
                Supports YouTube, Vimeo, TikTok, Twitter, and more
              </p>
            </div>
          )}

          {/* Upload */}
          {tab === 'upload' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Video File
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-yellow-400 transition-colors cursor-pointer">
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="reframe-video-upload"
                />
                <label htmlFor="reframe-video-upload" className="cursor-pointer">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  {file ? (
                    <div>
                      <p className="text-gray-900 font-medium">{file.name}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          setFile(null);
                        }}
                        className="mt-2 text-sm text-yellow-600 hover:text-yellow-700"
                      >
                        Change file
                      </button>
                    </div>
                  ) : (
                    <div>
                      <p className="text-gray-600 font-medium">Click to upload video</p>
                      <p className="text-sm text-gray-500 mt-2">MP4, MOV, AVI, or WebM</p>
                    </div>
                  )}
                </label>
              </div>
            </div>
          )}

          {/* Credit Cost Preview */}
          {file && estimatedCredits !== null && (
            <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
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

          {/* Aspect Ratio Selection */}
          <AspectRatioSelector
            selected={aspectRatio}
            onChange={(ratio) => setAspectRatio(ratio as any)}
          />

          {/* Divider */}
          <div className="border-t border-gray-200" />

          {/* Framing Mode Selector */}
          <FramingModeSelector
            selected={framingMode}
            onChange={setFramingMode}
            showAdvanced={true}
          />

          {/* Advanced Layout Controls */}
          {['side_by_side', 'picture_in_picture', 'grid', 'above_below'].includes(framingMode) && (
            <>
              <div className="border-t border-gray-200" />
              <AdvancedLayoutControls
                mode={framingMode}
                layout={layout}
                onChange={setLayout}
              />
            </>
          )}

          {/* AI Features */}
          {framingMode === 'smart_crop' && (
            <>
              <div className="border-t border-gray-200" />
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  <h3 className="font-semibold text-gray-900">AI Features</h3>
                  <span className="px-2 py-0.5 text-xs font-bold bg-purple-100 text-purple-700 rounded">
                    BETA
                  </span>
                </div>
                
                <label className="flex items-center gap-3 p-3 bg-purple-50 border border-purple-200 rounded-lg cursor-pointer hover:bg-purple-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={enableFaceDetection}
                    onChange={(e) => setEnableFaceDetection(e.target.checked)}
                    className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">Face Detection</div>
                    <div className="text-xs text-gray-600">Automatically center on faces</div>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={enableTransitions}
                    onChange={(e) => setEnableTransitions(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">Smooth Transitions</div>
                    <div className="text-xs text-gray-600">Animated framing changes</div>
                  </div>
                </label>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4">
          {isUploading ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-700 font-medium">{uploadMessage}</span>
                <span className="text-gray-500">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-yellow-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              {uploadError && (
                <div className="text-red-600 text-sm">{uploadError}</div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <button
                onClick={onClose}
                disabled={isUploading}
                className="px-6 py-2 text-gray-700 hover:bg-gray-200 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isUploading || (tab === 'url' ? !url : !file)}
                className="px-8 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-lg font-semibold hover:from-yellow-600 hover:to-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-yellow-500/30"
              >
                {isUploading ? 'Processing...' : 'Reframe Video'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
