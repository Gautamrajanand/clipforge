"use client";

import { useState } from "react";
import { Check, Type, Sparkles, Zap, Mic, Wand2, Star, Flame, Highlighter, Rainbow, Droplet, Box, Palette, ArrowUp } from "lucide-react";

/**
 * Caption Style Presets
 * Professional styles for social media and content creation
 */
export const CAPTION_PRESETS = [
  {
    id: "minimal",
    name: "Minimal",
    description: "Simple white text with subtle background",
    icon: Type,
    position: "bottom",
    gradient: "from-gray-600 to-gray-800",
  },
  {
    id: "bold",
    name: "Bold",
    description: "Large, high-contrast text that demands attention",
    icon: Zap,
    position: "center",
    gradient: "from-red-600 to-orange-600",
  },
  {
    id: "elegant",
    name: "Elegant",
    description: "Refined serif font with soft shadow",
    icon: Sparkles,
    position: "bottom",
    gradient: "from-purple-600 to-pink-600",
  },
  {
    id: "modern",
    name: "Modern",
    description: "Clean sans-serif with smooth animation",
    icon: Wand2,
    position: "bottom",
    gradient: "from-blue-600 to-cyan-600",
  },
  {
    id: "karaoke",
    name: "Karaoke",
    description: "Word-by-word highlighting (Opus Clip style)",
    icon: Sparkles,
    position: "center",
    gradient: "from-yellow-600 to-amber-600",
  },
  {
    id: "podcast",
    name: "Podcast",
    description: "Professional style with speaker labels",
    icon: Mic,
    position: "bottom",
    gradient: "from-green-600 to-emerald-600",
  },
  // NEW VIRAL STYLES (2024-2025 Trends)
  {
    id: "mrbeast",
    name: "MrBeast",
    description: "🔥 Viral yellow pop with bounce (TikTok/YouTube)",
    icon: Star,
    position: "center",
    gradient: "from-yellow-500 to-orange-500",
  },
  {
    id: "neon",
    name: "Neon",
    description: "✨ Bright green glow effect (Instagram Reels)",
    icon: Flame,
    position: "bottom",
    gradient: "from-green-400 to-emerald-500",
  },
  {
    id: "highlight",
    name: "Highlight",
    description: "💡 Yellow box on keywords (Hormozi style)",
    icon: Highlighter,
    position: "center",
    gradient: "from-amber-400 to-yellow-500",
  },
  {
    id: "rainbow",
    name: "Rainbow",
    description: "🌈 Rotating colors for max engagement",
    icon: Rainbow,
    position: "center",
    gradient: "from-pink-500 via-purple-500 to-blue-500",
  },
  {
    id: "fill",
    name: "Fill",
    description: "📊 Progressive fill as words are spoken",
    icon: Droplet,
    position: "center",
    gradient: "from-cyan-400 to-blue-500",
  },
  {
    id: "shadow3d",
    name: "3D Shadow",
    description: "🎭 Bold text with 3D depth effect",
    icon: Box,
    position: "center",
    gradient: "from-gray-700 to-gray-900",
  },
  {
    id: "tricolor",
    name: "Tricolor",
    description: "🎨 Accent color on middle word",
    icon: Palette,
    position: "center",
    gradient: "from-indigo-500 to-purple-600",
  },
  {
    id: "bounce",
    name: "Bounce",
    description: "⬆️ Words bounce UP (Hormozi/Gary Vee)",
    icon: ArrowUp,
    position: "center",
    gradient: "from-red-500 to-pink-600",
  },
];

interface CaptionStyleSelectorProps {
  selectedStyle: string;
  onStyleChange: (styleId: string) => void;
  className?: string;
}

export default function CaptionStyleSelector({
  selectedStyle,
  onStyleChange,
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
        <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-2">
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

              {/* Preview with gradient and animated caption */}
              <div className={`mb-3 h-24 bg-gradient-to-br ${preset.gradient} rounded flex items-center justify-center overflow-hidden relative`}>
                {/* Background icon */}
                <preset.icon className="w-12 h-12 text-white opacity-10 absolute" />
                
                {/* Animated caption preview */}
                <div className="relative z-10 w-full px-3">
                  <div 
                    className="text-white font-bold text-center animate-pulse"
                    style={{
                      fontSize: preset.id === 'bold' ? '16px' : preset.id === 'karaoke' ? '14px' : '12px',
                      textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                      letterSpacing: '0.5px',
                    }}
                  >
                    {preset.id === 'karaoke' ? (
                      <span className="text-green-400">SAMPLE TEXT</span>
                    ) : preset.id === 'bold' ? (
                      <span className="tracking-wide">SAMPLE TEXT</span>
                    ) : (
                      'Sample Caption Text'
                    )}
                  </div>
                  {/* Position indicator */}
                  <div className="text-xs text-white opacity-50 text-center mt-1">
                    {preset.position === 'center' ? '⬤ Center' : preset.position === 'top' ? '⬆ Top' : '⬇ Bottom'}
                  </div>
                </div>
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
