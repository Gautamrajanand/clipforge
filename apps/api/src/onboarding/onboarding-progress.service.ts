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

    // Calculate completion percentage based on feature tracking
    const features = [
      progress.hasCreatedClip,
      progress.hasAddedSubtitles,
      progress.hasReframedVideo,
      progress.hasShared,
    ];
    const completedCount = features.filter(Boolean).length;
    const completionPercentage = Math.round((completedCount / features.length) * 100);

    // Return progress in expected format
    return {
      userId: progress.userId,
      hasCreatedClip: progress.hasCreatedClip,
      hasAddedSubtitles: progress.hasAddedSubtitles,
      hasReframedVideo: progress.hasReframedVideo,
      hasShared: progress.hasShared,
      firstClipAt: progress.firstClipAt,
      firstSubtitleAt: progress.firstSubtitleAt,
      firstReframeAt: progress.firstReframeAt,
      firstShareAt: progress.firstShareAt,
      exportCount: progress.exportCount,
      lastExportAt: progress.lastExportAt,
      completedAt: progress.completedAt,
      completionPercentage,
    };
  }

  /**
   * DISABLED: Auto-update based on actual data
   * TODO: Re-enable when we have proper org/project tracking
   */
  private async _autoUpdateProgress_DISABLED(userId: string, progress: any) {
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
      const hasAddedSubtitles = false; // TODO: Add hasSubtitles field to Project model
      const hasReframedVideo = false; // TODO: Add hasReframed field to Project model
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
   * Mark a step as completed (legacy - for backwards compatibility)
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

    // Also update feature tracking based on step
    if (step === 'VIEW_CLIPS') {
      await this.updateFeatureProgress(userId, 'clip');
    } else if (step === 'CUSTOMIZE_CLIP') {
      await this.updateFeatureProgress(userId, 'subtitle');
    } else if (step === 'EXPORT_CLIP') {
      await this.updateFeatureProgress(userId, 'export');
    }

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

  /**
   * Update progress when user completes a feature
   */
  async updateFeatureProgress(
    userId: string,
    feature: 'clip' | 'subtitle' | 'reframe' | 'export'
  ) {
    this.logger.log(`Updating feature progress for user ${userId}: ${feature}`);

    const now = new Date();
    
    // Get or create progress
    let progress = await this.prisma.onboardingProgress.findUnique({
      where: { userId },
    });

    if (!progress) {
      progress = await this.prisma.onboardingProgress.create({
        data: { userId },
      });
    }

    const updateData: any = {};

    switch (feature) {
      case 'clip':
        if (!progress.hasCreatedClip) {
          updateData.hasCreatedClip = true;
          updateData.firstClipAt = now;
          this.logger.log(`🎉 First clip created for user ${userId}`);
        }
        break;

      case 'subtitle':
        if (!progress.hasAddedSubtitles) {
          updateData.hasAddedSubtitles = true;
          updateData.firstSubtitleAt = now;
          this.logger.log(`📝 First subtitles added for user ${userId}`);
        }
        break;

      case 'reframe':
        if (!progress.hasReframedVideo) {
          updateData.hasReframedVideo = true;
          updateData.firstReframeAt = now;
          this.logger.log(`🎬 First reframe for user ${userId}`);
        }
        break;

      case 'export':
        updateData.exportCount = { increment: 1 };
        updateData.lastExportAt = now;
        if (!progress.hasShared && progress.exportCount === 0) {
          updateData.hasShared = true;
          updateData.firstShareAt = now;
          this.logger.log(`🚀 First export for user ${userId}`);
        }
        break;
    }

    if (Object.keys(updateData).length > 0) {
      const updated = await this.prisma.onboardingProgress.update({
        where: { userId },
        data: updateData,
      });

      this.logger.log(`✅ Feature progress updated for user ${userId}`);
      return updated;
    }

    return progress;
  }
}
