export interface PlatformPreset {
  id: string;
  name: string;
  icon: string;
  aspectRatio: '9:16' | '16:9' | '1:1' | '4:5';
  clipLength: number;
  numberOfClips: number;
  description: string;
  color: string;
}

export const PLATFORM_PRESETS: PlatformPreset[] = [
  {
    id: 'youtube-shorts',
    name: 'YouTube Shorts',
    icon: '📺',
    aspectRatio: '9:16',
    clipLength: 45,
    numberOfClips: 3,
    description: 'Vertical videos up to 60s',
    color: 'from-red-500 to-red-600',
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    icon: '🎵',
    aspectRatio: '9:16',
    clipLength: 30,
    numberOfClips: 5,
    description: 'Short-form vertical videos',
    color: 'from-black to-gray-800',
  },
  {
    id: 'instagram-reels',
    name: 'Instagram Reels',
    icon: '📸',
    aspectRatio: '9:16',
    clipLength: 45,
    numberOfClips: 3,
    description: 'Vertical videos up to 90s',
    color: 'from-purple-500 to-pink-500',
  },
  {
    id: 'instagram-feed',
    name: 'Instagram Feed',
    icon: '🖼️',
    aspectRatio: '1:1',
    clipLength: 30,
    numberOfClips: 3,
    description: 'Square format videos',
    color: 'from-orange-500 to-pink-500',
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: '💼',
    aspectRatio: '16:9',
    clipLength: 60,
    numberOfClips: 2,
    description: 'Professional content',
    color: 'from-blue-600 to-blue-700',
  },
  {
    id: 'custom',
    name: 'Custom',
    icon: '⚙️',
    aspectRatio: '16:9',
    clipLength: 60,
    numberOfClips: 3,
    description: 'Customize all settings',
    color: 'from-gray-600 to-gray-700',
  },
];

export interface ClipSettings {
  aspectRatio: '9:16' | '16:9' | '1:1' | '4:5';
  clipLength: number;
  numberOfClips: number;
  timeframe?: {
    start: number;
    end: number;
  };
  targetPlatform?: string;
}

export const ASPECT_RATIOS = [
  { value: '9:16', label: 'Vertical', icon: '📱', description: 'TikTok, Shorts, Reels' },
  { value: '16:9', label: 'Landscape', icon: '🖥️', description: 'YouTube, LinkedIn' },
  { value: '1:1', label: 'Square', icon: '⬜', description: 'Instagram Feed' },
  { value: '4:5', label: 'Portrait', icon: '📐', description: 'Instagram Feed' },
] as const;
