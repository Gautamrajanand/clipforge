import { Controller, Get, Param, Query, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';

@ApiTags('analytics')
@ApiBearerAuth()
@Controller('v1/analytics')
@UseGuards(AuthGuard('jwt'))
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Get('projects/:projectId')
  @ApiOperation({ summary: 'Get project analytics' })
  async getProjectAnalytics(
    @Request() req,
    @Param('projectId') projectId: string,
  ) {
    const orgId = req.user.memberships[0]?.org?.id;
    if (!orgId) {
      throw new Error('No organization found');
    }
    return this.analyticsService.getProjectAnalytics(projectId, orgId);
  }

  @Get('org')
  @ApiOperation({ summary: 'Get organization analytics' })
  async getOrgAnalytics(
    @Request() req,
    @Query('days') days: string = '30',
  ) {
    const orgId = req.user.memberships[0]?.org?.id;
    if (!orgId) {
      throw new Error('No organization found');
    }
    return this.analyticsService.getOrgAnalytics(orgId, parseInt(days, 10));
  }

  @Get('clips/:projectId')
  @ApiOperation({ summary: 'Get clip performance data (for ranker v2)' })
  async getClipPerformance(
    @Request() req,
    @Param('projectId') projectId: string,
  ) {
    const orgId = req.user.memberships[0]?.org?.id;
    if (!orgId) {
      throw new Error('No organization found');
    }
    // Verify org owns project
    return this.analyticsService.getClipPerformance(projectId);
  }
}
