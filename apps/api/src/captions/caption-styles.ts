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
    description: 'Pop-in animation with large text (Opus Clip style)',
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
    description: 'Smooth slide-up animation with serif font',
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
    description: 'Fade-in animation with clean sans-serif',
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
    description: 'Word-by-word color highlighting (Opus Clip style)',
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

  // NEW VIRAL STYLES (2024-2025 Trends)

  mrbeast: {
    id: 'mrbeast',
    name: 'MrBeast',
    description: 'Viral yellow pop style with bounce animation',
    fontFamily: 'Arial Black',
    fontSize: 95, // Increased from 80 for maximum impact
    textColor: '#FFD700', // Gold/Yellow
    backgroundColor: 'rgba(0, 0, 0, 0)',
    position: 'center',
    alignment: 'center',
    stroke: {
      color: '#000000',
      width: 12, // Increased from 10 for even stronger outline
    },
  },

  neon: {
    id: 'neon',
    name: 'Neon',
    description: 'Bright neon green with glow effect (TikTok viral)',
    fontFamily: 'Arial Black',
    fontSize: 85, // Increased from 72 for maximum impact
    textColor: '#00FF00', // Neon green
    backgroundColor: 'rgba(0, 0, 0, 0)',
    position: 'bottom',
    alignment: 'center',
    stroke: {
      color: '#000000',
      width: 10, // Increased from 8 for stronger outline
    },
    shadow: {
      offsetX: 0,
      offsetY: 0,
      blur: 35, // Increased from 30 for even stronger glow
      color: '#00FF00',
    },
  },

  highlight: {
    id: 'highlight',
    name: 'Highlight',
    description: 'Yellow box highlights on key words (Hormozi style)',
    fontFamily: 'Arial Black',
    fontSize: 90, // Increased from 70 for maximum impact
    textColor: '#000000', // Black text
    backgroundColor: '#FFD700', // Yellow background
    position: 'center',
    alignment: 'center',
    stroke: {
      color: '#FFFFFF',
      width: 0,
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
