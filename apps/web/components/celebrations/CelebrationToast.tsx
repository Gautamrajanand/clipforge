'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, Sparkles, TrendingUp, Share2, X } from 'lucide-react';

interface CelebrationToastProps {
  type: 'first_clip' | 'first_export' | 'first_share' | 'milestone_10' | 'milestone_50';
  isOpen: boolean;
  onClose: () => void;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

const CELEBRATION_CONTENT = {
  first_clip: {
    icon: Sparkles,
    title: '🎉 Your First Clip is Ready!',
    message: 'Amazing! You just created your first viral clip. Time to share it with the world!',
    color: 'from-blue-500 to-purple-500',
  },
  first_export: {
    icon: CheckCircle,
    title: '🚀 Clip Exported Successfully!',
    message: 'Your clip is ready to share. Post it on social media and watch your audience grow!',
    color: 'from-green-500 to-emerald-500',
  },
  first_share: {
    icon: Share2,
    title: '💪 You\'re Growing Your Audience!',
    message: 'Great job sharing! Keep creating and sharing to build your brand.',
    color: 'from-pink-500 to-rose-500',
  },
  milestone_10: {
    icon: TrendingUp,
    title: '🔥 10 Clips Created!',
    message: 'You\'re on fire! You\'ve created 10 clips and saved hours of editing time.',
    color: 'from-orange-500 to-red-500',
  },
  milestone_50: {
    icon: TrendingUp,
    title: '⭐ 50 Clips Milestone!',
    message: 'Incredible! You\'re a ClipForge power user. Keep up the amazing work!',
    color: 'from-yellow-500 to-amber-500',
  },
};

export default function CelebrationToast({
  type,
  isOpen,
  onClose,
  autoClose = true,
  autoCloseDelay = 5000,
}: CelebrationToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      if (autoClose) {
        const timer = setTimeout(() => {
          setIsVisible(false);
          setTimeout(onClose, 300); // Wait for fade out animation
        }, autoCloseDelay);
        return () => clearTimeout(timer);
      }
    } else {
      setIsVisible(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, autoClose, autoCloseDelay]);

  if (!isOpen) return null;

  const content = CELEBRATION_CONTENT[type];
  const Icon = content.icon;

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-5 duration-300">
      <div
        className={`bg-white rounded-xl shadow-2xl border-2 border-gray-100 p-6 max-w-md transform transition-all duration-300 ${
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          className="absolute top-3 right-3 p-1 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-4 h-4 text-gray-400" />
        </button>

        {/* Content */}
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className={`flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br ${content.color} flex items-center justify-center`}>
            <Icon className="w-6 h-6 text-white" />
          </div>

          {/* Text */}
          <div className="flex-1 pt-1">
            <h3 className="font-bold text-gray-900 mb-1">{content.title}</h3>
            <p className="text-sm text-gray-600">{content.message}</p>
          </div>
        </div>

        {/* Progress Bar (auto-close indicator) */}
        {autoClose && (
          <div className="mt-4 h-1 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${content.color} animate-progress`}
              style={{
                animation: `progress ${autoCloseDelay}ms linear`,
              }}
            />
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes progress {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
        .animate-progress {
          animation: progress linear;
        }
      `}</style>
    </div>
  );
}
