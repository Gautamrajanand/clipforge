/**
 * Caption Style Presets
 * Professional caption styles inspired by Opus Clip and social media best practices
 */

export interface CaptionStylePreset {
  id: string;
  name: string;
  description: string;
  fontFamily: string;
  fontSize: number;
  textColor: string;
  backgroundColor: string;
  position: 'top' | 'center' | 'bottom';
  alignment: 'left' | 'center' | 'right';
  stroke?: {
    color: string;
    width: number;
  };
  shadow?: {
    offsetX: number;
    offsetY: number;
    blur: number;
    color: string;
  };
}

export const CAPTION_STYLE_PRESETS: Record<string, CaptionStylePreset> = {
  minimal: {
    id: 'minimal',
    name: 'Minimal',
    description: 'Simple white text with subtle background',
    fontFamily: 'Arial',
    fontSize: 32,
    textColor: '#FFFFFF',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    position: 'bottom',
    alignment: 'center',
    stroke: {
      color: '#000000',
      width: 2,
    },
  },

  bold: {
    id: 'bold',
    name: 'Bold',
    description: 'Large, high-contrast text that demands attention',
    fontFamily: 'Arial Black',
    fontSize: 56,
    textColor: '#FFFFFF',
    backgroundColor: 'rgba(0, 0, 0, 0)',
    position: 'center',
    alignment: 'center',
    stroke: {
      color: '#000000',
      width: 5,
    },
  },

  elegant: {
    id: 'elegant',
    name: 'Elegant',
    description: 'Refined serif font with soft shadow',
    fontFamily: 'Georgia',
    fontSize: 34,
    textColor: '#F5F5F5',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    position: 'bottom',
    alignment: 'center',
    stroke: {
      color: '#000000',
      width: 2,
    },
  },

  modern: {
    id: 'modern',
    name: 'Modern',
    description: 'Clean sans-serif with smooth animation',
    fontFamily: 'Arial',
    fontSize: 36,
    textColor: '#FFFFFF',
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    position: 'bottom',
    alignment: 'center',
    stroke: {
      color: '#000000',
      width: 2,
    },
  },

  karaoke: {
    id: 'karaoke',
    name: 'Karaoke',
    description: 'Word-by-word highlighting (Opus Clip style)',
    fontFamily: 'Arial',
    fontSize: 48,
    textColor: '#00FF00',
    backgroundColor: 'rgba(0, 0, 0, 0)',
    position: 'bottom',
    alignment: 'center',
    stroke: {
      color: '#000000',
      width: 4,
    },
  },

  podcast: {
    id: 'podcast',
    name: 'Podcast',
    description: 'Professional style with speaker labels',
    fontFamily: 'Arial',
    fontSize: 30,
    textColor: '#FFFFFF',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    position: 'bottom',
    alignment: 'center',
    stroke: {
      color: '#000000',
      width: 2,
    },
  },
};

/**
 * Get a caption style preset by ID
 */
export function getCaptionStylePreset(presetId: string): CaptionStylePreset {
  return CAPTION_STYLE_PRESETS[presetId] || CAPTION_STYLE_PRESETS.minimal;
}

/**
 * Get all available caption style presets
 */
export function getAllCaptionStylePresets(): CaptionStylePreset[] {
  return Object.values(CAPTION_STYLE_PRESETS);
}
