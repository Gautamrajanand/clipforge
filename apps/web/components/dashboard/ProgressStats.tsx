'use client';

import { TrendingUp, Clock, Video, Zap } from 'lucide-react';

interface ProgressStatsProps {
  totalClips: number;
  totalVideos: number;
  totalExports: number;
  weeklyClips: number;
}

export default function ProgressStats({
  totalClips,
  totalVideos,
  totalExports,
  weeklyClips,
}: ProgressStatsProps) {
  // Calculate time saved (assuming 30 min per clip manually)
  const hoursSaved = Math.round((totalClips * 30) / 60);
  
  // Calculate cost saved (assuming $50/hour for editor)
  const costSaved = hoursSaved * 50;

  // Next milestone
  const nextMilestone = totalClips < 10 ? 10 : totalClips < 50 ? 50 : totalClips < 100 ? 100 : 500;
  const progressToMilestone = (totalClips / nextMilestone) * 100;

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border-2 border-blue-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">Your Progress</h3>
          <p className="text-sm text-gray-600">See how much you've accomplished</p>
        </div>
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
          <TrendingUp className="w-6 h-6 text-white" />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {/* Total Clips */}
        <div className="bg-white rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Video className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-medium text-gray-600">Total Clips</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{totalClips}</div>
        </div>

        {/* This Week */}
        <div className="bg-white rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-purple-600" />
            <span className="text-xs font-medium text-gray-600">This Week</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{weeklyClips}</div>
        </div>

        {/* Time Saved */}
        <div className="bg-white rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-green-600" />
            <span className="text-xs font-medium text-gray-600">Hours Saved</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{hoursSaved}</div>
        </div>

        {/* Cost Saved */}
        <div className="bg-white rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-orange-600" />
            <span className="text-xs font-medium text-gray-600">$ Saved</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">${costSaved}</div>
        </div>
      </div>

      {/* Progress to Next Milestone */}
      <div className="bg-white rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Next Milestone: {nextMilestone} clips
          </span>
          <span className="text-sm font-bold text-blue-600">
            {totalClips}/{nextMilestone}
          </span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(progressToMilestone, 100)}%` }}
          />
        </div>
        {totalClips < nextMilestone && (
          <p className="text-xs text-gray-500 mt-2">
            {nextMilestone - totalClips} more clips to reach your next milestone! 🎯
          </p>
        )}
      </div>

      {/* Motivational Message */}
      {totalClips > 0 && (
        <div className="mt-4 p-3 bg-white/50 rounded-lg">
          <p className="text-xs text-gray-600 text-center">
            {totalClips < 5 && "🚀 You're just getting started! Keep creating amazing clips."}
            {totalClips >= 5 && totalClips < 10 && "💪 Great progress! You're becoming a pro at this."}
            {totalClips >= 10 && totalClips < 50 && "🔥 You're on fire! Your content game is strong."}
            {totalClips >= 50 && "⭐ Amazing! You're a ClipForge power user!"}
          </p>
        </div>
      )}
    </div>
  );
}
