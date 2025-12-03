'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { usePathname } from 'next/navigation';
import { fetchWithAuth } from '@/lib/api';
import { X } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
import Link from 'next/link';

interface PopupContent {
  id: string;
  name: string;
  type: string;
  title: string;
  subtitle?: string;
  content: string;
  ctaText: string;
  ctaUrl?: string;
  imageUrl?: string;
  showAfter?: number;
  showOnPages: string[];
  frequency: string;
  priority: number;
}

export default function DynamicPopup() {
  const { getToken, isSignedIn } = useAuth();
  const pathname = usePathname();
  const [activePopup, setActivePopup] = useState<PopupContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSignedIn) return;

    const loadPopups = async () => {
      try {
        // Don't show popups if onboarding is active
        const onboardingCompleted = localStorage.getItem('onboardingCompleted');
        if (!onboardingCompleted) {
          setLoading(false);
          return;
        }

        // Fetch active popups for current page
        const response = await fetchWithAuth(
          `${API_URL}/v1/plg/content/popups?page=${pathname}`,
          { getToken }
        );

        if (response.ok) {
          const popups: PopupContent[] = await response.json();
          
          // Filter popups based on display rules
          const eligiblePopup = popups.find((popup) => {
            // Check if popup should be shown on this page
            if (popup.showOnPages.length > 0 && !popup.showOnPages.includes(pathname)) {
              return false;
            }

            // Check frequency
            const viewKey = `popup_viewed_${popup.id}`;
            const lastViewed = localStorage.getItem(viewKey);

            if (popup.frequency === 'once' && lastViewed) {
              return false;
            }

            if (popup.frequency === 'daily' && lastViewed) {
              const daysSince = (Date.now() - parseInt(lastViewed)) / (1000 * 60 * 60 * 24);
              if (daysSince < 1) return false;
            }

            if (popup.frequency === 'weekly' && lastViewed) {
              const daysSince = (Date.now() - parseInt(lastViewed)) / (1000 * 60 * 60 * 24);
              if (daysSince < 7) return false;
            }

            return true;
          });

          if (eligiblePopup) {
            // Delay showing popup if showAfter is set
            const delay = (eligiblePopup.showAfter || 0) * 1000;
            setTimeout(() => {
              setActivePopup(eligiblePopup);
              // Track view
              localStorage.setItem(`popup_viewed_${eligiblePopup.id}`, Date.now().toString());
            }, delay);
          }
        }
      } catch (error) {
        console.error('Failed to load popups:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPopups();
  }, [isSignedIn, getToken, pathname]);

  const handleClose = () => {
    setActivePopup(null);
  };

  if (loading || !activePopup) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in duration-300">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
        >
          <X size={24} />
        </button>

        {activePopup.imageUrl && (
          <img
            src={activePopup.imageUrl}
            alt={activePopup.title}
            className="w-full h-48 object-cover"
          />
        )}

        <div className="p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {activePopup.title}
          </h2>
          
          {activePopup.subtitle && (
            <p className="text-lg text-gray-600 mb-4">{activePopup.subtitle}</p>
          )}

          <div
            className="text-gray-700 leading-relaxed mb-6"
            dangerouslySetInnerHTML={{ __html: activePopup.content }}
          />

          <div className="flex gap-3">
            {activePopup.ctaUrl ? (
              <Link
                href={activePopup.ctaUrl}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl text-center"
                onClick={handleClose}
              >
                {activePopup.ctaText}
              </Link>
            ) : (
              <button
                onClick={handleClose}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
              >
                {activePopup.ctaText}
              </button>
            )}
            
            <button
              onClick={handleClose}
              className="px-6 py-3 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
