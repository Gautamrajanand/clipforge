import { Controller, Post, Get, UseGuards, Req } from '@nestjs/common';
import { TrialService } from './trial.service';
import { ClerkAuthGuard } from '../auth/guards/clerk-auth.guard';

@Controller('v1/trial')
@UseGuards(ClerkAuthGuard)
export class TrialController {
  constructor(private trialService: TrialService) {}

  /**
   * Activate free trial for current organization
   */
  @Post('activate')
  async activateTrial(@Req() req: any) {
    const orgId = req.auth.orgId;
    return this.trialService.activateTrial(orgId);
  }

  /**
   * Get trial status for current organization
   */
  @Get('status')
  async getTrialStatus(@Req() req: any) {
    const orgId = req.auth.orgId;
    return this.trialService.getTrialStatus(orgId);
  }

  /**
   * Check if organization is in trial
   */
  @Get('check')
  async isInTrial(@Req() req: any) {
    const orgId = req.auth.orgId;
    const isInTrial = await this.trialService.isInTrial(orgId);
    return { isInTrial };
  }
}
