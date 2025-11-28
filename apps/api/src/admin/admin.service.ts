import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    try {
      // Get counts
      const [
        totalUsers,
        totalOrgs,
        totalProjects,
        totalClips,
        totalExports,
        activeUsers,
        paidUsers,
      ] = await Promise.all([
        this.prisma.user.count(),
        this.prisma.organization.count(),
        this.prisma.project.count(),
        this.prisma.moment.count(),
        this.prisma.export.count(),
        this.prisma.user.count({
          where: {
            updatedAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
            },
          },
        }),
        this.prisma.organization.count({
          where: {
            tier: {
              not: 'FREE',
            },
          },
        }),
      ]);

      // Get revenue stats (from credit transactions)
      const purchaseStats = await this.prisma.creditTransaction.aggregate({
        _sum: {
          amount: true,
        },
        where: {
          amount: {
            gt: 0, // Only count additions (purchases)
          },
        },
      });

      // Get credit stats
      const creditStats = await this.prisma.organization.aggregate({
        _sum: {
          credits: true,
        },
        _avg: {
          credits: true,
        },
      });

      // Get recent signups (last 30 days)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const recentSignups = await this.prisma.user.count({
        where: {
          createdAt: {
            gte: thirtyDaysAgo,
          },
        },
      });

      // Get projects by status
      const projectsByStatus = await this.prisma.project.groupBy({
        by: ['status'],
        _count: true,
      });

      // Get tier distribution
      const tierDistribution = await this.prisma.organization.groupBy({
        by: ['tier'],
        _count: true,
      });

      return {
        users: {
          total: totalUsers,
          active: activeUsers,
          paid: paidUsers,
          recentSignups,
        },
        organizations: {
          total: totalOrgs,
          tierDistribution: tierDistribution.reduce((acc, item) => {
            acc[item.tier] = item._count;
            return acc;
          }, {}),
        },
        projects: {
          total: totalProjects,
          byStatus: projectsByStatus.reduce((acc, item) => {
            acc[item.status] = item._count;
            return acc;
          }, {}),
        },
        content: {
          totalClips,
          totalExports,
        },
        revenue: {
          total: purchaseStats._sum.amount || 0,
          currency: 'USD',
        },
        credits: {
          total: creditStats._sum.credits || 0,
          average: Math.round(creditStats._avg.credits || 0),
        },
      };
    } catch (error) {
      this.logger.error('Failed to get dashboard stats:', error);
      throw error;
    }
  }

  async getRecentUsers(limit: number = 10) {
    return this.prisma.user.findMany({
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async getRecentProjects(limit: number = 10) {
    return this.prisma.project.findMany({
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
        orgId: true,
        creditsUsed: true,
      },
    });
  }

  async getRecentTransactions(limit: number = 10) {
    return this.prisma.creditTransaction.findMany({
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        amount: true,
        type: true,
        description: true,
        createdAt: true,
        orgId: true,
      },
    });
  }

  async getUserDetails(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        memberships: {
          include: {
            org: {
              include: {
                projects: {
                  take: 5,
                  orderBy: {
                    createdAt: 'desc',
                  },
                },
                creditTransactions: {
                  take: 5,
                  orderBy: {
                    createdAt: 'desc',
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  async getOrganizationDetails(orgId: string) {
    const org = await this.prisma.organization.findUnique({
      where: { id: orgId },
      include: {
        memberships: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
          },
        },
        projects: {
          orderBy: {
            createdAt: 'desc',
          },
        },
        creditTransactions: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!org) {
      throw new Error('Organization not found');
    }

    return org;
  }

  async getSystemHealth() {
    try {
      // Check database connection
      await this.prisma.$queryRaw`SELECT 1`;

      // Get database stats
      const dbStats = await this.prisma.$queryRaw<any[]>`
        SELECT 
          schemaname,
          tablename,
          pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
        FROM pg_tables
        WHERE schemaname = 'public'
        ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
        LIMIT 10
      `;

      return {
        status: 'healthy',
        database: {
          connected: true,
          tables: dbStats,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Health check failed:', error);
      return {
        status: 'unhealthy',
        database: {
          connected: false,
          error: error.message,
        },
        timestamp: new Date().toISOString(),
      };
    }
  }

  async searchUsers(query: string, limit: number = 20) {
    return this.prisma.user.findMany({
      where: {
        OR: [
          { email: { contains: query, mode: 'insensitive' } },
          { name: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: limit,
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });
  }

  async searchOrganizations(query: string, limit: number = 20) {
    return this.prisma.organization.findMany({
      where: {
        name: { contains: query, mode: 'insensitive' },
      },
      take: limit,
      include: {
        memberships: {
          include: {
            user: {
              select: {
                email: true,
              },
            },
          },
        },
      },
    });
  }

  async adjustCredits(orgId: string, amount: number, reason: string) {
    this.logger.log(`Adjusting credits for org ${orgId}: ${amount} (${reason})`);

    // Update organization credits
    const org = await this.prisma.organization.update({
      where: { id: orgId },
      data: {
        credits: {
          increment: amount,
        },
      },
    });

    // Create credit transaction
    await this.prisma.creditTransaction.create({
      data: {
        organizationId: orgId,
        amount,
        type: amount > 0 ? 'ADMIN_ADJUSTMENT' : 'ADMIN_DEDUCTION',
        description: reason,
        balanceAfter: org.credits,
      },
    });

    return {
      success: true,
      newBalance: org.credits,
      adjustment: amount,
      reason,
    };
  }

  async updateTier(orgId: string, tier: string) {
    this.logger.log(`Updating tier for org ${orgId} to ${tier}`);

    const org = await this.prisma.organization.update({
      where: { id: orgId },
      data: {
        tier: tier as any,
      },
      include: {
        memberships: {
          include: {
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

    return {
      success: true,
      organization: org,
    };
  }

  async toggleAdmin(userId: string, isAdmin: boolean) {
    this.logger.log(`Setting admin status for user ${userId} to ${isAdmin}`);

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        isAdmin,
      },
      select: {
        id: true,
        email: true,
        name: true,
        isAdmin: true,
      },
    });

    return {
      success: true,
      user,
    };
  }
}
