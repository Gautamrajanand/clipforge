import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  UseInterceptors,
  UploadedFile,
  Res,
  StreamableFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { Response } from 'express';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { DetectClipsDto } from './dto/clip-settings.dto';

@ApiTags('projects')
@ApiBearerAuth()
@Controller('v1/projects')
@UseGuards(AuthGuard('jwt'))
export class ProjectsController {
  constructor(private projectsService: ProjectsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new project' })
  async create(@Request() req: any, @Body() dto: CreateProjectDto) {
    const orgId = req.user.memberships[0]?.org?.id;
    if (!orgId) {
      throw new Error('No organization found');
    }
    return this.projectsService.create(orgId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List projects' })
  async findAll(
    @Request() req: any,
    @Query('skip') skip = 0,
    @Query('take') take = 20,
  ) {
    const orgId = req.user.memberships[0]?.org?.id;
    if (!orgId) {
      throw new Error('No organization found');
    }
    return this.projectsService.findAll(orgId, skip, take);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get project details' })
  async findOne(@Request() req: any, @Param('id') id: string) {
    const orgId = req.user.memberships[0]?.org?.id;
    if (!orgId) {
      throw new Error('No organization found');
    }
    return this.projectsService.findOne(id, orgId);
  }

  @Post(':id/detect')
  @ApiOperation({ summary: 'Run highlight detection with custom settings (async)' })
  async detect(@Request() req: any, @Param('id') id: string, @Body() dto: DetectClipsDto) {
    const orgId = req.user.memberships[0]?.org?.id;
    if (!orgId) {
      throw new Error('No organization found');
    }
    return this.projectsService.detect(id, orgId, dto);
  }

  @Post(':id/upload')
  @ApiOperation({ summary: 'Upload video file for project' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('video'))
  async uploadVideo(
    @Request() req: any,
    @Param('id') id: string,
    @UploadedFile() file: any,
  ) {
    const orgId = req.user.memberships[0]?.org?.id;
    if (!orgId) {
      throw new Error('No organization found');
    }
    return this.projectsService.uploadVideo(id, orgId, file);
  }

  @Get(':id/video')
  @ApiOperation({ summary: 'Stream project video' })
  async streamVideo(
    @Request() req: any,
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const orgId = req.user.memberships[0]?.org?.id;
    if (!orgId) {
      throw new Error('No organization found');
    }
    return this.projectsService.streamVideo(id, orgId, res);
  }

  @Get(':id/transcript')
  @ApiOperation({ summary: 'Get project transcript' })
  async getTranscript(@Request() req: any, @Param('id') id: string) {
    const orgId = req.user.memberships[0]?.org?.id;
    if (!orgId) {
      throw new Error('No organization found');
    }
    return this.projectsService.getTranscript(id, orgId);
  }

  @Post(':id/export')
  @ApiOperation({ summary: 'Export selected moments as video clips' })
  async exportMoments(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: { momentIds: string[] },
  ) {
    const orgId = req.user.memberships[0]?.org?.id;
    if (!orgId) {
      throw new Error('No organization found');
    }
    return this.projectsService.exportMoments(id, orgId, dto.momentIds);
  }

  @Get('exports/:exportId/download')
  @ApiOperation({ summary: 'Download exported clip' })
  async downloadExport(
    @Request() req: any,
    @Param('exportId') exportId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const orgId = req.user.memberships[0]?.org?.id;
    if (!orgId) {
      throw new Error('No organization found');
    }
    return this.projectsService.downloadExport(exportId, orgId, res);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update project' })
  async update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: { title?: string },
  ) {
    const orgId = req.user.memberships[0]?.org?.id;
    if (!orgId) {
      throw new Error('No organization found');
    }
    return this.projectsService.update(id, orgId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a project' })
  async delete(@Request() req: any, @Param('id') id: string) {
    const orgId = req.user.memberships[0]?.org?.id;
    if (!orgId) {
      throw new Error('No organization found');
    }
    return this.projectsService.delete(id, orgId);
  }
}
