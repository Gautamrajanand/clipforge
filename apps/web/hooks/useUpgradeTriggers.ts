import { useState, useEffect } from 'react';

interface UpgradeTrigger {
  type: 'credits_low' | 'credits_depleted' | 'feature_locked' | 'export_limit' | 'quality_upgrade';
  shouldShow: boolean;
  priority: number;
}

interface UseUpgradeTriggersProps {
  tier: 'FREE' | 'STARTER' | 'PRO' | 'BUSINESS';
  credits: number;
  monthlyAllocation: number;
  exportCount: number;
  daysActive: number;
}

/**
 * useUpgradeTriggers Hook
 * Intelligent upgrade prompt logic
 * 
 * Features:
 * - Multiple trigger conditions
 * - Priority-based showing
 * - Frequency limiting
 * - User behavior tracking
 * 
 * Triggers:
 * 1. Credits Low (< 20% remaining)
 * 2. Credits Depleted (0 credits)
 * 3. Feature Locked (trying to access paid feature)
 * 4. Export Limit (hit monthly limit)
 * 5. Quality Upgrade (after 5+ exports)
 */

export function useUpgradeTriggers({
  tier,
  credits,
  monthlyAllocation,
  exportCount,
  daysActive,
}: UseUpgradeTriggersProps) {
  const [triggers, setTriggers] = useState<UpgradeTrigger[]>([]);
  const [lastShown, setLastShown] = useState<Record<string, number>>({});

  useEffect(() => {
    // Don't show to paid users (except PRO → BUSINESS)
    if (tier === 'BUSINESS') return;

    // Don't show if credits haven't loaded yet (monthlyAllocation is 0 on initial load)
    // Also don't show if credits is exactly 0 but monthlyAllocation is also 0 (loading state)
    if (monthlyAllocation === 0 || (credits === 0 && monthlyAllocation === 0)) return;

    const now = Date.now();
    const newTriggers: UpgradeTrigger[] = [];

    // Trigger 1: Credits Depleted (CRITICAL)
    // Only show if we have a valid monthlyAllocation (data is loaded)
    if (credits === 0 && tier === 'FREE' && monthlyAllocation > 0) {
      const lastShownTime = lastShown['credits_depleted'] || 0;
      const hoursSinceLastShown = (now - lastShownTime) / (1000 * 60 * 60);
      
      newTriggers.push({
        type: 'credits_depleted',
        shouldShow: hoursSinceLastShown > 24, // Show once per day
        priority: 100,
      });
    }

    // Trigger 2: Credits Low (HIGH)
    const creditsPercentage = (credits / monthlyAllocation) * 100;
    if (creditsPercentage < 20 && creditsPercentage > 0 && tier === 'FREE') {
      const lastShownTime = lastShown['credits_low'] || 0;
      const hoursSinceLastShown = (now - lastShownTime) / (1000 * 60 * 60);
      
      newTriggers.push({
        type: 'credits_low',
        shouldShow: hoursSinceLastShown > 48, // Show once per 2 days
        priority: 90,
      });
    }

    // Trigger 3: Export Limit (HIGH)
    if (exportCount >= 10 && tier === 'FREE') {
      const lastShownTime = lastShown['export_limit'] || 0;
      const hoursSinceLastShown = (now - lastShownTime) / (1000 * 60 * 60);
      
      newTriggers.push({
        type: 'export_limit',
        shouldShow: hoursSinceLastShown > 72, // Show once per 3 days
        priority: 80,
      });
    }

    // Trigger 4: Quality Upgrade (MEDIUM)
    if (exportCount >= 5 && daysActive >= 7 && tier === 'FREE') {
      const lastShownTime = lastShown['quality_upgrade'] || 0;
      const daysSinceLastShown = (now - lastShownTime) / (1000 * 60 * 60 * 24);
      
      newTriggers.push({
        type: 'quality_upgrade',
        shouldShow: daysSinceLastShown > 7, // Show once per week
        priority: 50,
      });
    }

    // Sort by priority (highest first)
    newTriggers.sort((a, b) => b.priority - a.priority);

    setTriggers(newTriggers);
  }, [tier, credits, monthlyAllocation, exportCount, daysActive, lastShown]);

  const markAsShown = (type: string) => {
    setLastShown(prev => ({
      ...prev,
      [type]: Date.now(),
    }));

    // Store in localStorage for persistence
    if (typeof window !== 'undefined') {
      localStorage.setItem('upgrade_triggers_shown', JSON.stringify({
        ...lastShown,
        [type]: Date.now(),
      }));
    }
  };

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('upgrade_triggers_shown');
      if (stored) {
        try {
          setLastShown(JSON.parse(stored));
        } catch (e) {
          console.error('Failed to parse stored triggers:', e);
        }
      }
    }
  }, []);

  // Get highest priority trigger that should show
  const activeTriger = triggers.find(t => t.shouldShow);

  return {
    activeTriger,
    allTriggers: triggers,
    markAsShown,
    hasActiveTrigger: !!activeTriger,
  };
}

/**
 * Trigger conditions for manual checks
 */
export const shouldShowFeatureLockedModal = (tier: string, feature: string): boolean => {
  const featureRequirements: Record<string, string[]> = {
    'no_watermark': ['STARTER', 'PRO', 'BUSINESS'],
    '4k_export': ['PRO', 'BUSINESS'],
    'team_workspace': ['PRO', 'BUSINESS'],
    'brand_templates': ['PRO', 'BUSINESS'],
    'api_access': ['BUSINESS'],
  };

  const requiredTiers = featureRequirements[feature] || [];
  return !requiredTiers.includes(tier);
};

/**
 * Calculate days until credit reset
 */
export const daysUntilReset = (resetDate: Date): number => {
  const now = new Date();
  const diff = resetDate.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

/**
 * Format credits with color coding
 */
export const getCreditsColor = (credits: number, allocation: number): string => {
  const percentage = (credits / allocation) * 100;
  
  if (percentage === 0) return 'text-red-600';
  if (percentage < 20) return 'text-orange-600';
  if (percentage < 50) return 'text-yellow-600';
  return 'text-green-600';
};
