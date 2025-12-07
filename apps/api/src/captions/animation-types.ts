/**
 * Animation Types and Interfaces
 * Defines the complete animation specification system for caption styles
 */

export interface AnimationConfig {
  duration: number; // milliseconds
  delay?: number; // milliseconds
  easing?: EasingFunction;
  properties: AnimationProperties;
}

export interface AnimationProperties {
  opacity?: { from: number; to: number };
  scale?: { from: number; to: number };
  translateX?: { from: number; to: number }; // pixels
  translateY?: { from: number; to: number }; // pixels
  rotate?: { from: number; to: number }; // degrees
  blur?: { from: number; to: number }; // pixels
  glowIntensity?: { from: number; to: number }; // 0-1
  glowRadius?: { from: number; to: number }; // pixels
  colorShift?: { from: string; to: string }; // hex colors
  backgroundWidth?: { from: number; to: number }; // 0-1 (percentage)
  backgroundHeight?: { from: number; to: number }; // 0-1 (percentage)
  rgbSplitX?: { from: number; to: number }; // pixels
  rgbSplitY?: { from: number; to: number }; // pixels
}

export interface AnimationSpec {
  entry: AnimationConfig;
  perWord?: AnimationConfig;
  perChar?: AnimationConfig;
  loop?: AnimationConfig;
  exit: AnimationConfig;
  stagger?: {
    type: 'word' | 'char';
    delay: number; // milliseconds between each item
  };
}

export type EasingFunction = 
  | 'linear'
  | 'easeIn'
  | 'easeOut'
  | 'easeInOut'
  | 'easeOutBack'
  | 'easeOutElastic'
  | 'easeOutBounce';

export interface CaptionStyle {
  id: string;
  name: string;
  description: string;
  
  // Typography
  fontFamily: string;
  fontWeight: number | string;
  fontSize: number;
  textColor: string;
  letterSpacing?: number;
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  
  // Effects
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
  glow?: {
    color: string;
    radius: number;
    intensity: number;
  };
  background?: {
    color: string;
    opacity: number;
    blur?: number; // backdrop-blur
    padding?: {
      x: number;
      y: number;
    };
    borderRadius?: number;
  };
  
  // Animation
  animation: AnimationSpec;
  
  // Special features
  keywordEmphasis?: {
    enabled: boolean;
    color?: string;
    scale?: number;
    animation?: AnimationConfig;
  };
  karaokeMode?: {
    enabled: boolean;
    inactiveColor: string;
    activeColor: string;
    fillMode: 'progressive' | 'instant';
  };
  glitchEffect?: {
    enabled: boolean;
    frequency: number; // ms between glitches
    duration: number; // ms per glitch
    intensity: number; // 0-1
  };
}

export interface WordTiming {
  text: string;
  start: number; // seconds
  end: number; // seconds
  isKeyword?: boolean; // for emphasis styles
}

export interface CharacterTiming {
  char: string;
  start: number; // seconds
  end: number; // seconds
}

export interface RenderFrame {
  frameNumber: number;
  timestamp: number; // seconds
  words: WordTiming[];
  activeWordIndex?: number;
  activeCharIndex?: number;
}

/**
 * Easing function implementations
 */
export class Easing {
  static linear(t: number): number {
    return t;
  }

  static easeIn(t: number): number {
    return t * t;
  }

  static easeOut(t: number): number {
    return t * (2 - t);
  }

  static easeInOut(t: number): number {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }

  static easeOutBack(t: number): number {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  }

  static easeOutElastic(t: number): number {
    const c4 = (2 * Math.PI) / 3;
    return t === 0
      ? 0
      : t === 1
      ? 1
      : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  }

  static easeOutBounce(t: number): number {
    const n1 = 7.5625;
    const d1 = 2.75;

    if (t < 1 / d1) {
      return n1 * t * t;
    } else if (t < 2 / d1) {
      return n1 * (t -= 1.5 / d1) * t + 0.75;
    } else if (t < 2.5 / d1) {
      return n1 * (t -= 2.25 / d1) * t + 0.9375;
    } else {
      return n1 * (t -= 2.625 / d1) * t + 0.984375;
    }
  }

  static apply(easingName: EasingFunction, t: number): number {
    switch (easingName) {
      case 'linear':
        return this.linear(t);
      case 'easeIn':
        return this.easeIn(t);
      case 'easeOut':
        return this.easeOut(t);
      case 'easeInOut':
        return this.easeInOut(t);
      case 'easeOutBack':
        return this.easeOutBack(t);
      case 'easeOutElastic':
        return this.easeOutElastic(t);
      case 'easeOutBounce':
        return this.easeOutBounce(t);
      default:
        return this.linear(t);
    }
  }
}

/**
 * Animation value interpolator
 */
export class AnimationInterpolator {
  static interpolate(
    from: number,
    to: number,
    progress: number,
    easing: EasingFunction = 'linear'
  ): number {
    const easedProgress = Easing.apply(easing, progress);
    return from + (to - from) * easedProgress;
  }

  static interpolateColor(
    from: string,
    to: string,
    progress: number,
    easing: EasingFunction = 'linear'
  ): string {
    const easedProgress = Easing.apply(easing, progress);
    
    // Parse hex colors
    const fromRgb = this.hexToRgb(from);
    const toRgb = this.hexToRgb(to);
    
    if (!fromRgb || !toRgb) return from;
    
    const r = Math.round(fromRgb.r + (toRgb.r - fromRgb.r) * easedProgress);
    const g = Math.round(fromRgb.g + (toRgb.g - fromRgb.g) * easedProgress);
    const b = Math.round(fromRgb.b + (toRgb.b - fromRgb.b) * easedProgress);
    
    return this.rgbToHex(r, g, b);
  }

  private static hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  }

  private static rgbToHex(r: number, g: number, b: number): string {
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  }
}
