import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ClerkAuthGuard } from '../auth/guards/clerk-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { OnboardingProgressService } from './onboarding-progress.service';

@ApiTags('onboarding')
@Controller('v1/onboarding')
@UseGuards(ClerkAuthGuard)
@ApiBearerAuth()
export class OnboardingProgressController {
  constructor(private progressService: OnboardingProgressService) {}

  @Get('progress')
  @ApiOperation({ summary: 'Get user onboarding progress' })
  async getProgress(@CurrentUser() user: any) {
    return this.progressService.getProgress(user.id);
  }

  @Post('progress')
  @ApiOperation({ summary: 'Update onboarding progress' })
  async updateProgress(
    @CurrentUser() user: any,
    @Body() data: {
      hasUploadedVideo?: boolean;
      hasCreatedClip?: boolean;
      hasExportedClip?: boolean;
      hasInvitedMember?: boolean;
      hasCompletedProfile?: boolean;
    },
  ) {
    return this.progressService.updateProgress(user.id, data);
  }

  @Post('progress/complete')
  @ApiOperation({ summary: 'Mark onboarding as complete' })
  async completeOnboarding(@CurrentUser() user: any) {
    return this.progressService.completeOnboarding(user.id);
  }
}
