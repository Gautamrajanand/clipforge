import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NPSService {
  constructor(private prisma: PrismaService) {}

  async submitNPS(
    userId: string,
    orgId: string,
    score: number,
    feedback?: string,
    context?: string,
  ) {
    // Validate score
    if (score < 0 || score > 10) {
      throw new Error('NPS score must be between 0 and 10');
    }

    // Determine category
    let category: 'DETRACTOR' | 'PASSIVE' | 'PROMOTER';
    if (score <= 6) {
      category = 'DETRACTOR';
    } else if (score <= 8) {
      category = 'PASSIVE';
    } else {
      category = 'PROMOTER';
    }

    // Create NPS response
    const npsResponse = await this.prisma.nPSResponse.create({
      data: {
        userId,
        orgId,
        score,
        feedback,
        category,
        context,
      },
    });

    return {
      success: true,
      category,
      message: this.getCategoryMessage(category),
      npsResponse,
    };
  }

  async hasSubmittedNPS(userId: string) {
    const response = await this.prisma.nPSResponse.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return {
      hasSubmitted: !!response,
      lastSubmission: response?.createdAt,
      lastScore: response?.score,
    };
  }

  async submitFeedback(
    userId: string,
    orgId: string,
    data: {
      type: string;
      message: string;
      rating?: number;
      page?: string;
    },
  ) {
    const feedback = await this.prisma.feedback.create({
      data: {
        userId,
        orgId,
        type: data.type as any,
        message: data.message,
        rating: data.rating,
        page: data.page,
      },
    });

    return {
      success: true,
      message: 'Thank you for your feedback!',
      feedback,
    };
  }

  async getNPSStats(orgId?: string) {
    const where = orgId ? { orgId } : {};

    const responses = await this.prisma.nPSResponse.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const total = responses.length;
    const promoters = responses.filter((r) => r.category === 'PROMOTER').length;
    const detractors = responses.filter((r) => r.category === 'DETRACTOR').length;

    // NPS = (% Promoters) - (% Detractors)
    const npsScore = total > 0 ? Math.round(((promoters - detractors) / total) * 100) : 0;

    return {
      npsScore,
      total,
      promoters,
      passives: responses.filter((r) => r.category === 'PASSIVE').length,
      detractors,
      responses: responses.slice(0, 50), // Latest 50
    };
  }

  async getFeedbackList(filters?: {
    type?: string;
    resolved?: boolean;
    orgId?: string;
  }) {
    const where: any = {};
    if (filters?.type) where.type = filters.type;
    if (filters?.resolved !== undefined) where.resolved = filters.resolved;
    if (filters?.orgId) where.orgId = filters.orgId;

    const feedback = await this.prisma.feedback.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return feedback;
  }

  async resolveFeedback(feedbackId: string, adminUserId: string) {
    return this.prisma.feedback.update({
      where: { id: feedbackId },
      data: {
        resolved: true,
        resolvedAt: new Date(),
        resolvedBy: adminUserId,
      },
    });
  }

  private getCategoryMessage(category: string): string {
    switch (category) {
      case 'PROMOTER':
        return 'Thank you! We\'re thrilled you love ClipForge! 🎉';
      case 'PASSIVE':
        return 'Thanks for your feedback! We\'re working hard to improve.';
      case 'DETRACTOR':
        return 'We\'re sorry to hear that. Your feedback helps us improve!';
      default:
        return 'Thank you for your feedback!';
    }
  }
}
