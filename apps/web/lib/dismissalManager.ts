/**
 * Dismissal Manager
 * Tracks modal dismissals and enforces cooldown periods
 */

export interface DismissalConfig {
  modalId: string;
  userId: string;
  cooldownMs: number;
}

class DismissalManager {
  private readonly STORAGE_PREFIX = 'modal_dismissed_';

  /**
   * Record modal dismissal
   */
  dismiss(modalId: string, userId: string, cooldownMs: number = 24 * 60 * 60 * 1000): void {
    const key = this.getKey(modalId, userId);
    const timestamp = Date.now();
    
    localStorage.setItem(key, JSON.stringify({
      timestamp,
      cooldownMs,
    }));

    console.log(`[DismissalManager] Dismissed ${modalId} for ${cooldownMs}ms`);
  }

  /**
   * Check if modal can be shown (not dismissed or cooldown expired)
   */
  canShow(modalId: string, userId: string, cooldownMs: number = 24 * 60 * 60 * 1000): boolean {
    const key = this.getKey(modalId, userId);
    const stored = localStorage.getItem(key);

    if (!stored) {
      return true; // Never dismissed
    }

    try {
      const { timestamp, cooldownMs: storedCooldown } = JSON.parse(stored);
      const elapsed = Date.now() - timestamp;
      const cooldown = storedCooldown || cooldownMs;

      if (elapsed > cooldown) {
        // Cooldown expired, clear storage
        localStorage.removeItem(key);
        console.log(`[DismissalManager] Cooldown expired for ${modalId}`);
        return true;
      }

      const remainingMs = cooldown - elapsed;
      const remainingHours = Math.floor(remainingMs / (60 * 60 * 1000));
      console.log(`[DismissalManager] ${modalId} dismissed, ${remainingHours}h remaining`);
      return false;
    } catch (error) {
      console.error(`[DismissalManager] Error parsing dismissal data:`, error);
      localStorage.removeItem(key);
      return true;
    }
  }

  /**
   * Clear dismissal for specific modal
   */
  clear(modalId: string, userId: string): void {
    const key = this.getKey(modalId, userId);
    localStorage.removeItem(key);
    console.log(`[DismissalManager] Cleared dismissal for ${modalId}`);
  }

  /**
   * Clear all dismissals for user (e.g., after upgrade)
   */
  clearAll(userId: string): void {
    const keys = Object.keys(localStorage);
    const userKeys = keys.filter(key => 
      key.startsWith(this.STORAGE_PREFIX) && key.includes(userId)
    );

    userKeys.forEach(key => localStorage.removeItem(key));
    console.log(`[DismissalManager] Cleared ${userKeys.length} dismissals for user`);
  }

  /**
   * Clear all upgrade-related dismissals (after user upgrades)
   */
  clearUpgradeNudges(userId: string): void {
    const upgradeModalIds = [
      'watermark-upgrade',
      'export-upgrade',
      'low-credits',
      'project-expiry',
      'quality-upgrade',
      'api-access',
    ];

    upgradeModalIds.forEach(modalId => {
      this.clear(modalId, userId);
    });

    console.log(`[DismissalManager] Cleared all upgrade nudges for user`);
  }

  /**
   * Get time remaining until modal can be shown again
   */
  getTimeRemaining(modalId: string, userId: string): number | null {
    const key = this.getKey(modalId, userId);
    const stored = localStorage.getItem(key);

    if (!stored) {
      return null;
    }

    try {
      const { timestamp, cooldownMs } = JSON.parse(stored);
      const elapsed = Date.now() - timestamp;
      const remaining = cooldownMs - elapsed;
      return remaining > 0 ? remaining : null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Get storage key
   */
  private getKey(modalId: string, userId: string): string {
    return `${this.STORAGE_PREFIX}${modalId}_${userId}`;
  }

  /**
   * Get all dismissed modals for user
   */
  getDismissed(userId: string): Array<{ modalId: string; remainingMs: number }> {
    const keys = Object.keys(localStorage);
    const userKeys = keys.filter(key => 
      key.startsWith(this.STORAGE_PREFIX) && key.includes(userId)
    );

    return userKeys
      .map(key => {
        const modalId = key.replace(this.STORAGE_PREFIX, '').replace(`_${userId}`, '');
        const remaining = this.getTimeRemaining(modalId, userId);
        return remaining ? { modalId, remainingMs: remaining } : null;
      })
      .filter((item): item is { modalId: string; remainingMs: number } => item !== null);
  }
}

// Singleton instance
export const dismissalManager = new DismissalManager();

// Cooldown constants
export const COOLDOWNS = {
  UPGRADE_NUDGE: 24 * 60 * 60 * 1000,      // 24 hours
  LOW_CREDITS: 12 * 60 * 60 * 1000,        // 12 hours
  PROJECT_EXPIRY: 6 * 60 * 60 * 1000,      // 6 hours
  NPS_SURVEY: 30 * 24 * 60 * 60 * 1000,    // 30 days
  FEATURE_ANNOUNCEMENT: 7 * 24 * 60 * 60 * 1000, // 7 days
};
