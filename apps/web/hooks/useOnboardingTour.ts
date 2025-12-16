'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import introJs from 'intro.js';
import 'intro.js/introjs.css';

interface OnboardingStep {
  element?: string;
  intro: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    intro: `
      <div style="text-align: center;">
        <h2 style="margin: 0 0 12px 0; font-size: 24px; font-weight: bold;">Welcome to ClipForge! 🎉</h2>
        <p style="margin: 0; font-size: 16px; color: #6b7280;">Let's take a quick tour to get you started. This will only take 30 seconds.</p>
      </div>
    `,
  },
  {
    element: '[data-tour="upload-button"]',
    intro: `
      <div>
        <h3 style="margin: 0 0 8px 0; font-size: 18px; font-weight: bold;">1. Upload Your Video</h3>
        <p style="margin: 0; font-size: 14px; color: #6b7280;">Start by uploading a video or importing from a URL. We support videos up to 120 minutes long.</p>
      </div>
    `,
    position: 'bottom',
  },
  {
    element: '[data-tour="ai-clips"]',
    intro: `
      <div>
        <h3 style="margin: 0 0 8px 0; font-size: 18px; font-weight: bold;">2. Generate AI Clips</h3>
        <p style="margin: 0; font-size: 14px; color: #6b7280;">Our AI automatically detects the most engaging moments and creates viral-ready clips with captions.</p>
      </div>
    `,
    position: 'right',
  },
  {
    element: '[data-tour="ai-reframe"]',
    intro: `
      <div>
        <h3 style="margin: 0 0 8px 0; font-size: 18px; font-weight: bold;">3. Reframe for Social</h3>
        <p style="margin: 0; font-size: 14px; color: #6b7280;">Convert landscape videos to vertical format (9:16) perfect for TikTok, Instagram Reels, and YouTube Shorts.</p>
      </div>
    `,
    position: 'right',
  },
  {
    element: '[data-tour="credits"]',
    intro: `
      <div>
        <h3 style="margin: 0 0 8px 0; font-size: 18px; font-weight: bold;">4. Track Your Credits</h3>
        <p style="margin: 0; font-size: 14px; color: #6b7280;">You get 60 minutes free every month. 1 credit = 1 minute of video processing. Upgrade anytime for more!</p>
      </div>
    `,
    position: 'top',
  },
  {
    intro: `
      <div style="text-align: center;">
        <h2 style="margin: 0 0 12px 0; font-size: 24px; font-weight: bold;">You're All Set! 🚀</h2>
        <p style="margin: 0 0 16px 0; font-size: 16px; color: #6b7280;">Upload your first video to get started. Need help? Contact support@clipforge.ai</p>
        <p style="margin: 0; font-size: 14px; color: #8b5cf6; font-weight: 500;">Tip: Use the checklist below to track your progress!</p>
      </div>
    `,
  },
];

export function useOnboardingTour() {
  const { isLoaded, userId } = useAuth();
  const [hasSeenTour, setHasSeenTour] = useState(true);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!isLoaded || !userId) return;

    // Check if user has seen the tour
    const tourKey = `onboarding_tour_seen_${userId}`;
    const seen = localStorage.getItem(tourKey);
    
    if (!seen) {
      setHasSeenTour(false);
      // Wait a bit for the page to fully render
      setTimeout(() => setIsReady(true), 1000);
    }
  }, [isLoaded, userId]);

  const startTour = () => {
    if (!isReady) return;

    const intro = introJs();
    
    intro.setOptions({
      steps: ONBOARDING_STEPS,
      showProgress: true,
      showBullets: false,
      exitOnOverlayClick: false,
      exitOnEsc: true,
      nextLabel: 'Next →',
      prevLabel: '← Back',
      doneLabel: 'Get Started! 🎉',
      skipLabel: 'Skip Tour',
      overlayOpacity: 0.8,
      tooltipClass: 'customTooltip',
      highlightClass: 'customHighlight',
    });

    intro.onbeforeexit(() => {
      // Mark tour as seen
      if (userId) {
        localStorage.setItem(`onboarding_tour_seen_${userId}`, 'true');
      }
      setHasSeenTour(true);
      return true;
    });

    intro.start();
  };

  const resetTour = () => {
    if (userId) {
      localStorage.removeItem(`onboarding_tour_seen_${userId}`);
      setHasSeenTour(false);
      setIsReady(false);
      setTimeout(() => {
        setIsReady(true);
        startTour();
      }, 500);
    }
  };

  // Auto-start tour if not seen
  useEffect(() => {
    if (!hasSeenTour && isReady) {
      startTour();
    }
  }, [hasSeenTour, isReady]);

  return {
    hasSeenTour,
    startTour,
    resetTour,
  };
}
