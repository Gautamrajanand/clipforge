/**
 * useAnalytics Hook - React hook for analytics tracking
 * 
 * Usage:
 * const { track, identify, page } = useAnalytics();
 * 
 * track('button_clicked', { buttonName: 'Upgrade' });
 */

import { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { analytics, AnalyticsEvents } from '@/lib/analytics';

export function useAnalytics() {
  const { user, isLoaded } = useUser();

  // Auto-identify user when loaded
  useEffect(() => {
    if (isLoaded && user) {
      analytics.identify(user.id, {
        userId: user.id,
        email: user.primaryEmailAddress?.emailAddress,
        signupDate: user.createdAt ? new Date(user.createdAt) : undefined,
      });
    }
  }, [isLoaded, user]);

  return {
    track: analytics.track.bind(analytics),
    identify: analytics.identify.bind(analytics),
    page: analytics.page.bind(analytics),
    reset: analytics.reset.bind(analytics),
    setUserProperties: analytics.setUserProperties.bind(analytics),
    incrementUserProperty: analytics.incrementUserProperty.bind(analytics),
    events: AnalyticsEvents,
  };
}

/**
 * usePageTracking Hook - Auto-track page views
 * 
 * Usage:
 * usePageTracking('Dashboard');
 */
export function usePageTracking(pageName: string, properties?: Record<string, any>) {
  useEffect(() => {
    analytics.page(pageName, properties);
  }, [pageName, properties]);
}

/**
 * useEventTracking Hook - Track events with dependencies
 * 
 * Usage:
 * useEventTracking('project_created', { projectId }, [projectId]);
 */
export function useEventTracking(
  eventName: string,
  properties?: Record<string, any>,
  dependencies: any[] = []
) {
  useEffect(() => {
    if (dependencies.every((dep) => dep !== null && dep !== undefined)) {
      analytics.track(eventName, properties);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);
}
