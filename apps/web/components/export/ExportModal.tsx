'use client';

import { useState } from 'react';
import { X, Download, Loader2, Subtitles } from 'lucide-react';
import AspectRatioSelector from './AspectRatioSelector';
import CropModeSelector from './CropModeSelector';
import CropPositionSelector from './CropPositionSelector';
import CaptionStyleSelector from '../captions/CaptionStyleSelector';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedClips: string[];
  onExport: (options: ExportOptions) => Promise<void>;
}

export interface ExportOptions {
  aspectRatio: string;
  cropMode: 'crop' | 'pad' | 'smart';
  cropPosition: 'center' | 'top' | 'bottom';
  burnCaptions?: boolean;
  captionStyle?: string;
  primaryColor?: string;
  secondaryColor?: string;
  fontSize?: number;
  position?: 'top' | 'center' | 'bottom';
}

export default function ExportModal({ isOpen, onClose, selectedClips, onExport }: ExportModalProps) {
  const [aspectRatio, setAspectRatio] = useState('9:16');
  const [cropMode, setCropMode] = useState<'crop' | 'pad' | 'smart'>('crop');
  const [cropPosition, setCropPosition] = useState<'center' | 'top' | 'bottom'>('center');
  const [burnCaptions, setBurnCaptions] = useState(false);
  const [captionStyle, setCaptionStyle] = useState('minimal');
  const [primaryColor, setPrimaryColor] = useState('#FFFFFF');
  const [secondaryColor, setSecondaryColor] = useState('#FFD700');
  const [fontSize, setFontSize] = useState(48);
  const [position, setPosition] = useState<'top' | 'center' | 'bottom'>('bottom');
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState(0);

  if (!isOpen) return null;

  const handleExport = async () => {
    setIsExporting(true);
    setExportProgress(0);
    
    // Calculate estimated time: base 10s per clip + 5s if captions enabled
    const baseTime = selectedClips.length * 10;
    const captionTime = burnCaptions ? selectedClips.length * 5 : 0;
    const total = baseTime + captionTime;
    setEstimatedTime(total);
    
    // Simulate progress (since we don't have real-time progress from API)
    const progressInterval = setInterval(() => {
      setExportProgress(prev => {
        if (prev >= 90) return prev; // Stop at 90%, complete when done
        return prev + 10;
      });
    }, total * 100); // Update every 10% of estimated time
    
    try {
      console.log('🎨 Exporting with colors:', { primaryColor, secondaryColor, fontSize, position });
      await onExport({
        aspectRatio,
        cropMode,
        cropPosition,
        burnCaptions,
        captionStyle,
        primaryColor,
        secondaryColor,
        fontSize,
        position,
      });
      setExportProgress(100);
      clearInterval(progressInterval);
      setTimeout(() => onClose(), 500); // Close after showing 100%
    } catch (error) {
      console.error('Export failed:', error);
      clearInterval(progressInterval);
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Export Clips</h2>
              <p className="text-sm text-gray-500 mt-1">
                {selectedClips.length} clip{selectedClips.length !== 1 ? 's' : ''} selected
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Aspect Ratio */}
            <AspectRatioSelector
              selected={aspectRatio}
              onChange={setAspectRatio}
            />

            {/* Divider */}
            <div className="border-t border-gray-200" />

            {/* Crop Mode */}
            <CropModeSelector
              selected={cropMode}
              onChange={setCropMode}
            />

            {/* Crop Position (only for crop mode) */}
            {cropMode === 'crop' && (
              <>
                <div className="border-t border-gray-200" />
                <CropPositionSelector
                  selected={cropPosition}
                  onChange={setCropPosition}
                  disabled={cropMode !== 'crop'}
                />
              </>
            )}

            {/* Divider */}
            <div className="border-t border-gray-200" />

            {/* Captions */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Subtitles className="w-5 h-5 text-primary-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Captions</h3>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={burnCaptions}
                    onChange={(e) => setBurnCaptions(e.target.checked)}
                    className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-600">Burn captions into video</span>
                </label>
              </div>
              {burnCaptions && (
                <div className="space-y-4">
                  <CaptionStyleSelector
                    selectedStyle={captionStyle}
                    onStyleChange={setCaptionStyle}
                  />
                  
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

                  {/* Caption Position */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Caption Position
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setPosition('top')}
                        className={`px-4 py-2 rounded-lg border transition-colors ${
                          position === 'top'
                            ? 'bg-purple-600 text-white border-purple-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        Top
                      </button>
                      <button
                        type="button"
                        onClick={() => setPosition('center')}
                        className={`px-4 py-2 rounded-lg border transition-colors ${
                          position === 'center'
                            ? 'bg-purple-600 text-white border-purple-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        Center
                      </button>
                      <button
                        type="button"
                        onClick={() => setPosition('bottom')}
                        className={`px-4 py-2 rounded-lg border transition-colors ${
                          position === 'bottom'
                            ? 'bg-purple-600 text-white border-purple-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        Bottom
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 rounded-b-2xl">
            {/* Progress bar */}
            {isExporting && (
              <div className="mb-3">
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Exporting {selectedClips.length} clip{selectedClips.length !== 1 ? 's' : ''}...</span>
                  <span>~{estimatedTime}s • {exportProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${exportProgress}%` }}
                  />
                </div>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {burnCaptions ? (
                  <>Premium quality • Captions enabled • ~{selectedClips.length * 15}s</>
                ) : (
                  <>Premium quality • Fast processing • ~{selectedClips.length * 10}s</>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  disabled={isExporting}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExport}
                  disabled={isExporting}
                  className="px-6 py-2 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-medium rounded-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isExporting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Export {selectedClips.length} Clip{selectedClips.length !== 1 ? 's' : ''}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
