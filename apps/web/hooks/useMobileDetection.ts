'use client';

import { useState, useEffect } from 'react';

/**
 * Mobile Detection Hook
 * Detects mobile devices and adjusts UI accordingly
 */

const MOBILE_BREAKPOINT = 768; // pixels

export function useMobileDetection() {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [screenWidth, setScreenWidth] = useState(0);

  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      const userAgent = navigator.userAgent;

      // Check by screen width
      const isMobileWidth = width < MOBILE_BREAKPOINT;
      const isTabletWidth = width >= MOBILE_BREAKPOINT && width < 1024;

      // Check by user agent
      const isMobileUA = /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      const isTabletUA = /iPad|Android(?!.*Mobile)/i.test(userAgent);

      // Combine checks
      const mobile = isMobileWidth || (isMobileUA && !isTabletUA);
      const tablet = isTabletWidth || isTabletUA;

      setIsMobile(mobile);
      setIsTablet(tablet);
      setScreenWidth(width);

      console.log(`[MobileDetection] Width: ${width}px, Mobile: ${mobile}, Tablet: ${tablet}`);
    };

    // Initial check
    checkDevice();

    // Listen for resize
    window.addEventListener('resize', checkDevice);
    
    // Listen for orientation change
    window.addEventListener('orientationchange', checkDevice);

    return () => {
      window.removeEventListener('resize', checkDevice);
      window.removeEventListener('orientationchange', checkDevice);
    };
  }, []);

  return {
    isMobile,
    isTablet,
    isDesktop: !isMobile && !isTablet,
    screenWidth,
    isTouchDevice: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
  };
}

/**
 * Hook to check if device is mobile (simplified)
 */
export function useIsMobile(): boolean {
  const { isMobile } = useMobileDetection();
  return isMobile;
}

/**
 * Hook to check if onboarding tour should be shown
 */
export function useShouldShowTour(userId: string | undefined): boolean {
  const { isMobile } = useMobileDetection();
  const [hasSeenTour, setHasSeenTour] = useState(true);

  useEffect(() => {
    if (!userId) {
      setHasSeenTour(true);
      return;
    }

    const tourKey = `onboarding_tour_seen_${userId}`;
    const seen = localStorage.getItem(tourKey);
    setHasSeenTour(!!seen);
  }, [userId]);

  // Skip tour on mobile (too cramped)
  if (isMobile) {
    console.log(`[MobileDetection] Skipping tour on mobile device`);
    return false;
  }

  // Skip if already seen
  if (hasSeenTour) {
    return false;
  }

  return true;
}
