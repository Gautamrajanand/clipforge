import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Get comprehensive analytics metrics for admin dashboard
   */
  async getAnalytics() {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    const [
      mrr,
      churn,
      ltv,
      arpu,
      revenueByTier,
      growthMetrics,
      cohortData,
    ] = await Promise.all([
      this.calculateMRR(),
      this.calculateChurn(thirtyDaysAgo),
      this.calculateLTV(),
      this.calculateARPU(),
      this.getRevenueByTier(),
      this.getGrowthMetrics(thirtyDaysAgo, sixtyDaysAgo, ninetyDaysAgo),
      this.getCohortAnalysis(),
    ]);

    return {
      mrr,
      churn,
      ltv,
      arpu,
      revenueByTier,
      growthMetrics,
      cohortData,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Calculate Monthly Recurring Revenue (MRR)
   */
  private async calculateMRR() {
    const paidOrgs = await this.prisma.organization.findMany({
      where: {
        tier: {
          not: 'FREE',
        },
      },
      select: {
        tier: true,
      },
    });

    const tierPricing = {
      STARTER: 29,
      PRO: 79,
      BUSINESS: 99,
    };

    const mrr = paidOrgs.reduce((total, org) => {
      return total + (tierPricing[org.tier] || 0);
    }, 0);

    const arr = mrr * 12; // Annual Recurring Revenue

    return {
      current: mrr,
      arr,
      growth: await this.getMRRGrowth(),
    };
  }

  /**
   * Calculate MRR growth rate
   */
  private async getMRRGrowth() {
    // Get MRR from last month
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const currentPaidOrgs = await this.prisma.organization.count({
      where: { tier: { not: 'FREE' } },
    });

    const lastMonthPaidOrgs = await this.prisma.organization.count({
      where: {
        tier: { not: 'FREE' },
        createdAt: { lte: lastMonth },
      },
    });

    if (lastMonthPaidOrgs === 0) return 0;

    const growth = ((currentPaidOrgs - lastMonthPaidOrgs) / lastMonthPaidOrgs) * 100;
    return Math.round(growth * 10) / 10; // Round to 1 decimal
  }

  /**
   * Calculate Churn Rate
   */
  private async calculateChurn(thirtyDaysAgo: Date) {
    // Count organizations that downgraded to FREE in last 30 days
    const churned = await this.prisma.organization.count({
      where: {
        tier: 'FREE',
        updatedAt: {
          gte: thirtyDaysAgo,
        },
      },
    });

    const totalPaid = await this.prisma.organization.count({
      where: {
        tier: { not: 'FREE' },
      },
    });

    const churnRate = totalPaid > 0 ? (churned / (totalPaid + churned)) * 100 : 0;

    return {
      rate: Math.round(churnRate * 10) / 10,
      churned,
      retained: totalPaid,
    };
  }

  /**
   * Calculate Customer Lifetime Value (LTV)
   */
  private async calculateLTV() {
    const avgRevenue = await this.calculateARPU();
    const churnData = await this.calculateChurn(
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    );

    // LTV = ARPU / Churn Rate (monthly)
    const monthlyChurnRate = churnData.rate / 100;
    const ltv = monthlyChurnRate > 0 ? avgRevenue / monthlyChurnRate : avgRevenue * 12;

    return {
      value: Math.round(ltv),
      arpu: avgRevenue,
      churnRate: churnData.rate,
    };
  }

  /**
   * Calculate Average Revenue Per User (ARPU)
   */
  private async calculateARPU() {
    const paidOrgs = await this.prisma.organization.findMany({
      where: {
        tier: { not: 'FREE' },
      },
      select: {
        tier: true,
      },
    });

    const tierPricing = {
      STARTER: 29,
      PRO: 79,
      BUSINESS: 99,
    };

    if (paidOrgs.length === 0) return 0;

    const totalRevenue = paidOrgs.reduce((total, org) => {
      return total + (tierPricing[org.tier] || 0);
    }, 0);

    return Math.round(totalRevenue / paidOrgs.length);
  }

  /**
   * Get revenue breakdown by tier
   */
  private async getRevenueByTier() {
    const orgsByTier = await this.prisma.organization.groupBy({
      by: ['tier'],
      _count: true,
    });

    const tierPricing = {
      FREE: 0,
      STARTER: 29,
      PRO: 79,
      BUSINESS: 99,
    };

    return orgsByTier.map((item) => ({
      tier: item.tier,
      count: item._count,
      revenue: item._count * (tierPricing[item.tier] || 0),
    }));
  }

  /**
   * Get growth metrics over time
   */
  private async getGrowthMetrics(
    thirtyDaysAgo: Date,
    sixtyDaysAgo: Date,
    ninetyDaysAgo: Date,
  ) {
    const [current, last30, last60, last90] = await Promise.all([
      this.prisma.organization.count({ where: { tier: { not: 'FREE' } } }),
      this.prisma.organization.count({
        where: { tier: { not: 'FREE' }, createdAt: { lte: thirtyDaysAgo } },
      }),
      this.prisma.organization.count({
        where: { tier: { not: 'FREE' }, createdAt: { lte: sixtyDaysAgo } },
      }),
      this.prisma.organization.count({
        where: { tier: { not: 'FREE' }, createdAt: { lte: ninetyDaysAgo } },
      }),
    ]);

    return {
      current,
      last30Days: current - last30,
      last60Days: current - last60,
      last90Days: current - last90,
      growthRate30: last30 > 0 ? ((current - last30) / last30) * 100 : 0,
      growthRate60: last60 > 0 ? ((current - last60) / last60) * 100 : 0,
      growthRate90: last90 > 0 ? ((current - last90) / last90) * 100 : 0,
    };
  }

  /**
   * Get cohort analysis (retention by signup month)
   */
  private async getCohortAnalysis() {
    // Get organizations grouped by signup month
    const orgs = await this.prisma.organization.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000), // Last 6 months
        },
      },
      select: {
        id: true,
        createdAt: true,
        tier: true,
        updatedAt: true,
      },
    });

    // Group by month
    const cohorts = {};
    orgs.forEach((org) => {
      const month = org.createdAt.toISOString().slice(0, 7); // YYYY-MM
      if (!cohorts[month]) {
        cohorts[month] = {
          total: 0,
          retained: 0,
        };
      }
      cohorts[month].total++;
      if (org.tier !== 'FREE') {
        cohorts[month].retained++;
      }
    });

    return Object.entries(cohorts).map(([month, data]: [string, any]) => ({
      month,
      total: data.total,
      retained: data.retained,
      retentionRate: data.total > 0 ? (data.retained / data.total) * 100 : 0,
    }));
  }

  /**
   * Get time series data for charts
   */
  async getTimeSeriesData(days: number = 30) {
    const dataPoints = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const startOfDay = new Date(date.setHours(0, 0, 0, 0));
      const endOfDay = new Date(date.setHours(23, 59, 59, 999));

      const [users, paidOrgs, revenue] = await Promise.all([
        this.prisma.user.count({
          where: { createdAt: { lte: endOfDay } },
        }),
        this.prisma.organization.count({
          where: {
            tier: { not: 'FREE' },
            createdAt: { lte: endOfDay },
          },
        }),
        this.calculateDailyRevenue(endOfDay),
      ]);

      dataPoints.push({
        date: startOfDay.toISOString().split('T')[0],
        users,
        paidOrgs,
        revenue,
      });
    }

    return dataPoints;
  }

  private async calculateDailyRevenue(date: Date) {
    const paidOrgs = await this.prisma.organization.count({
      where: {
        tier: { not: 'FREE' },
        createdAt: { lte: date },
      },
    });

    // Simplified: assume average of $69/month
    return paidOrgs * 69;
  }
}
