/**
 * Feature Flags Configuration
 * 
 * Controls experimental and new features.
 * All flags default to false for safety.
 */

export const FeatureFlags = {
  /**
   * Enable aspect ratio video processing with FFmpeg
   * When enabled, exported clips will be cropped/resized to selected aspect ratio
   */
  ASPECT_RATIO: process.env.FF_ASPECT_RATIO === 'true',

  /**
   * Enable caption styles and rendering
   * When enabled, users can add styled captions to videos
   */
  CAPTION_STYLES: process.env.FF_CAPTION_STYLES === 'true',

  /**
   * Enable in-page video playback
   * When enabled, clips can be played directly on the project page
   */
  INPAGE_PLAYBACK: process.env.FF_INPAGE_PLAYBACK === 'true',
} as const;

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(feature: keyof typeof FeatureFlags): boolean {
  return FeatureFlags[feature];
}

/**
 * Get all enabled features
 */
export function getEnabledFeatures(): string[] {
  return Object.entries(FeatureFlags)
    .filter(([_, enabled]) => enabled)
    .map(([feature]) => feature);
}

/**
 * Log feature flag status (for debugging)
 */
export function logFeatureFlags(): void {
  console.log('🚩 Feature Flags Status:');
  Object.entries(FeatureFlags).forEach(([feature, enabled]) => {
    console.log(`  ${enabled ? '✅' : '❌'} ${feature}`);
  });
}
