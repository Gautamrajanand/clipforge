'use client';

import { useState } from 'react';
import { X, Upload, Link as LinkIcon, Wand2 } from 'lucide-react';

interface ReframeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReframe: (url: string, settings: ReframeSettings) => Promise<void>;
  onUpload: (file: File, settings: ReframeSettings) => Promise<void>;
}

interface ReframeSettings {
  aspectRatio: '9:16' | '16:9' | '1:1' | '4:5';
  strategy: 'smart_crop' | 'center_crop' | 'pad_blur' | 'pad_color';
  backgroundColor?: string;
}

const aspectRatios = [
  { value: '9:16', label: '9:16 Vertical', desc: 'TikTok, Reels, Shorts' },
  { value: '16:9', label: '16:9 Horizontal', desc: 'YouTube, Desktop' },
  { value: '1:1', label: '1:1 Square', desc: 'Instagram Post' },
  { value: '4:5', label: '4:5 Portrait', desc: 'Instagram Feed' },
];

const strategies = [
  { value: 'smart_crop', label: 'Smart Crop', desc: 'AI-powered intelligent cropping' },
  { value: 'center_crop', label: 'Center Crop', desc: 'Crop from center' },
  { value: 'pad_blur', label: 'Pad with Blur', desc: 'Blur background padding' },
  { value: 'pad_color', label: 'Pad with Color', desc: 'Solid color padding' },
];

export default function ReframeModal({ isOpen, onClose, onReframe, onUpload }: ReframeModalProps) {
  const [tab, setTab] = useState<'upload' | 'url'>('url');
  const [url, setUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [aspectRatio, setAspectRatio] = useState<'9:16' | '16:9' | '1:1' | '4:5'>('9:16');
  const [strategy, setStrategy] = useState<'smart_crop' | 'center_crop' | 'pad_blur' | 'pad_color'>('smart_crop');
  const [backgroundColor, setBackgroundColor] = useState('#000000');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

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

    setIsProcessing(true);
    try {
      const settings = {
        aspectRatio,
        strategy,
        backgroundColor,
      };

      if (tab === 'url') {
        await onReframe(url, settings);
      } else {
        await onUpload(file!, settings);
      }
      // Modal will be closed by parent component
    } catch (error) {
      console.error('Reframe error:', error);
      alert('Failed to start reframe process');
      setIsProcessing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
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
            disabled={isProcessing}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Upload Tabs */}
          <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
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

          {/* Aspect Ratio Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Target Aspect Ratio
            </label>
            <div className="grid grid-cols-2 gap-3">
              {aspectRatios.map((ratio) => (
                <button
                  key={ratio.value}
                  onClick={() => setAspectRatio(ratio.value as any)}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    aspectRatio === ratio.value
                      ? 'border-yellow-500 bg-yellow-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-semibold text-gray-900">{ratio.label}</div>
                  <div className="text-sm text-gray-500 mt-1">{ratio.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Framing Strategy */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Framing Strategy
            </label>
            <div className="grid grid-cols-2 gap-3">
              {strategies.map((strat) => (
                <button
                  key={strat.value}
                  onClick={() => setStrategy(strat.value as any)}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    strategy === strat.value
                      ? 'border-yellow-500 bg-yellow-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-semibold text-gray-900">{strat.label}</div>
                  <div className="text-sm text-gray-500 mt-1">{strat.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Background Color (only for pad_color) */}
          {strategy === 'pad_color' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Background Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="w-16 h-12 rounded-lg cursor-pointer"
                />
                <input
                  type="text"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-mono text-sm"
                  placeholder="#000000"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-between">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="px-6 py-2 text-gray-700 hover:bg-gray-200 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isProcessing || (tab === 'url' ? !url : !file)}
            className="px-8 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-lg font-semibold hover:from-yellow-600 hover:to-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-yellow-500/30"
          >
            {isProcessing ? 'Processing...' : 'Reframe Video'}
          </button>
        </div>
      </div>
    </div>
  );
}
