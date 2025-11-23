import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class TrialService {
  private readonly logger = new Logger(TrialService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Activate 7-day free trial for a new organization
   */
  async activateTrial(orgId: string) {
    const org = await this.prisma.organization.findUnique({
      where: { id: orgId },
    });

    if (!org) {
      throw new Error('Organization not found');
    }

    // Check if trial already used
    if (org.trialUsed) {
      this.logger.log(`❌ Trial already used for org ${orgId}`);
      return { success: false, message: 'Trial already used' };
    }

    // Check if already on paid plan
    if (org.tier !== 'FREE') {
      this.logger.log(`❌ Org ${orgId} already on ${org.tier} plan`);
      return { success: false, message: 'Already on paid plan' };
    }

    const trialStartDate = new Date();
    const trialEndDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await this.prisma.organization.update({
      where: { id: orgId },
      data: {
        trialStartDate,
        trialEndDate,
        credits: 150, // STARTER tier credits during trial
      },
    });

    // Log credit transaction
    await this.prisma.creditTransaction.create({
      data: {
        orgId,
        amount: 150,
        balanceBefore: org.credits,
        balanceAfter: 150,
        type: 'ADDITION_TRIAL',
        description: '7-day free trial activated - STARTER credits',
      },
    });

    this.logger.log(`✅ Trial activated for org ${orgId}: ${trialStartDate.toISOString()} → ${trialEndDate.toISOString()}`);

    return {
      success: true,
      trialStartDate,
      trialEndDate,
      credits: 150,
    };
  }

  /**
   * Check if organization is currently in trial period
   */
  async isInTrial(orgId: string): Promise<boolean> {
    const org = await this.prisma.organization.findUnique({
      where: { id: orgId },
      select: {
        trialStartDate: true,
        trialEndDate: true,
        tier: true,
      },
    });

    if (!org || org.tier !== 'FREE') {
      return false;
    }

    if (!org.trialStartDate || !org.trialEndDate) {
      return false;
    }

    const now = new Date();
    return now >= org.trialStartDate && now <= org.trialEndDate;
  }

  /**
   * Get trial status for an organization
   */
  async getTrialStatus(orgId: string) {
    const org = await this.prisma.organization.findUnique({
      where: { id: orgId },
      select: {
        trialStartDate: true,
        trialEndDate: true,
        trialUsed: true,
        tier: true,
        credits: true,
      },
    });

    if (!org) {
      throw new Error('Organization not found');
    }

    const now = new Date();
    const isInTrial = org.trialStartDate && org.trialEndDate && now >= org.trialStartDate && now <= org.trialEndDate;
    const daysLeft = org.trialEndDate ? Math.ceil((org.trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : 0;

    return {
      isInTrial,
      trialUsed: org.trialUsed,
      trialStartDate: org.trialStartDate,
      trialEndDate: org.trialEndDate,
      daysLeft: isInTrial ? daysLeft : 0,
      tier: org.tier,
      credits: org.credits,
    };
  }

  /**
   * Cron job to check and expire trials daily at midnight
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
    name: 'check-expired-trials',
  })
  async checkExpiredTrials() {
    this.logger.log('🔍 Checking for expired trials...');

    const now = new Date();

    // Find all organizations with expired trials
    const expiredTrials = await this.prisma.organization.findMany({
      where: {
        tier: 'FREE',
        trialEndDate: {
          lte: now,
        },
        trialUsed: false,
      },
    });

    this.logger.log(`Found ${expiredTrials.length} expired trials`);

    for (const org of expiredTrials) {
      try {
        // Revert to FREE tier credits (60)
        const currentCredits = org.credits;
        const newCredits = 60; // FREE tier allocation

        await this.prisma.organization.update({
          where: { id: org.id },
          data: {
            credits: newCredits,
            trialUsed: true, // Mark trial as used
          },
        });

        // Log credit transaction
        await this.prisma.creditTransaction.create({
          data: {
            orgId: org.id,
            amount: newCredits - currentCredits, // Likely negative
            balanceBefore: currentCredits,
            balanceAfter: newCredits,
            type: 'DEDUCTION_TRIAL_EXPIRED',
            description: 'Trial expired - reverted to FREE tier credits',
          },
        });

        this.logger.log(`✅ Expired trial for org ${org.id}: ${currentCredits} → ${newCredits} credits`);
      } catch (error) {
        this.logger.error(`❌ Failed to expire trial for org ${org.id}:`, error);
      }
    }

    this.logger.log(`✅ Processed ${expiredTrials.length} expired trials`);
  }

  /**
   * Manually expire a trial (for testing)
   */
  async expireTrial(orgId: string) {
    const org = await this.prisma.organization.findUnique({
      where: { id: orgId },
    });

    if (!org) {
      throw new Error('Organization not found');
    }

    const currentCredits = org.credits;
    const newCredits = 60; // FREE tier

    await this.prisma.organization.update({
      where: { id: orgId },
      data: {
        credits: newCredits,
        trialUsed: true,
      },
    });

    // Log transaction
    await this.prisma.creditTransaction.create({
      data: {
        orgId,
        amount: newCredits - currentCredits,
        balanceBefore: currentCredits,
        balanceAfter: newCredits,
        type: 'DEDUCTION_TRIAL_EXPIRED',
        description: 'Trial manually expired - reverted to FREE tier',
      },
    });

    this.logger.log(`✅ Manually expired trial for org ${orgId}`);

    return {
      success: true,
      creditsReverted: currentCredits - newCredits,
      newCredits,
    };
  }
}
