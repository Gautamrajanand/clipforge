"use client";

import { useState, useEffect, useCallback } from "react";
import { AlertCircle } from "lucide-react";

interface ClipSettingsProps {
  settings?: {
    clipLength: number;
    clipCount: number;
    minLength: number;
    maxLength: number;
  };
  initialLength?: number; // seconds
  initialCount?: number;
  onChange?: (settings: any) => void;
  onSettingsChange?: (settings: { length: number; count: number }) => void;
  onDetect?: () => void;
  isDetecting?: boolean;
  className?: string;
}

/**
 * Clip Settings Component
 * Manages clip length and count with exact value bindings
 * 
 * Constraints:
 * - Clip length: 15-180 seconds
 * - Clip count: 1-10
 * - Min ≤ Max validation
 * - Debounced server sync
 */
export default function ClipSettings({
  initialLength = 45,
  initialCount = 5,
  onSettingsChange,
  className = "",
}: ClipSettingsProps) {
  // State
  const [clipLength, setClipLength] = useState(initialLength);
  const [clipCount, setClipCount] = useState(initialCount);
  const [errors, setErrors] = useState<{ length?: string; count?: string }>({});

  // Constraints
  const MIN_LENGTH = 15;
  const MAX_LENGTH = 180;
  const MIN_COUNT = 1;
  const MAX_COUNT = 10;

  // Validation
  const validateSettings = useCallback(
    (length: number, count: number) => {
      const newErrors: { length?: string; count?: string } = {};

      // Validate length
      if (length < MIN_LENGTH) {
        newErrors.length = `Minimum clip length is ${MIN_LENGTH}s`;
      } else if (length > MAX_LENGTH) {
        newErrors.length = `Maximum clip length is ${MAX_LENGTH}s`;
      }

      // Validate count
      if (count < MIN_COUNT) {
        newErrors.count = `Minimum clip count is ${MIN_COUNT}`;
      } else if (count > MAX_COUNT) {
        newErrors.count = `Maximum clip count is ${MAX_COUNT}`;
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    },
    []
  );

  // Clamp value to range
  const clamp = (value: number, min: number, max: number) => {
    return Math.max(min, Math.min(max, value));
  };

  // Handle length change
  const handleLengthChange = (value: number) => {
    const clamped = clamp(value, MIN_LENGTH, MAX_LENGTH);
    setClipLength(clamped);
    validateSettings(clamped, clipCount);
  };

  // Handle count change
  const handleCountChange = (value: number) => {
    const clamped = clamp(value, MIN_COUNT, MAX_COUNT);
    setClipCount(clamped);
    validateSettings(clipLength, clamped);
  };

  // Debounced server sync
  useEffect(() => {
    const isValid = validateSettings(clipLength, clipCount);
    if (!isValid) return;

    const timer = setTimeout(() => {
      onSettingsChange?.({ length: clipLength, count: clipCount });
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [clipLength, clipCount, onSettingsChange, validateSettings]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Clip Length */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700">
            Clip Length
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={clipLength}
              onChange={(e) => handleLengthChange(parseInt(e.target.value) || MIN_LENGTH)}
              min={MIN_LENGTH}
              max={MAX_LENGTH}
              className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <span className="text-sm text-gray-500">seconds</span>
          </div>
        </div>

        {/* Slider */}
        <input
          type="range"
          min={MIN_LENGTH}
          max={MAX_LENGTH}
          value={clipLength}
          onChange={(e) => handleLengthChange(parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${
              ((clipLength - MIN_LENGTH) / (MAX_LENGTH - MIN_LENGTH)) * 100
            }%, #e5e7eb ${
              ((clipLength - MIN_LENGTH) / (MAX_LENGTH - MIN_LENGTH)) * 100
            }%, #e5e7eb 100%)`,
          }}
        />

        {/* Range labels */}
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>{MIN_LENGTH}s</span>
          <span>{MAX_LENGTH}s</span>
        </div>

        {/* Error */}
        {errors.length && (
          <div className="flex items-center gap-1 mt-2 text-sm text-red-600">
            <AlertCircle className="w-4 h-4" />
            <span>{errors.length}</span>
          </div>
        )}
      </div>

      {/* Clip Count */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700">
            Number of Clips
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={clipCount}
              onChange={(e) => handleCountChange(parseInt(e.target.value) || MIN_COUNT)}
              min={MIN_COUNT}
              max={MAX_COUNT}
              className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <span className="text-sm text-gray-500">clips</span>
          </div>
        </div>

        {/* Slider */}
        <input
          type="range"
          min={MIN_COUNT}
          max={MAX_COUNT}
          value={clipCount}
          onChange={(e) => handleCountChange(parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${
              ((clipCount - MIN_COUNT) / (MAX_COUNT - MIN_COUNT)) * 100
            }%, #e5e7eb ${
              ((clipCount - MIN_COUNT) / (MAX_COUNT - MIN_COUNT)) * 100
            }%, #e5e7eb 100%)`,
          }}
        />

        {/* Range labels */}
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>{MIN_COUNT}</span>
          <span>{MAX_COUNT}</span>
        </div>

        {/* Error */}
        {errors.count && (
          <div className="flex items-center gap-1 mt-2 text-sm text-red-600">
            <AlertCircle className="w-4 h-4" />
            <span>{errors.count}</span>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="text-sm text-blue-900">
          <span className="font-medium">Settings:</span> Generate{" "}
          <span className="font-semibold">{clipCount}</span> clips, each{" "}
          <span className="font-semibold">{clipLength}s</span> long
        </div>
        <div className="text-xs text-blue-700 mt-1">
          Total video time: ~{Math.round((clipLength * clipCount) / 60)} minutes
        </div>
      </div>
    </div>
  );
}
