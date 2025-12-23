'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { fetchWithAuth } from '@/lib/api';
import { X } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Custom NPS (Net Promoter Score) Widget
 * Free alternative to Delighted - uses our own backend
 * 
 * Features:
 * - NPS surveys (0-10 scale)
 * - Follow-up feedback
 * - Smart timing (after 3 exports or 7 days)
 * - One-time per user
 */
export default function NPSWidget() {
  const { isSignedIn, getToken } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isSignedIn) return;

    // Check if user has already submitted NPS
    const checkNPSStatus = async () => {
      try {
        const response = await fetchWithAuth(`${API_URL}/v1/nps/status`, {
          getToken,
        });
        const data = await response.json();
        
        if (data.hasSubmitted) {
          return; // Don't show again
        }

        // PRODUCTION: Only show NPS to users who have been active for 7+ days
        // For now, DISABLED for new users - they should complete onboarding first
        // Uncomment below to enable after 7 days:
        // const accountAge = Date.now() - new Date(user.createdAt).getTime();
        // const sevenDays = 7 * 24 * 60 * 60 * 1000;
        // if (accountAge < sevenDays) return;
        
        // setTimeout(() => {
        //   setShowModal(true);
        // }, 5000);
      } catch (error) {
        console.error('Failed to check NPS status:', error);
      }
    };

    checkNPSStatus();
  }, [isSignedIn, getToken]);

  const handleSubmit = async () => {
    if (score === null) return;

    setLoading(true);
    try {
      const response = await fetchWithAuth(`${API_URL}/v1/nps/submit`, {
        getToken,
        method: 'POST',
        body: JSON.stringify({
          score,
          feedback: feedback || undefined,
          context: 'dashboard_modal',
        }),
      });

      if (response.ok) {
        setSubmitted(true);
        setTimeout(() => {
          setShowModal(false);
        }, 2000);
      }
    } catch (error) {
      console.error('Failed to submit NPS:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
        <button
          onClick={() => setShowModal(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X size={20} />
        </button>

        {!submitted ? (
          <>
            <h3 className="text-xl font-semibold mb-2">How likely are you to recommend ClipForge?</h3>
            <p className="text-gray-600 text-sm mb-6">Your feedback helps us improve!</p>

            {/* NPS Score Buttons */}
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <button
                    key={num}
                    onClick={() => setScore(num)}
                    className={`w-8 h-8 rounded-full text-sm font-medium transition-all ${
                      score === num
                        ? 'bg-blue-600 text-white scale-110'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Not likely</span>
                <span>Very likely</span>
              </div>
            </div>

            {/* Feedback Text */}
            {score !== null && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What's the main reason for your score? (optional)
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Tell us more..."
                />
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={score === null || loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </>
        ) : (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🎉</div>
            <h3 className="text-xl font-semibold mb-2">Thank you!</h3>
            <p className="text-gray-600">Your feedback helps us improve ClipForge.</p>
          </div>
        )}
      </div>
    </div>
  );
}
