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
          currentStep: 'WELCOME',
          completedSteps: [],
          skippedSteps: [],
          isCompleted: false,
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
        progress.completedSteps.includes('UPLOAD_VIDEO') !== hasUploadedVideo ||
        progress.completedSteps.includes('VIEW_CLIPS') !== hasCreatedClip ||
        progress.completedSteps.includes('CUSTOMIZE_CLIP') !== hasAddedSubtitles ||
        progress.completedSteps.includes('CUSTOMIZE_CLIP') !== hasReframedVideo ||
        progress.completedSteps.includes('SHARE_REFERRAL') !== hasShared;

      if (needsUpdate) {
        progress = await this.prisma.onboardingProgress.update({
          where: { userId },
          data: {
            completedSteps: {
              push: [
                hasUploadedVideo ? 'UPLOAD_VIDEO' : undefined,
                hasCreatedClip ? 'VIEW_CLIPS' : undefined,
                hasAddedSubtitles ? 'CUSTOMIZE_CLIP' : undefined,
                hasReframedVideo ? 'CUSTOMIZE_CLIP' : undefined,
                hasShared ? 'SHARE_REFERRAL' : undefined,
              ].filter(Boolean),
            },
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

    // Return progress in expected format
    return {
      hasUploadedVideo: progress.completedSteps.includes('UPLOAD_VIDEO'),
      hasCreatedClip: progress.completedSteps.includes('VIEW_CLIPS'),
      hasAddedSubtitles: progress.completedSteps.includes('CUSTOMIZE_CLIP'),
      hasReframedVideo: progress.completedSteps.includes('CUSTOMIZE_CLIP'),
      hasShared: progress.completedSteps.includes('SHARE_REFERRAL'),
      completedAt: progress.completedAt,
      completionPercentage: this.calculateCompletionPercentage(progress),
    };
  }

  /**
   * Mark a step as completed
   */
  async completeStep(userId: string, step: string) {
    const progress = await this.prisma.onboardingProgress.upsert({
      where: { userId },
      create: {
        userId,
        currentStep: step,
        completedSteps: [step],
        skippedSteps: [],
        isCompleted: false,
      },
      update: {
        completedSteps: {
          push: step,
        },
        currentStep: step,
      },
    });

    this.logger.log(`✅ User ${userId} completed step: ${step}`);

    return progress;
  }

  /**
   * Mark onboarding as complete
   */
  async completeOnboarding(userId: string) {
    const progress = await this.prisma.onboardingProgress.update({
      where: { userId },
      data: {
        isCompleted: true,
        completedAt: new Date(),
        currentStep: 'COMPLETED',
      },
    });

    this.logger.log(`🎉 User ${userId} completed onboarding!`);

    return progress;
  }

  /**
   * Calculate completion percentage
   */
  private calculateCompletionPercentage(progress: any): number {
    const totalSteps = 5; // UPLOAD_VIDEO, VIEW_CLIPS, CUSTOMIZE_CLIP, EXPORT_CLIP, SHARE_REFERRAL
    const completed = progress.completedSteps.length;
    return Math.round((completed / totalSteps) * 100);
  }
}
