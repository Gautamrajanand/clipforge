import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * TEMPORARY STUB: This service is disabled while migrating to userId-based schema
 * TODO: Rewrite to use new OnboardingProgress model with userId and completedSteps[]
 */
@Injectable()
export class OnboardingService {
  private readonly logger = new Logger(OnboardingService.name);

  constructor(private prisma: PrismaService) {}

  async getOnboardingStatus(orgId: string) {
    this.logger.warn('OnboardingService.getOnboardingStatus is stubbed - returning empty data');
    return {
      completed: false,
      completedAt: null,
      skipped: false,
      currentStep: 'WELCOME',
      progress: [],
      completionPercentage: 0,
      totalSteps: 5,
      completedSteps: 0,
    };
  }

  async completeStep(orgId: string, step: string, timeSpent?: number) {
    this.logger.warn(`OnboardingService.completeStep is stubbed - step: ${step}`);
    return {
      step,
      nextStep: 'UPLOAD_VIDEO',
      completed: true,
    };
  }

  async skipStep(orgId: string, step: string) {
    this.logger.warn(`OnboardingService.skipStep is stubbed - step: ${step}`);
    return {
      step,
      nextStep: 'UPLOAD_VIDEO',
      skipped: true,
    };
  }

  async skipOnboarding(orgId: string) {
    this.logger.warn('OnboardingService.skipOnboarding is stubbed');
    return {
      skipped: true,
      currentStep: 'COMPLETED',
    };
  }

  async completeOnboarding(orgId: string) {
    this.logger.warn('OnboardingService.completeOnboarding is stubbed');
    return {
      completed: true,
      completedAt: new Date(),
    };
  }

  private getNextStep(currentStep: string): string {
    return 'UPLOAD_VIDEO';
  }

  async getOnboardingMetrics(startDate?: Date, endDate?: Date) {
    this.logger.warn('OnboardingService.getOnboardingMetrics is stubbed');
    return {
      totalUsers: 0,
      completedOnboarding: 0,
      skippedOnboarding: 0,
      inProgress: 0,
      completionRate: 0,
      averageTimeToComplete: 0,
      stepCompletionRates: {},
      dropoffPoints: [],
    };
  }
}
