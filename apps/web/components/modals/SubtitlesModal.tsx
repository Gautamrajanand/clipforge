'use client';

import { useState } from 'react';
import { X, Upload, Link as LinkIcon, Type } from 'lucide-react';
import CaptionStyleSelector from '../captions/CaptionStyleSelector';

interface SubtitlesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (url: string, settings: SubtitleSettings) => Promise<void>;
  onUpload: (file: File, settings: SubtitleSettings) => Promise<void>;
  isUploading?: boolean;
  uploadProgress?: number;
  uploadStage?: string;
  uploadMessage?: string;
  uploadError?: string;
}

interface SubtitleSettings {
  captionStyle: string;
  primaryColor?: string;
  secondaryColor?: string;
  fontSize?: number;
  position?: 'top' | 'center' | 'bottom';
}


export default function SubtitlesModal({ 
  isOpen, 
  onClose, 
  onGenerate, 
  onUpload,
  isUploading = false,
  uploadProgress = 0,
  uploadStage = '',
  uploadMessage = '',
  uploadError = ''
}: SubtitlesModalProps) {
  const [tab, setTab] = useState<'upload' | 'url'>('url');
  const [url, setUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [captionStyle, setCaptionStyle] = useState('mrbeast');
  const [primaryColor, setPrimaryColor] = useState('#FFFFFF');
  const [secondaryColor, setSecondaryColor] = useState('#FFD700');
  const [fontSize, setFontSize] = useState(48);
  const [position, setPosition] = useState<'top' | 'center' | 'bottom'>('bottom');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    console.log('🎬 SubtitlesModal handleSubmit called', { tab, url, file });
    
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
        captionStyle,
        primaryColor,
        secondaryColor,
        fontSize,
        position,
      };

      console.log('📤 Calling onUpload/onGenerate with settings:', settings);
      
      if (tab === 'url') {
        await onGenerate(url, settings);
      } else {
        await onUpload(file!, settings);
      }
      // Modal will be closed by parent component
    } catch (error) {
      console.error('❌ Subtitles error:', error);
      alert('Failed to start subtitle generation');
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

          {/* Upload */}
          {tab === 'upload' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Video File
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors cursor-pointer">
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="subtitle-video-upload"
                />
                <label htmlFor="subtitle-video-upload" className="cursor-pointer">
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
                        className="mt-2 text-sm text-purple-600 hover:text-purple-700"
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

          {/* Caption Style Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Caption Style
            </label>
            <CaptionStyleSelector
              selectedStyle={captionStyle}
              onStyleChange={setCaptionStyle}
            />
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
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4">
          {isUploading ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-700 font-medium">{uploadMessage}</span>
                <span className="text-gray-500">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full transition-all duration-300"
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
                disabled={isProcessing}
                className="px-6 py-2 text-gray-700 hover:bg-gray-200 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isProcessing || (tab === 'url' ? !url : !file)}
                className="px-8 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-purple-500/30"
              >
                {isProcessing ? 'Processing...' : 'Generate Subtitles'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
