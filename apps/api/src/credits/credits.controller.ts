import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiBearerAuth, 
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { ClerkAuthGuard } from '../auth/guards/clerk-auth.guard';
import { CreditsService } from './credits.service';

@ApiTags('Credits')
@Controller('v1/credits')
@UseGuards(ClerkAuthGuard)
@ApiBearerAuth('clerk-jwt')
export class CreditsController {
  constructor(private credits: CreditsService) {}

  /**
   * Get current credit balance
   */
  @Get('balance')
  @ApiOperation({ 
    summary: 'Get current credit balance',
    description: 'Returns the current credit balance, allocation, reset date, tier, and trial information for the authenticated user\'s organization.',
  })
  @ApiResponse({
    status: 200,
    description: 'Credit balance retrieved successfully',
    schema: {
      example: {
        balance: 151,
        usedThisMonth: 0,
        allocation: 150,
        resetDate: '2025-12-01T00:00:00.000Z',
        tier: 'STARTER',
        trial: {
          isActive: true,
          daysLeft: 5,
          startDate: '2025-11-23T00:00:00.000Z',
          endDate: '2025-11-30T00:00:00.000Z',
          used: false,
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 404,
    description: 'Organization not found',
  })
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
  @ApiOperation({ 
    summary: 'Get credit transaction history',
    description: 'Returns paginated credit transaction history for the authenticated user\'s organization. Includes all credit additions and deductions.',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of transactions to return (default: 50, max: 100)',
    example: 50,
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    type: Number,
    description: 'Number of transactions to skip for pagination (default: 0)',
    example: 0,
  })
  @ApiResponse({
    status: 200,
    description: 'Transaction history retrieved successfully',
    schema: {
      example: {
        transactions: [
          {
            id: 'txn_123',
            type: 'ADDITION_TRIAL',
            amount: 150,
            balance: 150,
            description: '7-day free trial credits',
            createdAt: '2025-11-23T00:00:00.000Z',
          },
          {
            id: 'txn_124',
            type: 'DEDUCTION_CLIPS',
            amount: -5,
            balance: 145,
            description: 'AI clip detection (5 minutes)',
            projectId: 'proj_123',
            createdAt: '2025-11-23T10:30:00.000Z',
          },
        ],
        pagination: {
          limit: 50,
          offset: 0,
          total: 2,
          hasMore: false,
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
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
