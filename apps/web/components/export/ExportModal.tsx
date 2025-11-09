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
}

export default function ExportModal({ isOpen, onClose, selectedClips, onExport }: ExportModalProps) {
  const [aspectRatio, setAspectRatio] = useState('9:16');
  const [cropMode, setCropMode] = useState<'crop' | 'pad' | 'smart'>('crop');
  const [cropPosition, setCropPosition] = useState<'center' | 'top' | 'bottom'>('center');
  const [burnCaptions, setBurnCaptions] = useState(false);
  const [captionStyle, setCaptionStyle] = useState('minimal');
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await onExport({
        aspectRatio,
        cropMode,
        cropPosition,
        burnCaptions,
        captionStyle,
      });
      onClose();
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
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
                <CaptionStyleSelector
                  selectedStyle={captionStyle}
                  onStyleChange={setCaptionStyle}
                />
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-between rounded-b-2xl">
            <div className="text-sm text-gray-600">
              Premium quality • Fast processing
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
  );
}
