import { Controller, Get, Post, Param, Body, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ExportsService } from './exports.service';

@ApiTags('exports')
@ApiBearerAuth()
@Controller('v1')
@UseGuards(AuthGuard('jwt'))
export class ExportsController {
  constructor(private exportsService: ExportsService) {}

  @Post('clips/:clipId/export')
  @ApiOperation({ summary: 'Render clip to MP4/SRT' })
  async create(
    @Request() req: any,
    @Param('clipId') clipId: string,
    @Body() dto: any,
  ) {
    const orgId = req.user.memberships[0]?.org?.id;
    if (!orgId) {
      throw new Error('No organization found');
    }
    return this.exportsService.create(clipId, orgId, dto);
  }

  @Get('exports/:id')
  @ApiOperation({ summary: 'Get export status' })
  async findOne(
    @Request() req: any,
    @Param('id') id: string,
  ) {
    const orgId = req.user.memberships[0]?.org?.id;
    if (!orgId) {
      throw new Error('No organization found');
    }
    return this.exportsService.findOne(id, orgId);
  }

  @Get('projects/:projectId/exports')
  @ApiOperation({ summary: 'List exports for project' })
  async findByProject(
    @Request() req: any,
    @Param('projectId') projectId: string,
  ) {
    const orgId = req.user.memberships[0]?.org?.id;
    if (!orgId) {
      throw new Error('No organization found');
    }
    return this.exportsService.findByProject(projectId, orgId);
  }
}
