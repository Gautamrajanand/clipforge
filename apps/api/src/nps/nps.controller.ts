import { Controller, Post, Get, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ClerkAuthGuard } from '../auth/guards/clerk-auth.guard';
import { NPSService } from './nps.service';

@ApiTags('nps')
@Controller('v1/nps')
@UseGuards(ClerkAuthGuard)
@ApiBearerAuth()
export class NPSController {
  constructor(private nps: NPSService) {}

  @Post('submit')
  @ApiOperation({ summary: 'Submit NPS score and feedback' })
  async submitNPS(
    @Req() req: any,
    @Body() body: { score: number; feedback?: string; context?: string },
  ) {
    const userId = req.user.id;
    const orgId = req.user.memberships[0]?.orgId;

    if (!orgId) {
      throw new Error('User must belong to an organization');
    }

    return this.nps.submitNPS(userId, orgId, body.score, body.feedback, body.context);
  }

  @Get('status')
  @ApiOperation({ summary: 'Check if user has submitted NPS' })
  async getNPSStatus(@Req() req: any) {
    const userId = req.user.id;
    return this.nps.hasSubmittedNPS(userId);
  }

  @Post('feedback')
  @ApiOperation({ summary: 'Submit general feedback' })
  async submitFeedback(
    @Req() req: any,
    @Body() body: {
      type: string;
      message: string;
      rating?: number;
      page?: string;
    },
  ) {
    const userId = req.user.id;
    const orgId = req.user.memberships[0]?.orgId;

    if (!orgId) {
      throw new Error('User must belong to an organization');
    }

    return this.nps.submitFeedback(userId, orgId, body);
  }
}
