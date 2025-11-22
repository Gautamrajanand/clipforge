import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Tier } from '@prisma/client';
import { AnalyticsService } from '../analytics/analytics.service';

/**
 * CreditService - Handles all credit operations (Opus Clip parity)
 * 
 * Credit Rules:
 * - 1 credit = 1 minute of video processing
 * - Videos < 1 minute: Round UP to 1 credit
 * - Videos with partial minutes: Round DOWN to nearest whole minute
 * 
 * Examples:
 * - 0.5 minutes → 1 credit
 * - 4.5 minutes → 4 credits
 * - 10.2 minutes → 10 credits
 */
@Injectable()
export class CreditsService {
  private readonly logger = new Logger(CreditsService.name);

  constructor(
    private prisma: PrismaService,
    private analytics: AnalyticsService,
  ) {}

  /**
   * Calculate credits needed for video processing (Opus Clip rules)
   * @param durationSeconds - Video duration in seconds
   * @returns Credits needed (integer)
   */
  calculateCredits(durationSeconds: number): number {
    const durationMinutes = durationSeconds / 60;

    // Rule 1: Videos < 1 minute = 1 credit
    if (durationMinutes < 1) {
      return 1;
    }

    // Rule 2: Videos with partial minutes = round down
    return Math.floor(durationMinutes);
  }

  /**
   * Get credit allocation for a tier
   */
  getCreditAllocation(tier: Tier): number {
    const allocations = {
      FREE: 60,
      STARTER: 150,
      PRO: 300,
      BUSINESS: 1000, // Custom, but default
      ENTERPRISE: 10000, // Custom, but default
    };

    return allocations[tier] || 60;
  }

  /**
   * Check if organization has sufficient credits
   * @param orgId - Organization ID
   * @param creditsNeeded - Credits required
   * @returns true if sufficient, false otherwise
   */
  async hasSufficientCredits(orgId: string, creditsNeeded: number): Promise<boolean> {
    const org = await this.prisma.organization.findUnique({
      where: { id: orgId },
      select: { credits: true },
    });

    if (!org) {
      throw new BadRequestException('Organization not found');
    }

    return org.credits >= creditsNeeded;
  }

  /**
   * Get organization's current credit balance
   */
  async getBalance(orgId: string): Promise<number> {
    const org = await this.prisma.organization.findUnique({
      where: { id: orgId },
      select: { credits: true },
    });

    if (!org) {
      throw new BadRequestException('Organization not found');
    }

    return org.credits;
  }

  /**
   * Deduct credits from organization (with transaction audit trail)
   * @param orgId - Organization ID
   * @param creditsToDeduct - Credits to deduct
   * @param type - Transaction type
   * @param projectId - Optional project ID
   * @param videoDuration - Optional video duration in minutes
   * @param description - Optional description
   */
  async deductCredits(
    orgId: string,
    creditsToDeduct: number,
    type: 'CLIPS' | 'REFRAME' | 'CAPTIONS',
    projectId?: string,
    videoDuration?: number,
    description?: string,
  ): Promise<void> {
    // Get current balance
    const org = await this.prisma.organization.findUnique({
      where: { id: orgId },
      select: { credits: true, tier: true, name: true },
    });

    if (!org) {
      throw new BadRequestException('Organization not found');
    }

    const balanceBefore = org.credits;
    const balanceAfter = balanceBefore - creditsToDeduct;

    // Check sufficient credits
    if (balanceAfter < 0) {
      this.logger.warn(
        `❌ Insufficient credits for org ${orgId} (${org.name}): needs ${creditsToDeduct}, has ${balanceBefore}`,
      );
      
      // Track insufficient credits event
      await this.analytics.trackEvent('credits_insufficient', {
        orgId,
        creditsNeeded: creditsToDeduct,
        creditsAvailable: balanceBefore,
        tier: org.tier,
        type,
        projectId,
      });
      
      throw new BadRequestException(
        `Insufficient credits. You need ${creditsToDeduct} credits but only have ${balanceBefore}. Please upgrade your plan.`,
      );
    }

    // Map type to transaction type enum
    const transactionTypeMap: Record<string, string> = {
      CLIPS: 'DEDUCTION_CLIPS',
      REFRAME: 'DEDUCTION_REFRAME',
      CAPTIONS: 'DEDUCTION_CAPTIONS',
    };

    // Perform deduction and create audit trail in a transaction
    await this.prisma.$transaction(async (tx) => {
      // Update organization credits
      await tx.organization.update({
        where: { id: orgId },
        data: {
          credits: balanceAfter,
          creditsUsedThisMonth: {
            increment: creditsToDeduct,
          },
        },
      });

      // Create audit trail
      await tx.creditTransaction.create({
        data: {
          orgId,
          amount: -creditsToDeduct, // Negative for deduction
          balanceBefore,
          balanceAfter,
          type: transactionTypeMap[type] as any,
          projectId,
          videoDuration,
          description: description || `${type} processing: ${creditsToDeduct} credits`,
          metadata: {
            tier: org.tier,
            timestamp: new Date().toISOString(),
          },
        },
      });

      // Update project if provided
      if (projectId) {
        await tx.project.update({
          where: { id: projectId },
          data: { creditsUsed: creditsToDeduct },
        });
      }
    });

    this.logger.log(
      `✅ Deducted ${creditsToDeduct} credits from org ${orgId} (${org.name}): ${balanceBefore} → ${balanceAfter}`,
    );

    // Track credit deduction event
    await this.analytics.trackEvent('credits_deducted', {
      orgId,
      amount: creditsToDeduct,
      balanceBefore,
      balanceAfter,
      type,
      tier: org.tier,
      projectId,
      videoDuration,
    });
  }

  /**
   * Add credits to organization (purchase, renewal, refund, etc.)
   */
  async addCredits(
    orgId: string,
    creditsToAdd: number,
    type: 'PURCHASE' | 'RENEWAL' | 'TRIAL' | 'REFUND' | 'MANUAL',
    description?: string,
    metadata?: any,
  ): Promise<void> {
    const org = await this.prisma.organization.findUnique({
      where: { id: orgId },
      select: { credits: true, name: true },
    });

    if (!org) {
      throw new BadRequestException('Organization not found');
    }

    const balanceBefore = org.credits;
    const balanceAfter = balanceBefore + creditsToAdd;

    const transactionTypeMap: Record<string, string> = {
      PURCHASE: 'ADDITION_PURCHASE',
      RENEWAL: 'ADDITION_RENEWAL',
      TRIAL: 'ADDITION_TRIAL',
      REFUND: 'ADDITION_REFUND',
      MANUAL: 'ADDITION_MANUAL',
    };

    await this.prisma.$transaction(async (tx) => {
      // Update organization credits
      await tx.organization.update({
        where: { id: orgId },
        data: { credits: balanceAfter },
      });

      // Create audit trail
      await tx.creditTransaction.create({
        data: {
          orgId,
          amount: creditsToAdd, // Positive for addition
          balanceBefore,
          balanceAfter,
          type: transactionTypeMap[type] as any,
          description: description || `${type}: ${creditsToAdd} credits added`,
          metadata: metadata || {},
        },
      });
    });

    this.logger.log(
      `✅ Added ${creditsToAdd} credits to org ${orgId} (${org.name}): ${balanceBefore} → ${balanceAfter}`,
    );
  }

  /**
   * Get credit transaction history for an organization
   */
  async getTransactionHistory(
    orgId: string,
    limit: number = 50,
    offset: number = 0,
  ): Promise<any[]> {
    const transactions = await this.prisma.creditTransaction.findMany({
      where: { orgId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      include: {
        org: {
          select: { name: true, tier: true },
        },
      },
    });

    return transactions;
  }

  /**
   * Refund credits for failed processing
   */
  async refundCredits(projectId: string, reason: string): Promise<void> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { creditsUsed: true, orgId: true, title: true },
    });

    if (!project || !project.creditsUsed) {
      this.logger.warn(`⚠️  No credits to refund for project ${projectId}`);
      return;
    }

    await this.addCredits(
      project.orgId,
      project.creditsUsed,
      'REFUND',
      `Refund for failed project: ${project.title}. Reason: ${reason}`,
      { projectId, reason },
    );

    // Clear credits used on project
    await this.prisma.project.update({
      where: { id: projectId },
      data: { creditsUsed: null },
    });

    this.logger.log(`✅ Refunded ${project.creditsUsed} credits for project ${projectId}`);
  }

  /**
   * Check if organization needs credit renewal (monthly reset)
   */
  async needsRenewal(orgId: string): Promise<boolean> {
    const org = await this.prisma.organization.findUnique({
      where: { id: orgId },
      select: { creditsResetDate: true },
    });

    if (!org) {
      return false;
    }

    const now = new Date();
    const resetDate = new Date(org.creditsResetDate);
    const daysSinceReset = (now.getTime() - resetDate.getTime()) / (1000 * 60 * 60 * 24);

    // Renew if more than 30 days since last reset
    return daysSinceReset >= 30;
  }

  /**
   * Renew credits for an organization (monthly reset)
   */
  async renewCredits(orgId: string): Promise<void> {
    const org = await this.prisma.organization.findUnique({
      where: { id: orgId },
      select: { tier: true, name: true },
    });

    if (!org) {
      throw new BadRequestException('Organization not found');
    }

    const creditsToAdd = this.getCreditAllocation(org.tier);

    await this.prisma.$transaction(async (tx) => {
      // Reset credits to tier allocation
      await tx.organization.update({
        where: { id: orgId },
        data: {
          credits: creditsToAdd,
          creditsResetDate: new Date(),
          creditsUsedThisMonth: 0, // Reset usage counter
        },
      });

      // Create audit trail
      await tx.creditTransaction.create({
        data: {
          orgId,
          amount: creditsToAdd,
          balanceBefore: 0, // Renewal resets balance
          balanceAfter: creditsToAdd,
          type: 'ADDITION_RENEWAL',
          description: `Monthly renewal: ${creditsToAdd} credits (${org.tier} tier)`,
          metadata: {
            tier: org.tier,
            renewalDate: new Date().toISOString(),
          },
        },
      });
    });

    this.logger.log(
      `✅ Renewed ${creditsToAdd} credits for org ${orgId} (${org.name}, ${org.tier} tier)`,
    );
  }
}
