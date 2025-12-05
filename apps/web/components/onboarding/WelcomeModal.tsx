'use client';

import { useState } from 'react';
import { X, Sparkles, Video, Zap, Gift } from 'lucide-react';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName?: string;
}

export default function WelcomeModal({ isOpen, onClose, userName }: WelcomeModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-8 relative animate-in fade-in zoom-in duration-300">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={24} />
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to ClipForge{userName ? `, ${userName}` : ''}! 🎉
          </h2>
          <p className="text-gray-600 text-lg">
            Transform your long videos into viral short clips with AI
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="text-center p-4">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-3">
              <Video className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Upload Video</h3>
            <p className="text-sm text-gray-600">
              Upload your long-form content and let AI find the best moments
            </p>
          </div>

          <div className="text-center p-4">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-3">
              <Zap className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">AI Magic</h3>
            <p className="text-sm text-gray-600">
              Our AI detects viral moments, adds captions, and optimizes for social
            </p>
          </div>

          <div className="text-center p-4">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-3">
              <Gift className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Free Trial</h3>
            <p className="text-sm text-gray-600">
              7 days free with 60 credits to create amazing clips
            </p>
          </div>
        </div>

        {/* Trial Info */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                60
              </div>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">
                You've got 60 free credits! 🎁
              </h3>
              <p className="text-sm text-gray-600">
                Each credit lets you process 1 minute of video. That's enough to create 
                multiple viral clips and test all our features!
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="space-y-3">
          <button
            onClick={onClose}
            className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
          >
            <Sparkles className="w-5 h-5" />
            Get Started
          </button>
          <p className="text-xs text-gray-500 text-center mt-2">
            Upload your video and try AI Clips to get started
          </p>
        </div>

        {/* Quick Tips */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            💡 <strong>Pro tip:</strong> Start with a 5-10 minute video for best results. 
            Our AI works best with podcasts, interviews, and educational content.
          </p>
        </div>
      </div>
    </div>
  );
}
