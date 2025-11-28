import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ResendService } from '../email/resend.service';

/**
 * ClerkSyncService - Syncs Clerk users with local database
 * 
 * Creates/updates User and Organization records when Clerk users sign in
 * Triggers PLG email flows for new users
 */
@Injectable()
export class ClerkSyncService {
  private readonly logger = new Logger(ClerkSyncService.name);

  constructor(
    private prisma: PrismaService,
    private resendService: ResendService,
  ) {}

  /**
   * Get or create user and organization from Clerk user ID
   */
  async syncUser(clerkUserId: string, email?: string, name?: string) {
    // Check if user exists
    let user = await this.prisma.user.findUnique({
      where: { clerkId: clerkUserId },
      include: {
        memberships: {
          include: {
            org: true,
          },
        },
      },
    });

    if (!user) {
      // Create new user with personal organization
      const trialStartDate = new Date();
      const trialEndDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

      const org = await this.prisma.organization.create({
        data: {
          name: `${name || email || 'User'}'s Workspace`,
          tier: 'FREE',
          credits: 150, // STARTER credits for 7-day trial
          creditsResetDate: this.getNextMonthDate(),
          // Activate 7-day free trial automatically
          trialStartDate,
          trialEndDate,
          trialUsed: false,
        },
      });

      // Log trial activation
      await this.prisma.creditTransaction.create({
        data: {
          orgId: org.id,
          amount: 150,
          balanceBefore: 0,
          balanceAfter: 150,
          type: 'ADDITION_TRIAL',
          description: '7-day free trial activated - STARTER credits',
        },
      });

      this.logger.log(`🎉 New user signup! Trial activated for ${email}: ${trialStartDate.toISOString()} → ${trialEndDate.toISOString()}`);

      user = await this.prisma.user.create({
        data: {
          clerkId: clerkUserId,
          email: email || `${clerkUserId}@clerk.local`,
          name: name || 'User',
          memberships: {
            create: {
              orgId: org.id,
              role: 'OWNER',
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

      // PLG: Send welcome email immediately after signup (critical for activation)
      // Industry standard: Welcome emails have 4x higher open rates when sent instantly
      if (email && !email.includes('@clerk.local')) {
        try {
          await this.resendService.sendWelcomeEmail({
            to: email,
            userName: name,
            userEmail: email,
            tier: 'FREE (7-Day Trial)',
            credits: 150,
          });
          this.logger.log(`✅ Welcome email sent to ${email}`);
        } catch (error) {
          this.logger.error(`❌ Failed to send welcome email to ${email}:`, error);
          // Don't block user creation if email fails
        }
      }
    }

    return user;
  }

  private getNextMonthDate(): Date {
    const date = new Date();
    date.setMonth(date.getMonth() + 1);
    return date;
  }
}
