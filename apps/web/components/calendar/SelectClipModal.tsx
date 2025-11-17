'use client';

import { X } from 'lucide-react';

interface SelectClipModalProps {
  project: any;
  onClose: () => void;
  onSelect: (clip: any) => void;
}

export function SelectClipModal({ project, onClose, onSelect }: SelectClipModalProps) {
  // Mock clip data - replace with actual API call
  const clip = {
    id: '1',
    title: '#1 US-India Trade: Potential Unlocked?',
    duration: '00:58',
    viralityScore: null, // /100
    metrics: {
      hook: 'undefined',
      flow: 'undefined',
      engagement: 'undefined',
      trend: 'undefined',
    },
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl max-w-2xl w-full border border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div>
            <h2 className="text-2xl font-bold text-white">Select clip</h2>
            <p className="text-sm text-gray-400 mt-1">
              Select a clip to preview and confirm.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Clip Preview */}
        <div className="p-6">
          {/* Video Player */}
          <div className="aspect-video bg-gray-800 rounded-lg mb-4 relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-600 transition-colors">
                <div className="w-0 h-0 border-l-10 border-l-white border-y-8 border-y-transparent ml-1"></div>
              </div>
            </div>
            {/* Duration */}
            <div className="absolute bottom-4 left-4 px-3 py-1 bg-black/80 text-white text-sm rounded">
              00:00 / {clip.duration}
            </div>
          </div>

          {/* Clip Info */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-3">{clip.title}</h3>
            
            {/* Virality Score */}
            <div className="flex items-center gap-4 mb-4">
              <div className="text-gray-400 text-sm">Virality Score:</div>
              <div className="text-white font-medium">/100</div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-4 gap-3">
              <div className="bg-gray-800 rounded-lg p-3 text-center">
                <div className="text-xs text-gray-500 mb-1">Hook</div>
                <div className="text-sm text-gray-400">{clip.metrics.hook}</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-3 text-center">
                <div className="text-xs text-gray-500 mb-1">Flow</div>
                <div className="text-sm text-gray-400">{clip.metrics.flow}</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-3 text-center">
                <div className="text-xs text-gray-500 mb-1">Engagement</div>
                <div className="text-sm text-gray-400">{clip.metrics.engagement}</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-3 text-center">
                <div className="text-xs text-gray-500 mb-1">Trend</div>
                <div className="text-sm text-gray-400">{clip.metrics.trend}</div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => onSelect(clip)}
              className="flex-1 px-4 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-lg transition-colors"
            >
              Select Clip
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
