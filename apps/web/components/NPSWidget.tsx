'use client';

import { useEffect } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';

/**
 * NPS (Net Promoter Score) Widget Component
 * Integrates Delighted for NPS surveys and feedback collection
 * 
 * Features:
 * - NPS surveys (0-10 scale)
 * - Follow-up questions
 * - User segmentation
 * - Automated triggers
 * - Analytics dashboard
 */
export default function NPSWidget() {
  const { isSignedIn } = useAuth();
  const { user } = useUser();

  useEffect(() => {
    // Only load NPS if user is signed in
    if (!isSignedIn || !user) return;

    // Delighted API Key (set in environment variable)
    const apiKey = process.env.NEXT_PUBLIC_DELIGHTED_API_KEY;
    
    if (!apiKey) {
      console.warn('Delighted API Key not configured');
      return;
    }

    // Load Delighted script
    (function() {
      const w = window as any;
      
      if (w.delighted) {
        return; // Already loaded
      }

      w.delighted = w.delighted || {};
      w.delighted.survey = function(options: any) {
        (w.delighted.survey.q = w.delighted.survey.q || []).push(options);
      };

      const script = document.createElement('script');
      script.src = 'https://d2yyd1h5u9mauk.cloudfront.net/integrations/web/v1/library/' + apiKey + '/delighted.js';
      script.async = true;
      
      const firstScript = document.getElementsByTagName('script')[0];
      firstScript.parentNode?.insertBefore(script, firstScript);
    })();

    // Configure survey
    const w = window as any;
    if (w.delighted && w.delighted.survey) {
      w.delighted.survey({
        email: user.primaryEmailAddress?.emailAddress,
        name: user.fullName || user.firstName || 'User',
        properties: {
          user_id: user.id,
          created_at: user.createdAt,
          // Add custom properties for segmentation
        },
      });
    }

  }, [isSignedIn, user]);

  return null; // Widget is injected by Delighted script
}
