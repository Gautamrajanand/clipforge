'use client';

import { useState } from 'react';
import { X, Upload, Link as LinkIcon, Type } from 'lucide-react';

interface SubtitlesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (projectId: string, settings: SubtitleSettings) => Promise<void>;
}

interface SubtitleSettings {
  captionStyle: string;
  primaryColor?: string;
  secondaryColor?: string;
  fontSize?: number;
  position?: 'top' | 'center' | 'bottom';
}

const captionStyles = [
  { value: 'karaoke', label: 'Karaoke', desc: 'Word-by-word highlighting' },
  { value: 'deep_diver', label: 'Deep Diver', desc: 'Bold impact style' },
  { value: 'pod_p', label: 'Pod P', desc: 'Podcast-style captions' },
  { value: 'viral_captions', label: 'Viral Captions', desc: 'Social media optimized' },
  { value: 'mr_beast', label: 'Mr Beast', desc: 'High-energy style' },
  { value: 'alex_hormozi', label: 'Alex Hormozi', desc: 'Business-focused' },
  { value: 'minimalist', label: 'Minimalist', desc: 'Clean and simple' },
  { value: 'bold_impact', label: 'Bold Impact', desc: 'Maximum visibility' },
  { value: 'neon_glow', label: 'Neon Glow', desc: 'Glowing effect' },
  { value: 'classic_subtitle', label: 'Classic', desc: 'Traditional subtitles' },
];

export default function SubtitlesModal({ isOpen, onClose, onGenerate }: SubtitlesModalProps) {
  const [tab, setTab] = useState<'upload' | 'url'>('url');
  const [url, setUrl] = useState('');
  const [captionStyle, setCaptionStyle] = useState('karaoke');
  const [primaryColor, setPrimaryColor] = useState('#FFFFFF');
  const [secondaryColor, setSecondaryColor] = useState('#FFD700');
  const [fontSize, setFontSize] = useState(48);
  const [position, setPosition] = useState<'top' | 'center' | 'bottom'>('bottom');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!url) {
      alert('Please enter a video URL');
      return;
    }

    setIsProcessing(true);
    try {
      // For MVP: Create project first, then generate subtitles
      // TODO: Implement proper flow
      alert('Subtitles feature coming soon! Backend API is ready.');
    } catch (error) {
      console.error('Subtitles error:', error);
      alert('Failed to start subtitle generation');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center">
              <Type className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">AI Subtitles</h2>
              <p className="text-sm text-gray-600">Auto-generate styled captions</p>
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <p className="mt-2 text-sm text-gray-500">
                Supports YouTube, Vimeo, TikTok, Twitter, and more
              </p>
            </div>
          )}

          {/* Upload (Coming Soon) */}
          {tab === 'upload' && (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">Upload coming soon</p>
              <p className="text-sm text-gray-500 mt-2">Use URL import for now</p>
            </div>
          )}

          {/* Caption Style Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Caption Style
            </label>
            <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
              {captionStyles.map((style) => (
                <button
                  key={style.value}
                  onClick={() => setCaptionStyle(style.value)}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    captionStyle === style.value
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-semibold text-gray-900">{style.label}</div>
                  <div className="text-sm text-gray-500 mt-1">{style.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Color Customization */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primary Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-12 h-10 rounded-lg cursor-pointer"
                />
                <input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Highlight Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="w-12 h-10 rounded-lg cursor-pointer"
                />
                <input
                  type="text"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm"
                />
              </div>
            </div>
          </div>

          {/* Font Size */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Font Size: {fontSize}px
            </label>
            <input
              type="range"
              min="24"
              max="96"
              value={fontSize}
              onChange={(e) => setFontSize(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Small (24px)</span>
              <span>Large (96px)</span>
            </div>
          </div>

          {/* Position */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Caption Position
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(['top', 'center', 'bottom'] as const).map((pos) => (
                <button
                  key={pos}
                  onClick={() => setPosition(pos)}
                  className={`px-4 py-3 border-2 rounded-lg font-medium capitalize transition-all ${
                    position === pos
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-200 text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {pos}
                </button>
              ))}
            </div>
          </div>
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
            disabled={isProcessing || !url}
            className="px-8 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-purple-500/30"
          >
            {isProcessing ? 'Processing...' : 'Generate Subtitles'}
          </button>
        </div>
      </div>
    </div>
  );
}
