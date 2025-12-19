'use client';

import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import TourTooltip from '@/components/onboarding/TourTooltip';

interface TourStep {
  selector: string;
  title: string;
  description: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

const TOUR_STEPS: TourStep[] = [
  {
    selector: '[data-tour="upload-button"]',
    title: 'Upload Your Video',
    description: 'Start by uploading a video or importing from a URL. We support videos up to 120 minutes long.',
    position: 'bottom',
  },
  {
    selector: '[data-tour="ai-clips"]',
    title: 'Generate AI Clips',
    description: 'Our AI automatically detects the most engaging moments and creates viral-ready clips with captions.',
    position: 'right',
  },
  {
    selector: '[data-tour="ai-reframe"]',
    title: 'Reframe for Social',
    description: 'Convert landscape videos to vertical format (9:16) perfect for TikTok, Instagram Reels, and YouTube Shorts.',
    position: 'right',
  },
  {
    selector: '[data-tour="projects"]',
    title: 'Your Projects',
    description: 'All your videos and clips are saved here. Access them anytime to download or make changes.',
    position: 'top',
  },
];

export function useCustomTour() {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (isActive && currentStep < TOUR_STEPS.length) {
      const step = TOUR_STEPS[currentStep];
      const element = document.querySelector(step.selector) as HTMLElement;
      
      if (element) {
        setTargetElement(element);
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [isActive, currentStep]);

  const startTour = useCallback(() => {
    setIsActive(true);
    setCurrentStep(0);
  }, []);

  const nextStep = useCallback(() => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsActive(false);
      setCurrentStep(0);
      localStorage.setItem('onboarding_tour_completed', 'true');
    }
  }, [currentStep]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  const skipTour = useCallback(() => {
    setIsActive(false);
    setCurrentStep(0);
    localStorage.setItem('onboarding_tour_completed', 'true');
  }, []);

  const resetTour = useCallback(() => {
    localStorage.removeItem('onboarding_tour_completed');
    startTour();
  }, [startTour]);

  // Auto-start tour for new users
  useEffect(() => {
    const hasCompletedTour = localStorage.getItem('onboarding_tour_completed');
    if (!hasCompletedTour) {
      const timer = setTimeout(() => {
        startTour();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [startTour]);

  const TourComponent = useCallback(() => {
    if (!isActive || currentStep >= TOUR_STEPS.length) return null;

    const step = TOUR_STEPS[currentStep];

    return createPortal(
      <TourTooltip
        title={step.title}
        description={step.description}
        currentStep={currentStep + 1}
        totalSteps={TOUR_STEPS.length}
        onNext={nextStep}
        onPrev={prevStep}
        onSkip={skipTour}
        targetElement={targetElement}
        position={step.position}
      />,
      document.body
    );
  }, [isActive, currentStep, targetElement, nextStep, prevStep, skipTour]);

  return {
    startTour,
    resetTour,
    TourComponent,
    isActive,
  };
}
