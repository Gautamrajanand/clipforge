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
    fontSize: 46, // Increased from 32 for better visibility
    textColor: '#FFFFFF',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    position: 'bottom',
    alignment: 'center',
    stroke: {
      color: '#000000',
      width: 4, // Increased from 2 for better contrast
    },
  },

  bold: {
    id: 'bold',
    name: 'Meme Block Capitals',
    description: 'Classic YouTube meme style (comedy edits, reactions)',
    fontFamily: 'Impact',
    fontSize: 80, // Canonical: 70-90px
    textColor: '#FFFFFF',
    backgroundColor: 'rgba(0, 0, 0, 0)',
    position: 'center',
    alignment: 'center',
    stroke: {
      color: '#000000',
      width: 8, // Canonical: 8px thick stroke
    },
  },

  elegant: {
    id: 'elegant',
    name: 'Elegant',
    description: 'Smooth slide-up animation with serif font',
    fontFamily: 'Georgia',
    fontSize: 48, // Increased from 34 for better visibility
    textColor: '#F5F5F5',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    position: 'bottom',
    alignment: 'center',
    stroke: {
      color: '#000000',
      width: 4, // Increased from 2 for better contrast
    },
  },

  modern: {
    id: 'modern',
    name: 'Modern',
    description: 'Fade-in animation with clean sans-serif',
    fontFamily: 'Arial',
    fontSize: 50, // Increased from 36 for better visibility
    textColor: '#FFFFFF',
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    position: 'bottom',
    alignment: 'center',
    stroke: {
      color: '#000000',
      width: 4, // Increased from 2 for better contrast
    },
  },

  karaoke: {
    id: 'karaoke',
    name: 'Karaoke Sync',
    description: 'Progressive fill synced to audio (singing, poetry)',
    fontFamily: 'Montserrat',
    fontSize: 48,
    textColor: '#FFFFFF', // Canonical: White inactive
    backgroundColor: 'rgba(0, 0, 0, 0)',
    position: 'bottom',
    alignment: 'center',
    stroke: {
      color: '#000000',
      width: 2,
    },
  },

  podcast: {
    id: 'podcast',
    name: 'Soft Subtle Podcast',
    description: 'Minimal clean style for educational content (Lex Fridman, Ali Abdaal)',
    fontFamily: 'Inter',
    fontSize: 40, // Canonical: 32-48px
    textColor: '#FFFFFF',
    backgroundColor: 'rgba(0, 0, 0, 0.25)', // Canonical: soft translucent strip
    position: 'bottom',
    alignment: 'center',
    stroke: {
      color: '#000000',
      width: 2,
    },
    shadow: {
      offsetX: 0,
      offsetY: 2,
      blur: 8,
      color: 'rgba(0, 0, 0, 0.35)',
    },
  },

  // NEW VIRAL STYLES (2024-2025 Trends)

  mrbeast: {
    id: 'mrbeast',
    name: 'MrBeast Bold',
    description: 'Most viral style - ALL CAPS jumpy emphasis (MrBeast, meme pages)',
    fontFamily: 'Impact',
    fontSize: 75, // Canonical: 60-90px
    textColor: '#FFD900', // Canonical: High-sat yellow
    backgroundColor: 'rgba(0, 0, 0, 0)',
    position: 'center',
    alignment: 'center',
    stroke: {
      color: '#000000',
      width: 5, // Canonical: 4-6px
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
    name: 'Highlighter Box',
    description: 'Word-level emphasis for debate clips (Opus Highlighter)',
    fontFamily: 'Inter',
    fontSize: 47, // Canonical: 42-52px
    textColor: '#000000', // Black text
    backgroundColor: '#FFE600', // Canonical: Yellow highlight
    position: 'center',
    alignment: 'center',
    stroke: {
      color: 'transparent',
      width: 0,
    },
  },

  // ADVANCED VIRAL STYLES (2025 Trends)

  rainbow: {
    id: 'rainbow',
    name: 'Rainbow',
    description: 'Rotating colors for maximum engagement (Yellow/Cyan/Green/Pink)',
    fontFamily: 'Arial Black',
    fontSize: 95,
    textColor: '#FFD700', // Default yellow (will rotate)
    backgroundColor: 'rgba(0, 0, 0, 0)',
    position: 'center',
    alignment: 'center',
    stroke: {
      color: '#000000',
      width: 12,
    },
  },

  fill: {
    id: 'fill',
    name: 'Fill',
    description: 'Progressive fill effect as words are spoken',
    fontFamily: 'Arial Black',
    fontSize: 90,
    textColor: '#FFFFFF', // White text
    backgroundColor: '#00BFFF', // Cyan/blue background
    position: 'center',
    alignment: 'center',
    stroke: {
      color: '#000000',
      width: 10,
    },
  },

  shadow3d: {
    id: 'shadow3d',
    name: '3D Shadow',
    description: 'Bold text with 3D shadow effect for depth',
    fontFamily: 'Arial Black',
    fontSize: 95,
    textColor: '#FFFFFF',
    backgroundColor: 'rgba(0, 0, 0, 0)',
    position: 'center',
    alignment: 'center',
    stroke: {
      color: '#000000',
      width: 12,
    },
    shadow: {
      offsetX: 6,
      offsetY: 6,
      blur: 0,
      color: '#000000',
    },
  },

  tricolor: {
    id: 'tricolor',
    name: 'Multi-Color Highlight',
    description: 'Color-coded meaning (Alex Hormozi style)',
    fontFamily: 'Inter',
    fontSize: 48, // Canonical: 42-54px
    textColor: '#FFFFFF',
    backgroundColor: 'rgba(0, 0, 0, 0)',
    position: 'center',
    alignment: 'center',
    stroke: {
      color: '#000000',
      width: 2,
    },
  },

  bounce: {
    id: 'bounce',
    name: 'Bounce Zoom',
    description: 'TikTok default emphasis bounce (humor, punchlines)',
    fontFamily: 'Arial Black',
    fontSize: 62, // Canonical: 52-72px
    textColor: '#FFFFFF',
    backgroundColor: 'rgba(0, 0, 0, 0)',
    position: 'center',
    alignment: 'center',
    stroke: {
      color: '#000000',
      width: 3, 
    },
  },

  typewriter: {
    id: 'typewriter',
    name: 'Typewriter',
    description: 'Letter-by-letter typing animation (nostalgic storytelling)',
    fontFamily: 'Courier New',
    fontSize: 38, 
    textColor: '#FFFFFF',
    backgroundColor: 'rgba(0, 0, 0, 0)',
    position: 'bottom',
    alignment: 'center',
    stroke: {
      color: '#000000',
      width: 2,
    },
  },

  glitch: {
    id: 'glitch',
    name: 'Glitch RGB',
    description: 'RGB split distortion (gaming, tech, Gen-Z)',
    fontFamily: 'Arial Black',
    fontSize: 48, 
    textColor: '#FFFFFF',
    backgroundColor: 'rgba(0, 0, 0, 0)',
    position: 'center',
    alignment: 'center',
    stroke: {
      color: '#000000',
      width: 3,
    },
  },

  popline: {
    id: 'popline',
    name: 'Popline Slide-Bar',
    description: 'Horizontal wipe bar (modern TikTok, motivational)',
    fontFamily: 'Inter',
    fontSize: 40, 
    textColor: '#000000',
    backgroundColor: '#00FF87', 
    position: 'center',
    alignment: 'center',
    stroke: {
      color: 'transparent',
      width: 0,
    },
  },

  blur: {
    id: 'blur',
    name: 'Blur Switch',
    description: 'Frosted glass caption (aesthetic, luxury)',
    fontFamily: 'Inter',
    fontSize: 38, 
    textColor: '#FFFFFF',
    backgroundColor: 'rgba(255, 255, 255, 0.15)', 
    position: 'center',
    alignment: 'center',
    stroke: {
      color: 'transparent',
      width: 0,
    },
    shadow: {
      offsetX: 0,
      offsetY: 4,
      blur: 12,
      color: 'rgba(0, 0, 0, 0.3)',
    },
  },

  documentary: {
    id: 'documentary',
    name: 'Cut-Out Block',
    description: 'Documentary style (Vox, AJ+, explainers)',
    fontFamily: 'Arial Black',
    fontSize: 40, 
    textColor: '#FFFFFF',
    backgroundColor: '#FF3DA1', 
    position: 'bottom',
    alignment: 'center',
    stroke: {
      color: 'transparent',
      width: 0,
    },
  },

  cinematic: {
    id: 'cinematic',
    name: 'Cinematic Subtitles',
    description: 'Film-style captions (travel reels, vlogs)',
    fontFamily: 'Georgia',
    fontSize: 38, 
    textColor: '#FFFFFF',
    backgroundColor: 'rgba(0, 0, 0, 0)',
    position: 'bottom',
    alignment: 'center',
    stroke: {
      color: 'transparent',
      width: 0,
    },
    shadow: {
      offsetX: 0,
      offsetY: 4,
      blur: 12,
      color: 'rgba(0, 0, 0, 0.7)',
    },
  },

  uppercase: {
    id: 'uppercase',
    name: 'Uppercase Plate',
    description: 'Clean boxed text (corporate, tips reels)',
    fontFamily: 'Montserrat',
    fontSize: 44, 
    textColor: '#FFFFFF',
    backgroundColor: '#000000',
    position: 'center',
    alignment: 'center',
    stroke: {
      color: 'transparent',
      width: 0,
    },
  },

  zoom: {
    id: 'zoom',
    name: 'Word Zoom Emphasis',
    description: 'Key words zoom 1.2x (business, TED talks)',
    fontFamily: 'Inter',
    fontSize: 40, 
    textColor: '#FFFFFF',
    backgroundColor: 'rgba(0, 0, 0, 0)',
    position: 'center',
    alignment: 'center',
    stroke: {
      color: '#000000',
      width: 2,
    },
  },

  gradient: {
    id: 'gradient',
    name: 'Gradient Pop',
    description: 'Gradient text (fitness, influencer reels)',
    fontFamily: 'Montserrat',
    fontSize: 40, 
    textColor: '#FF1493', 
    backgroundColor: 'rgba(0, 0, 0, 0)',
    position: 'center',
    alignment: 'center',
    stroke: {
      color: '#000000',
      width: 2,
    },
  },

  bubble: {
    id: 'bubble',
    name: 'Podcast Bubble Words',
    description: 'Bubble behind each word (ClipFM style)',
    fontFamily: 'Inter',
    fontSize: 36, 
    textColor: '#FFFFFF',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    position: 'bottom',
    alignment: 'center',
    stroke: {
      color: 'transparent',
      width: 0,
    },
    shadow: {
      offsetX: 0,
      offsetY: 2,
      blur: 6,
      color: 'rgba(0, 0, 0, 0.3)',
    },
  },

  news: {
    id: 'news',
    name: 'News Ticker',
    description: 'Breaking news meme style (satire, commentary)',
    fontFamily: 'Arial Black',
    fontSize: 38, 
    textColor: '#FFFFFF',
    backgroundColor: '#D90000', 
    position: 'bottom',
    alignment: 'center',
    stroke: {
      color: 'transparent',
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
