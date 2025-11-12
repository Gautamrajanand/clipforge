"use client";

import { useEffect, useState } from "react";
import { CAPTION_PRESETS } from "./CaptionStyleSelector";

interface Word {
  text: string;
  start: number;
  end: number;
}

interface CaptionPreviewProps {
  transcript?: Word[];
  currentTime: number;
  styleId: string;
  className?: string;
}

/**
 * Live caption preview overlay
 * Renders captions over video using HTML/CSS
 * Matches the selected preset style
 */
export default function CaptionPreview({
  transcript = [],
  currentTime,
  styleId,
  className = "",
}: CaptionPreviewProps) {
  const [currentCaption, setCurrentCaption] = useState<string>("");
  const [highlightedWords, setHighlightedWords] = useState<Set<number>>(
    new Set()
  );

  const preset = CAPTION_PRESETS.find((p) => p.id === styleId);

  useEffect(() => {
    if (!transcript || transcript.length === 0) {
      // Use sample text if no transcript
      setCurrentCaption("Amazing product launch!");
      return;
    }

    // Find words at current time
    const activeWords = transcript.filter(
      (word) => currentTime >= word.start && currentTime <= word.end
    );

    if (activeWords.length > 0) {
      // Get context (3 words before and after)
      const firstIndex = transcript.indexOf(activeWords[0]);
      const startIndex = Math.max(0, firstIndex - 3);
      const endIndex = Math.min(transcript.length, firstIndex + 4);
      const contextWords = transcript.slice(startIndex, endIndex);

      setCurrentCaption(contextWords.map((w) => w.text).join(" "));

      // Highlight current words
      const highlighted = new Set(
        activeWords.map((w) => transcript.indexOf(w))
      );
      setHighlightedWords(highlighted);
    }
  }, [currentTime, transcript]);

  if (!preset || !currentCaption) return null;

  // Get position class based on preset
  const getPositionClass = () => {
    switch (preset.preview) {
      case "top-center":
        return "top-8 left-1/2 -translate-x-1/2";
      case "center":
        return "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2";
      case "bottom-center":
      default:
        return "bottom-8 left-1/2 -translate-x-1/2";
    }
  };

  // Apply keyword painting
  const renderCaptionWithKeywords = () => {
    const words = currentCaption.split(" ");
    const keywordPattern = /\b(\d+|[A-Z][a-z]+|amazing|awesome|incredible)\b/gi;

    return words.map((word, index) => {
      const isKeyword = keywordPattern.test(word);
      const isHighlighted = styleId === "karaoke" && highlightedWords.has(index);

      return (
        <span
          key={index}
          className={`${isHighlighted ? "text-yellow-300" : ""} ${
            isKeyword && preset.id === "youshaei" ? "text-pink-400" : ""
          }`}
        >
          {word}{" "}
        </span>
      );
    });
  };

  return (
    <div
      className={`absolute ${getPositionClass()} pointer-events-none z-10 max-w-[90%] ${className}`}
    >
      <div
        className="caption-text px-4 py-2 transition-all duration-200"
        style={{
          ...preset.style,
          fontSize: `clamp(16px, ${preset.style.fontSize}, 32px)`, // Scale down for preview
          lineHeight: "1.2",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        {renderCaptionWithKeywords()}
      </div>
    </div>
  );
}
