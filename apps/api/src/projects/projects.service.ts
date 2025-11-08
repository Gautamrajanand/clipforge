import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { VideoService } from '../video/video.service';
import { AIService } from '../ai/ai.service';
import { TranscriptionService } from '../transcription/transcription.service';
import { CreateProjectDto } from './dto/create-project.dto';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class ProjectsService {
  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
    private video: VideoService,
    private ai: AIService,
    private transcription: TranscriptionService,
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
    // Process clip settings if provided
    const clipSettings = dto.settings ? {
      aspectRatio: dto.settings.aspectRatio || '16:9',
      clipLength: dto.settings.clipLength || 60,
      numberOfClips: dto.settings.numberOfClips || 5,
      timeframe: dto.settings.timeframe,
      targetPlatform: dto.settings.targetPlatform,
    } : null;

    console.log('📝 Creating project with settings:', JSON.stringify(clipSettings, null, 2));

    return this.prisma.project.create({
      data: {
        orgId,
        title: dto.title,
        sourceUrl: dto.sourceUrl,
        clipSettings: clipSettings as any,
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
        transcript: true,
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

    // Extract clip settings from dto
    const settings = dto?.settings || {};
    console.log('🎬 Received clip settings:', JSON.stringify(settings, null, 2));
    
    const clipSettings = {
      aspectRatio: settings.aspectRatio || '16:9',
      clipLength: settings.clipLength || 60,
      numberOfClips: settings.numberOfClips || 3,
      timeframe: settings.timeframe,
      targetPlatform: settings.targetPlatform,
    };
    
    console.log('🎬 Processed clip settings:', JSON.stringify(clipSettings, null, 2));

    // Update project status to DETECTING and save settings
    await this.prisma.project.update({
      where: { id: projectId },
      data: { 
        status: 'DETECTING',
        clipSettings: clipSettings as any,
      },
    });

    // Call ML worker for real detection
    this.callMLWorkerDetection(projectId, clipSettings);

    return {
      projectId,
      status: 'detecting',
      message: 'Highlight detection started with custom settings',
      settings: clipSettings,
    };
  }

  /**
   * Extract transcript text for a specific time range
   */
  private extractTranscriptText(
    transcript: any,
    startTime: number,
    endTime: number,
  ): string {
    if (!transcript || !transcript.data) {
      return '';
    }

    try {
      const words = transcript.data.words || [];
      
      // Find words in this time range
      const clipWords = words.filter(
        (w: any) => w.start >= startTime && w.end <= endTime,
      );

      if (clipWords.length === 0) {
        return '';
      }

      // Get the text
      return clipWords.map((w: any) => w.text).join(' ');
    } catch (error) {
      console.error('Error extracting transcript text:', error);
      return '';
    }
  }

  /**
   * Call ML worker for real clip detection
   */
  private async callMLWorkerDetection(projectId: string, settings?: any) {
    try {
      // Get transcript for this project
      const transcript = await this.prisma.transcript.findUnique({
        where: { projectId },
      });

      if (!transcript) {
        console.error(`No transcript found for project ${projectId}`);
        await this.prisma.project.update({
          where: { id: projectId },
          data: { status: 'FAILED' },
        });
        return;
      }

      // Call ML worker detection endpoint
      const mlWorkerUrl = process.env.ML_WORKER_URL || 'http://ml-workers:8000';
      const response = await fetch(`${mlWorkerUrl}/v1/ranker/detect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          transcriptId: transcript.id,
          numClips: settings?.numberOfClips || 6,
        }),
      });

      if (!response.ok) {
        throw new Error(`ML worker returned ${response.status}`);
      }

      const result = await response.json();
      console.log(`✅ Detection queued for project ${projectId}:`, result);
    } catch (error) {
      console.error(`❌ ML worker detection failed for ${projectId}:`, error);
      await this.prisma.project.update({
        where: { id: projectId },
        data: { status: 'FAILED' },
      });
    }
  }

  private async simulateDetection(projectId: string, settings?: any) {
    // Wait 3 seconds to simulate processing
    await new Promise(resolve => setTimeout(resolve, 3000));

    try {
      // Get transcript and project for this project
      const [transcript, projectData] = await Promise.all([
        this.prisma.transcript.findUnique({
          where: { projectId },
        }),
        this.prisma.project.findUnique({
          where: { id: projectId },
        }),
      ]);

      // Extract settings
      const clipLength = settings?.clipLength || 60;
      const numberOfClips = settings?.numberOfClips || 3;
      const aspectRatio = settings?.aspectRatio || '16:9';
      const targetPlatform = settings?.targetPlatform;
      const timeframe = settings?.timeframe;

      // Generate moments based on settings
      // Dynamically create the requested number of clips
      const reasons = [
        'Strong hook • Emotional',
        'Well-structured • Novel',
        'Novel content • Clarity',
        'Engaging story • Clear',
        'Emotional impact • Hook',
        'Great pacing • Structure',
        'Compelling narrative',
        'High engagement potential',
        'Clear message • Impact',
        'Strong storytelling',
      ];

      const baseMoments = [];
      const startTime = timeframe?.start || 10;
      const spacing = 10; // seconds between clips

      for (let i = 0; i < numberOfClips; i++) {
        const score = 92 - (i * 3); // Decreasing scores
        const tStart = startTime + (i * (clipLength + spacing));
        
        baseMoments.push({
          projectId,
          score,
          reason: reasons[i % reasons.length],
          tStart,
          duration: clipLength,
          features: { 
            hook: 0.9 - (i * 0.05), 
            emotion: 0.85 - (i * 0.05), 
            structure: 0.8, 
            novelty: 0.7, 
            clarity: 0.75, 
            quote: 0.6, 
            vision_focus: 0.7 
          },
          aspectRatio,
          targetPlatform,
        });
      }

      // Map to add tEnd
      const moments = baseMoments.map(m => ({
        ...m,
        tEnd: m.tStart + m.duration,
      }));

      // Generate AI-powered titles and descriptions for each moment
      const momentsWithTitles = await Promise.all(
        moments.map(async (moment) => {
          // Extract transcript text for this clip
          const clipText = this.extractTranscriptText(
            transcript,
            moment.tStart,
            moment.tEnd,
          );

          // Generate professional title and description using AI
          const { title, description } = await this.ai.generateClipMetadata(
            clipText,
            {
              videoTitle: projectData?.title,
              duration: moment.duration,
              score: moment.score,
            },
          );

          return { ...moment, title, description };
        }),
      );

      await this.prisma.moment.createMany({
        data: momentsWithTitles,
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

    // Trigger transcription asynchronously (don't wait for it)
    if (this.transcription.isAvailable()) {
      console.log(`🎙️  Triggering transcription for project: ${projectId}`);
      this.transcription.transcribeProject(projectId).catch((error) => {
        console.error('Transcription failed:', error);
      });
    } else {
      console.warn('⚠️  Transcription not available - skipping');
    }

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
      'Content-Type': metadata.ContentType || 'video/mp4',
      'Content-Length': metadata.ContentLength,
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
      'Content-Length': metadata.ContentLength,
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

  async getTranscript(projectId: string, orgId: string) {
    // Verify org owns project
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project || project.orgId !== orgId) {
      throw new NotFoundException('Project not found');
    }

    // Fetch transcript
    const transcript = await this.prisma.transcript.findUnique({
      where: { projectId },
    });

    if (!transcript) {
      throw new NotFoundException('Transcript not found');
    }

    return transcript;
  }
}
