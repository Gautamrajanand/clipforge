'use client';

import { Smartphone, Monitor, Square, RectangleVertical } from 'lucide-react';

interface AspectRatio {
  id: string;
  label: string;
  ratio: string;
  width: number;
  height: number;
  icon: React.ReactNode;
  description: string;
  color: string;
}

const aspectRatios: AspectRatio[] = [
  {
    id: '9:16',
    label: 'Vertical',
    ratio: '9:16',
    width: 1080,
    height: 1920,
    icon: <Smartphone className="w-6 h-6" />,
    description: 'TikTok, Reels, Shorts',
    color: 'from-purple-500 to-pink-500',
  },
  {
    id: '16:9',
    label: 'Landscape',
    ratio: '16:9',
    width: 1920,
    height: 1080,
    icon: <Monitor className="w-6 h-6" />,
    description: 'YouTube, LinkedIn',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: '1:1',
    label: 'Square',
    ratio: '1:1',
    width: 1080,
    height: 1080,
    icon: <Square className="w-6 h-6" />,
    description: 'Instagram Feed',
    color: 'from-orange-500 to-red-500',
  },
  {
    id: '4:5',
    label: 'Portrait',
    ratio: '4:5',
    width: 1080,
    height: 1350,
    icon: <RectangleVertical className="w-6 h-6" />,
    description: 'Instagram Feed',
    color: 'from-green-500 to-emerald-500',
  },
];

interface AspectRatioSelectorProps {
  selected: string;
  onChange: (ratio: string) => void;
}

export default function AspectRatioSelector({ selected, onChange }: AspectRatioSelectorProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Choose aspect ratio</h3>
        <p className="text-sm text-gray-500">
          We'll make your videos vertical 9:16, perfect for Instagram, TikTok, and Shorts.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {aspectRatios.map((ar) => {
          const isSelected = selected === ar.id;
          
          return (
            <button
              key={ar.id}
              onClick={() => onChange(ar.id)}
              className={`
                relative p-4 rounded-xl border-2 transition-all
                ${
                  isSelected
                    ? 'border-primary-500 bg-primary-50 shadow-lg scale-105'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                }
              `}
            >
              {/* Icon with gradient background */}
              <div
                className={`
                  w-12 h-12 rounded-lg flex items-center justify-center mb-3 mx-auto
                  ${isSelected ? `bg-gradient-to-br ${ar.color}` : 'bg-gray-100'}
                `}
              >
                <div className={isSelected ? 'text-white' : 'text-gray-600'}>
                  {ar.icon}
                </div>
              </div>

              {/* Label */}
              <div className="text-center">
                <div className={`font-semibold ${isSelected ? 'text-primary-600' : 'text-gray-900'}`}>
                  {ar.label}
                </div>
                <div className="text-xs text-gray-500 mt-1">{ar.ratio}</div>
                <div className="text-xs text-gray-400 mt-1">{ar.description}</div>
              </div>

              {/* Selected indicator */}
              {isSelected && (
                <div className="absolute top-2 right-2">
                  <div className="w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
              )}

              {/* Dimensions badge */}
              <div className="mt-2 text-xs text-gray-400 text-center">
                {ar.width}×{ar.height}
              </div>
            </button>
          );
        })}
      </div>

      {/* Info message */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
        <svg
          className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clipRule="evenodd"
          />
        </svg>
        <div className="text-sm text-blue-700">
          <strong>Actual video quality will be higher.</strong> We use smart cropping to keep the
          speaker centered in frame.
        </div>
      </div>
    </div>
  );
}
