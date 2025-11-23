import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ClerkAuthGuard } from '../auth/guards/clerk-auth.guard';
import { CreditsService } from './credits.service';

@ApiTags('credits')
@Controller('v1/credits')
@UseGuards(ClerkAuthGuard)
@ApiBearerAuth()
export class CreditsController {
  constructor(private credits: CreditsService) {}

  /**
   * Get current credit balance
   */
  @Get('balance')
  @ApiOperation({ summary: 'Get current credit balance' })
  async getBalance(@Request() req: any) {
    const orgId = req.user.memberships[0]?.org?.id;
    if (!orgId) {
      throw new Error('No organization found');
    }

    const balance = await this.credits.getBalance(orgId);
    const org = await this.credits['prisma'].organization.findUnique({
      where: { id: orgId },
      select: {
        credits: true,
        creditsUsedThisMonth: true,
        creditsResetDate: true,
        tier: true,
        trialStartDate: true,
        trialEndDate: true,
        trialUsed: true,
      },
    });

    const allocation = this.credits.getCreditAllocation(org.tier);

    // Check if in trial
    const now = new Date();
    const isInTrial = org.trialStartDate && org.trialEndDate && 
                      now >= org.trialStartDate && now <= org.trialEndDate &&
                      !org.trialUsed;
    const trialDaysLeft = isInTrial ? 
      Math.ceil((org.trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : 0;

    return {
      balance,
      usedThisMonth: org.creditsUsedThisMonth,
      allocation,
      resetDate: org.creditsResetDate,
      tier: org.tier,
      trial: {
        isActive: isInTrial,
        daysLeft: trialDaysLeft,
        startDate: org.trialStartDate,
        endDate: org.trialEndDate,
        used: org.trialUsed,
      },
    };
  }

  /**
   * Get credit transaction history
   */
  @Get('history')
  @ApiOperation({ summary: 'Get credit transaction history' })
  async getHistory(
    @Request() req: any,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const orgId = req.user.memberships[0]?.org?.id;
    if (!orgId) {
      throw new Error('No organization found');
    }

    const limitNum = limit ? parseInt(limit, 10) : 50;
    const offsetNum = offset ? parseInt(offset, 10) : 0;

    const transactions = await this.credits.getTransactionHistory(
      orgId,
      limitNum,
      offsetNum,
    );

    // Get total count for pagination
    const total = await this.credits['prisma'].creditTransaction.count({
      where: { orgId },
    });

    return {
      transactions,
      pagination: {
        limit: limitNum,
        offset: offsetNum,
        total,
        hasMore: offsetNum + limitNum < total,
      },
    };
  }
}
