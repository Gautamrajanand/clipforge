'use client';

import { Upload, Sparkles, Video, ArrowRight } from 'lucide-react';

interface EmptyProjectsProps {
  onUploadClick: () => void;
}

export default function EmptyProjects({ onUploadClick }: EmptyProjectsProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      {/* Illustration Container */}
      <div className="relative mb-8">
        {/* Background Gradient Circle */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full blur-3xl opacity-60 scale-150"></div>
        
        {/* Icon Stack */}
        <div className="relative">
          <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-xl transform rotate-3 hover:rotate-6 transition-transform duration-300">
            <Video className="w-16 h-16 text-white" />
          </div>
          
          {/* Floating Sparkles */}
          <div className="absolute -top-2 -right-2 w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg animate-bounce">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          
          <div className="absolute -bottom-2 -left-2 w-8 h-8 bg-pink-400 rounded-full flex items-center justify-center shadow-lg animate-pulse">
            <Upload className="w-4 h-4 text-white" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="text-center max-w-md">
        <h3 className="text-2xl font-bold text-gray-900 mb-3">
          Create Your First Viral Clip
        </h3>
        <p className="text-gray-600 mb-8 leading-relaxed">
          Upload a video and let our AI find the best moments. 
          Turn long-form content into engaging clips in seconds.
        </p>

        {/* CTA Button */}
        <button
          onClick={onUploadClick}
          className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
        >
          <Upload className="w-5 h-5" />
          Upload Your First Video
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>

        {/* Quick Stats */}
        <div className="mt-12 grid grid-cols-3 gap-6 pt-8 border-t border-gray-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              &lt; 2 min
            </div>
            <div className="text-sm text-gray-600">
              Processing Time
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              AI-Powered
            </div>
            <div className="text-sm text-gray-600">
              Smart Detection
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-pink-600 mb-1">
              150
            </div>
            <div className="text-sm text-gray-600">
              Free Credits
            </div>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-100">
          <p className="text-sm text-blue-900">
            <span className="font-semibold">💡 Pro Tip:</span> Upload videos with clear speech 
            for best results. Podcasts, interviews, and presentations work great!
          </p>
        </div>
      </div>
    </div>
  );
}
