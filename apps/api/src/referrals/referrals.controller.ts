import { Controller, Get, Post, UseGuards, Request, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { ClerkAuthGuard } from '../auth/guards/clerk-auth.guard';
import { ReferralsService } from './referrals.service';

@ApiTags('referrals')
@Controller('v1/referrals')
@UseGuards(ClerkAuthGuard)
@ApiBearerAuth()
export class ReferralsController {
  constructor(private readonly referralsService: ReferralsService) {}

  @Get('code')
  @ApiOperation({ summary: 'Get or generate referral code for current organization' })
  @ApiResponse({ status: 200, description: 'Referral code returned' })
  async getReferralCode(@Request() req: any) {
    const orgId = req.user.memberships[0]?.org?.id;
    if (!orgId) {
      throw new Error('No organization found');
    }

    const code = await this.referralsService.generateReferralCode(orgId);
    
    return {
      code,
      referralUrl: `${process.env.WEB_URL}/signup?ref=${code}`,
    };
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get referral statistics for current organization' })
  @ApiResponse({ status: 200, description: 'Referral stats returned' })
  async getReferralStats(@Request() req: any) {
    const orgId = req.user.memberships[0]?.org?.id;
    if (!orgId) {
      throw new Error('No organization found');
    }

    return this.referralsService.getReferralStats(orgId);
  }

  @Get('list')
  @ApiOperation({ summary: 'Get list of referrals made by current organization' })
  @ApiResponse({ status: 200, description: 'Referral list returned' })
  async getReferralList(@Request() req: any) {
    const orgId = req.user.memberships[0]?.org?.id;
    if (!orgId) {
      throw new Error('No organization found');
    }

    return this.referralsService.getReferralList(orgId);
  }

  @Get('leaderboard')
  @ApiOperation({ summary: 'Get referral leaderboard (top referrers)' })
  @ApiResponse({ status: 200, description: 'Leaderboard returned' })
  async getLeaderboard(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.referralsService.getLeaderboard(limitNum);
  }

  @Post('complete/:orgId')
  @ApiOperation({ summary: 'Manually complete referral (admin only)' })
  @ApiResponse({ status: 200, description: 'Referral completed' })
  async completeReferral(@Param('orgId') orgId: string) {
    await this.referralsService.completeReferral(orgId);
    return { message: 'Referral completed successfully' };
  }
}
