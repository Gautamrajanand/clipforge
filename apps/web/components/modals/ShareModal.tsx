'use client';

import { X } from 'lucide-react';
import ShareButtons from '../export/ShareButtons';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  clipTitle: string;
  clipUrl?: string;
  projectId: string;
  clipId: string;
}

export default function ShareModal({
  isOpen,
  onClose,
  clipTitle,
  clipUrl,
  projectId,
  clipId,
}: ShareModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Share Your Clip</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <ShareButtons
            clipTitle={clipTitle}
            clipUrl={clipUrl}
            projectId={projectId}
            clipId={clipId}
          />
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 border-t border-gray-200 rounded-b-2xl">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
