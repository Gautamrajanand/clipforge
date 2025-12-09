/**
 * Caption Style Registry
 * Complete definitions for all 18 industry-standard caption styles
 * Matches TikTok/Reels/OpusClip quality standards
 * 
 * Includes Opus Clip style aliases for user recognition
 */

import { CaptionStyle } from './animation-types';

/**
 * Opus Clip style name aliases
 * Maps Opus Clip marketing names to our technical style IDs
 */
export const OPUS_CLIP_ALIASES: Record<string, string> = {
  // Opus Clip Name → Our Style ID
  'beasty': 'mrbeast',
  'deep-diver': 'cinematic',
  'deepdiver': 'cinematic',
  'youshaei': 'bold',
  'pod-p': 'podcast',
  'podp': 'podcast',
  'mozi': 'neon',
  'glitch-infinite': 'glitch',
  'glitchinfinite': 'glitch',
  'seamless-bounce': 'bounce',
  'seamlessbounce': 'bounce',
  'baby-earthquake': 'bounce',
  'babyearthquake': 'bounce',
  'baby-steps': 'bounce',
  'babysteps': 'bounce',
  'grow': 'bounce',
  'blur-switch': 'blur',
  'blurswitch': 'blur',
  'blur-in': 'blur',
  'blurin': 'blur',
  'focus': 'blur',
  'highlighter-box': 'highlight',
  'highlighterbox': 'highlight',
  'simple': 'minimal',
  'breathe': 'minimal',
  'think-media': 'uppercase',
  'thinkmedia': 'uppercase',
  'with-backdrop': 'documentary',
  'withbackdrop': 'documentary',
  'soft-landing': 'podcast', // Soft landing = soft settle
  'softlanding': 'podcast',
};

export const CaptionStyleRegistry: Record<string, CaptionStyle> = {
  // ============================================
  // 1) STATIC / PROFESSIONAL STYLES
  // ============================================

  minimal: {
    id: 'minimal',
    name: 'Minimal',
    description: 'Simple white text with subtle background',
    fontFamily: 'Arial',
    fontWeight: 400,
    fontSize: 46,
    textColor: '#FFFFFF',
    background: {
      color: '#000000',
      opacity: 0.8,
      padding: { x: 20, y: 10 },
      borderRadius: 4,
    },
    animation: {
      entry: {
        duration: 180,
        easing: 'easeOut',
        properties: {
          opacity: { from: 0, to: 1 },
          translateY: { from: 6, to: 0 },
        },
      },
      exit: {
        duration: 180,
        easing: 'easeIn',
        properties: {
          opacity: { from: 1, to: 0 },
        },
      },
    },
  },

  subtitle: {
    id: 'subtitle',
    name: 'Subtitle',
    description: 'Professional Netflix/YouTube style',
    fontFamily: 'Arial',
    fontWeight: 400,
    fontSize: 42,
    textColor: '#FFFFFF',
    background: {
      color: '#000000',
      opacity: 0.95,
      padding: { x: 24, y: 8 },
      borderRadius: 0,
    },
    animation: {
      entry: {
        duration: 120,
        easing: 'linear',
        properties: {
          opacity: { from: 0, to: 1 },
        },
      },
      exit: {
        duration: 80,
        easing: 'linear',
        properties: {
          opacity: { from: 1, to: 0 },
        },
      },
    },
  },

  podcast: {
    id: 'podcast',
    name: 'Podcast',
    description: 'Soft subtitle style for educational content',
    fontFamily: 'Inter',
    fontWeight: 400,
    fontSize: 44,
    textColor: '#FFFFFF',
    background: {
      color: '#000000',
      opacity: 0.75,
      blur: 8,
      padding: { x: 20, y: 12 },
      borderRadius: 8,
    },
    animation: {
      entry: {
        duration: 220,
        easing: 'easeOut',
        properties: {
          opacity: { from: 0, to: 1 },
          translateY: { from: 10, to: 0 },
        },
      },
      exit: {
        duration: 200,
        easing: 'easeIn',
        properties: {
          opacity: { from: 1, to: 0 },
          translateY: { from: 0, to: 4 },
        },
      },
    },
  },

  cinematic: {
    id: 'cinematic',
    name: 'Cinematic',
    description: 'Film-style captions for travel reels',
    fontFamily: 'Georgia',
    fontWeight: 400,
    fontSize: 48,
    textColor: '#FFFFFF',
    shadow: {
      offsetX: 0,
      offsetY: 4,
      blur: 12,
      color: 'rgba(0, 0, 0, 0.8)',
    },
    animation: {
      entry: {
        duration: 260,
        easing: 'easeInOut',
        properties: {
          opacity: { from: 0, to: 1 },
          scale: { from: 0.98, to: 1.0 },
        },
      },
      exit: {
        duration: 260,
        easing: 'easeInOut',
        properties: {
          opacity: { from: 1, to: 0 },
        },
      },
    },
  },

  bold: {
    id: 'bold',
    name: 'Bold',
    description: 'Classic YouTube meme style',
    fontFamily: 'Impact',
    fontWeight: 700,
    fontSize: 80,
    textColor: '#FFFFFF',
    textTransform: 'uppercase',
    stroke: {
      color: '#000000',
      width: 8,
    },
    animation: {
      entry: {
        duration: 160,
        easing: 'linear',
        properties: {
          opacity: { from: 0, to: 1 },
        },
      },
      exit: {
        duration: 160,
        easing: 'linear',
        properties: {
          opacity: { from: 1, to: 0 },
        },
      },
    },
  },

  // ============================================
  // 2) VIRAL / SOCIAL MEDIA STYLES
  // ============================================

  mrbeast: {
    id: 'mrbeast',
    name: 'MrBeast',
    description: 'Most viral style - ALL CAPS jumpy emphasis',
    fontFamily: 'Impact',
    fontWeight: 700,
    fontSize: 75,
    textColor: '#FFD900',
    textTransform: 'uppercase',
    stroke: {
      color: '#000000',
      width: 5,
    },
    animation: {
      entry: {
        duration: 180,
        easing: 'easeOutBack',
        properties: {
          opacity: { from: 0, to: 1 },
          scale: { from: 1.15, to: 1.0 },
        },
      },
      perWord: {
        duration: 120,
        easing: 'easeOutBack',
        properties: {
          scale: { from: 1.0, to: 1.08 },
        },
      },
      exit: {
        duration: 160,
        easing: 'easeIn',
        properties: {
          opacity: { from: 1, to: 0 },
        },
      },
    },
    keywordEmphasis: {
      enabled: true,
      scale: 1.08,
    },
  },

  neon: {
    id: 'neon',
    name: 'Neon',
    description: 'Bright neon green with glow effect',
    fontFamily: 'Arial Black',
    fontWeight: 900,
    fontSize: 85,
    textColor: '#00FF00',
    glow: {
      color: '#00FF00',
      radius: 40,
      intensity: 1.2,
    },
    animation: {
      entry: {
        duration: 200,
        easing: 'easeOut',
        properties: {
          opacity: { from: 0, to: 1 },
          glowIntensity: { from: 0, to: 1.0 },
        },
      },
      perWord: {
        duration: 80,
        delay: 0,
        easing: 'easeOut',
        properties: {
          glowIntensity: { from: 1.0, to: 1.3 },
          scale: { from: 1.0, to: 1.03 },
        },
      },
      loop: {
        duration: 2000,
        easing: 'easeInOut',
        properties: {
          glowIntensity: { from: 1.0, to: 1.03 },
        },
      },
      exit: {
        duration: 200,
        easing: 'easeIn',
        properties: {
          opacity: { from: 1, to: 0 },
          glowIntensity: { from: 1.0, to: 0 },
        },
      },
    },
  },

  highlight: {
    id: 'highlight',
    name: 'Highlight',
    description: 'Word-level emphasis for debate clips',
    fontFamily: 'Inter',
    fontWeight: 700,
    fontSize: 52,
    textColor: '#FFFFFF',
    background: {
      color: '#FFE600',
      opacity: 1.0,
      padding: { x: 12, y: 6 },
      borderRadius: 4,
    },
    animation: {
      entry: {
        duration: 0,
        properties: {},
      },
      perWord: {
        duration: 120,
        delay: 50,
        easing: 'easeOut',
        properties: {
          backgroundWidth: { from: 0, to: 1 },
          opacity: { from: 0, to: 1 },
        },
      },
      exit: {
        duration: 160,
        easing: 'easeIn',
        properties: {
          opacity: { from: 1, to: 0 },
        },
      },
      stagger: {
        type: 'word',
        delay: 50,
      },
    },
  },

  bounce: {
    id: 'bounce',
    name: 'Bounce',
    description: 'Bouncy word animation',
    fontFamily: 'Montserrat',
    fontWeight: 900,
    fontSize: 72,
    textColor: '#FFFFFF',
    stroke: {
      color: '#000000',
      width: 8,
    },
    animation: {
      entry: {
        duration: 200,
        easing: 'easeOutBack',
        properties: {
          scale: { from: 0.8, to: 1.0 },
        },
      },
      perWord: {
        duration: 200,
        delay: 0,
        easing: 'easeOutBounce',
        properties: {
          scale: { from: 1.0, to: 1.25 },
          translateY: { from: 10, to: 0 },
        },
      },
      exit: {
        duration: 180,
        easing: 'easeIn',
        properties: {
          opacity: { from: 1, to: 0 },
          translateY: { from: 0, to: 6 },
        },
      },
      stagger: {
        type: 'word',
        delay: 40,
      },
    },
  },

  glitch: {
    id: 'glitch',
    name: 'Glitch',
    description: 'Digital glitch effect',
    fontFamily: 'Courier New',
    fontWeight: 700,
    fontSize: 62,
    textColor: '#FFFFFF',
    glitchEffect: {
      enabled: true,
      frequency: 1000,
      duration: 80,
      intensity: 0.8,
    },
    animation: {
      entry: {
        duration: 120,
        easing: 'linear',
        properties: {
          opacity: { from: 0, to: 1 },
          rgbSplitX: { from: 4, to: 0 },
        },
      },
      loop: {
        duration: 80,
        easing: 'linear',
        properties: {
          translateX: { from: -3, to: 3 },
          rgbSplitX: { from: 0, to: 5 },
        },
      },
      exit: {
        duration: 160,
        easing: 'linear',
        properties: {
          opacity: { from: 1, to: 0 },
          rgbSplitX: { from: 0, to: 4 },
        },
      },
    },
  },

  popline: {
    id: 'popline',
    name: 'Popline',
    description: 'Horizontal wipe bar',
    fontFamily: 'Inter',
    fontWeight: 700,
    fontSize: 52,
    textColor: '#000000',
    background: {
      color: '#87FF00',
      opacity: 1.0,
      padding: { x: 24, y: 12 },
      borderRadius: 8,
    },
    animation: {
      entry: {
        duration: 220,
        easing: 'easeOut',
        properties: {
          translateX: { from: -100, to: 0 },
        },
      },
      exit: {
        duration: 180,
        easing: 'easeIn',
        properties: {
          opacity: { from: 1, to: 0 },
        },
      },
    },
  },

  // ============================================
  // 3) PROFESSIONAL / BUSINESS STYLES
  // ============================================

  documentary: {
    id: 'documentary',
    name: 'Documentary',
    description: 'White text on pink box',
    fontFamily: 'Inter',
    fontWeight: 600,
    fontSize: 48,
    textColor: '#FFFFFF',
    background: {
      color: '#FF6B9D',
      opacity: 1.0,
      padding: { x: 20, y: 10 },
      borderRadius: 6,
    },
    animation: {
      entry: {
        duration: 180,
        easing: 'easeOut',
        properties: {
          backgroundWidth: { from: 0, to: 1 },
          opacity: { from: 0, to: 1 },
        },
      },
      exit: {
        duration: 160,
        easing: 'easeIn',
        properties: {
          backgroundWidth: { from: 1, to: 0 },
          opacity: { from: 1, to: 0 },
        },
      },
    },
  },

  uppercase: {
    id: 'uppercase',
    name: 'Uppercase',
    description: 'All caps white on black box',
    fontFamily: 'Arial',
    fontWeight: 700,
    fontSize: 54,
    textColor: '#FFFFFF',
    textTransform: 'uppercase',
    background: {
      color: '#000000',
      opacity: 1.0,
      padding: { x: 20, y: 10 },
      borderRadius: 4,
    },
    animation: {
      entry: {
        duration: 160,
        easing: 'easeOut',
        properties: {
          opacity: { from: 0, to: 1 },
          translateY: { from: 6, to: 0 },
        },
      },
      exit: {
        duration: 160,
        easing: 'easeIn',
        properties: {
          opacity: { from: 1, to: 0 },
        },
      },
    },
  },

  blur: {
    id: 'blur',
    name: 'Blur',
    description: 'Frosted glass blur box',
    fontFamily: 'Inter',
    fontWeight: 500,
    fontSize: 46,
    textColor: '#FFFFFF',
    background: {
      color: 'rgba(255, 255, 255, 0.2)',
      opacity: 1.0,
      blur: 8,
      padding: { x: 20, y: 12 },
      borderRadius: 12,
    },
    animation: {
      entry: {
        duration: 200,
        easing: 'easeOut',
        properties: {
          opacity: { from: 0, to: 1 },
          blur: { from: 14, to: 8 },
          translateY: { from: 6, to: 0 },
        },
      },
      exit: {
        duration: 200,
        easing: 'easeIn',
        properties: {
          opacity: { from: 1, to: 0 },
          blur: { from: 8, to: 0 },
        },
      },
    },
  },

  bubble: {
    id: 'bubble',
    name: 'Bubble',
    description: 'Rounded bubble background',
    fontFamily: 'Montserrat',
    fontWeight: 500,
    fontSize: 46,
    textColor: '#000000',
    background: {
      color: '#FFFFFF',
      opacity: 0.95,
      padding: { x: 24, y: 14 },
      borderRadius: 24,
    },
    shadow: {
      offsetX: 0,
      offsetY: 4,
      blur: 12,
      color: 'rgba(0, 0, 0, 0.2)',
    },
    animation: {
      entry: {
        duration: 180,
        easing: 'easeOutBack',
        properties: {
          scale: { from: 0.9, to: 1.0 },
          opacity: { from: 0, to: 1 },
        },
      },
      exit: {
        duration: 180,
        easing: 'easeIn',
        properties: {
          scale: { from: 1.0, to: 0.95 },
          opacity: { from: 1, to: 0 },
        },
      },
    },
  },

  // ============================================
  // 4) BUSINESS / SALES
  // ============================================

  hormozi: {
    id: 'hormozi',
    name: 'Alex Hormozi',
    description: 'White text + GOLD keywords',
    fontFamily: 'Arial',
    fontWeight: 700,
    fontSize: 58,
    textColor: '#FFFFFF',
    stroke: {
      color: '#000000',
      width: 3,
    },
    animation: {
      entry: {
        duration: 200,
        easing: 'easeOut',
        properties: {
          opacity: { from: 0, to: 1 },
          translateY: { from: 8, to: 0 },
        },
      },
      exit: {
        duration: 160,
        easing: 'easeIn',
        properties: {
          opacity: { from: 1, to: 0 },
        },
      },
    },
    keywordEmphasis: {
      enabled: true,
      color: '#FFC94A',
      scale: 1.06,
      animation: {
        duration: 120,
        easing: 'easeOutBack',
        properties: {
          colorShift: { from: '#FFFFFF', to: '#FFC94A' },
          scale: { from: 1.0, to: 1.06 },
        },
      },
    },
  },

  // ============================================
  // 5) CREATIVE / ARTISTIC
  // ============================================

  karaoke: {
    id: 'karaoke',
    name: 'Karaoke',
    description: 'Progressive fill synced to audio',
    fontFamily: 'Arial Black',
    fontWeight: 900,
    fontSize: 68,
    textColor: '#FFFFFF',
    stroke: {
      color: '#000000',
      width: 6,
    },
    karaokeMode: {
      enabled: true,
      inactiveColor: '#FFFFFF',
      activeColor: '#00D9FF',
      fillMode: 'progressive',
    },
    animation: {
      entry: {
        duration: 180,
        easing: 'easeOut',
        properties: {
          opacity: { from: 0, to: 1 },
        },
      },
      perChar: {
        duration: 0, // Instant, controlled by audio timing
        properties: {
          colorShift: { from: '#FFFFFF', to: '#00F8C8' },
        },
      },
      exit: {
        duration: 180,
        easing: 'easeIn',
        properties: {
          opacity: { from: 1, to: 0 },
        },
      },
    },
  },

  typewriter: {
    id: 'typewriter',
    name: 'Typewriter',
    description: 'Letter-by-letter typing effect',
    fontFamily: 'monospace',
    fontWeight: 700,
    fontSize: 52,
    textColor: '#FFFFFF',
    background: {
      color: '#000000',
      opacity: 0.85,
      padding: { x: 16, y: 10 },
      borderRadius: 4,
    },
    animation: {
      entry: {
        duration: 0,
        properties: {},
      },
      perChar: {
        duration: 40,
        delay: 0,
        easing: 'linear',
        properties: {
          opacity: { from: 0, to: 1 },
        },
      },
      exit: {
        duration: 200,
        easing: 'easeIn',
        properties: {
          opacity: { from: 1, to: 0 },
        },
      },
      stagger: {
        type: 'char',
        delay: 40, // 40ms per character
      },
    },
  },
};

/**
 * Get a caption style by ID (supports Opus Clip aliases)
 */
export function getCaptionStyle(styleId: string): CaptionStyle {
  // Normalize style ID (lowercase, remove spaces/hyphens)
  const normalizedId = styleId.toLowerCase().replace(/[\s_]/g, '-');
  
  // Check if it's an Opus Clip alias
  const actualStyleId = OPUS_CLIP_ALIASES[normalizedId] || normalizedId;
  
  // Return the style (fallback to minimal if not found)
  return CaptionStyleRegistry[actualStyleId] || CaptionStyleRegistry.minimal;
}

/**
 * Get all available caption styles
 */
export function getAllCaptionStyles(): CaptionStyle[] {
  return Object.values(CaptionStyleRegistry);
}

/**
 * Get caption styles by category
 */
export function getCaptionStylesByCategory(category: string): CaptionStyle[] {
  const categories: Record<string, string[]> = {
    professional: ['minimal', 'subtitle', 'podcast', 'cinematic', 'bold'],
    viral: ['mrbeast', 'neon', 'highlight', 'bounce', 'glitch', 'popline'],
    business: ['documentary', 'uppercase', 'blur', 'bubble'],
    sales: ['hormozi'],
    creative: ['karaoke', 'typewriter'],
  };

  const styleIds = categories[category] || [];
  return styleIds.map(id => CaptionStyleRegistry[id]).filter(Boolean);
}
