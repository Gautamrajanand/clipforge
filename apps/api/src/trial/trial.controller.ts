import { Controller, Post, Get, UseGuards, Req } from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiBearerAuth, 
  ApiResponse,
} from '@nestjs/swagger';
import { TrialService } from './trial.service';
import { ClerkAuthGuard } from '../auth/guards/clerk-auth.guard';

@ApiTags('Trial')
@Controller('v1/trial')
@UseGuards(ClerkAuthGuard)
@ApiBearerAuth('clerk-jwt')
export class TrialController {
  constructor(private trialService: TrialService) {}

  /**
   * Activate free trial for current organization
   */
  @Post('activate')
  @ApiOperation({ 
    summary: 'Activate 7-day free trial',
    description: 'Activates a 7-day free trial for the organization. Grants STARTER tier access with 150 credits. Can only be used once per organization.',
  })
  @ApiResponse({
    status: 201,
    description: 'Trial activated successfully',
    schema: {
      example: {
        id: 'trial_123',
        orgId: 'org_123',
        startDate: '2025-11-23T00:00:00.000Z',
        endDate: '2025-11-30T00:00:00.000Z',
        isActive: true,
        tier: 'STARTER',
        creditsGranted: 150,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Trial already used or organization already has a paid plan',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async activateTrial(@Req() req: any) {
    const orgId = req.auth.orgId;
    return this.trialService.activateTrial(orgId);
  }

  /**
   * Get trial status for current organization
   */
  @Get('status')
  @ApiOperation({ 
    summary: 'Get trial status',
    description: 'Returns the current trial status including whether the trial is active, days remaining, and trial dates.',
  })
  @ApiResponse({
    status: 200,
    description: 'Trial status retrieved successfully',
    schema: {
      example: {
        isInTrial: true,
        daysLeft: 5,
        startDate: '2025-11-23T00:00:00.000Z',
        endDate: '2025-11-30T00:00:00.000Z',
        tier: 'STARTER',
        creditsGranted: 150,
        trialUsed: false,
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async getTrialStatus(@Req() req: any) {
    const orgId = req.auth.orgId;
    return this.trialService.getTrialStatus(orgId);
  }

  /**
   * Check if organization is in trial
   */
  @Get('check')
  @ApiOperation({ 
    summary: 'Check if in trial',
    description: 'Simple boolean check to see if the organization is currently in an active trial period.',
  })
  @ApiResponse({
    status: 200,
    description: 'Trial check completed',
    schema: {
      example: {
        isInTrial: true,
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async isInTrial(@Req() req: any) {
    const orgId = req.auth.orgId;
    const isInTrial = await this.trialService.isInTrial(orgId);
    return { isInTrial };
  }
}
