'use client';

import { X, Plus } from 'lucide-react';

interface SchedulePostModalProps {
  clip: any;
  onClose: () => void;
  onSchedule: () => void;
}

export function SchedulePostModal({ clip, onClose, onSchedule }: SchedulePostModalProps) {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Schedule post</h2>
            <p className="text-sm text-gray-600 mt-1">
              Select the social accounts you would like to post from. You may select multiple accounts from the same social platforms.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Empty State */}
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-gray-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No social media accounts connected
            </h3>
            <p className="text-gray-600 mb-6">
              Add one now to get started with the scheduler!
            </p>
            <button className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-gray-900 font-semibold rounded-lg transition-colors inline-flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add account
            </button>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-50 hover:bg-gray-100 text-gray-900 font-medium rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              disabled
              className="flex-1 px-4 py-3 bg-gray-700 text-gray-500 font-medium rounded-lg cursor-not-allowed"
            >
              Schedule
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
