import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { ResendService } from '../email/resend.service';

/**
 * CreditMonitorService - PLG credit monitoring and alerts
 * 
 * Monitors credit usage and sends timely warnings to drive upgrades
 * Industry standard: Alert at 20% remaining to maximize conversion
 */
@Injectable()
export class CreditMonitorService {
  private readonly logger = new Logger(CreditMonitorService.name);
  private readonly LOW_CREDIT_THRESHOLD = 0.2; // 20% remaining
  private sentWarnings = new Set<string>(); // Track sent warnings to avoid spam

  constructor(
    private prisma: PrismaService,
    private resendService: ResendService,
  ) {}

  /**
   * Check for low credits after each credit deduction
   * Called synchronously to provide instant feedback
   */
  async checkCreditsAfterDeduction(orgId: string): Promise<void> {
    try {
      const org = await this.prisma.organization.findUnique({
        where: { id: orgId },
        include: {
          memberships: {
            include: {
              user: true,
            },
          },
        },
      });

      if (!org) return;

      // Calculate credit allocation based on tier
      const allocation = this.getCreditAllocation(org.tier);
      const percentage = org.credits / allocation;

      // PLG: Send warning when credits drop below 20%
      // This is the optimal time to drive upgrade decisions
      if (percentage <= this.LOW_CREDIT_THRESHOLD && percentage > 0) {
        const warningKey = `${orgId}-${Math.floor(org.credits / 10)}`; // Group by tens
        
        if (!this.sentWarnings.has(warningKey)) {
          this.sentWarnings.add(warningKey);
          
          // Send to all org members (typically just owner for personal workspace)
          for (const membership of org.memberships) {
            const user = membership.user;
            if (user.email && !user.email.includes('@clerk.local')) {
              try {
                await this.resendService.sendCreditLowEmail({
                  to: user.email,
                  userName: user.name,
                  currentCredits: org.credits,
                  totalCredits: allocation,
                  tier: org.tier,
                  resetDate: org.creditsResetDate?.toLocaleDateString(),
                });
                
                this.logger.log(`📧 Low credit warning sent to ${user.email} (${org.credits}/${allocation} credits)`);
              } catch (error) {
                this.logger.error(`Failed to send low credit email to ${user.email}:`, error);
              }
            }
          }
        }
      }

      // Clear warning cache when credits are replenished
      if (percentage > this.LOW_CREDIT_THRESHOLD) {
        const keysToRemove = Array.from(this.sentWarnings).filter(key => key.startsWith(orgId));
        keysToRemove.forEach(key => this.sentWarnings.delete(key));
      }
    } catch (error) {
      this.logger.error(`Error checking credits for org ${orgId}:`, error);
    }
  }

  /**
   * Periodic check for low credits (backup to real-time checks)
   * Runs every hour to catch any missed warnings
   */
  @Cron(CronExpression.EVERY_HOUR)
  async checkAllOrganizationsForLowCredits(): Promise<void> {
    this.logger.log('🔍 Running periodic low credit check...');

    try {
      const orgs = await this.prisma.organization.findMany({
        where: {
          tier: {
            not: 'BUSINESS', // BUSINESS has unlimited credits
          },
        },
        include: {
          memberships: {
            include: {
              user: true,
            },
          },
        },
      });

      for (const org of orgs) {
        const allocation = this.getCreditAllocation(org.tier);
        const percentage = org.credits / allocation;

        if (percentage <= this.LOW_CREDIT_THRESHOLD && percentage > 0) {
          await this.checkCreditsAfterDeduction(org.id);
        }
      }

      this.logger.log('✅ Periodic low credit check complete');
    } catch (error) {
      this.logger.error('Error in periodic credit check:', error);
    }
  }

  /**
   * Get credit allocation by tier
   */
  private getCreditAllocation(tier: string): number {
    switch (tier) {
      case 'FREE':
        return 60;
      case 'STARTER':
        return 150;
      case 'PRO':
        return 300;
      case 'BUSINESS':
        return 999999; // Effectively unlimited
      default:
        return 60;
    }
  }

  /**
   * Clear warning cache (useful for testing)
   */
  clearWarningCache(): void {
    this.sentWarnings.clear();
    this.logger.log('Warning cache cleared');
  }
}
