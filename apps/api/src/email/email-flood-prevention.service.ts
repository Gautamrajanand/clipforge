import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Email Flood Prevention Service
 * Prevents overwhelming users with too many emails
 */

export interface EmailSendCheck {
  canSend: boolean;
  reason?: string;
  nextAvailableAt?: Date;
}

@Injectable()
export class EmailFloodPreventionService {
  private readonly logger = new Logger(EmailFloodPreventionService.name);
  private readonly MAX_EMAILS_PER_DAY = 2;
  private readonly COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 hours

  // Email types that are exempt from flood prevention
  private readonly TRANSACTIONAL_TYPES = [
    'welcome',
    'processing-complete',
    'processing-started',
    'payment-failed',
    'credit-adjustment',
  ];

  constructor(private prisma: PrismaService) {}

  /**
   * Check if email can be sent to user
   */
  async canSendEmail(
    userId: string,
    emailType: string,
  ): Promise<EmailSendCheck> {
    try {
      // Transactional emails always allowed
      if (this.TRANSACTIONAL_TYPES.includes(emailType)) {
        this.logger.debug(
          `Email type ${emailType} is transactional, allowing`,
        );
        return { canSend: true };
      }

      // Check email preferences
      const preferences = await this.getEmailPreferences(userId);
      if (!this.isEmailTypeEnabled(emailType, preferences)) {
        this.logger.debug(
          `User ${userId} has disabled ${emailType} emails`,
        );
        return {
          canSend: false,
          reason: 'User has disabled this email type',
        };
      }

      // Check daily limit
      const dailyCheck = await this.checkDailyLimit(userId);
      if (!dailyCheck.canSend) {
        return dailyCheck;
      }

      // Check cooldown for this specific email type
      const cooldownCheck = await this.checkCooldown(userId, emailType);
      if (!cooldownCheck.canSend) {
        return cooldownCheck;
      }

      return { canSend: true };
    } catch (error) {
      this.logger.error(
        `Error checking email send permission: ${error.message}`,
      );
      // Fail open - allow email if check fails
      return { canSend: true };
    }
  }

  /**
   * Record that an email was sent
   */
  async recordEmailSent(userId: string, emailType: string): Promise<void> {
    try {
      // Create email log entry
      await this.prisma.emailLog.create({
        data: {
          userId,
          emailType,
          sentAt: new Date(),
        },
      });

      this.logger.debug(`Recorded ${emailType} email sent to ${userId}`);
    } catch (error) {
      this.logger.error(`Error recording email: ${error.message}`);
    }
  }

  /**
   * Check daily email limit
   */
  private async checkDailyLimit(userId: string): Promise<EmailSendCheck> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const emailsSentToday = await this.prisma.emailLog.count({
      where: {
        userId,
        sentAt: {
          gte: today,
        },
        emailType: {
          notIn: this.TRANSACTIONAL_TYPES,
        },
      },
    });

    if (emailsSentToday >= this.MAX_EMAILS_PER_DAY) {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      this.logger.debug(
        `User ${userId} has reached daily email limit (${emailsSentToday}/${this.MAX_EMAILS_PER_DAY})`,
      );

      return {
        canSend: false,
        reason: `Daily email limit reached (${this.MAX_EMAILS_PER_DAY} per day)`,
        nextAvailableAt: tomorrow,
      };
    }

    return { canSend: true };
  }

  /**
   * Check cooldown for specific email type
   */
  private async checkCooldown(
    userId: string,
    emailType: string,
  ): Promise<EmailSendCheck> {
    const cooldownStart = new Date(Date.now() - this.COOLDOWN_MS);

    const lastSent = await this.prisma.emailLog.findFirst({
      where: {
        userId,
        emailType,
        sentAt: {
          gte: cooldownStart,
        },
      },
      orderBy: {
        sentAt: 'desc',
      },
    });

    if (lastSent) {
      const nextAvailable = new Date(
        lastSent.sentAt.getTime() + this.COOLDOWN_MS,
      );
      const hoursRemaining = Math.ceil(
        (nextAvailable.getTime() - Date.now()) / (60 * 60 * 1000),
      );

      this.logger.debug(
        `Email type ${emailType} for user ${userId} is in cooldown (${hoursRemaining}h remaining)`,
      );

      return {
        canSend: false,
        reason: `Email type in cooldown (${hoursRemaining}h remaining)`,
        nextAvailableAt: nextAvailable,
      };
    }

    return { canSend: true };
  }

  /**
   * Get user email preferences
   */
  private async getEmailPreferences(userId: string): Promise<any> {
    // TODO: Implement email preferences table
    // For now, return default preferences
    return this.getDefaultPreferences();
  }

  /**
   * Check if email type is enabled in preferences
   */
  private isEmailTypeEnabled(emailType: string, preferences: any): boolean {
    // Map email types to preference categories
    const categoryMap: Record<string, string> = {
      'onboarding-day1': 'productUpdates',
      'onboarding-day3': 'productUpdates',
      'onboarding-day5': 'productUpdates',
      'onboarding-day7': 'productUpdates',
      'onboarding-day14': 'productUpdates',
      'credits-low': 'accountAndCredits',
      'trial-expiry': 'accountAndCredits',
      'weekly-summary': 'usageAndActivity',
      'monthly-report': 'usageAndActivity',
      'inactivity': 'usageAndActivity',
      'upgrade-after-exports': 'marketing',
      'feature-announcement': 'productUpdates',
    };

    const category = categoryMap[emailType];
    if (!category) {
      // Unknown email type, allow by default
      return true;
    }

    return preferences[category] !== false;
  }

  /**
   * Get default email preferences
   */
  private getDefaultPreferences(): any {
    return {
      transactional: true, // Always true
      productUpdates: true,
      accountAndCredits: true,
      usageAndActivity: true,
      marketing: true,
    };
  }

  /**
   * Get email stats for user
   */
  async getEmailStats(userId: string): Promise<{
    sentToday: number;
    sentThisWeek: number;
    sentThisMonth: number;
    canSendMore: boolean;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [sentToday, sentThisWeek, sentThisMonth] = await Promise.all([
      this.prisma.emailLog.count({
        where: {
          userId,
          sentAt: { gte: today },
          emailType: { notIn: this.TRANSACTIONAL_TYPES },
        },
      }),
      this.prisma.emailLog.count({
        where: {
          userId,
          sentAt: { gte: weekAgo },
          emailType: { notIn: this.TRANSACTIONAL_TYPES },
        },
      }),
      this.prisma.emailLog.count({
        where: {
          userId,
          sentAt: { gte: monthAgo },
          emailType: { notIn: this.TRANSACTIONAL_TYPES },
        },
      }),
    ]);

    return {
      sentToday,
      sentThisWeek,
      sentThisMonth,
      canSendMore: sentToday < this.MAX_EMAILS_PER_DAY,
    };
  }
}
