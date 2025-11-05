import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { VideoService } from '../video/video.service';
import { CreateProjectDto } from './dto/create-project.dto';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class ProjectsService {
  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
    private video: VideoService,
  ) {}

  // Helper to convert BigInt to number for JSON serialization
  private serializeProject(project: any) {
    if (!project) return project;
    
    return {
      ...project,
      assets: project.assets?.map((asset: any) => ({
        ...asset,
        size: asset.size ? Number(asset.size) : null,
      })),
    };
  }

  async create(orgId: string, dto: CreateProjectDto) {
    return this.prisma.project.create({
      data: {
        orgId,
        title: dto.title,
        sourceUrl: dto.sourceUrl,
      },
    });
  }

  async findAll(orgId: string, skip = 0, take = 20) {
    const projects = await this.prisma.project.findMany({
      where: { orgId },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        assets: true,
        transcript: true,
        moments: { orderBy: { score: 'desc' }, take: 5 },
      },
    });
    
    return projects.map(p => this.serializeProject(p));
  }

  async findOne(projectId: string, orgId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        assets: true,
        moments: { orderBy: { score: 'desc' } },
        exports: { orderBy: { createdAt: 'desc' }, take: 10 },
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.orgId !== orgId) {
      throw new ForbiddenException('Access denied');
    }

    return this.serializeProject(project);
  }

  async detect(projectId: string, orgId: string, dto: any) {
    const project = await this.findOne(projectId, orgId);

    // Update project status to DETECTING
    await this.prisma.project.update({
      where: { id: projectId },
      data: { status: 'DETECTING' },
    });

    // Simulate ML detection - create some mock moments asynchronously
    // In production, this would enqueue a job to the ML workers
    this.simulateDetection(projectId);

    return {
      projectId,
      status: 'detecting',
      message: 'Highlight detection started',
    };
  }

  private async simulateDetection(projectId: string) {
    // Wait 3 seconds to simulate processing
    await new Promise(resolve => setTimeout(resolve, 3000));

    try {
      await this.prisma.moment.createMany({
        data: [
          {
            projectId,
            score: 92,
            reason: 'Strong hook • Emotional',
            tStart: 10.5,
            tEnd: 65.5,
            duration: 55,
            features: { hook: 0.9, emotion: 0.85, structure: 0.8, novelty: 0.7, clarity: 0.75, quote: 0.6, vision_focus: 0.7 },
          },
          {
            projectId,
            score: 87,
            reason: 'Well-structured • Novel',
            tStart: 120,
            tEnd: 175,
            duration: 55,
            features: { structure: 0.95, novelty: 0.85, clarity: 0.8, hook: 0.7, emotion: 0.6, quote: 0.5, vision_focus: 0.65 },
          },
          {
            projectId,
            score: 81,
            reason: 'Novel content • Clarity',
            tStart: 200,
            tEnd: 255,
            duration: 55,
            features: { novelty: 0.9, clarity: 0.85, structure: 0.75, hook: 0.65, emotion: 0.6, quote: 0.55, vision_focus: 0.7 },
          },
        ],
      });

      // Update project status to READY
      await this.prisma.project.update({
        where: { id: projectId },
        data: { status: 'READY' },
      });
    } catch (error) {
      console.error('Error creating moments:', error);
    }
  }

  async update(projectId: string, orgId: string, dto: any) {
    const project = await this.findOne(projectId, orgId);
    return this.prisma.project.update({
      where: { id: projectId },
      data: dto,
    });
  }

  async uploadVideo(projectId: string, orgId: string, file: any) {
    const project = await this.findOne(projectId, orgId);

    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Upload to MinIO
    const key = `projects/${projectId}/source${path.extname(file.originalname)}`;
    const result = await this.storage.uploadFile(key, file.buffer, file.mimetype);

    // Get video metadata
    const tempPath = this.video.getTempFilePath(path.extname(file.originalname));
    await fs.writeFile(tempPath, file.buffer);
    const metadata = await this.video.getVideoMetadata(tempPath);
    await this.video.cleanupTempFile(tempPath);

    // Update project with video info
    await this.prisma.project.update({
      where: { id: projectId },
      data: {
        sourceUrl: result.key,
        status: 'INGESTING',
      },
    });

    // Create asset record
    await this.prisma.asset.create({
      data: {
        projectId,
        kind: 'ORIGINAL',
        url: result.key,
        duration: metadata.duration,
        mimeType: file.mimetype,
        size: BigInt(file.size),
      },
    });

    return {
      message: 'Video uploaded successfully',
      key: result.key,
      metadata: {
        ...metadata,
        size: file.size, // Return as number, not BigInt
      },
    };
  }

  async streamVideo(projectId: string, orgId: string, res: Response) {
    const project = await this.findOne(projectId, orgId);

    if (!project.sourceUrl) {
      throw new NotFoundException('No video file found for this project');
    }

    const metadata = await this.storage.getFileMetadata(project.sourceUrl);
    const stream = this.storage.getFileStream(project.sourceUrl);

    res.set({
      'Content-Type': metadata.contentType || 'video/mp4',
      'Content-Length': metadata.contentLength,
      'Accept-Ranges': 'bytes',
    });

    return new Promise((resolve, reject) => {
      stream.pipe(res);
      stream.on('error', reject);
      stream.on('end', resolve);
    });
  }

  async exportMoments(projectId: string, orgId: string, momentIds: string[]) {
    const project = await this.findOne(projectId, orgId);

    if (!project.sourceUrl) {
      throw new BadRequestException('No source video found');
    }

    if (!momentIds || momentIds.length === 0) {
      throw new BadRequestException('No moments selected');
    }

    // Get the moments
    const moments = await this.prisma.moment.findMany({
      where: {
        id: { in: momentIds },
        projectId,
      },
    });

    if (moments.length === 0) {
      throw new NotFoundException('No moments found');
    }

    // Download source video to temp
    const sourceBuffer = await this.storage.downloadFile(project.sourceUrl);
    const sourcePath = this.video.getTempFilePath(path.extname(project.sourceUrl));
    await fs.writeFile(sourcePath, sourceBuffer);

    const exports = [];

    for (const moment of moments) {
      // Cut the video segment
      const outputPath = this.video.getTempFilePath('.mp4');
      await this.video.cutVideoSegment(
        sourcePath,
        outputPath,
        moment.tStart,
        moment.tEnd,
      );

      // Upload the clip to MinIO
      const clipBuffer = await fs.readFile(outputPath);
      const clipKey = `projects/${projectId}/exports/${moment.id}.mp4`;
      await this.storage.uploadFile(clipKey, clipBuffer, 'video/mp4');

      // Create export record
      const exportRecord = await this.prisma.export.create({
        data: {
          projectId,
          momentId: moment.id,
          format: 'MP4',
          artifacts: {
            mp4_url: clipKey,
          },
          status: 'COMPLETED',
        },
      });

      exports.push(exportRecord);

      // Cleanup temp file
      await this.video.cleanupTempFile(outputPath);
    }

    // Cleanup source temp file
    await this.video.cleanupTempFile(sourcePath);

    return {
      message: `Exported ${exports.length} clips successfully`,
      exports,
    };
  }

  async downloadExport(exportId: string, orgId: string, res: Response) {
    const exportRecord = await this.prisma.export.findUnique({
      where: { id: exportId },
      include: { project: true },
    });

    if (!exportRecord) {
      throw new NotFoundException('Export not found');
    }

    if (exportRecord.project.orgId !== orgId) {
      throw new ForbiddenException('Access denied');
    }

    const artifacts = exportRecord.artifacts as any;
    const clipUrl = artifacts.mp4_url;
    
    const metadata = await this.storage.getFileMetadata(clipUrl);
    const stream = this.storage.getFileStream(clipUrl);

    res.set({
      'Content-Type': 'video/mp4',
      'Content-Length': metadata.contentLength,
      'Content-Disposition': `attachment; filename="clip-${exportRecord.momentId}.mp4"`,
    });

    return new Promise((resolve, reject) => {
      stream.pipe(res);
      stream.on('error', reject);
      stream.on('end', resolve);
    });
  }

  async delete(projectId: string, orgId: string) {
    const project = await this.findOne(projectId, orgId);
    return this.prisma.project.delete({
      where: { id: projectId },
    });
  }
}
