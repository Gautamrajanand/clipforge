'use client';

import { useState } from 'react';
import { Twitter, Linkedin, Facebook, Link2, Check, Share2 } from 'lucide-react';
import { analytics, AnalyticsEvents } from '@/lib/analytics';

interface ShareButtonsProps {
  clipTitle: string;
  clipUrl?: string;
  projectId: string;
  clipId: string;
}

export default function ShareButtons({ clipTitle, clipUrl, projectId, clipId }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  // Generate shareable URL with UTM parameters
  const getShareUrl = (platform: string) => {
    const baseUrl = clipUrl || `${window.location.origin}/clip/${clipId}`;
    return `${baseUrl}?utm_source=${platform}&utm_medium=social&utm_campaign=clip_share&ref=${projectId}`;
  };

  // Pre-filled social media text
  const getShareText = (platform: string) => {
    const baseText = `Check out this clip I made with ClipForge! 🎬`;
    const hashtags = '#ClipForge #VideoEditing #ContentCreation';
    
    switch (platform) {
      case 'twitter':
        return `${baseText} ${clipTitle}\n\n${hashtags}`;
      case 'linkedin':
        return `${baseText}\n\n"${clipTitle}"\n\nCreated with ClipForge - the fastest way to turn long videos into viral clips. Try it free: clipforge.com`;
      case 'facebook':
        return `${baseText}\n\n${clipTitle}\n\nMade with ClipForge 🚀`;
      default:
        return baseText;
    }
  };

  // Track share event
  const trackShare = (platform: string) => {
    analytics.track(AnalyticsEvents.CLIP_SHARED, {
      projectId,
      clipId,
      platform,
      clipTitle,
    });
  };

  // Share handlers
  const shareToTwitter = () => {
    const url = getShareUrl('twitter');
    const text = getShareText('twitter');
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      '_blank',
      'width=550,height=420'
    );
    trackShare('twitter');
  };

  const shareToLinkedIn = () => {
    const url = getShareUrl('linkedin');
    const text = getShareText('linkedin');
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&summary=${encodeURIComponent(text)}`,
      '_blank',
      'width=550,height=420'
    );
    trackShare('linkedin');
  };

  const shareToFacebook = () => {
    const url = getShareUrl('facebook');
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      '_blank',
      'width=550,height=420'
    );
    trackShare('facebook');
  };

  const copyLink = async () => {
    const url = getShareUrl('copy');
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      trackShare('copy_link');
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  const shareNative = async () => {
    const url = getShareUrl('native');
    const text = getShareText('native');
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: clipTitle,
          text: text,
          url: url,
        });
        trackShare('native_share');
      } catch (error) {
        // User cancelled or error occurred
        console.log('Share cancelled or failed:', error);
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Share Your Clip</h3>
        <p className="text-sm text-gray-600">
          Share on social media and grow your audience
        </p>
      </div>

      {/* Social Share Buttons */}
      <div className="grid grid-cols-2 gap-3">
        {/* Twitter */}
        <button
          onClick={shareToTwitter}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-[#1DA1F2] text-white rounded-lg hover:bg-[#1a8cd8] transition-colors"
        >
          <Twitter className="w-5 h-5" />
          <span className="font-medium">Twitter</span>
        </button>

        {/* LinkedIn */}
        <button
          onClick={shareToLinkedIn}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-[#0A66C2] text-white rounded-lg hover:bg-[#004182] transition-colors"
        >
          <Linkedin className="w-5 h-5" />
          <span className="font-medium">LinkedIn</span>
        </button>

        {/* Facebook */}
        <button
          onClick={shareToFacebook}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-[#1877F2] text-white rounded-lg hover:bg-[#0c63d4] transition-colors"
        >
          <Facebook className="w-5 h-5" />
          <span className="font-medium">Facebook</span>
        </button>

        {/* Copy Link */}
        <button
          onClick={copyLink}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-600">Copied!</span>
            </>
          ) : (
            <>
              <Link2 className="w-5 h-5" />
              <span className="font-medium">Copy Link</span>
            </>
          )}
        </button>
      </div>

      {/* Native Share (Mobile) */}
      {typeof window !== 'undefined' && 'share' in navigator && (
        <button
          onClick={shareNative}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors"
        >
          <Share2 className="w-5 h-5" />
          <span className="font-medium">Share via...</span>
        </button>
      )}

      {/* Share Stats (Optional) */}
      <div className="pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          💡 Tip: Add your own commentary when sharing to increase engagement!
        </p>
      </div>
    </div>
  );
}
