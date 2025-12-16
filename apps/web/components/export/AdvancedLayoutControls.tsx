'use client';

import { Grid, PictureInPicture, SplitSquareHorizontal, SplitSquareVertical } from 'lucide-react';

type FramingMode = 'smart_crop' | 'center_crop' | 'pad_blur' | 'pad_color' | 'side_by_side' | 'picture_in_picture' | 'grid' | 'above_below';

type OverlayPosition = 'top_left' | 'top_right' | 'bottom_left' | 'bottom_right' | 'center';

interface AdvancedLayout {
  // Side-by-Side
  leftRatio?: number;
  rightRatio?: number;
  
  // Picture-in-Picture
  overlayPosition?: OverlayPosition;
  overlaySize?: number;
  overlayPadding?: number;
  
  // Grid
  rows?: number;
  columns?: number;
  
  // Above/Below
  topRatio?: number;
  bottomRatio?: number;
  
  // Common
  gap?: number;
  borderWidth?: number;
  borderColor?: string;
}

interface AdvancedLayoutControlsProps {
  mode: FramingMode;
  layout: AdvancedLayout;
  onChange: (layout: AdvancedLayout) => void;
}

export default function AdvancedLayoutControls({ mode, layout, onChange }: AdvancedLayoutControlsProps) {
  const updateLayout = (updates: Partial<AdvancedLayout>) => {
    onChange({ ...layout, ...updates });
  };

  // Side-by-Side Controls
  if (mode === 'side_by_side') {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-3">
          <SplitSquareHorizontal className="w-5 h-5 text-yellow-600" />
          <h3 className="font-semibold text-gray-900">Side-by-Side Layout</h3>
        </div>

        {/* Split Ratio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Split Ratio: {Math.round((layout.leftRatio || 0.5) * 100)}% / {Math.round((layout.rightRatio || 0.5) * 100)}%
          </label>
          <input
            type="range"
            min="0.2"
            max="0.8"
            step="0.1"
            value={layout.leftRatio || 0.5}
            onChange={(e) => {
              const left = parseFloat(e.target.value);
              updateLayout({ leftRatio: left, rightRatio: 1 - left });
            }}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-yellow-600"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>More Left</span>
            <span>Equal</span>
            <span>More Right</span>
          </div>
        </div>

        {/* Gap */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Gap: {layout.gap || 10}px
          </label>
          <input
            type="range"
            min="0"
            max="50"
            step="5"
            value={layout.gap || 10}
            onChange={(e) => updateLayout({ gap: parseInt(e.target.value) })}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-yellow-600"
          />
        </div>
      </div>
    );
  }

  // Picture-in-Picture Controls
  if (mode === 'picture_in_picture') {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-3">
          <PictureInPicture className="w-5 h-5 text-yellow-600" />
          <h3 className="font-semibold text-gray-900">Picture-in-Picture Layout</h3>
        </div>

        {/* Position Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Overlay Position
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: 'top_left', label: 'Top Left', icon: '↖' },
              { value: 'top_right', label: 'Top Right', icon: '↗' },
              { value: 'center', label: 'Center', icon: '●' },
              { value: 'bottom_left', label: 'Bottom Left', icon: '↙' },
              { value: 'bottom_right', label: 'Bottom Right', icon: '↘' },
            ].map((pos) => (
              <button
                key={pos.value}
                onClick={() => updateLayout({ overlayPosition: pos.value as OverlayPosition })}
                className={`px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                  (layout.overlayPosition || 'bottom_right') === pos.value
                    ? 'border-yellow-600 bg-yellow-50 text-yellow-900'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-yellow-300'
                }`}
              >
                <span className="text-lg mr-1">{pos.icon}</span>
                {pos.label}
              </button>
            ))}
          </div>
        </div>

        {/* Overlay Size */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Overlay Size: {Math.round((layout.overlaySize || 0.25) * 100)}%
          </label>
          <input
            type="range"
            min="0.1"
            max="0.5"
            step="0.05"
            value={layout.overlaySize || 0.25}
            onChange={(e) => updateLayout({ overlaySize: parseFloat(e.target.value) })}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-yellow-600"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Small (10%)</span>
            <span>Medium (25%)</span>
            <span>Large (50%)</span>
          </div>
        </div>

        {/* Padding */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Edge Padding: {layout.overlayPadding || 20}px
          </label>
          <input
            type="range"
            min="0"
            max="100"
            step="10"
            value={layout.overlayPadding || 20}
            onChange={(e) => updateLayout({ overlayPadding: parseInt(e.target.value) })}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-yellow-600"
          />
        </div>

        {/* Border */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Border Width: {layout.borderWidth || 3}px
            </label>
            <input
              type="range"
              min="0"
              max="10"
              step="1"
              value={layout.borderWidth || 3}
              onChange={(e) => updateLayout({ borderWidth: parseInt(e.target.value) })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-yellow-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Border Color
            </label>
            <input
              type="color"
              value={layout.borderColor || '#ffffff'}
              onChange={(e) => updateLayout({ borderColor: e.target.value })}
              className="w-full h-10 rounded-lg cursor-pointer"
            />
          </div>
        </div>
      </div>
    );
  }

  // Grid Controls
  if (mode === 'grid') {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-3">
          <Grid className="w-5 h-5 text-yellow-600" />
          <h3 className="font-semibold text-gray-900">Grid Layout</h3>
        </div>

        {/* Grid Size Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Grid Size
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { rows: 2, cols: 2, label: '2×2' },
              { rows: 2, cols: 3, label: '2×3' },
              { rows: 3, cols: 2, label: '3×2' },
              { rows: 3, cols: 3, label: '3×3' },
              { rows: 2, cols: 4, label: '2×4' },
              { rows: 4, cols: 2, label: '4×2' },
            ].map((grid) => (
              <button
                key={grid.label}
                onClick={() => updateLayout({ rows: grid.rows, columns: grid.cols })}
                className={`px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                  (layout.rows || 2) === grid.rows && (layout.columns || 2) === grid.cols
                    ? 'border-yellow-600 bg-yellow-50 text-yellow-900'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-yellow-300'
                }`}
              >
                {grid.label}
              </button>
            ))}
          </div>
        </div>

        {/* Gap */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Gap: {layout.gap || 5}px
          </label>
          <input
            type="range"
            min="0"
            max="50"
            step="5"
            value={layout.gap || 5}
            onChange={(e) => updateLayout({ gap: parseInt(e.target.value) })}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-yellow-600"
          />
        </div>
      </div>
    );
  }

  // Above/Below Controls
  if (mode === 'above_below') {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-3">
          <SplitSquareVertical className="w-5 h-5 text-yellow-600" />
          <h3 className="font-semibold text-gray-900">Above/Below Layout</h3>
        </div>

        {/* Split Ratio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Split Ratio: {Math.round((layout.topRatio || 0.6) * 100)}% / {Math.round((layout.bottomRatio || 0.4) * 100)}%
          </label>
          <input
            type="range"
            min="0.2"
            max="0.8"
            step="0.1"
            value={layout.topRatio || 0.6}
            onChange={(e) => {
              const top = parseFloat(e.target.value);
              updateLayout({ topRatio: top, bottomRatio: 1 - top });
            }}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-yellow-600"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>More Top</span>
            <span>Equal</span>
            <span>More Bottom</span>
          </div>
        </div>

        {/* Gap */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Gap: {layout.gap || 10}px
          </label>
          <input
            type="range"
            min="0"
            max="50"
            step="5"
            value={layout.gap || 10}
            onChange={(e) => updateLayout({ gap: parseInt(e.target.value) })}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-yellow-600"
          />
        </div>
      </div>
    );
  }

  // No advanced controls for basic modes
  return null;
}
