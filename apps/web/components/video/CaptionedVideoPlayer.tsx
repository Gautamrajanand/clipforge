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
    const wordsPerCaption = captionStyle === 'karaoke' ? 2 : 3;
    
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
  }, [currentTime, transcript, captionStyle]);

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

    switch (captionStyle) {
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
      
      {/* Caption Overlay */}
      {currentCaption && (
        <div className={getCaptionClasses()}>
          <span style={getTextStyle()}>
            {currentCaption}
          </span>
        </div>
      )}
    </div>
  );
}
