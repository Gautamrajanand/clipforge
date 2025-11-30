import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ClerkAuthGuard } from '../auth/guards/clerk-auth.guard';
import { OnboardingService } from './onboarding.service';

@ApiTags('onboarding')
@Controller('v1/onboarding')
@UseGuards(ClerkAuthGuard)
@ApiBearerAuth()
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Get('status')
  @ApiOperation({ summary: 'Get onboarding status for current organization' })
  async getStatus(@Request() req: any) {
    const orgId = req.user.memberships[0]?.org?.id;
    if (!orgId) {
      throw new Error('No organization found');
    }

    return this.onboardingService.getOnboardingStatus(orgId);
  }

  @Post('complete/:step')
  @ApiOperation({ summary: 'Mark an onboarding step as completed' })
  async completeStep(
    @Request() req: any,
    @Param('step') step: string,
    @Body() body: { timeSpent?: number },
  ) {
    const orgId = req.user.memberships[0]?.org?.id;
    if (!orgId) {
      throw new Error('No organization found');
    }

    return this.onboardingService.completeStep(orgId, step as any, body.timeSpent);
  }

  @Post('skip/:step')
  @ApiOperation({ summary: 'Skip an onboarding step' })
  async skipStep(@Request() req: any, @Param('step') step: string) {
    const orgId = req.user.memberships[0]?.org?.id;
    if (!orgId) {
      throw new Error('No organization found');
    }

    return this.onboardingService.skipStep(orgId, step as any);
  }

  @Post('skip-all')
  @ApiOperation({ summary: 'Skip entire onboarding' })
  async skipAll(@Request() req: any) {
    const orgId = req.user.memberships[0]?.org?.id;
    if (!orgId) {
      throw new Error('No organization found');
    }

    return this.onboardingService.skipOnboarding(orgId);
  }
}
