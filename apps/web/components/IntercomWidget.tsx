'use client';

import { useEffect } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import Intercom from '@intercom/messenger-js-sdk';

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
    if (!isSignedIn || !user) {
      console.log('Intercom: User not signed in yet');
      return;
    }

    // Intercom App ID (set in environment variable)
    const appId = process.env.NEXT_PUBLIC_INTERCOM_APP_ID;
    
    console.log('Intercom: Initializing with APP_ID:', appId);
    
    if (!appId) {
      console.warn('Intercom App ID not configured');
      return;
    }

    try {
      // Initialize Intercom with official SDK
      Intercom({
        app_id: appId,
        user_id: user.id,
        name: user.fullName || user.firstName || 'User',
        email: user.primaryEmailAddress?.emailAddress || '',
        created_at: user.createdAt 
          ? Math.floor(new Date(user.createdAt).getTime() / 1000) 
          : Math.floor(Date.now() / 1000),
      });
      
      console.log('✅ Intercom: Successfully initialized with user:', {
        id: user.id,
        name: user.fullName || user.firstName,
        email: user.primaryEmailAddress?.emailAddress,
      });
    } catch (error) {
      console.error('❌ Intercom: Failed to initialize:', error);
    }

    // Cleanup on unmount
    return () => {
      const w = window as any;
      if (w.Intercom) {
        w.Intercom('shutdown');
        console.log('Intercom: Shutdown');
      }
    };
  }, [isSignedIn, user]);

  return null; // Widget is injected by Intercom SDK
}
