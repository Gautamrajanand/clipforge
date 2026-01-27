import { Controller, Get, Post, Patch, Param, Body, UseGuards, Request, SetMetadata } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ClerkAuthGuard } from '../auth/guards/clerk-auth.guard';
import { ExportsService } from './exports.service';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

@ApiTags('exports')
@ApiBearerAuth()
@Controller('v1')
@UseGuards(ClerkAuthGuard)
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

  @Public()
  @Patch('exports/:id')
  @ApiOperation({ summary: 'Update export status and artifacts (ML worker only)' })
  async update(
    @Param('id') id: string,
    @Body() dto: { status?: string; artifacts?: any },
  ) {
    // This endpoint is called by the ML worker, no auth required
    return this.exportsService.update(id, dto);
  }
}
