import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OnboardingStep } from '@prisma/client';

@Injectable()
export class OnboardingService {
  private readonly logger = new Logger(OnboardingService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Get onboarding status for organization
   */
  async getOnboardingStatus(orgId: string) {
    const org = await this.prisma.organization.findUnique({
      where: { id: orgId },
      select: {
        onboardingCompleted: true,
        onboardingCompletedAt: true,
        onboardingSkipped: true,
        currentOnboardingStep: true,
      },
    });

    const progress = await this.prisma.onboardingProgress.findMany({
      where: { orgId },
      orderBy: { createdAt: 'asc' },
    });

    // Calculate completion percentage
    const totalSteps = Object.keys(OnboardingStep).length - 1; // Exclude COMPLETED
    const completedSteps = progress.filter(p => p.completed).length;
    const completionPercentage = (completedSteps / totalSteps) * 100;

    return {
      completed: org?.onboardingCompleted || false,
      completedAt: org?.onboardingCompletedAt,
      skipped: org?.onboardingSkipped || false,
      currentStep: org?.currentOnboardingStep || 'WELCOME',
      progress,
      completionPercentage: Math.round(completionPercentage),
      totalSteps,
      completedSteps,
    };
  }

  /**
   * Mark an onboarding step as completed
   */
  async completeStep(orgId: string, step: OnboardingStep, timeSpent?: number) {
    // Upsert progress record
    await this.prisma.onboardingProgress.upsert({
      where: {
        orgId_step: { orgId, step },
      },
      create: {
        orgId,
        step,
        completed: true,
        completedAt: new Date(),
        timeSpent,
      },
      update: {
        completed: true,
        completedAt: new Date(),
        timeSpent,
      },
    });

    // Update organization's current step
    const nextStep = this.getNextStep(step);
    await this.prisma.organization.update({
      where: { id: orgId },
      data: {
        currentOnboardingStep: nextStep,
      },
    });

    this.logger.log(`✅ Onboarding step completed: ${orgId} - ${step}`);

    // Check if all steps are completed
    if (nextStep === OnboardingStep.COMPLETED) {
      await this.markOnboardingComplete(orgId);
    }

    return { step, nextStep, completed: true };
  }

  /**
   * Skip an onboarding step
   */
  async skipStep(orgId: string, step: OnboardingStep) {
    await this.prisma.onboardingProgress.upsert({
      where: {
        orgId_step: { orgId, step },
      },
      create: {
        orgId,
        step,
        skipped: true,
      },
      update: {
        skipped: true,
      },
    });

    const nextStep = this.getNextStep(step);
    await this.prisma.organization.update({
      where: { id: orgId },
      data: {
        currentOnboardingStep: nextStep,
      },
    });

    this.logger.log(`⏭️  Onboarding step skipped: ${orgId} - ${step}`);

    return { step, nextStep, skipped: true };
  }

  /**
   * Skip entire onboarding
   */
  async skipOnboarding(orgId: string) {
    await this.prisma.organization.update({
      where: { id: orgId },
      data: {
        onboardingSkipped: true,
        currentOnboardingStep: OnboardingStep.COMPLETED,
      },
    });

    this.logger.log(`⏭️  Onboarding skipped entirely: ${orgId}`);

    return { skipped: true };
  }

  /**
   * Mark onboarding as complete
   */
  private async markOnboardingComplete(orgId: string) {
    await this.prisma.organization.update({
      where: { id: orgId },
      data: {
        onboardingCompleted: true,
        onboardingCompletedAt: new Date(),
        currentOnboardingStep: OnboardingStep.COMPLETED,
      },
    });

    this.logger.log(`🎉 Onboarding completed: ${orgId}`);
  }

  /**
   * Get next onboarding step
   */
  private getNextStep(currentStep: OnboardingStep): OnboardingStep {
    const steps = [
      OnboardingStep.WELCOME,
      OnboardingStep.UPLOAD_VIDEO,
      OnboardingStep.VIEW_CLIPS,
      OnboardingStep.CUSTOMIZE_CLIP,
      OnboardingStep.EXPORT_CLIP,
      OnboardingStep.SHARE_REFERRAL,
      OnboardingStep.COMPLETED,
    ];

    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex === -1 || currentIndex === steps.length - 1) {
      return OnboardingStep.COMPLETED;
    }

    return steps[currentIndex + 1];
  }

  /**
   * Auto-track onboarding progress based on user actions
   */
  async autoTrackProgress(orgId: string, action: string) {
    const stepMap: Record<string, OnboardingStep> = {
      'project_created': OnboardingStep.UPLOAD_VIDEO,
      'clips_viewed': OnboardingStep.VIEW_CLIPS,
      'clip_customized': OnboardingStep.CUSTOMIZE_CLIP,
      'clip_exported': OnboardingStep.EXPORT_CLIP,
      'referral_viewed': OnboardingStep.SHARE_REFERRAL,
    };

    const step = stepMap[action];
    if (step) {
      await this.completeStep(orgId, step);
    }
  }

  /**
   * Get onboarding analytics (admin)
   */
  async getOnboardingAnalytics(days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [totalUsers, completedOnboarding, skippedOnboarding, stepStats] = await Promise.all([
      // Total users in period
      this.prisma.organization.count({
        where: { createdAt: { gte: startDate } },
      }),

      // Completed onboarding
      this.prisma.organization.count({
        where: {
          createdAt: { gte: startDate },
          onboardingCompleted: true,
        },
      }),

      // Skipped onboarding
      this.prisma.organization.count({
        where: {
          createdAt: { gte: startDate },
          onboardingSkipped: true,
        },
      }),

      // Step completion stats
      this.prisma.onboardingProgress.groupBy({
        by: ['step'],
        where: {
          createdAt: { gte: startDate },
        },
        _count: {
          id: true,
        },
        _sum: {
          timeSpent: true,
        },
      }),
    ]);

    const completionRate = totalUsers > 0 ? (completedOnboarding / totalUsers) * 100 : 0;
    const skipRate = totalUsers > 0 ? (skippedOnboarding / totalUsers) * 100 : 0;

    // Calculate drop-off at each step
    const dropOffByStep: Record<string, number> = {};
    stepStats.forEach(stat => {
      const completed = stat._count.id;
      const dropOff = totalUsers > 0 ? ((totalUsers - completed) / totalUsers) * 100 : 0;
      dropOffByStep[stat.step] = Math.round(dropOff);
    });

    return {
      period: `${days} days`,
      totalUsers,
      completedOnboarding,
      skippedOnboarding,
      completionRate: completionRate.toFixed(2),
      skipRate: skipRate.toFixed(2),
      stepStats: stepStats.map(stat => ({
        step: stat.step,
        completions: stat._count.id,
        avgTimeSpent: stat._sum.timeSpent ? Math.round(stat._sum.timeSpent / stat._count.id) : 0,
        dropOffRate: dropOffByStep[stat.step],
      })),
    };
  }
}
