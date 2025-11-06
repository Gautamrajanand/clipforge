"use client";

import { useState } from "react";
import { Check } from "lucide-react";

/**
 * Caption Style Presets
 * Matches worker/services/caption_presets.py
 */
export const CAPTION_PRESETS = [
  {
    id: "karaoke",
    name: "Karaoke",
    description: "Word-by-word highlight, big caps, bottom",
    preview: "bottom-center",
    style: {
      fontSize: "72px",
      fontWeight: "bold",
      color: "#FFFFFF",
      textShadow: "3px 3px 6px rgba(0,0,0,0.5)",
      textAlign: "center" as const,
    },
  },
  {
    id: "deep_diver",
    name: "Deep Diver",
    description: "Centered, bold, large lines",
    preview: "center",
    style: {
      fontSize: "80px",
      fontWeight: "bold",
      color: "#FFFFFF",
      textShadow: "4px 4px 8px rgba(0,0,0,0.8)",
      textAlign: "center" as const,
    },
  },
  {
    id: "pod_p",
    name: "Pod P",
    description: "Bottom, clean blocks, minimal",
    preview: "bottom-center",
    style: {
      fontSize: "64px",
      fontWeight: "normal",
      color: "#FFFFFF",
      textShadow: "2px 2px 4px rgba(0,0,0,0.4)",
      textAlign: "center" as const,
    },
  },
  {
    id: "popline",
    name: "Popline",
    description: "Upper third, strong outline",
    preview: "top-center",
    style: {
      fontSize: "70px",
      fontWeight: "bold",
      color: "#FFFFFF",
      textShadow: "5px 5px 10px rgba(0,0,0,0.9)",
      textAlign: "center" as const,
    },
  },
  {
    id: "seamless_bounce",
    name: "Seamless Bounce",
    description: "Subtle bounce entrance",
    preview: "bottom-center",
    style: {
      fontSize: "68px",
      fontWeight: "bold",
      color: "#FFFFFF",
      textShadow: "2.5px 2.5px 5px rgba(0,0,0,0.4)",
      textAlign: "center" as const,
    },
  },
  {
    id: "beasty",
    name: "Beasty",
    description: "Heavy stroke, high contrast",
    preview: "bottom-center",
    style: {
      fontSize: "76px",
      fontWeight: "bold",
      color: "#FFFFFF",
      textShadow: "6px 6px 12px rgba(0,0,0,1)",
      textAlign: "center" as const,
    },
  },
  {
    id: "youshaei",
    name: "Youshaei",
    description: "Thin stroke, keyword paint",
    preview: "bottom-center",
    style: {
      fontSize: "66px",
      fontWeight: "normal",
      color: "#FFFFFF",
      textShadow: "1.5px 1.5px 3px rgba(0,0,0,0.3)",
      textAlign: "center" as const,
    },
  },
  {
    id: "mozi",
    name: "Mozi",
    description: "Rounded pill backgrounds",
    preview: "bottom-center",
    style: {
      fontSize: "64px",
      fontWeight: "bold",
      color: "#FFFFFF",
      backgroundColor: "rgba(0,0,0,0.8)",
      padding: "8px 24px",
      borderRadius: "32px",
      textAlign: "center" as const,
    },
  },
  {
    id: "glitch_infinite",
    name: "Glitch Infinite",
    description: "Short glitch-in effect",
    preview: "bottom-center",
    style: {
      fontSize: "70px",
      fontWeight: "bold",
      color: "#FFFFFF",
      textShadow: "3px 3px 6px rgba(0,255,255,0.5)",
      textAlign: "center" as const,
    },
  },
  {
    id: "baby_earthquake",
    name: "Baby Earthquake",
    description: "Micro shake on emphasized words",
    preview: "bottom-center",
    style: {
      fontSize: "68px",
      fontWeight: "bold",
      color: "#FFFFFF",
      textShadow: "2.5px 2.5px 5px rgba(0,0,0,0.4)",
      textAlign: "center" as const,
    },
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

              {/* Preview */}
              <div className="mb-3 h-20 bg-gradient-to-br from-gray-800 to-gray-900 rounded flex items-center justify-center overflow-hidden">
                <div
                  className="text-white text-xs px-2"
                  style={{
                    fontSize: "10px",
                    fontWeight: preset.style.fontWeight,
                    textShadow: "1px 1px 2px rgba(0,0,0,0.5)",
                  }}
                >
                  Sample Text
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
