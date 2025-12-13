'use client';

import { Crop, Maximize2, Sparkles, Grid, PictureInPicture, SplitSquareHorizontal, SplitSquareVertical, Image } from 'lucide-react';

type FramingMode = 'smart_crop' | 'center_crop' | 'pad_blur' | 'pad_color' | 'side_by_side' | 'picture_in_picture' | 'grid' | 'above_below';

interface FramingModeSelectorProps {
  selected: FramingMode;
  onChange: (mode: FramingMode) => void;
  showAdvanced?: boolean;
}

const BASIC_MODES = [
  {
    value: 'smart_crop' as FramingMode,
    label: 'Auto Focus',
    description: 'AI tracks & centers subject',
    icon: Sparkles,
    badge: 'RECOMMENDED',
  },
  {
    value: 'center_crop' as FramingMode,
    label: 'Center Crop',
    description: 'Crop from center',
    icon: Crop,
  },
  {
    value: 'pad_blur' as FramingMode,
    label: 'Blur Background',
    description: 'Letterbox with blur',
    icon: Maximize2,
  },
  {
    value: 'pad_color' as FramingMode,
    label: 'Color Background',
    description: 'Letterbox with solid color',
    icon: Image,
  },
];

const ADVANCED_MODES = [
  {
    value: 'picture_in_picture' as FramingMode,
    label: 'Picture-in-Picture',
    description: 'Blurred background with PiP overlay',
    icon: PictureInPicture,
    badge: 'BETA',
  },
  {
    value: 'side_by_side' as FramingMode,
    label: 'Split Screen',
    description: 'Coming soon – multi-speaker split layout',
    icon: SplitSquareHorizontal,
    badge: 'COMING SOON',
    disabled: true,
  },
  {
    value: 'grid' as FramingMode,
    label: '4-Panel Grid',
    description: 'Coming soon – 2×2 speaker grid',
    icon: Grid,
    badge: 'COMING SOON',
    disabled: true,
  },
  {
    value: 'above_below' as FramingMode,
    label: 'Stacked',
    description: 'Coming soon – top/bottom speakers',
    icon: SplitSquareVertical,
    badge: 'COMING SOON',
    disabled: true,
  },
];

export default function FramingModeSelector({ selected, onChange, showAdvanced = true }: FramingModeSelectorProps) {
  return (
    <div className="space-y-4">
      {/* Basic Modes */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Basic Framing</h3>
        <div className="grid grid-cols-2 gap-3">
          {BASIC_MODES.map((mode) => {
            const Icon = mode.icon;
            const isSelected = selected === mode.value;
            
            return (
              <button
                key={mode.value}
                onClick={() => onChange(mode.value)}
                className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                  isSelected
                    ? 'border-yellow-600 bg-yellow-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-yellow-300 hover:shadow-sm'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${
                    isSelected ? 'bg-yellow-600 text-white' : 'bg-gray-100 text-gray-600'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className={`font-semibold text-sm ${
                        isSelected ? 'text-yellow-900' : 'text-gray-900'
                      }`}>
                        {mode.label}
                      </h4>
                      {mode.badge && (
                        <span
                          className={`px-1.5 py-0.5 text-xs font-bold rounded ${
                            mode.badge === 'RECOMMENDED'
                              ? 'bg-green-100 text-green-700'
                              : mode.badge === 'BETA'
                              ? 'bg-orange-100 text-orange-700'
                              : mode.badge === 'COMING SOON'
                              ? 'bg-gray-100 text-gray-600'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {mode.badge}
                        </span>
                      )}
                    </div>
                    <p className={`text-xs mt-1 ${
                      isSelected ? 'text-yellow-700' : 'text-gray-500'
                    }`}>
                      {mode.description}
                    </p>
                  </div>
                </div>
                
                {isSelected && (
                  <div className="absolute top-2 right-2">
                    <div className="w-5 h-5 bg-yellow-600 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Advanced Modes */}
      {showAdvanced && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-sm font-semibold text-gray-900">Advanced Framing</h3>
            <span className="px-2 py-0.5 text-xs font-bold bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 rounded">
              NEW
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {ADVANCED_MODES.map((mode) => {
              const Icon = mode.icon;
              const isSelected = selected === mode.value;
              const isDisabled = (mode as any).disabled;

              return (
                <button
                  key={mode.value}
                  type="button"
                  onClick={() => {
                    if (!isDisabled) {
                      onChange(mode.value);
                    }
                  }}
                  disabled={isDisabled}
                  className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                    isDisabled
                      ? 'border-dashed border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed opacity-70'
                      : isSelected
                      ? 'border-yellow-600 bg-yellow-50 shadow-md'
                      : 'border-gray-200 bg-white hover:border-yellow-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${
                      isSelected ? 'bg-yellow-600 text-white' : 'bg-gray-100 text-gray-600'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className={`font-semibold text-sm ${
                          isSelected ? 'text-yellow-900' : 'text-gray-900'
                        }`}>
                          {mode.label}
                        </h4>
                        {mode.badge && (
                          <span
                            className={`px-1.5 py-0.5 text-xs font-bold rounded ${
                              mode.badge === 'COMING SOON'
                                ? 'bg-gray-100 text-gray-600'
                                : mode.badge === 'BETA'
                                ? 'bg-orange-100 text-orange-700'
                                : 'bg-purple-100 text-purple-700'
                            }`}
                          >
                            {mode.badge}
                          </span>
                        )}
                      </div>
                      <p className={`text-xs mt-1 ${
                        isSelected ? 'text-yellow-700' : 'text-gray-500'
                      }`}>
                        {mode.description}
                      </p>
                    </div>
                  </div>
                  
                  {isSelected && !isDisabled && (
                    <div className="absolute top-2 right-2">
                      <div className="w-5 h-5 bg-yellow-600 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
