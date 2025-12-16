'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { CheckCircle, Circle, X, RotateCcw } from 'lucide-react';
import { fetchWithAuth } from '@/lib/api';

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

interface ProgressChecklistProps {
  onRestartTour?: () => void;
}

export default function ProgressChecklist({ onRestartTour }: ProgressChecklistProps) {
  const { getToken } = useAuth();
  const [items, setItems] = useState<ChecklistItem[]>([
    {
      id: 'upload',
      title: 'Upload Your First Video',
      description: 'Get started by uploading a video or importing from URL',
      completed: false,
    },
    {
      id: 'generate_clips',
      title: 'Generate AI Clips',
      description: 'Let our AI find the best moments in your video',
      completed: false,
    },
    {
      id: 'customize_captions',
      title: 'Customize Captions',
      description: 'Try different caption styles to match your brand',
      completed: false,
    },
    {
      id: 'export',
      title: 'Export Your First Clip',
      description: 'Download your clip and share it on social media',
      completed: false,
    },
    {
      id: 'explore_features',
      title: 'Explore More Features',
      description: 'Try AI Reframe, AI Subtitles, or Smart Clips',
      completed: false,
    },
  ]);
  const [isVisible, setIsVisible] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      setLoading(true);
      const response = await fetchWithAuth('/v1/users/onboarding-progress', {
        method: 'GET',
        getToken,
      });
      const data = await response.json();
      
      // Update checklist based on user's actual progress
      setItems(prev => prev.map(item => ({
        ...item,
        completed: data[item.id] || false,
      })));
    } catch (error) {
      console.error('Failed to load onboarding progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const completedCount = items.filter(item => item.completed).length;
  const progress = (completedCount / items.length) * 100;
  const isComplete = completedCount === items.length;

  if (!isVisible) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <h3 className="text-lg font-semibold text-gray-900">Getting Started Checklist</h3>
          {isComplete && (
            <span className="ml-3 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <CheckCircle className="w-3 h-3 mr-1" />
              Complete!
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {onRestartTour && (
            <button
              onClick={onRestartTour}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center"
              title="Restart tour"
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              Restart Tour
            </button>
          )}
          <button
            onClick={() => setIsVisible(false)}
            className="text-gray-400 hover:text-gray-600"
            title="Dismiss"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
          <span>{completedCount} of {items.length} completed</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Checklist Items */}
      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className={`flex items-start p-3 rounded-lg transition-colors ${
              item.completed ? 'bg-green-50' : 'bg-gray-50 hover:bg-gray-100'
            }`}
          >
            <div className="flex-shrink-0 mt-0.5">
              {item.completed ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <Circle className="w-5 h-5 text-gray-400" />
              )}
            </div>
            <div className="ml-3 flex-1">
              <p className={`text-sm font-medium ${
                item.completed ? 'text-green-900 line-through' : 'text-gray-900'
              }`}>
                {item.title}
              </p>
              <p className={`text-xs ${
                item.completed ? 'text-green-700' : 'text-gray-600'
              }`}>
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {isComplete && (
        <div className="mt-4 p-4 bg-gradient-to-r from-primary-50 to-purple-50 rounded-lg border border-primary-200">
          <p className="text-sm font-medium text-primary-900 mb-2">
            🎉 Congratulations! You've completed the basics!
          </p>
          <p className="text-xs text-primary-700">
            Ready to create more content? Upgrade to unlock unlimited features and remove watermarks.
          </p>
        </div>
      )}
    </div>
  );
}
