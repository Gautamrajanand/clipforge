import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { AdminGuard } from '../auth/admin.guard';
import { PrismaService } from '../prisma/prisma.service';
import { ReferralsService } from '../referrals/referrals.service';

/**
 * Admin PLG (Product-Led Growth) Controller
 * Centralized control panel for all PLG features
 */
@ApiTags('admin-plg')
@Controller('admin/plg')
@UseGuards(AdminGuard)
@ApiBearerAuth()
export class AdminPLGController {
  constructor(
    private prisma: PrismaService,
    private referrals: ReferralsService,
  ) {}

  // ============ REFERRAL PROGRAM ADMIN ============

  @Get('referrals/overview')
  @ApiOperation({ summary: 'Get referral program overview and stats' })
  async getReferralOverview() {
    const [
      totalReferrals,
      pendingReferrals,
      completedReferrals,
      rewardedReferrals,
      totalCreditsDistributed,
      topReferrers,
      recentReferrals,
    ] = await Promise.all([
      // Total referrals
      this.prisma.referral.count(),
      
      // Pending referrals
      this.prisma.referral.count({
        where: { status: 'PENDING' },
      }),
      
      // Completed referrals
      this.prisma.referral.count({
        where: { status: 'COMPLETED' },
      }),
      
      // Rewarded referrals
      this.prisma.referral.count({
        where: { status: 'REWARDED' },
      }),
      
      // Total credits distributed
      this.prisma.referral.aggregate({
        where: { status: 'REWARDED' },
        _sum: {
          referrerReward: true,
          referredReward: true,
        },
      }),
      
      // Top 10 referrers
      this.referrals.getLeaderboard(10),
      
      // Recent 20 referrals
      this.prisma.referral.findMany({
        take: 20,
        orderBy: { createdAt: 'desc' },
        include: {
          referrer: {
            select: { id: true, name: true, referralCode: true },
          },
          referred: {
            select: { id: true, name: true, createdAt: true },
          },
        },
      }),
    ]);

    const totalCreditsGiven = 
      (totalCreditsDistributed._sum.referrerReward || 0) + 
      (totalCreditsDistributed._sum.referredReward || 0);

    const conversionRate = totalReferrals > 0 
      ? ((completedReferrals + rewardedReferrals) / totalReferrals) * 100 
      : 0;

    return {
      stats: {
        total: totalReferrals,
        pending: pendingReferrals,
        completed: completedReferrals,
        rewarded: rewardedReferrals,
        conversionRate: conversionRate.toFixed(2),
        totalCreditsDistributed: totalCreditsGiven,
      },
      topReferrers,
      recentReferrals,
    };
  }

  @Get('referrals/search')
  @ApiOperation({ summary: 'Search referrals by organization name or code' })
  async searchReferrals(@Query('q') query: string) {
    const referrals = await this.prisma.referral.findMany({
      where: {
        OR: [
          { referralCode: { contains: query, mode: 'insensitive' } },
          { referrer: { name: { contains: query, mode: 'insensitive' } } },
          { referred: { name: { contains: query, mode: 'insensitive' } } },
        ],
      },
      include: {
        referrer: {
          select: { id: true, name: true, referralCode: true, tier: true },
        },
        referred: {
          select: { id: true, name: true, tier: true, createdAt: true },
        },
      },
      take: 50,
      orderBy: { createdAt: 'desc' },
    });

    return { referrals };
  }

  @Post('referrals/:referralId/complete')
  @ApiOperation({ summary: 'Manually complete a referral (admin override)' })
  async manuallyCompleteReferral(@Param('referralId') referralId: string) {
    const referral = await this.prisma.referral.findUnique({
      where: { id: referralId },
      include: { referred: true },
    });

    if (!referral) {
      throw new Error('Referral not found');
    }

    await this.referrals.completeReferral(referral.referredOrgId);
    
    return { 
      message: 'Referral completed and rewards distributed',
      referral: await this.prisma.referral.findUnique({ where: { id: referralId } }),
    };
  }

  @Delete('referrals/:referralId')
  @ApiOperation({ summary: 'Delete a referral (admin only)' })
  async deleteReferral(@Param('referralId') referralId: string) {
    await this.prisma.referral.delete({
      where: { id: referralId },
    });

    return { message: 'Referral deleted successfully' };
  }

  @Put('referrals/settings')
  @ApiOperation({ summary: 'Update referral program settings' })
  async updateReferralSettings(@Body() settings: {
    referrerReward?: number;
    referredReward?: number;
    enabled?: boolean;
  }) {
    // Store settings in database (create a Settings table if needed)
    // For now, we'll return the settings
    // TODO: Implement settings persistence
    return {
      message: 'Settings updated (not yet persisted - implement Settings table)',
      settings,
    };
  }

  // ============ ONBOARDING ADMIN ============

  @Get('onboarding/stats')
  @ApiOperation({ summary: 'Get onboarding completion stats' })
  async getOnboardingStats() {
    // TODO: Implement when onboarding is built
    return {
      message: 'Onboarding stats - to be implemented',
      stats: {
        totalUsers: 0,
        completedOnboarding: 0,
        droppedAtStep: {},
      },
    };
  }

  // ============ IN-APP MESSAGING ADMIN ============

  @Get('messaging/stats')
  @ApiOperation({ summary: 'Get in-app messaging stats' })
  async getMessagingStats() {
    // TODO: Implement when messaging is built
    return {
      message: 'Messaging stats - to be implemented',
      stats: {
        totalMessages: 0,
        openRate: 0,
        clickRate: 0,
      },
    };
  }

  // ============ NPS & FEEDBACK ADMIN ============

  @Get('nps/overview')
  @ApiOperation({ summary: 'Get NPS scores and feedback overview' })
  async getNPSOverview() {
    // TODO: Implement when NPS is built
    return {
      message: 'NPS overview - to be implemented',
      stats: {
        averageScore: 0,
        promoters: 0,
        passives: 0,
        detractors: 0,
        npsScore: 0,
      },
    };
  }

  // ============ SOCIAL PROOF ADMIN ============

  @Get('social-proof/testimonials')
  @ApiOperation({ summary: 'Get all testimonials' })
  async getTestimonials() {
    // TODO: Implement when testimonials are built
    return {
      message: 'Testimonials - to be implemented',
      testimonials: [],
    };
  }

  @Post('social-proof/testimonials')
  @ApiOperation({ summary: 'Add a new testimonial' })
  async addTestimonial(@Body() testimonial: {
    userName: string;
    userTitle: string;
    userAvatar?: string;
    content: string;
    rating: number;
    featured: boolean;
  }) {
    // TODO: Implement testimonial creation
    return {
      message: 'Testimonial added - to be implemented',
      testimonial,
    };
  }

  // ============ UPGRADE NUDGES ADMIN ============

  @Get('nudges/stats')
  @ApiOperation({ summary: 'Get upgrade nudge performance stats' })
  async getNudgeStats() {
    // TODO: Implement when nudges are built
    return {
      message: 'Nudge stats - to be implemented',
      stats: {
        totalShown: 0,
        clickRate: 0,
        conversionRate: 0,
      },
    };
  }

  @Put('nudges/settings')
  @ApiOperation({ summary: 'Update upgrade nudge settings' })
  async updateNudgeSettings(@Body() settings: {
    enabled?: boolean;
    triggers?: string[];
    frequency?: string;
  }) {
    // TODO: Implement settings persistence
    return {
      message: 'Nudge settings updated - to be implemented',
      settings,
    };
  }

  // ============ ANALYTICS ADMIN ============

  @Get('analytics/growth')
  @ApiOperation({ summary: 'Get PLG growth metrics' })
  async getGrowthMetrics(@Query('period') period: string = '30d') {
    const days = period === '7d' ? 7 : period === '90d' ? 90 : 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [newUsers, activeUsers, conversions] = await Promise.all([
      // New users
      this.prisma.organization.count({
        where: { createdAt: { gte: startDate } },
      }),
      
      // Active users (with exports)
      this.prisma.organization.count({
        where: {
          projects: {
            some: {
              exports: {
                some: {
                  createdAt: { gte: startDate },
                },
              },
            },
          },
        },
      }),
      
      // Conversions (FREE → PAID)
      this.prisma.organization.count({
        where: {
          tier: { not: 'FREE' },
          updatedAt: { gte: startDate },
        },
      }),
    ]);

    return {
      period,
      metrics: {
        newUsers,
        activeUsers,
        conversions,
        activationRate: newUsers > 0 ? ((activeUsers / newUsers) * 100).toFixed(2) : 0,
        conversionRate: newUsers > 0 ? ((conversions / newUsers) * 100).toFixed(2) : 0,
      },
    };
  }
}
