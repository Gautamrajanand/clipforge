'use client';

import { useEffect } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';

/**
 * Intercom Widget Component
 * Loads Intercom chat widget for customer support and engagement
 * 
 * Features:
 * - Live chat support
 * - Automated messages (welcome, help, upgrade)
 * - User segmentation
 * - Product tours
 * - Message analytics
 */
export default function IntercomWidget() {
  const { isSignedIn } = useAuth();
  const { user } = useUser();

  useEffect(() => {
    // Only load Intercom if user is signed in
    if (!isSignedIn || !user) return;

    // Intercom App ID (set in environment variable)
    const appId = process.env.NEXT_PUBLIC_INTERCOM_APP_ID;
    
    if (!appId) {
      console.warn('Intercom App ID not configured');
      return;
    }

    // Load Intercom script
    (function() {
      const w = window as any;
      const ic = w.Intercom;
      
      if (typeof ic === 'function') {
        ic('reattach_activator');
        ic('update', w.intercomSettings);
      } else {
        const d = document;
        const i = function() {
          (i as any).c(arguments);
        };
        (i as any).q = [];
        (i as any).c = function(args: any) {
          (i as any).q.push(args);
        };
        w.Intercom = i;
        
        const l = function() {
          const s = d.createElement('script');
          s.type = 'text/javascript';
          s.async = true;
          s.src = `https://widget.intercom.io/widget/${appId}`;
          const x = d.getElementsByTagName('script')[0];
          x.parentNode?.insertBefore(s, x);
        };
        
        if (document.readyState === 'complete') {
          l();
        } else if (w.attachEvent) {
          w.attachEvent('onload', l);
        } else {
          w.addEventListener('load', l, false);
        }
      }
    })();

    // Boot Intercom with user data
    const w = window as any;
    w.intercomSettings = {
      app_id: appId,
      user_id: user.id,
      name: user.fullName || user.firstName || 'User',
      email: user.primaryEmailAddress?.emailAddress,
      created_at: user.createdAt ? Math.floor(new Date(user.createdAt).getTime() / 1000) : Math.floor(Date.now() / 1000),
      // Custom attributes for segmentation
      custom_launcher_selector: '#intercom-launcher',
    };

    if (w.Intercom) {
      w.Intercom('boot', w.intercomSettings);
    }

    // Cleanup on unmount
    return () => {
      if (w.Intercom) {
        w.Intercom('shutdown');
      }
    };
  }, [isSignedIn, user]);

  return null; // Widget is injected by Intercom script
}
