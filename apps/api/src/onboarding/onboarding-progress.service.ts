import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OnboardingProgressService {
  private readonly logger = new Logger(OnboardingProgressService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Get user's onboarding progress
   */
  async getProgress(userId: string) {
    // Get or create progress record
    let progress = await this.prisma.onboardingProgress.findUnique({
      where: { userId },
    });

    if (!progress) {
      // Create default progress
      progress = await this.prisma.onboardingProgress.create({
        data: {
          userId,
          hasUploadedVideo: false,
          hasCreatedClip: false,
          hasAddedSubtitles: false,
          hasReframedVideo: false,
          hasShared: false,
          completedAt: null,
        },
      });
    }

    // Check actual progress from database
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        memberships: {
          include: {
            org: {
              include: {
                projects: {
                  include: {
                    moments: true,
                    exports: true,
                  },
                },
                members: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return progress;
    }

    // Calculate actual progress
    const org = user.memberships[0]?.org;
    if (org) {
      const hasUploadedVideo = org.projects.length > 0;
      const hasCreatedClip = org.projects.some(p => p.moments && p.moments.length > 0);
      const hasAddedSubtitles = org.projects.some(p => p.hasSubtitles === true);
      const hasReframedVideo = org.projects.some(p => p.hasReframed === true);
      const hasShared = org.projects.some(p => p.exports && p.exports.length > 0);

      // Update progress if changed
      const needsUpdate = 
        progress.hasUploadedVideo !== hasUploadedVideo ||
        progress.hasCreatedClip !== hasCreatedClip ||
        progress.hasAddedSubtitles !== hasAddedSubtitles ||
        progress.hasReframedVideo !== hasReframedVideo ||
        progress.hasShared !== hasShared;

      if (needsUpdate) {
        progress = await this.prisma.onboardingProgress.update({
          where: { userId },
          data: {
            hasUploadedVideo,
            hasCreatedClip,
            hasAddedSubtitles,
            hasReframedVideo,
            hasShared,
          },
        });

        this.logger.log(`✅ Updated onboarding progress for user ${userId}`);
      }

      // Auto-complete if all 3 services tried
      if (
        hasUploadedVideo &&
        hasCreatedClip &&
        hasAddedSubtitles &&
        hasReframedVideo &&
        !progress.completedAt
      ) {
        await this.completeOnboarding(userId);
        progress.completedAt = new Date();
      }
    }

    return {
      hasUploadedVideo: progress.hasUploadedVideo,
      hasCreatedClip: progress.hasCreatedClip,
      hasAddedSubtitles: progress.hasAddedSubtitles,
      hasReframedVideo: progress.hasReframedVideo,
      hasShared: progress.hasShared,
      completedAt: progress.completedAt,
      completionPercentage: this.calculateCompletionPercentage(progress),
    };
  }

  /**
   * Update onboarding progress manually
   */
  async updateProgress(
    userId: string,
    data: {
      hasUploadedVideo?: boolean;
      hasCreatedClip?: boolean;
      hasExportedClip?: boolean;
      hasInvitedMember?: boolean;
      hasCompletedProfile?: boolean;
    },
  ) {
    const progress = await this.prisma.onboardingProgress.upsert({
      where: { userId },
      create: {
        userId,
        ...data,
      },
      update: data,
    });

    this.logger.log(`✅ Manually updated progress for user ${userId}`);

    return progress;
  }

  /**
   * Mark onboarding as complete
   */
  async completeOnboarding(userId: string) {
    const progress = await this.prisma.onboardingProgress.update({
      where: { userId },
      data: {
        completedAt: new Date(),
      },
    });

    this.logger.log(`🎉 User ${userId} completed onboarding!`);

    // TODO: Trigger celebration email or notification

    return progress;
  }

  /**
   * Calculate completion percentage
   */
  private calculateCompletionPercentage(progress: any): number {
    const steps = [
      progress.hasUploadedVideo,
      progress.hasCreatedClip,
      progress.hasExportedClip,
      progress.hasInvitedMember,
      progress.hasCompletedProfile,
    ];

    const completed = steps.filter(Boolean).length;
    return Math.round((completed / steps.length) * 100);
  }
}
