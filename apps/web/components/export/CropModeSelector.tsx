'use client';

import { Maximize2, Minimize2, Sparkles } from 'lucide-react';

interface CropMode {
  id: 'crop' | 'pad' | 'smart';
  label: string;
  description: string;
  icon: React.ReactNode;
}

const cropModes: CropMode[] = [
  {
    id: 'crop',
    label: 'Crop',
    description: 'Zoom to fill (recommended)',
    icon: <Maximize2 className="w-5 h-5" />,
  },
  {
    id: 'pad',
    label: 'Pad',
    description: 'Add black bars',
    icon: <Minimize2 className="w-5 h-5" />,
  },
  {
    id: 'smart',
    label: 'Smart',
    description: 'AI-guided crop (coming soon)',
    icon: <Sparkles className="w-5 h-5" />,
  },
];

interface CropModeSelectorProps {
  selected: 'crop' | 'pad' | 'smart';
  onChange: (mode: 'crop' | 'pad' | 'smart') => void;
}

export default function CropModeSelector({ selected, onChange }: CropModeSelectorProps) {
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-gray-700">Crop Mode</h4>
      
      <div className="grid grid-cols-3 gap-2">
        {cropModes.map((mode) => {
          const isSelected = selected === mode.id;
          const isDisabled = mode.id === 'smart'; // Coming soon
          
          return (
            <button
              key={mode.id}
              onClick={() => !isDisabled && onChange(mode.id)}
              disabled={isDisabled}
              className={`
                relative p-3 rounded-lg border transition-all text-left
                ${
                  isSelected
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }
                ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className={isSelected ? 'text-primary-600' : 'text-gray-600'}>
                  {mode.icon}
                </div>
                <div className={`font-medium text-sm ${isSelected ? 'text-primary-600' : 'text-gray-900'}`}>
                  {mode.label}
                </div>
              </div>
              <div className="text-xs text-gray-500">{mode.description}</div>
              
              {isSelected && !isDisabled && (
                <div className="absolute top-2 right-2">
                  <div className="w-4 h-4 bg-primary-500 rounded-full flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
