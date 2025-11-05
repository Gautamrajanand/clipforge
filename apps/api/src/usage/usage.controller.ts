import { Controller, Get, UseGuards, Request, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsageService } from './usage.service';

@ApiTags('usage')
@ApiBearerAuth()
@Controller('v1/usage')
@UseGuards(AuthGuard('jwt'))
export class UsageController {
  constructor(private usageService: UsageService) {}

  @Get()
  @ApiOperation({ summary: 'Get usage metering' })
  async getUsage(@Request() req: any, @Query('period') period?: string) {
    const orgId = req.user.memberships[0]?.org?.id;
    if (!orgId) {
      throw new Error('No organization found');
    }
    return this.usageService.getCurrentUsage(orgId);
  }
}
