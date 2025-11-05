import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface ExportMetrics {
  views: number;
  engagement: number;
  retention: number;
  shares: number;
  comments: number;
  likes: number;
  publishedAt: string;
  platform: string;
}

export interface AnalyticsData {
  exportId: string;
  projectId: string;
  clipScore: number;
  duration: number;
  aspectRatio: string;
  metrics: ExportMetrics;
  createdAt: string;
}

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Record export metrics (called after publishing)
   */
  async recordMetrics(
    exportId: string,
    metrics: Partial<ExportMetrics>,
  ): Promise<void> {
    await this.prisma.export.update({
      where: { id: exportId },
      data: {
        metrics: metrics as any,
      },
    });
  }

  /**
   * Get analytics for a project
   */
  async getProjectAnalytics(
    projectId: string,
    orgId: string,
  ): Promise<AnalyticsData[]> {
    // Verify org owns project
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project || project.orgId !== orgId) {
      throw new Error('Project not found');
    }

    // Get all exports with metrics
    const exports = await this.prisma.export.findMany({
      where: { projectId },
      include: {
        moment: {
          select: {
            score: true,
            duration: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return exports.map((exp) => ({
      exportId: exp.id,
      projectId: exp.projectId,
      clipScore: exp.moment?.score || 0,
      duration: exp.moment?.duration || 0,
      aspectRatio: '9:16', // TODO: Store in export
      metrics: (exp.metrics as any) || {},
      createdAt: exp.createdAt.toISOString(),
    }));
  }

  /**
   * Get org-level analytics
   */
  async getOrgAnalytics(orgId: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const exports = await this.prisma.export.findMany({
      where: {
        project: { orgId },
        createdAt: { gte: startDate },
        status: 'COMPLETED',
      },
      include: {
        moment: true,
        project: true,
      },
    });

    // Calculate aggregates
    const totalExports = exports.length;
    const totalViews = exports.reduce(
      (sum, exp) => sum + ((exp.metrics as any)?.views || 0),
      0,
    );
    const avgEngagement = exports.length
      ? exports.reduce(
          (sum, exp) => sum + ((exp.metrics as any)?.engagement || 0),
          0,
        ) / exports.length
      : 0;
    const avgRetention = exports.length
      ? exports.reduce(
          (sum, exp) => sum + ((exp.metrics as any)?.retention || 0),
          0,
        ) / exports.length
      : 0;

    // Group by platform
    const byPlatform = exports.reduce(
      (acc, exp) => {
        const platform = (exp.metrics as any)?.platform || 'unknown';
        if (!acc[platform]) {
          acc[platform] = { count: 0, views: 0 };
        }
        acc[platform].count++;
        acc[platform].views += (exp.metrics as any)?.views || 0;
        return acc;
      },
      {} as Record<string, { count: number; views: number }>,
    );

    // Top performers
    const topPerformers = exports
      .sort(
        (a, b) =>
          ((b.metrics as any)?.views || 0) - ((a.metrics as any)?.views || 0),
      )
      .slice(0, 5)
      .map((exp) => ({
        exportId: exp.id,
        projectTitle: exp.project.title,
        views: (exp.metrics as any)?.views || 0,
        engagement: (exp.metrics as any)?.engagement || 0,
      }));

    return {
      period: { startDate, endDate: new Date(), days },
      totalExports,
      totalViews,
      avgEngagement,
      avgRetention,
      byPlatform,
      topPerformers,
    };
  }

  /**
   * Get clip performance (for ranker v2 learning)
   */
  async getClipPerformance(projectId: string) {
    const exports = await this.prisma.export.findMany({
      where: { projectId },
      include: {
        moment: {
          select: {
            score: true,
            features: true,
            duration: true,
          },
        },
      },
    });

    return exports.map((exp) => ({
      clipScore: exp.moment?.score || 0,
      features: exp.moment?.features || {},
      duration: exp.moment?.duration || 0,
      views: (exp.metrics as any)?.views || 0,
      engagement: (exp.metrics as any)?.engagement || 0,
      retention: (exp.metrics as any)?.retention || 0,
      performanceScore:
        (((exp.metrics as any)?.views || 0) * 0.4 +
          ((exp.metrics as any)?.engagement || 0) * 0.4 +
          ((exp.metrics as any)?.retention || 0) * 0.2) /
        100,
    }));
  }
}
