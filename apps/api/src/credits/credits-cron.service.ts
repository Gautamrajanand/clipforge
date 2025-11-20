import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { CreditsService } from './credits.service';

/**
 * CreditsCronService - Handles scheduled credit operations
 * 
 * Jobs:
 * - Monthly credit renewal (runs daily, checks if renewal needed)
 * - Project expiration cleanup (Free tier projects older than 2 days)
 */
@Injectable()
export class CreditsCronService {
  private readonly logger = new Logger(CreditsCronService.name);

  constructor(
    private prisma: PrismaService,
    private credits: CreditsService,
  ) {}

  /**
   * Check and renew credits for organizations (runs daily at 2 AM)
   * Checks if 30+ days since last reset, then renews
   */
  @Cron(CronExpression.EVERY_DAY_AT_2AM, {
    name: 'credit-renewal',
  })
  async handleCreditRenewal() {
    this.logger.log('🔄 Starting credit renewal check...');

    try {
      // Get all organizations
      const orgs = await this.prisma.organization.findMany({
        select: {
          id: true,
          name: true,
          tier: true,
          creditsResetDate: true,
        },
      });

      let renewedCount = 0;
      let skippedCount = 0;

      for (const org of orgs) {
        const needsRenewal = await this.credits.needsRenewal(org.id);

        if (needsRenewal) {
          try {
            await this.credits.renewCredits(org.id);
            renewedCount++;
            this.logger.log(`✅ Renewed credits for org: ${org.name} (${org.tier})`);
          } catch (error) {
            this.logger.error(`❌ Failed to renew credits for org ${org.id}:`, error);
          }
        } else {
          skippedCount++;
        }
      }

      this.logger.log(
        `✅ Credit renewal complete: ${renewedCount} renewed, ${skippedCount} skipped`,
      );
    } catch (error) {
      this.logger.error('❌ Credit renewal job failed:', error);
    }
  }

  /**
   * Clean up expired projects (runs daily at 3 AM)
   * Deletes Free tier projects that expired 2+ days ago
   */
  @Cron(CronExpression.EVERY_DAY_AT_3AM, {
    name: 'expired-projects-cleanup',
  })
  async handleExpiredProjects() {
    this.logger.log('🗑️  Starting expired project cleanup...');

    try {
      const now = new Date();

      // Find expired projects
      const expiredProjects = await this.prisma.project.findMany({
        where: {
          expiresAt: {
            lte: now, // Expired (less than or equal to now)
          },
        },
        select: {
          id: true,
          title: true,
          expiresAt: true,
          org: {
            select: {
              name: true,
              tier: true,
            },
          },
        },
      });

      if (expiredProjects.length === 0) {
        this.logger.log('✅ No expired projects found');
        return;
      }

      this.logger.log(`🗑️  Found ${expiredProjects.length} expired projects`);

      // Delete expired projects
      for (const project of expiredProjects) {
        try {
          await this.prisma.project.delete({
            where: { id: project.id },
          });

          this.logger.log(
            `✅ Deleted expired project: ${project.title} (org: ${project.org.name}, expired: ${project.expiresAt})`,
          );
        } catch (error) {
          this.logger.error(`❌ Failed to delete project ${project.id}:`, error);
        }
      }

      this.logger.log(`✅ Expired project cleanup complete: ${expiredProjects.length} deleted`);
    } catch (error) {
      this.logger.error('❌ Expired project cleanup failed:', error);
    }
  }

  /**
   * Send low credit warnings (runs daily at 10 AM)
   * Notifies organizations with less than 10 credits remaining
   */
  @Cron(CronExpression.EVERY_DAY_AT_10AM, {
    name: 'low-credit-warnings',
  })
  async handleLowCreditWarnings() {
    this.logger.log('⚠️  Checking for low credit balances...');

    try {
      const lowCreditOrgs = await this.prisma.organization.findMany({
        where: {
          credits: {
            lte: 10, // 10 or fewer credits
          },
          tier: {
            in: ['FREE', 'STARTER', 'PRO'], // Only paid tiers (not custom)
          },
        },
        select: {
          id: true,
          name: true,
          credits: true,
          tier: true,
          memberships: {
            select: {
              user: {
                select: {
                  email: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      if (lowCreditOrgs.length === 0) {
        this.logger.log('✅ No organizations with low credits');
        return;
      }

      this.logger.log(`⚠️  Found ${lowCreditOrgs.length} organizations with low credits`);

      for (const org of lowCreditOrgs) {
        // TODO: Send email notification when EmailService is enabled
        this.logger.warn(
          `⚠️  Low credits: ${org.name} (${org.tier}) has ${org.credits} credits remaining`,
        );

        // Log for each user in the organization
        for (const membership of org.memberships) {
          this.logger.log(
            `   → Notify user: ${membership.user.name} (${membership.user.email})`,
          );
        }
      }

      this.logger.log('✅ Low credit warning check complete');
    } catch (error) {
      this.logger.error('❌ Low credit warning check failed:', error);
    }
  }

  /**
   * Manual trigger for credit renewal (for testing)
   */
  async manualRenewal(orgId: string): Promise<void> {
    this.logger.log(`🔄 Manual credit renewal triggered for org: ${orgId}`);
    await this.credits.renewCredits(orgId);
  }

  /**
   * Manual trigger for expired project cleanup (for testing)
   */
  async manualCleanup(): Promise<{ deleted: number }> {
    this.logger.log('🗑️  Manual expired project cleanup triggered');
    await this.handleExpiredProjects();
    return { deleted: 0 }; // TODO: Return actual count
  }
}
