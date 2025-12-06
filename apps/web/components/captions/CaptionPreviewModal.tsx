"use client";

import { useState, useEffect } from "react";
import { X, Play, Pause } from "lucide-react";
import { CAPTION_PRESETS } from "./CaptionStyleSelector";

interface CaptionPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  styleId: string;
  videoUrl?: string;
  videoThumbnail?: string;
  sampleText?: string;
}

export default function CaptionPreviewModal({
  isOpen,
  onClose,
  styleId,
  videoThumbnail,
  sampleText = "This is how your captions will look",
}: CaptionPreviewModalProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  const style = CAPTION_PRESETS.find((p) => p.id === styleId);
  const words = sampleText.split(" ");

  // Animate words
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentWordIndex((prev) => {
        if (prev >= words.length - 1) {
          setIsPlaying(false);
          return 0;
        }
        return prev + 1;
      });
    }, 500); // Change word every 500ms

    return () => clearInterval(interval);
  }, [isPlaying, words.length]);

  if (!isOpen || !style) return null;

  const getCaptionStyle = () => {
    const baseStyle: React.CSSProperties = {
      fontFamily: style.id === 'typewriter' ? 'Courier New, monospace' :
                  style.id === 'cinematic' ? 'Georgia, serif' :
                  style.id === 'bold' ? 'Impact, sans-serif' :
                  style.id === 'mrbeast' ? 'Impact, sans-serif' :
                  'Inter, Arial, sans-serif',
      fontWeight: style.id.includes('bold') || style.id === 'mrbeast' || style.id === 'uppercase' ? '900' : '600',
      textTransform: style.id === 'uppercase' || style.id === 'bold' || style.id === 'mrbeast' ? 'uppercase' : 'none',
    };

    // Style-specific colors and effects
    switch (style.id) {
      case 'mrbeast':
        return {
          ...baseStyle,
          color: '#FFD900',
          fontSize: '48px',
          textShadow: '4px 4px 0px #000, -2px -2px 0px #000, 2px -2px 0px #000, -2px 2px 0px #000',
        };
      case 'neon':
        return {
          ...baseStyle,
          color: '#00FF00',
          fontSize: '42px',
          textShadow: '0 0 20px #00FF00, 0 0 40px #00FF00, 4px 4px 0px #000',
        };
      case 'highlight':
        return {
          ...baseStyle,
          color: '#000',
          backgroundColor: '#FFE600',
          padding: '8px 16px',
          fontSize: '38px',
          display: 'inline-block',
        };
      case 'karaoke':
        return {
          ...baseStyle,
          color: currentWordIndex >= 0 ? '#00F8C8' : '#FFF',
          fontSize: '36px',
          textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
        };
      case 'typewriter':
        return {
          ...baseStyle,
          color: '#FFF',
          fontSize: '32px',
          textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
          letterSpacing: '1px',
        };
      case 'glitch':
        return {
          ...baseStyle,
          color: '#FFF',
          fontSize: '40px',
          textShadow: '2px 0 #FF0000, -2px 0 #00FFFF, 0 2px #000',
        };
      case 'popline':
        return {
          ...baseStyle,
          color: '#000',
          backgroundColor: '#00FF87',
          padding: '8px 20px',
          fontSize: '36px',
          display: 'inline-block',
        };
      case 'blur':
        return {
          ...baseStyle,
          color: '#FFF',
          backgroundColor: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(12px)',
          padding: '12px 24px',
          fontSize: '34px',
          borderRadius: '8px',
        };
      case 'documentary':
        return {
          ...baseStyle,
          color: '#FFF',
          backgroundColor: '#FF3DA1',
          padding: '8px 16px',
          fontSize: '36px',
          display: 'inline-block',
        };
      case 'cinematic':
        return {
          ...baseStyle,
          color: '#FFF',
          fontSize: '34px',
          textShadow: '0 4px 12px rgba(0,0,0,0.7)',
        };
      case 'uppercase':
        return {
          ...baseStyle,
          color: '#FFF',
          backgroundColor: '#000',
          padding: '10px 20px',
          fontSize: '36px',
          display: 'inline-block',
        };
      case 'gradient':
        return {
          ...baseStyle,
          background: 'linear-gradient(90deg, #FF1493, #9B59B6, #3498DB)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontSize: '38px',
          textShadow: 'none',
        };
      case 'bubble':
        return {
          ...baseStyle,
          color: '#FFF',
          backgroundColor: 'rgba(0,0,0,0.7)',
          padding: '8px 16px',
          fontSize: '32px',
          borderRadius: '20px',
          display: 'inline-block',
        };
      case 'news':
        return {
          ...baseStyle,
          color: '#FFF',
          backgroundColor: '#D90000',
          padding: '6px 16px',
          fontSize: '32px',
          display: 'inline-block',
        };
      case 'rainbow':
        return {
          ...baseStyle,
          color: ['#FFD700', '#00FFFF', '#00FF00', '#FF1493'][currentWordIndex % 4],
          fontSize: '44px',
          textShadow: '4px 4px 0px #000',
        };
      case 'bounce':
        return {
          ...baseStyle,
          color: '#FFF',
          fontSize: '40px',
          textShadow: '3px 3px 0px #000',
          transform: isPlaying ? 'scale(1.08)' : 'scale(1)',
          transition: 'transform 0.2s ease-out',
        };
      default:
        return {
          ...baseStyle,
          color: '#FFF',
          fontSize: '32px',
          textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
        };
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Caption Preview</h2>
            <p className="text-sm text-gray-500 mt-1">
              {style.name} - {style.description}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Preview Area */}
        <div className="p-6">
          {/* Video Preview with Caption Overlay */}
          <div className="relative aspect-video bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg overflow-hidden">
            {/* Video or Thumbnail */}
            {videoThumbnail ? (
              <img
                src={videoThumbnail}
                alt="Video thumbnail"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <Play className="w-16 h-16 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Video preview</p>
                </div>
              </div>
            )}

            {/* Caption Overlay */}
            <div
              className={`absolute inset-0 flex items-${
                style.position === 'top' ? 'start' : style.position === 'center' ? 'center' : 'end'
              } justify-center p-8`}
            >
              <div
                style={getCaptionStyle()}
                className="max-w-[90%] text-center leading-tight"
              >
                {style.id === 'typewriter' && isPlaying
                  ? words.slice(0, currentWordIndex + 1).join(' ')
                  : words.map((word, idx) => (
                      <span
                        key={idx}
                        className={`inline-block mx-1 ${
                          isPlaying && idx === currentWordIndex ? 'animate-pulse' : ''
                        }`}
                        style={{
                          opacity: !isPlaying || idx <= currentWordIndex ? 1 : 0.3,
                        }}
                      >
                        {word}
                      </span>
                    ))}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  setIsPlaying(!isPlaying);
                  if (!isPlaying) setCurrentWordIndex(0);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-4 h-4" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Play Animation
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setCurrentWordIndex(0);
                  setIsPlaying(false);
                }}
                className="px-4 py-2 border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
              >
                Reset
              </button>
            </div>

            <div className="text-sm text-gray-500">
              Position: <span className="font-medium capitalize">{style.position}</span>
            </div>
          </div>

          {/* Style Info */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Style Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Font:</span>{' '}
                <span className="font-medium">
                  {style.id === 'typewriter' ? 'Courier New' :
                   style.id === 'cinematic' ? 'Georgia' :
                   style.id === 'bold' || style.id === 'mrbeast' ? 'Impact' :
                   'Inter'}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Position:</span>{' '}
                <span className="font-medium capitalize">{style.position}</span>
              </div>
              <div>
                <span className="text-gray-500">Best for:</span>{' '}
                <span className="font-medium">{style.description.split('(')[1]?.replace(')', '') || 'All content'}</span>
              </div>
              <div>
                <span className="text-gray-500">Animation:</span>{' '}
                <span className="font-medium">
                  {style.id.includes('bounce') ? 'Bounce' :
                   style.id === 'typewriter' ? 'Letter-by-letter' :
                   style.id === 'glitch' ? 'RGB Split' :
                   style.id === 'karaoke' ? 'Progressive fill' :
                   'Pop-in'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 hover:bg-white rounded-lg transition-colors"
          >
            Close
          </button>
          <button
            onClick={() => {
              // This would trigger the actual caption application
              onClose();
            }}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
          >
            Use This Style
          </button>
        </div>
      </div>
    </div>
  );
}
