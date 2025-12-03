'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { fetchWithAuth } from '@/lib/api';
import { X, ChevronRight, ChevronLeft, Check } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface OnboardingStep {
  id: string;
  step: number;
  title: string;
  subtitle?: string;
  description: string;
  icon?: string;
  imageUrl?: string;
  ctaText: string;
  ctaUrl?: string;
}

export default function MultiStepOnboarding() {
  const { getToken, isSignedIn } = useAuth();
  const [steps, setSteps] = useState<OnboardingStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSignedIn) return;

    const loadOnboarding = async () => {
      try {
        // Check if user has completed onboarding
        const hasCompleted = localStorage.getItem('onboardingCompleted');
        if (hasCompleted) {
          setLoading(false);
          return;
        }

        // Fetch onboarding steps from API
        const response = await fetchWithAuth(`${API_URL}/v1/plg/content/onboarding`, {
          getToken,
        });

        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            setSteps(data);
            setShowOnboarding(true);
          }
        }
      } catch (error) {
        console.error('Failed to load onboarding:', error);
      } finally {
        setLoading(false);
      }
    };

    loadOnboarding();
  }, [isSignedIn, getToken]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    localStorage.setItem('onboardingCompleted', 'true');
    setShowOnboarding(false);
    
    // Track completion
    try {
      fetchWithAuth(`${API_URL}/v1/onboarding/progress`, {
        getToken,
        method: 'POST',
        body: JSON.stringify({ step: 'COMPLETED' }),
      });
    } catch (error) {
      console.error('Failed to track onboarding completion:', error);
    }
  };

  if (loading || !showOnboarding || steps.length === 0) {
    return null;
  }

  const step = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* Progress Bar */}
        <div className="h-2 bg-gray-100">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-4xl">{step.icon || '📝'}</div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{step.title}</h2>
                {step.subtitle && (
                  <p className="text-gray-600 mt-1">{step.subtitle}</p>
                )}
              </div>
            </div>
            <button
              onClick={handleSkip}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {step.imageUrl && (
            <img
              src={step.imageUrl}
              alt={step.title}
              className="w-full h-64 object-cover rounded-lg mb-6"
            />
          )}
          
          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            {step.description}
          </p>

          {/* Step Indicators */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentStep
                    ? 'w-8 bg-blue-600'
                    : index < currentStep
                    ? 'w-2 bg-green-500'
                    : 'w-2 bg-gray-300'
                }`}
              />
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="px-6 py-3 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <ChevronLeft size={20} />
              Previous
            </button>

            <div className="text-sm text-gray-500">
              Step {currentStep + 1} of {steps.length}
            </div>

            <button
              onClick={handleNext}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              {currentStep === steps.length - 1 ? (
                <>
                  <Check size={20} />
                  {step.ctaText || 'Complete'}
                </>
              ) : (
                <>
                  {step.ctaText || 'Next'}
                  <ChevronRight size={20} />
                </>
              )}
            </button>
          </div>

          {/* Skip Link */}
          <div className="text-center mt-4">
            <button
              onClick={handleSkip}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Skip onboarding
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
