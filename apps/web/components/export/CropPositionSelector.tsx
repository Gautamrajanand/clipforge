'use client';

import { AlignVerticalJustifyCenter, AlignVerticalJustifyStart, AlignVerticalJustifyEnd } from 'lucide-react';

interface CropPosition {
  id: 'center' | 'top' | 'bottom';
  label: string;
  icon: React.ReactNode;
}

const cropPositions: CropPosition[] = [
  {
    id: 'center',
    label: 'Center',
    icon: <AlignVerticalJustifyCenter className="w-5 h-5" />,
  },
  {
    id: 'top',
    label: 'Top',
    icon: <AlignVerticalJustifyStart className="w-5 h-5" />,
  },
  {
    id: 'bottom',
    label: 'Bottom',
    icon: <AlignVerticalJustifyEnd className="w-5 h-5" />,
  },
];

interface CropPositionSelectorProps {
  selected: 'center' | 'top' | 'bottom';
  onChange: (position: 'center' | 'top' | 'bottom') => void;
  disabled?: boolean;
}

export default function CropPositionSelector({ selected, onChange, disabled = false }: CropPositionSelectorProps) {
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-gray-700">Crop Position</h4>
      
      <div className="flex gap-2">
        {cropPositions.map((position) => {
          const isSelected = selected === position.id;
          
          return (
            <button
              key={position.id}
              onClick={() => !disabled && onChange(position.id)}
              disabled={disabled}
              className={`
                flex-1 p-3 rounded-lg border transition-all
                ${
                  isSelected
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <div className="flex flex-col items-center gap-1">
                <div className={isSelected ? 'text-primary-600' : 'text-gray-600'}>
                  {position.icon}
                </div>
                <div className={`text-xs font-medium ${isSelected ? 'text-primary-600' : 'text-gray-700'}`}>
                  {position.label}
                </div>
              </div>
            </button>
          );
        })}
      </div>
      
      {disabled && (
        <p className="text-xs text-gray-500 italic">
          Position control only available in Crop mode
        </p>
      )}
    </div>
  );
}
