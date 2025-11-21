import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * ClerkSyncService - Syncs Clerk users with local database
 * 
 * Creates/updates User and Organization records when Clerk users sign in
 */
@Injectable()
export class ClerkSyncService {
  constructor(private prisma: PrismaService) {}

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
      const org = await this.prisma.organization.create({
        data: {
          name: `${name || email || 'User'}'s Workspace`,
          tier: 'FREE',
          credits: 60, // Initial credits
          creditsResetDate: this.getNextMonthDate(),
        },
      });

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
    }

    return user;
  }

  private getNextMonthDate(): Date {
    const date = new Date();
    date.setMonth(date.getMonth() + 1);
    return date;
  }
}
