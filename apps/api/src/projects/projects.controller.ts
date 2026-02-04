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
  SetMetadata,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiResponse, ApiQuery, ApiBody, ApiParam } from '@nestjs/swagger';
import { Response } from 'express';
import { ClerkAuthGuard } from '../auth/guards/clerk-auth.guard';
import { ProjectsService } from './projects.service';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
import { ExportMomentsDto } from './dto/export-moments.dto';
import { CreateProjectDto } from './dto/create-project.dto';
import { DetectClipsDto } from './dto/clip-settings.dto';
import { ReframeDto } from './dto/reframe.dto';
import { SubtitlesDto } from './dto/subtitles.dto';

@ApiTags('Projects')
@ApiBearerAuth('clerk-jwt')
@Controller('v1/projects')
@UseGuards(ClerkAuthGuard)
export class ProjectsController {
  constructor(private projectsService: ProjectsService) {}

  @Post()
  @ApiOperation({ 
    summary: 'Create a new project',
    description: 'Creates a new video project. Returns project ID and metadata. Video must be uploaded separately using /upload or /import-url endpoints.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['title'],
      properties: {
        title: {
          type: 'string',
          description: 'Project title',
          example: 'My Podcast Episode 1',
        },
        description: {
          type: 'string',
          description: 'Project description',
          example: 'Interview with John Doe about AI',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Project created successfully',
    schema: {
      example: {
        id: 'proj_123',
        title: 'My Podcast Episode 1',
        description: 'Interview with John Doe about AI',
        status: 'CREATED',
        createdAt: '2025-11-23T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async create(@Request() req: any, @Body() dto: CreateProjectDto) {
    const orgId = req.user.memberships[0]?.org?.id;
    if (!orgId) {
      throw new Error('No organization found');
    }
    return this.projectsService.create(orgId, dto);
  }

  @Get()
  @ApiOperation({ 
    summary: 'List all projects',
    description: 'Returns paginated list of projects for the authenticated organization. Includes project metadata, status, and expiry information.',
  })
  @ApiQuery({
    name: 'skip',
    required: false,
    type: Number,
    description: 'Number of projects to skip (default: 0)',
    example: 0,
  })
  @ApiQuery({
    name: 'take',
    required: false,
    type: Number,
    description: 'Number of projects to return (default: 20, max: 100)',
    example: 20,
  })
  @ApiResponse({
    status: 200,
    description: 'Projects retrieved successfully',
    schema: {
      example: [
        {
          id: 'proj_123',
          title: 'My Podcast Episode 1',
          status: 'COMPLETED',
          duration: 3600,
          createdAt: '2025-11-23T00:00:00.000Z',
          expiresAt: null,
          clipSettings: { clipLength: 45, clipCount: 5 },
        },
      ],
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async findAll(
    @Request() req: any,
    @Query('skip') skip: string | number = 0,
    @Query('take') take: string | number = 20,
  ) {
    const orgId = req.user.memberships[0]?.org?.id;
    if (!orgId) {
      throw new Error('No organization found');
    }
    // Convert query params to integers
    const skipInt = typeof skip === 'string' ? parseInt(skip, 10) : skip;
    const takeInt = typeof take === 'string' ? parseInt(take, 10) : take;
    return this.projectsService.findAll(orgId, skipInt, takeInt);
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Get project details',
    description: 'Returns detailed information about a specific project including status, settings, transcript, detected clips, and exports.',
  })
  @ApiParam({
    name: 'id',
    description: 'Project ID',
    example: 'proj_123',
  })
  @ApiResponse({
    status: 200,
    description: 'Project details retrieved successfully',
    schema: {
      example: {
        id: 'proj_123',
        title: 'My Podcast Episode 1',
        status: 'COMPLETED',
        duration: 3600,
        videoUrl: 'https://storage.example.com/video.mp4',
        transcript: { segments: [] },
        detectedClips: [{ start: 0, end: 45, score: 0.95 }],
        clipSettings: { clipLength: 45, clipCount: 5 },
        createdAt: '2025-11-23T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 404,
    description: 'Project not found',
  })
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
  @ApiOperation({ 
    summary: 'Upload video file',
    description: 'Uploads a video file to an existing project. Supports MP4, MOV, AVI, WebM, MKV formats. Max size: 1GB. Deducts credits based on video duration.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        video: {
          type: 'string',
          format: 'binary',
          description: 'Video file to upload',
        },
      },
    },
  })
  @ApiParam({
    name: 'id',
    description: 'Project ID',
    example: 'proj_123',
  })
  @ApiResponse({
    status: 200,
    description: 'Video uploaded successfully',
    schema: {
      example: {
        projectId: 'proj_123',
        status: 'PROCESSING',
        duration: 3600,
        creditsDeducted: 60,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid file format or insufficient credits',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @UseInterceptors(FileInterceptor('video'))
  async uploadVideo(
    @Request() req: any,
    @Param('id') id: string,
    @UploadedFile() file: any,
  ) {
    console.log('📤 Upload request - req.user:', JSON.stringify(req.user, null, 2));
    console.log('📤 Upload request - memberships:', req.user?.memberships);
    const orgId = req.user.memberships[0]?.org?.id;
    console.log('📤 Upload request - orgId:', orgId);
    if (!orgId) {
      throw new Error('No organization found');
    }
    return this.projectsService.uploadVideo(id, orgId, file);
  }

  @Post(':id/import-url')
  @ApiOperation({ 
    summary: 'Import video from URL',
    description: 'Imports video from YouTube, Vimeo, Rumble, Twitter/X, or TikTok. Automatically extracts metadata and downloads video. Deducts credits based on duration.',
  })
  @ApiParam({
    name: 'id',
    description: 'Project ID',
    example: 'proj_123',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['url'],
      properties: {
        url: {
          type: 'string',
          description: 'Video URL (YouTube, Vimeo, Rumble, Twitter, TikTok)',
          example: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        },
        title: {
          type: 'string',
          description: 'Optional custom title (auto-extracted if not provided)',
          example: 'My Video Title',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Video import started',
    schema: {
      example: {
        projectId: 'proj_123',
        status: 'IMPORTING',
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        estimatedDuration: 180,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid URL or unsupported platform',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async importVideoFromUrl(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: { url: string; title?: string },
  ) {
    const orgId = req.user.memberships[0]?.org?.id;
    if (!orgId) {
      throw new Error('No organization found');
    }
    return this.projectsService.importVideoFromUrl(id, orgId, dto.url, dto.title);
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

  @Public()
  @Get(':id/transcript')
  @ApiOperation({ summary: 'Get project transcript (ML worker access)' })
  async getTranscript(@Request() req: any, @Param('id') id: string) {
    // Allow ML worker to access without auth
    const orgId = req.user?.memberships?.[0]?.org?.id;
    return this.projectsService.getTranscript(id, orgId);
  }

  @Get(':id/download-captioned')
  @ApiOperation({ summary: 'Download video with burned-in captions' })
  async downloadCaptioned(
    @Request() req: any,
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const orgId = req.user.memberships[0]?.org?.id;
    if (!orgId) {
      throw new Error('No organization found');
    }
    return this.projectsService.downloadCaptionedVideo(id, orgId, res);
  }

  @Post(':id/export')
  @ApiOperation({ 
    summary: 'Export clips with customization',
    description: 'Exports selected clips with aspect ratio conversion, subtitles, and custom styling. Supports 9:16, 1:1, 16:9, 4:5 aspect ratios. Deducts 1 credit per minute exported.',
  })
  @ApiParam({
    name: 'id',
    description: 'Project ID',
    example: 'proj_123',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['clips', 'aspectRatio'],
      properties: {
        clips: {
          type: 'array',
          description: 'Array of clips to export',
          items: {
            type: 'object',
            properties: {
              start: { type: 'number', example: 0 },
              end: { type: 'number', example: 45 },
            },
          },
        },
        aspectRatio: {
          type: 'string',
          enum: ['9:16', '1:1', '16:9', '4:5'],
          description: 'Target aspect ratio',
          example: '9:16',
        },
        subtitles: {
          type: 'object',
          description: 'Subtitle styling options',
          properties: {
            enabled: { type: 'boolean', example: true },
            style: { type: 'string', example: 'minimal' },
            color: { type: 'string', example: '#FFFFFF' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Export started successfully',
    schema: {
      example: {
        exportId: 'export_123',
        projectId: 'proj_123',
        status: 'PROCESSING',
        clipCount: 5,
        estimatedTime: 120,
        creditsDeducted: 4,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid clips or insufficient credits',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async exportMoments(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: ExportMomentsDto,
  ) {
    const orgId = req.user.memberships[0]?.org?.id;
    if (!orgId) {
      throw new Error('No organization found');
    }
    
    // Queue export job (async, uses API's advanced animator)
    await this.projectsService.queueExport(id, orgId, dto);
    
    // Return backward-compatible response for frontend polling
    return {
      status: 'processing',
      message: 'Export started. Your clips will appear in a few minutes.',
    };
  }

  @Get(':id/exports')
  @UseGuards(ClerkAuthGuard)
  @ApiOperation({ summary: 'Get all exports for a project' })
  async getProjectExports(
    @Request() req: any,
    @Param('id') id: string,
  ) {
    const orgId = req.user.memberships[0]?.org?.id;
    if (!orgId) {
      throw new Error('No organization found');
    }
    return this.projectsService.getProjectExports(id, orgId);
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
  @ApiOperation({ 
    summary: 'Update project',
    description: 'Updates project metadata such as title. Other fields are read-only.',
  })
  @ApiParam({
    name: 'id',
    description: 'Project ID',
    example: 'proj_123',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'New project title',
          example: 'Updated Project Title',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Project updated successfully',
    schema: {
      example: {
        id: 'proj_123',
        title: 'Updated Project Title',
        updatedAt: '2025-11-23T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 404,
    description: 'Project not found',
  })
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
  @ApiOperation({ 
    summary: 'Delete project',
    description: 'Permanently deletes a project and all associated data (video, transcript, clips, exports). This action cannot be undone.',
  })
  @ApiParam({
    name: 'id',
    description: 'Project ID',
    example: 'proj_123',
  })
  @ApiResponse({
    status: 200,
    description: 'Project deleted successfully',
    schema: {
      example: {
        message: 'Project deleted successfully',
        projectId: 'proj_123',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 404,
    description: 'Project not found',
  })
  async delete(@Request() req: any, @Param('id') id: string) {
    const orgId = req.user.memberships[0]?.org?.id;
    if (!orgId) {
      throw new Error('No organization found');
    }
    return this.projectsService.delete(id, orgId);
  }

  @Post(':id/reframe')
  @ApiOperation({ summary: 'Reframe video to different aspect ratio' })
  async reframe(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: ReframeDto,
  ) {
    const orgId = req.user.memberships[0]?.org?.id;
    if (!orgId) {
      throw new Error('No organization found');
    }
    return this.projectsService.reframeVideo(id, orgId, dto);
  }

  @Post(':id/subtitles')
  @ApiOperation({ summary: 'Generate subtitles for video' })
  async subtitles(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: SubtitlesDto,
  ) {
    const orgId = req.user.memberships[0]?.org?.id;
    if (!orgId) {
      throw new Error('No organization found');
    }
    return this.projectsService.generateSubtitles(id, orgId, dto);
  }
}

// Separate controller for internal/public endpoints (no auth required)
@ApiTags('Projects - Internal')
@Controller('v1/projects')
export class ProjectsInternalController {
  constructor(private projectsService: ProjectsService) {}

  @Post(':id/notify-ready')
  @ApiOperation({ summary: 'Internal endpoint for ML workers to trigger email notifications' })
  async notifyReady(
    @Param('id') id: string,
    @Body() dto: { clipCount?: number },
  ) {
    // This endpoint is called by ML workers (no auth required for internal service calls)
    return this.projectsService.sendProjectReadyEmail(id, dto.clipCount);
  }
}
