import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReferralStatus } from '@prisma/client';
import { customAlphabet } from 'nanoid';

// Generate short, memorable referral codes (e.g., "CLIP42XY")
const generateCode = customAlphabet('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 8);

@Injectable()
export class ReferralsService {
  private readonly logger = new Logger(ReferralsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Generate unique referral code for organization
   * Format: CLIP + 4 random chars (e.g., CLIP42XY)
   */
  async generateReferralCode(orgId: string): Promise<string> {
    const org = await this.prisma.organization.findUnique({
      where: { id: orgId },
    });

    if (!org) {
      throw new NotFoundException('Organization not found');
    }

    // If org already has a code, return it
    if (org.referralCode) {
      return org.referralCode;
    }

    // Generate unique code
    let code: string;
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      code = `CLIP${generateCode().substring(0, 4)}`;
      
      // Check if code is unique
      const existing = await this.prisma.organization.findUnique({
        where: { referralCode: code },
      });

      if (!existing) {
        // Save code to organization
        await this.prisma.organization.update({
          where: { id: orgId },
          data: { referralCode: code },
        });

        this.logger.log(`Generated referral code ${code} for org ${orgId}`);
        return code;
      }

      attempts++;
    }

    throw new Error('Failed to generate unique referral code');
  }

  /**
   * Track referral when new user signs up with a code
   * Called during organization creation
   */
  async trackReferral(newOrgId: string, referralCode: string): Promise<void> {
    // Find referrer by code
    const referrer = await this.prisma.organization.findUnique({
      where: { referralCode },
    });

    if (!referrer) {
      this.logger.warn(`Invalid referral code: ${referralCode}`);
      return; // Don't fail signup, just ignore invalid code
    }

    // Don't allow self-referral
    if (referrer.id === newOrgId) {
      this.logger.warn(`Self-referral attempt blocked: ${newOrgId}`);
      return;
    }

    // Create referral record
    await this.prisma.referral.create({
      data: {
        referrerOrgId: referrer.id,
        referredOrgId: newOrgId,
        referralCode,
        status: ReferralStatus.PENDING,
      },
    });

    // Update referred org with referrer code
    await this.prisma.organization.update({
      where: { id: newOrgId },
      data: { referredBy: referralCode },
    });

    this.logger.log(`Tracked referral: ${referrer.id} → ${newOrgId} (code: ${referralCode})`);
  }

  /**
   * Complete referral when referred user takes qualifying action
   * Qualifying action: First successful export
   */
  async completeReferral(referredOrgId: string): Promise<void> {
    // Find pending referral for this org
    const referral = await this.prisma.referral.findFirst({
      where: {
        referredOrgId,
        status: ReferralStatus.PENDING,
      },
      include: {
        referrer: true,
        referred: true,
      },
    });

    if (!referral) {
      this.logger.debug(`No pending referral found for org ${referredOrgId}`);
      return;
    }

    // Mark referral as completed
    await this.prisma.referral.update({
      where: { id: referral.id },
      data: {
        status: ReferralStatus.COMPLETED,
        completedAt: new Date(),
      },
    });

    this.logger.log(`Referral completed: ${referral.referrerOrgId} → ${referredOrgId}`);

    // Trigger reward process
    await this.rewardReferral(referral.id);
  }

  /**
   * Reward both referrer and referred user
   * Referrer: +30 credits
   * Referred: +30 credits (signup bonus)
   */
  async rewardReferral(referralId: string): Promise<void> {
    const referral = await this.prisma.referral.findUnique({
      where: { id: referralId },
      include: {
        referrer: true,
        referred: true,
      },
    });

    if (!referral) {
      throw new NotFoundException('Referral not found');
    }

    if (referral.status !== ReferralStatus.COMPLETED) {
      throw new BadRequestException('Referral not completed yet');
    }

    if (referral.referrerRewarded && referral.referredRewarded) {
      this.logger.warn(`Referral ${referralId} already rewarded`);
      return;
    }

    // Reward referrer
    if (!referral.referrerRewarded) {
      const referrerOrg = await this.prisma.organization.findUnique({
        where: { id: referral.referrerOrgId },
        select: { credits: true },
      });

      const balanceBefore = referrerOrg?.credits || 0;
      const balanceAfter = balanceBefore + referral.referrerReward;

      await this.prisma.organization.update({
        where: { id: referral.referrerOrgId },
        data: {
          credits: { increment: referral.referrerReward },
        },
      });

      // Log credit transaction
      await this.prisma.creditTransaction.create({
        data: {
          orgId: referral.referrerOrgId,
          type: 'ADDITION_REFERRAL_BONUS',
          amount: referral.referrerReward,
          balanceBefore,
          balanceAfter,
          description: `Referral bonus: ${referral.referred.name} signed up`,
        },
      });

      this.logger.log(`Rewarded referrer ${referral.referrerOrgId} with ${referral.referrerReward} credits`);
    }

    // Reward referred user (signup bonus)
    if (!referral.referredRewarded && !referral.referred.referralRewardClaimed) {
      const referredOrg = await this.prisma.organization.findUnique({
        where: { id: referral.referredOrgId },
        select: { credits: true },
      });

      const balanceBefore = referredOrg?.credits || 0;
      const balanceAfter = balanceBefore + referral.referredReward;

      await this.prisma.organization.update({
        where: { id: referral.referredOrgId },
        data: {
          credits: { increment: referral.referredReward },
          referralRewardClaimed: true,
        },
      });

      // Log credit transaction
      await this.prisma.creditTransaction.create({
        data: {
          orgId: referral.referredOrgId,
          type: 'ADDITION_REFERRAL_BONUS',
          amount: referral.referredReward,
          balanceBefore,
          balanceAfter,
          description: `Welcome bonus for using referral code ${referral.referralCode}`,
        },
      });

      this.logger.log(`Rewarded referred user ${referral.referredOrgId} with ${referral.referredReward} credits`);
    }

    // Mark as rewarded
    await this.prisma.referral.update({
      where: { id: referralId },
      data: {
        status: ReferralStatus.REWARDED,
        referrerRewarded: true,
        referredRewarded: true,
      },
    });

    this.logger.log(`Referral ${referralId} fully rewarded`);
  }

  /**
   * Get referral stats for organization
   */
  async getReferralStats(orgId: string) {
    const [totalReferrals, completedReferrals, pendingReferrals, totalCreditsEarned] = await Promise.all([
      // Total referrals made
      this.prisma.referral.count({
        where: { referrerOrgId: orgId },
      }),

      // Completed referrals
      this.prisma.referral.count({
        where: {
          referrerOrgId: orgId,
          status: { in: [ReferralStatus.COMPLETED, ReferralStatus.REWARDED] },
        },
      }),

      // Pending referrals
      this.prisma.referral.count({
        where: {
          referrerOrgId: orgId,
          status: ReferralStatus.PENDING,
        },
      }),

      // Total credits earned from referrals
      this.prisma.referral.aggregate({
        where: {
          referrerOrgId: orgId,
          referrerRewarded: true,
        },
        _sum: {
          referrerReward: true,
        },
      }),
    ]);

    return {
      totalReferrals,
      completedReferrals,
      pendingReferrals,
      totalCreditsEarned: totalCreditsEarned._sum.referrerReward || 0,
      conversionRate: totalReferrals > 0 ? (completedReferrals / totalReferrals) * 100 : 0,
    };
  }

  /**
   * Get referral leaderboard (top referrers)
   */
  async getLeaderboard(limit: number = 10) {
    const topReferrers = await this.prisma.referral.groupBy({
      by: ['referrerOrgId'],
      where: {
        status: { in: [ReferralStatus.COMPLETED, ReferralStatus.REWARDED] },
      },
      _count: {
        id: true,
      },
      _sum: {
        referrerReward: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: limit,
    });

    // Fetch org details
    const leaderboard = await Promise.all(
      topReferrers.map(async (entry) => {
        const org = await this.prisma.organization.findUnique({
          where: { id: entry.referrerOrgId },
          select: {
            id: true,
            name: true,
            referralCode: true,
          },
        });

        return {
          org,
          referralCount: entry._count.id,
          creditsEarned: entry._sum.referrerReward || 0,
        };
      })
    );

    return leaderboard;
  }

  /**
   * Get detailed referral list for organization
   */
  async getReferralList(orgId: string) {
    const referrals = await this.prisma.referral.findMany({
      where: { referrerOrgId: orgId },
      include: {
        referred: {
          select: {
            id: true,
            name: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return referrals.map((ref) => ({
      id: ref.id,
      referredOrg: ref.referred,
      status: ref.status,
      reward: ref.referrerReward,
      rewarded: ref.referrerRewarded,
      completedAt: ref.completedAt,
      createdAt: ref.createdAt,
    }));
  }
}
