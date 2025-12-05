import { useQuery } from 'react-query';
import { fetchWithAuth } from '@/lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface OnboardingProgress {
  userId: string;
  hasCreatedClip: boolean;
  hasAddedSubtitles: boolean;
  hasReframedVideo: boolean;
  hasShared: boolean;
  firstClipAt: string | null;
  firstSubtitleAt: string | null;
  firstReframeAt: string | null;
  firstShareAt: string | null;
  exportCount: number;
  lastExportAt: string | null;
  completedAt: string | null;
  completionPercentage: number;
}

/**
 * Hook to fetch and track onboarding progress
 * 
 * Features:
 * - Real-time progress tracking
 * - Auto-refetch every 5 seconds
 * - Completion percentage calculation
 * - Feature completion timestamps
 * 
 * Usage:
 * ```tsx
 * const { progress, isLoading, refetch } = useOnboardingProgress();
 * 
 * if (progress?.hasCreatedClip) {
 *   // Show celebration
 * }
 * ```
 */
export function useOnboardingProgress() {
  const { data, isLoading, error, refetch } = useQuery<OnboardingProgress>(
    'onboarding-progress',
    async () => {
      const response = await fetchWithAuth(`${API_URL}/v1/onboarding/progress`, {
        getToken: async () => {
          // Token will be automatically added by fetchWithAuth
          return '';
        },
      });
      
      // fetchWithAuth returns the parsed JSON directly
      return response as unknown as OnboardingProgress;
    },
    {
      // DISABLED: Auto-refetch causes blinking - use manual refetch instead
      refetchInterval: false,
      // Keep previous data while refetching (prevents UI flicker)
      keepPreviousData: true,
      // Retry once on failure
      retry: 1,
      // Don't refetch on window focus
      refetchOnWindowFocus: false,
      // Cache for 5 minutes (long cache, manual refresh needed)
      staleTime: 300000,
      // Refetch on mount to get latest data
      refetchOnMount: true,
      // Disable background refetch
      refetchIntervalInBackground: false,
    }
  );

  return {
    progress: data,
    isLoading,
    error,
    refetch,
    // Helper computed values
    isComplete: data?.completionPercentage === 100,
    completedCount: data ? [
      data.hasCreatedClip,
      data.hasAddedSubtitles,
      data.hasReframedVideo,
      data.hasShared,
    ].filter(Boolean).length : 0,
  };
}
