'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { fetchWithAuth } from '@/lib/api';
import { CheckCircle2, Circle, ChevronDown, ChevronUp, Sparkles, Scissors, Type, Maximize, Share2, X } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  icon: React.ReactNode;
  action?: () => void;
  actionText?: string;
}

export default function OnboardingChecklist() {
  const { getToken } = useAuth();
  const [isExpanded, setIsExpanded] = useState(true);
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState({
    hasUploadedVideo: false,
    hasCreatedClip: false,
    hasAddedSubtitles: false,
    hasReframedVideo: false,
    hasShared: false,
  });

  const getClerkToken = async () => {
    const token = await getToken();
    return token || '';
  };

  // Fetch progress from API
  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    try {
      const response = await fetchWithAuth(`${API_URL}/v1/onboarding/progress`, {
        getToken: getClerkToken,
      });
      if (response.ok) {
        const data = await response.json();
        setProgress(data);
      }
    } catch (error) {
      console.error('Failed to fetch onboarding progress:', error);
    }
  };

  const items: ChecklistItem[] = [
    {
      id: 'clips',
      title: 'Try AI Clips',
      description: 'Create viral short clips from your video',
      completed: progress.hasCreatedClip,
      icon: <Scissors className="w-5 h-5" />,
      actionText: 'Try AI Clips',
    },
    {
      id: 'subtitles',
      title: 'Try AI Subtitles',
      description: 'Add professional captions in 20+ languages',
      completed: progress.hasAddedSubtitles,
      icon: <Type className="w-5 h-5" />,
      actionText: 'Add Captions',
    },
    {
      id: 'reframe',
      title: 'Try AI Reframe',
      description: 'Convert to different aspect ratios (9:16, 1:1, etc.)',
      completed: progress.hasReframedVideo,
      icon: <Maximize className="w-5 h-5" />,
      actionText: 'Reframe Video',
    },
    {
      id: 'share',
      title: 'Share your transformation',
      description: 'Export and share your content on social media',
      completed: progress.hasShared,
      icon: <Share2 className="w-5 h-5" />,
      actionText: 'Share',
    },
  ];

  const completedCount = items.filter(item => item.completed).length;
  const totalCount = items.length;
  const progressPercentage = (completedCount / totalCount) * 100;
  const isComplete = completedCount === totalCount;

  // Hide checklist if all items are complete
  if (isComplete && !isExpanded) {
    return null;
  }

  if (!isVisible) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div 
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              {isComplete ? '🎉 You\'re a Platform Pro!' : 'Discover the Content OS'}
            </h3>
            <p className="text-sm text-gray-600">
              {isComplete ? 'All AI features explored!' : `${completedCount} of ${totalCount} features tried`}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Progress Circle */}
          <div className="relative w-12 h-12">
            <svg className="w-12 h-12 transform -rotate-90">
              <circle
                cx="24"
                cy="24"
                r="20"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
                className="text-gray-200"
              />
              <circle
                cx="24"
                cy="24"
                r="20"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 20}`}
                strokeDashoffset={`${2 * Math.PI * 20 * (1 - progressPercentage / 100)}`}
                className="text-blue-600 transition-all duration-500"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-semibold text-gray-700">
                {Math.round(progressPercentage)}%
              </span>
            </div>
          </div>

          {/* Expand/Collapse Button */}
          <button className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-gray-600" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-600" />
            )}
          </button>

          {/* Close Button (only show when complete) */}
          {isComplete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsVisible(false);
              }}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          )}
        </div>
      </div>

      {/* Checklist Items */}
      {isExpanded && (
        <div className="border-t border-gray-200">
          {items.map((item, index) => (
            <div
              key={item.id}
              className={`flex items-start gap-4 p-4 ${
                index !== items.length - 1 ? 'border-b border-gray-100' : ''
              } ${item.completed ? 'bg-gray-50' : 'hover:bg-gray-50'} transition-colors`}
            >
              {/* Icon & Checkbox */}
              <div className="flex items-center gap-3">
                {item.completed ? (
                  <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
                ) : (
                  <Circle className="w-6 h-6 text-gray-300 flex-shrink-0" />
                )}
                <div className={`p-2 rounded-lg ${
                  item.completed 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {item.icon}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h4 className={`font-medium ${
                  item.completed ? 'text-gray-500 line-through' : 'text-gray-900'
                }`}>
                  {item.title}
                </h4>
                <p className="text-sm text-gray-600 mt-0.5">
                  {item.description}
                </p>
              </div>

              {/* Action Button */}
              {!item.completed && item.action && item.actionText && (
                <button
                  onClick={item.action}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
                >
                  {item.actionText}
                </button>
              )}
            </div>
          ))}

          {/* Completion Message */}
          {isComplete && (
            <div className="p-6 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 border-t border-gray-200">
              <div className="text-center">
                <div className="inline-flex p-3 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full mb-4">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">
                  🎉 You're a Platform Pro!
                </h4>
                <p className="text-gray-600 mb-4">
                  You've unlocked all 3 services! Now you can transform any video into clips, captions, and multi-format versions. 
                  That's the power of the Content OS.
                </p>
                <div className="flex flex-wrap justify-center gap-2 text-sm">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                    ✓ AI Clips
                  </span>
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full font-medium">
                    ✓ AI Subtitles
                  </span>
                  <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full font-medium">
                    ✓ AI Reframe
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-4">
                  Pro tip: Use all 3 services on every video to maximize your reach!
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
