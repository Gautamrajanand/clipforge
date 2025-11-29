import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { ResendService } from './resend.service';

/**
 * EmailSchedulerService - Automated PLG email campaigns
 * 
 * Handles all scheduled and behavioral email triggers:
 * - Onboarding sequences (Day 1, Day 3)
 * - Trial expiry warnings (3 days before)
 * - Weekly usage summaries (every Monday)
 * - Inactivity re-engagement (7 days)
 * 
 * Industry standards:
 * - Onboarding: 2-3x activation improvement
 * - Weekly summaries: 15-20% engagement boost
 * - Inactivity: 10-15% reactivation rate
 */
@Injectable()
export class EmailSchedulerService {
  private readonly logger = new Logger(EmailSchedulerService.name);

  constructor(
    private prisma: PrismaService,
    private resendService: ResendService,
  ) {}

  /**
   * Onboarding Day 1 Email
   * Runs daily at 9 AM
   * Sends to users who signed up 24 hours ago
   * Different message if they've created a clip or not
   */
  @Cron('30 3 * * *') // Every day at 9 AM IST (3:30 AM UTC)
  async sendOnboardingDay1Emails(): Promise<void> {
    this.logger.log('🚀 Running Onboarding Day 1 email job...');

    try {
      // Find users who signed up exactly 1 day ago
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);
      oneDayAgo.setHours(0, 0, 0, 0);

      const oneDayAgoEnd = new Date(oneDayAgo);
      oneDayAgoEnd.setHours(23, 59, 59, 999);

      const users = await this.prisma.user.findMany({
        where: {
          createdAt: {
            gte: oneDayAgo,
            lte: oneDayAgoEnd,
          },
          email: {
            not: {
              contains: '@clerk.local',
            },
          },
        },
        include: {
          memberships: {
            include: {
              org: true,
            },
          },
        },
      });

      this.logger.log(`Found ${users.length} users for Day 1 onboarding`);

      for (const user of users) {
        try {
          // Check if user has created any clips
          const clipCount = await this.prisma.moment.count({
            where: {
              project: {
                orgId: user.memberships[0]?.org.id,
              },
            },
          });

          const org = user.memberships[0]?.org;
          if (!org) continue;

          await this.resendService.sendOnboardingDay1Email({
            to: user.email,
            userName: user.name,
            userEmail: user.email,
            hasCreatedClip: clipCount > 0,
            credits: org.credits,
          });

          this.logger.log(`✅ Sent Day 1 email to ${user.email} (clips: ${clipCount})`);
        } catch (error) {
          this.logger.error(`Failed to send Day 1 email to ${user.email}:`, error);
        }
      }

      this.logger.log(`✅ Completed Day 1 onboarding emails (${users.length} sent)`);
    } catch (error) {
      this.logger.error('Failed to run Day 1 onboarding job:', error);
    }
  }

  /**
   * Onboarding Day 3 Email
   * Runs daily at 9 AM
   * Sends to users who signed up 3 days ago
   * Includes usage stats and feature education
   */
  @Cron('30 3 * * *') // Every day at 9 AM IST (3:30 AM UTC)
  async sendOnboardingDay3Emails(): Promise<void> {
    this.logger.log('🚀 Running Onboarding Day 3 email job...');

    try {
      // Find users who signed up exactly 3 days ago
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      threeDaysAgo.setHours(0, 0, 0, 0);

      const threeDaysAgoEnd = new Date(threeDaysAgo);
      threeDaysAgoEnd.setHours(23, 59, 59, 999);

      const users = await this.prisma.user.findMany({
        where: {
          createdAt: {
            gte: threeDaysAgo,
            lte: threeDaysAgoEnd,
          },
          email: {
            not: {
              contains: '@clerk.local',
            },
          },
        },
        include: {
          memberships: {
            include: {
              org: true,
            },
          },
        },
      });

      this.logger.log(`Found ${users.length} users for Day 3 onboarding`);

      for (const user of users) {
        try {
          const org = user.memberships[0]?.org;
          if (!org) continue;

          // Get user's stats
          const clipsCreated = await this.prisma.moment.count({
            where: {
              project: {
                orgId: org.id,
              },
            },
          });

          const creditsUsed = await this.prisma.creditTransaction.aggregate({
            where: {
              orgId: org.id,
              amount: {
                lt: 0, // Negative amounts are deductions
              },
            },
            _sum: {
              amount: true,
            },
          });

          await this.resendService.sendOnboardingDay3Email({
            to: user.email,
            userName: user.name,
            clipsCreated,
            creditsUsed: Math.abs(creditsUsed._sum.amount || 0),
            creditsRemaining: org.credits,
          });

          this.logger.log(`✅ Sent Day 3 email to ${user.email} (clips: ${clipsCreated})`);
        } catch (error) {
          this.logger.error(`Failed to send Day 3 email to ${user.email}:`, error);
        }
      }

      this.logger.log(`✅ Completed Day 3 onboarding emails (${users.length} sent)`);
    } catch (error) {
      this.logger.error('Failed to run Day 3 onboarding job:', error);
    }
  }

  /**
   * Trial Expiry Warning Email
   * Runs daily at 9 AM
   * Sends to users whose trial expires in 3 days
   * Critical for conversion (15-25% conversion rate)
   */
  @Cron('30 3 * * *') // Every day at 9 AM IST (3:30 AM UTC)
  async sendTrialExpiryEmails(): Promise<void> {
    this.logger.log('🚀 Running Trial Expiry email job...');

    try {
      // Find orgs whose trial expires in exactly 3 days
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
      threeDaysFromNow.setHours(0, 0, 0, 0);

      const threeDaysFromNowEnd = new Date(threeDaysFromNow);
      threeDaysFromNowEnd.setHours(23, 59, 59, 999);

      const orgs = await this.prisma.organization.findMany({
        where: {
          tier: 'FREE',
          trialEndDate: {
            gte: threeDaysFromNow,
            lte: threeDaysFromNowEnd,
          },
          trialUsed: false,
        },
        include: {
          memberships: {
            include: {
              user: true,
            },
          },
        },
      });

      this.logger.log(`Found ${orgs.length} orgs with trials expiring in 3 days`);

      for (const org of orgs) {
        for (const membership of org.memberships) {
          const user = membership.user;
          if (user.email.includes('@clerk.local')) continue;

          try {
            await this.resendService.sendTrialExpiryEmail({
              to: user.email,
              userName: user.name,
              daysLeft: 3,
              expiryDate: org.trialEndDate?.toLocaleDateString() || 'soon',
            });

            this.logger.log(`✅ Sent trial expiry email to ${user.email}`);
          } catch (error) {
            this.logger.error(`Failed to send trial expiry email to ${user.email}:`, error);
          }
        }
      }

      this.logger.log(`✅ Completed trial expiry emails (${orgs.length} orgs)`);
    } catch (error) {
      this.logger.error('Failed to run trial expiry job:', error);
    }
  }

  /**
   * Weekly Usage Summary Email
   * Runs every Monday at 9 AM
   * Sends weekly stats to all active users
   * Drives 15-20% engagement boost
   */
  @Cron('30 3 * * 1') // Every Monday at 9 AM IST (3:30 AM UTC)
  async sendWeeklySummaryEmails(): Promise<void> {
    this.logger.log('🚀 Running Weekly Summary email job...');

    try {
      // Get date range for last week
      const today = new Date();
      const lastWeekStart = new Date(today);
      lastWeekStart.setDate(today.getDate() - 7);
      lastWeekStart.setHours(0, 0, 0, 0);

      const lastWeekEnd = new Date(today);
      lastWeekEnd.setHours(0, 0, 0, 0);

      // Find all active users (created at least a week ago)
      const users = await this.prisma.user.findMany({
        where: {
          createdAt: {
            lt: lastWeekStart,
          },
          email: {
            not: {
              contains: '@clerk.local',
            },
          },
        },
        include: {
          memberships: {
            include: {
              org: true,
            },
          },
        },
      });

      this.logger.log(`Found ${users.length} users for weekly summary`);

      for (const user of users) {
        try {
          const org = user.memberships[0]?.org;
          if (!org) continue;

          // Get weekly stats
          const clipsCreated = await this.prisma.moment.count({
            where: {
              project: {
                orgId: org.id,
              },
              createdAt: {
                gte: lastWeekStart,
                lt: lastWeekEnd,
              },
            },
          });

          const videosProcessed = await this.prisma.project.count({
            where: {
              orgId: org.id,
              createdAt: {
                gte: lastWeekStart,
                lt: lastWeekEnd,
              },
            },
          });

          const creditsUsed = await this.prisma.creditTransaction.aggregate({
            where: {
              orgId: org.id,
              createdAt: {
                gte: lastWeekStart,
                lt: lastWeekEnd,
              },
              amount: {
                lt: 0,
              },
            },
            _sum: {
              amount: true,
            },
          });

          // Determine most used feature (simplified)
          const mostUsedFeature = clipsCreated > 0 ? 'AI Clips' : 'AI Reframe';

          await this.resendService.sendWeeklySummaryEmail({
            to: user.email,
            userName: user.name,
            weekStart: lastWeekStart.toLocaleDateString(),
            weekEnd: lastWeekEnd.toLocaleDateString(),
            clipsCreated,
            videosProcessed,
            creditsUsed: Math.abs(creditsUsed._sum.amount || 0),
            creditsRemaining: org.credits,
            totalMinutesProcessed: Math.abs(creditsUsed._sum.amount || 0), // 1 credit = 1 minute
            mostUsedFeature,
            tier: org.tier,
          });

          this.logger.log(`✅ Sent weekly summary to ${user.email} (clips: ${clipsCreated})`);
        } catch (error) {
          this.logger.error(`Failed to send weekly summary to ${user.email}:`, error);
        }
      }

      this.logger.log(`✅ Completed weekly summary emails (${users.length} sent)`);
    } catch (error) {
      this.logger.error('Failed to run weekly summary job:', error);
    }
  }

  /**
   * Inactivity Re-engagement Email
   * Runs daily at 9 AM
   * Sends to users who haven't logged in for 7 days
   * Different message for trial vs paid users
   */
  @Cron('30 3 * * *') // Every day at 9 AM IST (3:30 AM UTC)
  async sendInactivityEmails(): Promise<void> {
    this.logger.log('🚀 Running Inactivity Re-engagement email job...');

    try {
      // Find users whose last activity was exactly 7 days ago
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      sevenDaysAgo.setHours(0, 0, 0, 0);

      const sevenDaysAgoEnd = new Date(sevenDaysAgo);
      sevenDaysAgoEnd.setHours(23, 59, 59, 999);

      const users = await this.prisma.user.findMany({
        where: {
          updatedAt: {
            gte: sevenDaysAgo,
            lte: sevenDaysAgoEnd,
          },
          email: {
            not: {
              contains: '@clerk.local',
            },
          },
        },
        include: {
          memberships: {
            include: {
              org: true,
            },
          },
        },
      });

      this.logger.log(`Found ${users.length} inactive users (7 days)`);

      for (const user of users) {
        try {
          const org = user.memberships[0]?.org;
          if (!org) continue;

          // Get last clip created
          const lastClip = await this.prisma.moment.findFirst({
            where: {
              project: {
                orgId: org.id,
              },
            },
            orderBy: {
              createdAt: 'desc',
            },
            select: {
              title: true,
            },
          });

          // Calculate trial days left (if applicable)
          let trialDaysLeft: number | undefined;
          if (org.tier === 'FREE' && org.trialEndDate) {
            const now = new Date();
            const daysLeft = Math.ceil((org.trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            trialDaysLeft = Math.max(0, daysLeft);
          }

          await this.resendService.sendInactivityReengagementEmail({
            to: user.email,
            userName: user.name,
            daysSinceLastActivity: 7,
            lastClipCreated: lastClip?.title,
            creditsRemaining: org.credits,
            tier: org.tier,
            trialDaysLeft,
          });

          this.logger.log(`✅ Sent inactivity email to ${user.email}`);
        } catch (error) {
          this.logger.error(`Failed to send inactivity email to ${user.email}:`, error);
        }
      }

      this.logger.log(`✅ Completed inactivity emails (${users.length} sent)`);
    } catch (error) {
      this.logger.error('Failed to run inactivity job:', error);
    }
  }
}
