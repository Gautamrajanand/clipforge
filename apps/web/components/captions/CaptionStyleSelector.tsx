"use client";

import { useState } from "react";
import { Check, Type, Sparkles, Zap, Mic, Star, Flame, Highlighter, Box, Keyboard, Tv, TrendingUp, Cloud, FileText, Film, Square, MessageCircle, Eye } from "lucide-react";

/**
 * Caption Style Presets
 * Professional styles for social media and content creation
 */

// Caption preview GIFs (animated previews)
const PREVIEW_GIFS: Record<string, string> = {
  // Add animated GIF previews here when available
  // Example: mrbeast: '/caption-previews/mrbeast.gif',
};

export const CAPTION_PRESETS = [
  // Static Styles
  {
    id: "minimal",
    name: "Minimal",
    description: "Simple white text with subtle background",
    icon: Type,
    position: "bottom",
    gradient: "from-gray-600 to-gray-800",
  },
  {
    id: "subtitle",
    name: "Subtitle",
    description: "Professional Netflix/YouTube style (30% of content)",
    icon: Tv,
    position: "bottom",
    gradient: "from-gray-700 to-gray-900",
  },
  {
    id: "podcast",
    name: "Podcast",
    description: "Soft subtle style for educational content",
    icon: Mic,
    position: "bottom",
    gradient: "from-blue-600 to-indigo-600",
  },
  {
    id: "cinematic",
    name: "Cinematic",
    description: "Film-style captions for travel reels",
    icon: Film,
    position: "bottom",
    gradient: "from-purple-600 to-pink-600",
  },
  {
    id: "bold",
    name: "Bold (Meme)",
    description: "Classic YouTube meme style",
    icon: Zap,
    position: "center",
    gradient: "from-red-600 to-orange-600",
  },
  
  // Viral Styles
  {
    id: "mrbeast",
    name: "MrBeast",
    description: "Yellow Impact font - Most viral style",
    icon: Flame,
    position: "center",
    gradient: "from-yellow-500 to-orange-500",
  },
  {
    id: "neon",
    name: "Neon",
    description: "Bright green with glow effect",
    icon: Zap,
    position: "bottom",
    gradient: "from-green-500 to-emerald-500",
  },
  {
    id: "highlight",
    name: "Highlight",
    description: "White text on yellow box - Debate clips",
    icon: Highlighter,
    position: "center",
    gradient: "from-yellow-400 to-yellow-600",
  },
  {
    id: "bounce",
    name: "Bounce",
    description: "TikTok default emphasis bounce",
    icon: TrendingUp,
    position: "center",
    gradient: "from-pink-500 to-rose-500",
  },
  {
    id: "glitch",
    name: "Glitch RGB",
    description: "RGB split distortion for gaming/tech",
    icon: Zap,
    position: "center",
    gradient: "from-cyan-500 to-blue-500",
  },
  {
    id: "popline",
    name: "Popline",
    description: "Black text on green box - Modern TikTok",
    icon: Box,
    position: "center",
    gradient: "from-green-400 to-teal-500",
  },
  
  // Professional Styles
  {
    id: "documentary",
    name: "Documentary",
    description: "White on pink box - Vox/AJ+ style",
    icon: FileText,
    position: "bottom",
    gradient: "from-pink-500 to-rose-600",
  },
  {
    id: "uppercase",
    name: "Uppercase",
    description: "White on black box - Corporate style",
    icon: Square,
    position: "center",
    gradient: "from-slate-700 to-gray-900",
  },
  {
    id: "blur",
    name: "Blur",
    description: "Frosted glass effect - Luxury aesthetic",
    icon: Cloud,
    position: "center",
    gradient: "from-blue-300 to-indigo-400",
  },
  {
    id: "bubble",
    name: "Bubble",
    description: "Rounded bubbles - ClipFM style",
    icon: MessageCircle,
    position: "bottom",
    gradient: "from-indigo-500 to-purple-600",
  },
  
  // Business Styles
  {
    id: "hormozi",
    name: "Alex Hormozi",
    description: "Gold keywords - Business/sales (20% of market)",
    icon: Star,
    position: "center",
    gradient: "from-yellow-600 to-amber-600",
  },
  
  // Creative Styles
  {
    id: "karaoke",
    name: "Karaoke",
    description: "White→Cyan progressive fill",
    icon: Sparkles,
    position: "bottom",
    gradient: "from-cyan-400 to-blue-500",
  },
  {
    id: "typewriter",
    name: "Typewriter",
    description: "Letter-by-letter typing effect",
    icon: Keyboard,
    position: "bottom",
    gradient: "from-gray-600 to-slate-700",
  },
];

interface CaptionStyleSelectorProps {
  selectedStyle: string;
  onStyleChange: (styleId: string) => void;
  onPreview?: (styleId: string) => void;
  className?: string;
}

export default function CaptionStyleSelector({
  selectedStyle,
  onStyleChange,
  onPreview,
  className = "",
}: CaptionStyleSelectorProps) {
  const [activeTab, setActiveTab] = useState<"styles" | "custom">("styles");

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab("styles")}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === "styles"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Styles
        </button>
        <button
          onClick={() => setActiveTab("custom")}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === "custom"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          My Presets
        </button>
      </div>

      {/* Content */}
      {activeTab === "styles" && (
        <div className="grid grid-cols-3 gap-3 max-h-[500px] overflow-y-auto pr-2">
          {CAPTION_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => onStyleChange(preset.id)}
              className={`relative p-4 rounded-lg border-2 transition-all text-left hover:shadow-md ${
                selectedStyle === preset.id
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              {/* Selected indicator */}
              {selectedStyle === preset.id && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}

              {/* Preview button */}
              {onPreview && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onPreview(preset.id);
                  }}
                  className="absolute top-2 left-2 w-7 h-7 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-colors"
                  title="Preview this style"
                >
                  <Eye className="w-4 h-4 text-white" />
                </button>
              )}

              {/* Preview with gradient and animated caption */}
              <div className={`mb-3 h-24 bg-gradient-to-br ${preset.gradient} rounded flex items-center justify-center overflow-hidden relative`}>
                {/* GIF Preview (if available) */}
                {PREVIEW_GIFS[preset.id] ? (
                  <img 
                    src={PREVIEW_GIFS[preset.id]} 
                    alt={`${preset.name} preview`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <>
                    {/* Background icon */}
                    <preset.icon className="w-12 h-12 text-white opacity-10 absolute" />
                
                {/* Animated caption preview - Style-specific */}
                <div className="relative z-10 w-full px-3">
                  <div 
                    className={`text-white font-bold text-center ${
                      preset.id === 'bounce' ? 'animate-bounce' :
                      preset.id === 'typewriter' ? 'animate-pulse' :
                      preset.id === 'glitch' ? 'animate-ping' :
                      preset.id === 'mrbeast' ? 'animate-bounce' :
                      preset.id === 'neon' ? 'animate-pulse' :
                      'animate-pulse'
                    }`}
                    style={{
                      fontSize: 
                        preset.id === 'bold' || preset.id === 'mrbeast' ? '16px' :
                        preset.id === 'karaoke' || preset.id === 'typewriter' ? '11px' :
                        preset.id === 'neon' || preset.id === 'rainbow' ? '14px' :
                        '12px',
                      textShadow: 
                        preset.id === 'neon' ? '0 0 10px #00FF00, 2px 2px 4px rgba(0,0,0,0.8)' :
                        preset.id === 'glitch' ? '2px 0 #FF0000, -2px 0 #00FFFF' :
                        preset.id === 'shadow3d' ? '4px 4px 0px #000' :
                        '2px 2px 4px rgba(0,0,0,0.8)',
                      letterSpacing: 
                        preset.id === 'typewriter' ? '2px' :
                        preset.id === 'bold' || preset.id === 'mrbeast' ? '1px' :
                        '0.5px',
                      fontFamily:
                        preset.id === 'typewriter' ? 'Courier New, monospace' :
                        preset.id === 'bold' || preset.id === 'mrbeast' ? 'Impact, sans-serif' :
                        preset.id === 'elegant' || preset.id === 'cinematic' ? 'Georgia, serif' :
                        'inherit',
                      color:
                        preset.id === 'highlight' || preset.id === 'popline' || preset.id === 'documentary' ? '#000' :
                        preset.id === 'karaoke' ? '#00F8C8' :
                        preset.id === 'mrbeast' ? '#FFD900' :
                        preset.id === 'neon' ? '#00FF00' :
                        preset.id === 'gradient' ? '#FF1493' :
                        '#FFF',
                      backgroundColor:
                        preset.id === 'highlight' ? '#FFE600' :
                        preset.id === 'popline' ? '#00FF87' :
                        preset.id === 'documentary' ? '#FF3DA1' :
                        preset.id === 'uppercase' || preset.id === 'news' ? '#000' :
                        preset.id === 'bubble' ? 'rgba(0,0,0,0.7)' :
                        preset.id === 'blur' ? 'rgba(255,255,255,0.15)' :
                        'transparent',
                      padding:
                        preset.id === 'highlight' || preset.id === 'popline' || preset.id === 'documentary' ||
                        preset.id === 'uppercase' || preset.id === 'bubble' || preset.id === 'news' ||
                        preset.id === 'blur' ? '4px 8px' :
                        '0',
                      borderRadius:
                        preset.id === 'bubble' ? '12px' :
                        preset.id === 'blur' ? '6px' :
                        '0',
                      backdropFilter:
                        preset.id === 'blur' ? 'blur(8px)' : 'none',
                      display: 'inline-block',
                      textTransform:
                        preset.id === 'bold' || preset.id === 'mrbeast' || preset.id === 'uppercase' ? 'uppercase' : 'none',
                    }}
                  >
                    {preset.id === 'karaoke' ? (
                      <span>SAMPLE</span>
                    ) : preset.id === 'typewriter' ? (
                      <span>Type...</span>
                    ) : preset.id === 'bold' || preset.id === 'mrbeast' || preset.id === 'uppercase' ? (
                      <span>SAMPLE</span>
                    ) : preset.id === 'news' ? (
                      <span>BREAKING</span>
                    ) : (
                      'Sample'
                    )}
                  </div>
                  {/* Position indicator */}
                  <div className="text-xs text-white opacity-50 text-center mt-1">
                    {preset.position === 'center' ? '⬤ Center' : preset.position === 'top' ? '⬆ Top' : '⬇ Bottom'}
                  </div>
                </div>
                  </>
                )}
              </div>

              {/* Info */}
              <div>
                <h3 className="font-semibold text-sm text-gray-900">
                  {preset.name}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  {preset.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {activeTab === "custom" && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-sm">Custom presets coming soon</p>
          <p className="text-xs mt-1">Save your favorite styles</p>
        </div>
      )}
    </div>
  );
}
