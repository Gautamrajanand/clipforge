import { Module } from '@nestjs/common';
import { OnboardingController } from './onboarding.controller';
import { OnboardingService } from './onboarding.service';
import { OnboardingProgressController } from './onboarding-progress.controller';
import { OnboardingProgressService } from './onboarding-progress.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [OnboardingController, OnboardingProgressController],
  providers: [OnboardingService, OnboardingProgressService],
  exports: [OnboardingService, OnboardingProgressService],
})
export class OnboardingModule {}
