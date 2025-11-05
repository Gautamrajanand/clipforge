import { Controller, Get, Post, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { WebhooksService } from './webhooks.service';

@ApiTags('webhooks')
@ApiBearerAuth()
@Controller('v1/webhooks')
@UseGuards(AuthGuard('jwt'))
export class WebhooksController {
  constructor(private webhooksService: WebhooksService) {}

  @Post('endpoints')
  @ApiOperation({ summary: 'Register webhook endpoint' })
  async create(@Request() req: any, @Body() dto: any) {
    const orgId = req.user.memberships[0]?.org?.id;
    const userId = req.user.id;
    if (!orgId) {
      throw new Error('No organization found');
    }
    return this.webhooksService.create(orgId, userId, dto);
  }

  @Get('endpoints')
  @ApiOperation({ summary: 'List webhooks' })
  async findAll(@Request() req: any) {
    const orgId = req.user.memberships[0]?.org?.id;
    if (!orgId) {
      throw new Error('No organization found');
    }
    return this.webhooksService.findAll(orgId);
  }

  @Delete('endpoints/:id')
  @ApiOperation({ summary: 'Delete webhook' })
  async delete(@Request() req: any, @Param('id') id: string) {
    const orgId = req.user.memberships[0]?.org?.id;
    if (!orgId) {
      throw new Error('No organization found');
    }
    return this.webhooksService.delete(id, orgId);
  }
}
