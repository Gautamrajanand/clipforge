'use client';

import { X } from 'lucide-react';
import { useState } from 'react';
import { PLATFORM_PRESETS, ASPECT_RATIOS, ClipSettings } from '@/lib/platform-presets';

interface ClipSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: ClipSettings) => void;
  videoDuration?: number;
}

export default function ClipSettingsModal({
  isOpen,
  onClose,
  onSave,
  videoDuration = 300,
}: ClipSettingsModalProps) {
  const [selectedPreset, setSelectedPreset] = useState<string>('custom');
  const [aspectRatio, setAspectRatio] = useState<'9:16' | '16:9' | '1:1' | '4:5'>('16:9');
  const [clipLength, setClipLength] = useState(60);
  const [numberOfClips, setNumberOfClips] = useState(3);
  const [useTimeframe, setUseTimeframe] = useState(false);
  const [timeframeStart, setTimeframeStart] = useState(0);
  const [timeframeEnd, setTimeframeEnd] = useState(videoDuration);

  if (!isOpen) return null;

  const handlePresetSelect = (presetId: string) => {
    setSelectedPreset(presetId);
    const preset = PLATFORM_PRESETS.find(p => p.id === presetId);
    if (preset) {
      setAspectRatio(preset.aspectRatio);
      setClipLength(preset.clipLength);
      setNumberOfClips(preset.numberOfClips);
    }
  };

  const handleSave = () => {
    const settings: ClipSettings = {
      aspectRatio,
      clipLength,
      numberOfClips,
      targetPlatform: selectedPreset !== 'custom' ? selectedPreset : undefined,
      timeframe: useTimeframe ? {
        start: timeframeStart,
        end: timeframeEnd,
      } : undefined,
    };
    onSave(settings);
    onClose();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60]">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🎬</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Clip Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Clip Length */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">Clip Length</h3>
              <span className="text-sm font-medium text-primary-600">{clipLength}s</span>
            </div>
            <input
              type="range"
              min="15"
              max="90"
              step="5"
              value={clipLength}
              onChange={(e) => setClipLength(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
            />
          </div>

          {/* Number of Clips */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">Number of Clips</h3>
              <span className="text-sm font-medium text-primary-600">{numberOfClips} clips</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              step="1"
              value={numberOfClips}
              onChange={(e) => setNumberOfClips(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
            />
          </div>

          {/* Processing Timeframe */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">Processing Timeframe</h3>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!useTimeframe}
                  onChange={(e) => setUseTimeframe(!e.target.checked)}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <span className="text-sm text-gray-600">Process entire video</span>
              </label>
            </div>
            {useTimeframe && (
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start</label>
                    <input
                      type="range"
                      min="0"
                      max={videoDuration}
                      value={timeframeStart}
                      onChange={(e) => setTimeframeStart(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
                    />
                    <div className="text-xs text-gray-500 mt-1">{formatTime(timeframeStart)}</div>
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">End</label>
                    <input
                      type="range"
                      min="0"
                      max={videoDuration}
                      value={timeframeEnd}
                      onChange={(e) => setTimeframeEnd(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
                    />
                    <div className="text-xs text-gray-500 mt-1">{formatTime(timeframeEnd)}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-3 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-3 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 transition-colors"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
