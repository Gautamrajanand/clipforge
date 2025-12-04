'use client';

import { useState } from 'react';
import { X, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';

interface OnboardingSurveyProps {
  isOpen: boolean;
  onComplete: (data: OnboardingData) => void;
  onSkip: () => void;
}

export interface OnboardingData {
  role?: string;
  goal?: string;
  platforms?: string[];
}

const roles = [
  { id: 'creator', label: 'Content Creator', icon: '📹', description: 'YouTube, TikTok, Instagram' },
  { id: 'marketer', label: 'Social Media Manager', icon: '📱', description: 'Managing brand accounts' },
  { id: 'editor', label: 'Video Editor', icon: '🎬', description: 'Professional editing' },
  { id: 'agency', label: 'Agency Owner', icon: '🏢', description: 'Client work' },
];

const goals = [
  { id: 'grow', label: 'Grow my audience', icon: '🚀', description: 'More views & followers' },
  { id: 'save-time', label: 'Save time editing', icon: '⏱️', description: 'Automate clip creation' },
  { id: 'monetize', label: 'Monetize content', icon: '💰', description: 'Make money from videos' },
  { id: 'engagement', label: 'Improve engagement', icon: '📊', description: 'Better performing content' },
];

const platforms = [
  { id: 'youtube', label: 'YouTube', icon: '▶️' },
  { id: 'tiktok', label: 'TikTok', icon: '🎵' },
  { id: 'instagram', label: 'Instagram', icon: '📷' },
  { id: 'linkedin', label: 'LinkedIn', icon: '💼' },
  { id: 'twitter', label: 'Twitter/X', icon: '🐦' },
  { id: 'facebook', label: 'Facebook', icon: '👥' },
];

export default function OnboardingSurvey({ isOpen, onComplete, onSkip }: OnboardingSurveyProps) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingData>({
    platforms: [],
  });

  if (!isOpen) return null;

  const totalSteps = 3;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      onComplete(data);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const togglePlatform = (platformId: string) => {
    const platforms = data.platforms || [];
    if (platforms.includes(platformId)) {
      setData({ ...data, platforms: platforms.filter(p => p !== platformId) });
    } else {
      setData({ ...data, platforms: [...platforms, platformId] });
    }
  };

  const canProceed = () => {
    if (step === 1) return !!data.role;
    if (step === 2) return !!data.goal;
    if (step === 3) return (data.platforms?.length || 0) > 0;
    return false;
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full relative animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Let's personalize your experience</h2>
                <p className="text-sm text-gray-500">Takes only 30 seconds</p>
              </div>
            </div>
            <button
              onClick={onSkip}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="flex gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                  s <= step ? 'bg-gradient-to-r from-blue-500 to-purple-500' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Step 1: Role */}
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-right-5 duration-300">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">What's your role?</h3>
              <p className="text-gray-600 mb-6">This helps us show you the most relevant features</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {roles.map((role) => (
                  <button
                    key={role.id}
                    onClick={() => setData({ ...data, role: role.id })}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      data.role === role.id
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-3xl">{role.icon}</span>
                      <div>
                        <div className="font-semibold text-gray-900">{role.label}</div>
                        <div className="text-sm text-gray-500">{role.description}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Goal */}
          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-5 duration-300">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">What's your main goal?</h3>
              <p className="text-gray-600 mb-6">We'll help you achieve it faster</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {goals.map((goal) => (
                  <button
                    key={goal.id}
                    onClick={() => setData({ ...data, goal: goal.id })}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      data.goal === goal.id
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-3xl">{goal.icon}</span>
                      <div>
                        <div className="font-semibold text-gray-900">{goal.label}</div>
                        <div className="text-sm text-gray-500">{goal.description}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Platforms */}
          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-right-5 duration-300">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Where do you publish?</h3>
              <p className="text-gray-600 mb-6">Select all that apply - we'll optimize for your platforms</p>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {platforms.map((platform) => (
                  <button
                    key={platform.id}
                    onClick={() => togglePlatform(platform.id)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      data.platforms?.includes(platform.id)
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="text-center">
                      <span className="text-3xl block mb-2">{platform.icon}</span>
                      <div className="font-semibold text-gray-900 text-sm">{platform.label}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {step > 1 && (
              <button
                onClick={handleBack}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2"
              >
                <ArrowLeft size={16} />
                Back
              </button>
            )}
            <button
              onClick={onSkip}
              className="px-4 py-2 text-gray-500 hover:text-gray-700 text-sm transition-colors"
            >
              Skip for now
            </button>
          </div>

          <button
            onClick={handleNext}
            disabled={!canProceed()}
            className={`px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all ${
              canProceed()
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg hover:scale-105'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {step === totalSteps ? 'Complete' : 'Next'}
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
