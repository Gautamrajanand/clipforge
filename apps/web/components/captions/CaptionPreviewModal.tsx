"use client";

import { X } from "lucide-react";
import { CAPTION_PRESETS } from "./CaptionStyleSelector";

interface CaptionPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  styleId: string;
  videoUrl?: string;
  videoThumbnail?: string;
  sampleText?: string;
}

export default function CaptionPreviewModal({
  isOpen,
  onClose,
  styleId,
}: CaptionPreviewModalProps) {
  const style = CAPTION_PRESETS.find((p) => p.id === styleId);

  if (!isOpen || !style) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Caption Preview</h2>
            <p className="text-sm text-gray-500 mt-1">
              {style.name} - {style.description}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Preview Area */}
        <div className="p-6">
          {/* Caption Style Preview Image */}
          <div className="relative aspect-video bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg overflow-hidden">
            {/* Show actual caption preview image */}
            <img
              src={`/caption-previews/${styleId}.png`}
              alt={`${style.name} caption style preview`}
              className="w-full h-full object-contain"
              onError={(e) => {
                // Fallback to default preview if specific image not found
                const target = e.target as HTMLImageElement;
                target.src = '/caption-previews/mrbeast.png';
              }}
            />
          </div>


          {/* Style Info */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Style Details</h3>
            <div className="text-sm text-gray-700">
              <p className="mb-2"><span className="font-medium">Position:</span> <span className="capitalize">{style.position}</span></p>
              <p><span className="font-medium">Description:</span> {style.description}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 hover:bg-white rounded-lg transition-colors"
          >
            Close
          </button>
          <button
            onClick={() => {
              // This would trigger the actual caption application
              onClose();
            }}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
          >
            Use This Style
          </button>
        </div>
      </div>
    </div>
  );
}
