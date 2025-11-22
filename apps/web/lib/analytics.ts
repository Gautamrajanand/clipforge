/**
 * Analytics Utility - Unified tracking for Mixpanel, GA4, and PostHog
 * 
 * Usage:
 * import { analytics } from '@/lib/analytics';
 * 
 * analytics.track('project_created', { projectId: '123', type: 'CLIPS' });
 * analytics.identify(userId, { email, tier });
 * analytics.page('Dashboard');
 */

import mixpanel from 'mixpanel-browser';
import ReactGA from 'react-ga4';

// Types
export interface UserProperties {
  userId: string;
  email?: string;
  tier?: 'FREE' | 'STARTER' | 'PRO' | 'BUSINESS';
  signupDate?: Date;
  signupSource?: string;
}

export interface EventProperties {
  [key: string]: any;
}

class Analytics {
  private isInitialized = false;
  private isDevelopment = process.env.NODE_ENV === 'development';

  /**
   * Initialize all analytics services
   */
  init() {
    if (this.isInitialized) return;
    if (typeof window === 'undefined') return; // Server-side guard

    try {
      // Initialize Mixpanel
      const mixpanelToken = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN;
      if (mixpanelToken) {
        mixpanel.init(mixpanelToken, {
          debug: this.isDevelopment,
          track_pageview: true,
          persistence: 'localStorage',
        });
        console.log('✅ Mixpanel initialized');
      }

      // Initialize GA4
      const ga4MeasurementId = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID;
      if (ga4MeasurementId) {
        ReactGA.initialize(ga4MeasurementId, {
          gaOptions: {
            debug_mode: this.isDevelopment,
          },
        });
        console.log('✅ GA4 initialized');
      }

      // Initialize PostHog (optional)
      const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
      if (posthogKey && typeof window !== 'undefined') {
        // Dynamic import to avoid SSR issues
        import('posthog-js').then((posthog) => {
          posthog.default.init(posthogKey, {
            api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
            loaded: (posthog) => {
              if (this.isDevelopment) posthog.debug();
            },
          });
          console.log('✅ PostHog initialized');
        });
      }

      this.isInitialized = true;
    } catch (error) {
      console.error('❌ Analytics initialization error:', error);
    }
  }

  /**
   * Identify a user with properties
   */
  identify(userId: string, properties?: UserProperties) {
    if (!this.isInitialized) this.init();

    try {
      // Mixpanel
      mixpanel.identify(userId);
      if (properties) {
        mixpanel.people.set(properties);
      }

      // GA4
      ReactGA.set({ userId });

      // PostHog
      if (typeof window !== 'undefined' && (window as any).posthog) {
        (window as any).posthog.identify(userId, properties);
      }

      if (this.isDevelopment) {
        console.log('👤 User identified:', userId, properties);
      }
    } catch (error) {
      console.error('❌ Analytics identify error:', error);
    }
  }

  /**
   * Track an event
   */
  track(eventName: string, properties?: EventProperties) {
    if (!this.isInitialized) this.init();

    try {
      // Mixpanel
      mixpanel.track(eventName, properties);

      // GA4
      ReactGA.event(eventName, properties);

      // PostHog
      if (typeof window !== 'undefined' && (window as any).posthog) {
        (window as any).posthog.capture(eventName, properties);
      }

      if (this.isDevelopment) {
        console.log('📊 Event tracked:', eventName, properties);
      }
    } catch (error) {
      console.error('❌ Analytics track error:', error);
    }
  }

  /**
   * Track a page view
   */
  page(pageName: string, properties?: EventProperties) {
    if (!this.isInitialized) this.init();

    try {
      // Mixpanel
      mixpanel.track_pageview({ page: pageName, ...properties });

      // GA4
      ReactGA.send({ hitType: 'pageview', page: pageName, ...properties });

      // PostHog
      if (typeof window !== 'undefined' && (window as any).posthog) {
        (window as any).posthog.capture('$pageview', { page: pageName, ...properties });
      }

      if (this.isDevelopment) {
        console.log('📄 Page viewed:', pageName, properties);
      }
    } catch (error) {
      console.error('❌ Analytics page error:', error);
    }
  }

  /**
   * Reset user identity (on logout)
   */
  reset() {
    try {
      // Mixpanel
      mixpanel.reset();

      // PostHog
      if (typeof window !== 'undefined' && (window as any).posthog) {
        (window as any).posthog.reset();
      }

      if (this.isDevelopment) {
        console.log('🔄 Analytics reset');
      }
    } catch (error) {
      console.error('❌ Analytics reset error:', error);
    }
  }

  /**
   * Set user properties (without identifying)
   */
  setUserProperties(properties: Partial<UserProperties>) {
    try {
      // Mixpanel
      mixpanel.people.set(properties);

      // GA4
      ReactGA.set(properties);

      // PostHog
      if (typeof window !== 'undefined' && (window as any).posthog) {
        (window as any).posthog.setPersonProperties(properties);
      }

      if (this.isDevelopment) {
        console.log('👤 User properties set:', properties);
      }
    } catch (error) {
      console.error('❌ Analytics setUserProperties error:', error);
    }
  }

  /**
   * Increment a user property
   */
  incrementUserProperty(property: string, value: number = 1) {
    try {
      // Mixpanel
      mixpanel.people.increment(property, value);

      if (this.isDevelopment) {
        console.log(`📈 User property incremented: ${property} +${value}`);
      }
    } catch (error) {
      console.error('❌ Analytics incrementUserProperty error:', error);
    }
  }
}

// Export singleton instance
export const analytics = new Analytics();

// Event name constants for type safety
export const AnalyticsEvents = {
  // Auth
  USER_SIGNED_UP: 'user_signed_up',
  USER_SIGNED_IN: 'user_signed_in',
  USER_SIGNED_OUT: 'user_signed_out',

  // Projects
  PROJECT_CREATED: 'project_created',
  VIDEO_UPLOADED: 'video_uploaded',
  VIDEO_IMPORTED_FROM_URL: 'video_imported_from_url',
  CLIPS_DETECTED: 'clips_detected',
  CLIP_SELECTED: 'clip_selected',
  CLIP_EXPORTED: 'clip_exported',
  PROJECT_DELETED: 'project_deleted',

  // Credits
  CREDITS_DEDUCTED: 'credits_deducted',
  CREDITS_ADDED: 'credits_added',
  CREDITS_INSUFFICIENT: 'credits_insufficient',
  CREDITS_RENEWED: 'credits_renewed',

  // Payments
  CHECKOUT_INITIATED: 'checkout_initiated',
  CHECKOUT_COMPLETED: 'checkout_completed',
  CHECKOUT_FAILED: 'checkout_failed',
  SUBSCRIPTION_CREATED: 'subscription_created',
  SUBSCRIPTION_UPGRADED: 'subscription_upgraded',
  SUBSCRIPTION_DOWNGRADED: 'subscription_downgraded',
  SUBSCRIPTION_CANCELED: 'subscription_canceled',

  // Features
  AI_CLIPS_USED: 'ai_clips_used',
  AI_SUBTITLES_USED: 'ai_subtitles_used',
  AI_REFRAME_USED: 'ai_reframe_used',
  CAPTION_STYLE_CHANGED: 'caption_style_changed',
  EXPORT_SETTINGS_CHANGED: 'export_settings_changed',

  // Engagement
  DASHBOARD_VIEWED: 'dashboard_viewed',
  PRICING_VIEWED: 'pricing_viewed',
  HELP_CLICKED: 'help_clicked',
  UPGRADE_PROMPT_SHOWN: 'upgrade_prompt_shown',
  UPGRADE_PROMPT_CLICKED: 'upgrade_prompt_clicked',
} as const;

// Helper functions for common tracking patterns
export const trackProjectCreated = (projectId: string, type: string, duration: number) => {
  analytics.track(AnalyticsEvents.PROJECT_CREATED, {
    projectId,
    projectType: type,
    videoDuration: duration,
  });
};

export const trackVideoUploaded = (projectId: string, duration: number, fileSize: number) => {
  analytics.track(AnalyticsEvents.VIDEO_UPLOADED, {
    projectId,
    videoDuration: duration,
    fileSize,
  });
};

export const trackClipExported = (projectId: string, clipId: string, duration: number) => {
  analytics.track(AnalyticsEvents.CLIP_EXPORTED, {
    projectId,
    clipId,
    clipDuration: duration,
  });
  analytics.incrementUserProperty('total_exports');
};

export const trackCreditsDeducted = (amount: number, remaining: number, reason: string) => {
  analytics.track(AnalyticsEvents.CREDITS_DEDUCTED, {
    creditsUsed: amount,
    creditsRemaining: remaining,
    reason,
  });
};

export const trackCheckoutInitiated = (plan: string, amount: number) => {
  analytics.track(AnalyticsEvents.CHECKOUT_INITIATED, {
    plan,
    amount,
    currency: 'USD',
  });
};

export const trackUpgradePromptShown = (location: string, currentTier: string) => {
  analytics.track(AnalyticsEvents.UPGRADE_PROMPT_SHOWN, {
    location,
    currentTier,
  });
};

export const trackUpgradePromptClicked = (location: string, targetTier: string) => {
  analytics.track(AnalyticsEvents.UPGRADE_PROMPT_CLICKED, {
    location,
    targetTier,
  });
};
