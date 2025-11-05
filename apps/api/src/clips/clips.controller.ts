import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ClipsService } from './clips.service';

@ApiTags('clips')
@ApiBearerAuth()
@Controller('v1/projects/:projectId/clips')
@UseGuards(AuthGuard('jwt'))
export class ClipsController {
  constructor(private clipsService: ClipsService) {}

  @Get()
  @ApiOperation({ summary: 'List ranked clips for project' })
  async findAll(@Request() req, @Param('projectId') projectId: string) {
    const orgId = req.user.memberships[0]?.org?.id;
    if (!orgId) {
      throw new Error('No organization found');
    }
    return this.clipsService.findByProject(projectId, orgId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get clip details' })
  async findOne(@Request() req, @Param('id') id: string) {
    const orgId = req.user.memberships[0]?.org?.id;
    if (!orgId) {
      throw new Error('No organization found');
    }
    return this.clipsService.findOne(id, orgId);
  }
}
