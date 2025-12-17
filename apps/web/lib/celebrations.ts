// Celebration tracking utilities
export type CelebrationType = 
  | 'first_clip' 
  | 'first_reframe' 
  | 'first_subtitles' 
  | 'first_export' 
  | 'first_share' 
  | 'milestone_10' 
  | 'milestone_50'
  | 'upgraded';

const CELEBRATION_KEYS: Record<CelebrationType, string> = {
  first_clip: 'celebrated_first_clip',
  first_reframe: 'celebrated_first_reframe',
  first_subtitles: 'celebrated_first_subtitles',
  first_export: 'celebrated_first_export',
  first_share: 'celebrated_first_share',
  milestone_10: 'celebrated_10_clips',
  milestone_50: 'celebrated_50_clips',
  upgraded: 'celebrated_upgrade',
};

export function shouldShowCelebration(type: CelebrationType): boolean {
  if (typeof window === 'undefined') return false;
  return !localStorage.getItem(CELEBRATION_KEYS[type]);
}

export function markCelebrationShown(type: CelebrationType): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CELEBRATION_KEYS[type], 'true');
}

export function triggerCelebration(
  type: CelebrationType,
  setCelebrationToast: (toast: { type: CelebrationType; isOpen: boolean } | null) => void
): void {
  if (shouldShowCelebration(type)) {
    setCelebrationToast({ type, isOpen: true });
    markCelebrationShown(type);
  }
}
