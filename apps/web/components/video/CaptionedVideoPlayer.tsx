'use client';

import { useEffect, useRef, useState } from 'react';

interface Word {
  text: string;
  start: number;
  end: number;
  speaker?: string;
  confidence?: number;
}

interface CaptionSettings {
  captionStyle?: string;
  primaryColor?: string;
  secondaryColor?: string;
  fontSize?: number;
  captionPosition?: string;
}

interface CaptionedVideoPlayerProps {
  videoUrl: string;
  transcript?: {
    data?: {
      words?: Word[];
      text?: string;
    };
  };
  settings?: CaptionSettings;
}

export default function CaptionedVideoPlayer({
  videoUrl,
  transcript,
  settings = {},
}: CaptionedVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentCaption, setCurrentCaption] = useState<string>('');

  const {
    captionStyle = 'mr_beast',
    primaryColor = '#FFFFFF',
    secondaryColor = '#FFD700',
    fontSize = 48,
    captionPosition = 'bottom',
  } = settings;

  // Normalize new caption style IDs (used by AI Clips/Subtitles presets)
  // to the legacy style keys used in this preview component
  const normalizeCaptionStyle = (style: string): string => {
    switch (style) {
      case 'mrbeast':
        return 'mr_beast';
      case 'highlight':
        // Hormozi-style yellow box
        return 'alex_hormozi';
      case 'minimal':
        return 'minimalist';
      case 'bold':
        return 'bold_impact';
      case 'neon':
        return 'viral_style';
      // Map other new IDs to the closest existing visual style
      case 'rainbow':
      case 'fill':
      case 'shadow3d':
      case 'tricolor':
      case 'bounce':
      case 'modern':
      case 'elegant':
        return 'bold_impact';
      default:
        return style;
    }
  };

  const effectiveCaptionStyle = normalizeCaptionStyle(captionStyle);
  
  // Check if the selected style is an advanced animated style
  const isAdvancedAnimatedStyle = ['bounce', 'rainbow', 'fill', 'shadow3d', 'tricolor', 'modern', 'elegant'].includes(captionStyle);

  // Debug logging
  useEffect(() => {
    console.log('🎬 CaptionedVideoPlayer mounted');
    console.log('📊 Transcript:', transcript);
    console.log('📊 Words count:', transcript?.data?.words?.length || 0);
    console.log('⚙️  Settings:', settings);
  }, [transcript, settings]);

  // Update current time as video plays
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => video.removeEventListener('timeupdate', handleTimeUpdate);
  }, []);

  // Update caption based on current time
  useEffect(() => {
    if (!transcript?.data?.words) {
      console.log('⚠️  No transcript words available');
      setCurrentCaption('');
      return;
    }

    const words = transcript.data.words;
    
    // Find words that should be displayed at current time
    // Group words into phrases (2-4 words at a time for better readability)
    const wordsPerCaption = effectiveCaptionStyle === 'karaoke' ? 2 : 3;
    
    // Find the current word index
    const currentWordIndex = words.findIndex(
      (word) => currentTime >= word.start && currentTime <= word.end
    );

    if (currentWordIndex === -1) {
      setCurrentCaption('');
      return;
    }

    // Get surrounding words for context
    const startIndex = Math.max(0, currentWordIndex - Math.floor(wordsPerCaption / 2));
    const endIndex = Math.min(words.length, startIndex + wordsPerCaption);
    
    const captionWords = words.slice(startIndex, endIndex);
    const caption = captionWords.map((w) => w.text).join(' ');
    
    console.log(`💬 Caption at ${currentTime.toFixed(2)}s:`, caption);
    setCurrentCaption(caption);
  }, [currentTime, transcript, effectiveCaptionStyle]);

  // Get caption style classes
  const getCaptionClasses = () => {
    const baseClasses = 'absolute left-0 right-0 text-center px-8 pointer-events-none transition-all duration-200';
    
    const positionClasses = {
      top: 'top-16',
      center: 'top-1/2 -translate-y-1/2',
      bottom: 'bottom-16',
    }[captionPosition] || 'bottom-16';

    return `${baseClasses} ${positionClasses}`;
  };

  // Get text style based on caption style
  const getTextStyle = () => {
    const baseStyle: React.CSSProperties = {
      fontSize: `${fontSize}px`,
      lineHeight: '1.2',
      fontWeight: 'bold',
      textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
    };

    switch (effectiveCaptionStyle) {
      case 'mr_beast':
        return {
          ...baseStyle,
          color: primaryColor,
          backgroundColor: secondaryColor,
          padding: '8px 24px',
          borderRadius: '8px',
          display: 'inline-block',
          textTransform: 'uppercase' as const,
        };
      
      case 'viral_style':
        return {
          ...baseStyle,
          color: secondaryColor,
          WebkitTextStroke: `2px ${primaryColor}`,
          textTransform: 'uppercase' as const,
        };
      
      case 'alex_hormozi':
        return {
          ...baseStyle,
          color: primaryColor,
          backgroundColor: 'rgba(0,0,0,0.8)',
          padding: '12px 32px',
          borderRadius: '4px',
          display: 'inline-block',
          letterSpacing: '1px',
        };
      
      case 'minimalist':
        return {
          ...baseStyle,
          color: primaryColor,
          fontWeight: 'normal',
          fontSize: `${fontSize * 0.8}px`,
        };
      
      case 'bold_impact':
        return {
          ...baseStyle,
          color: secondaryColor,
          WebkitTextStroke: `3px ${primaryColor}`,
          fontSize: `${fontSize * 1.2}px`,
          textTransform: 'uppercase' as const,
        };
      
      case 'karaoke':
      default:
        return {
          ...baseStyle,
          color: primaryColor,
          background: `linear-gradient(to right, ${secondaryColor} 50%, ${primaryColor} 50%)`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundSize: '200% 100%',
          backgroundPosition: '100% 0',
        };
    }
  };

  return (
    <div className="space-y-3">
      {/* Notice for advanced animated styles */}
      {isAdvancedAnimatedStyle && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 flex items-start gap-3">
          <div className="flex-shrink-0 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center mt-0.5">
            <span className="text-white text-xs font-bold">!</span>
          </div>
          <div className="flex-1">
            <p className="text-sm text-purple-900 font-medium">
              Preview shows simplified captions
            </p>
            <p className="text-xs text-purple-700 mt-1">
              The <strong>{captionStyle}</strong> style uses advanced animations that can't be previewed in real-time. 
              Your exported video will have the full animated effect with the exact colors and size you selected.
            </p>
          </div>
        </div>
      )}
      
      <div className="relative aspect-video bg-black rounded-xl overflow-hidden">
        <video
          ref={videoRef}
          controls
          className="w-full h-full"
          src={videoUrl}
          preload="metadata"
        >
          Your browser does not support the video tag.
        </video>
        
        {/* Caption Overlay - Only show for non-advanced styles */}
        {currentCaption && !isAdvancedAnimatedStyle && (
          <div className={getCaptionClasses()}>
            <span style={getTextStyle()}>
              {currentCaption}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
