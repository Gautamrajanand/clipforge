import { Processor, WorkerHost, OnWorkerEvent, InjectQueue } from '@nestjs/bullmq';
import { Logger, BadRequestException } from '@nestjs/common';
import { Job, Queue } from 'bullmq';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from '../../storage/storage.service';
import { VideoService } from '../../video/video.service';
import { CreditsService } from '../../credits/credits.service';
import { TranscriptionJobData } from './transcription.processor';
import { promises as fs } from 'fs';

export interface VideoImportJobData {
  projectId: string;
  url: string;
  customTitle?: string;
}

@Processor('video-import', {
  concurrency: 3, // Process 3 imports concurrently
})
export class VideoImportProcessor extends WorkerHost {
  private readonly logger = new Logger(VideoImportProcessor.name);

  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
    private video: VideoService,
    private credits: CreditsService,
    @InjectQueue('transcription') private transcriptionQueue: Queue<TranscriptionJobData>,
  ) {
    super();
  }

  async process(job: Job<VideoImportJobData>): Promise<any> {
    const { projectId, url, customTitle } = job.data;

    this.logger.log(`🔄 Processing video import job ${job.id} for project ${projectId}`);
    
    try {
      // Update job progress
      await job.updateProgress(10);

      // Import VideoDownloadService dynamically
      const { VideoDownloadService } = await import('../../video/video-download.service');
      const downloadService = new VideoDownloadService();

      // Update job progress
      await job.updateProgress(20);

      // Download video from URL
      this.logger.log(`📥 Downloading video from: ${url}`);
      const { filePath, info } = await downloadService.downloadVideo(url, customTitle);

      // Update job progress
      await job.updateProgress(50);

      // Read the downloaded file
      const fileBuffer = await fs.readFile(filePath);
      const fileSize = (await fs.stat(filePath)).size;

      // Upload to MinIO
      this.logger.log(`📤 Uploading to storage...`);
      const key = `projects/${projectId}/source.mp4`;
      const result = await this.storage.uploadFile(key, fileBuffer, 'video/mp4');

      // Update job progress
      await job.updateProgress(70);

      // Get video metadata
      const metadata = await this.video.getVideoMetadata(filePath);

      // Get project and organization info for credit deduction
      const project = await this.prisma.project.findUnique({
        where: { id: projectId },
        select: { orgId: true, clipSettings: true },
      });

      if (!project) {
        throw new Error('Project not found');
      }

      // 💳 CREDIT SYSTEM: Calculate and deduct credits
      const baseCredits = this.credits.calculateCredits(metadata.duration);
      const creditsNeeded = baseCredits; // Same as direct upload (market standard)
      this.logger.log(`💳 URL Import - Video duration: ${metadata.duration}s (${(metadata.duration / 60).toFixed(2)} min) → ${creditsNeeded} credits`);

      // Check if organization has sufficient credits
      const hasSufficientCredits = await this.credits.hasSufficientCredits(project.orgId, creditsNeeded);
      if (!hasSufficientCredits) {
        // Cleanup downloaded file before throwing error
        await downloadService.cleanup(filePath);
        
        const currentBalance = await this.credits.getBalance(project.orgId);
        throw new BadRequestException(
          `Insufficient credits. You need ${creditsNeeded} credits but only have ${currentBalance}. Please upgrade your plan or wait for your monthly renewal.`
        );
      }

      // Determine processing type from clipSettings
      const clipSettings = project.clipSettings as any;
      let processingType: 'CLIPS' | 'REFRAME' | 'CAPTIONS' = 'CLIPS'; // Default
      if (clipSettings?.reframeMode) {
        processingType = 'REFRAME';
      } else if (clipSettings?.subtitlesMode) {
        processingType = 'CAPTIONS';
      }

      // Deduct credits
      await this.credits.deductCredits(
        project.orgId,
        creditsNeeded,
        processingType,
        projectId,
        metadata.duration / 60, // Convert to minutes
        `${processingType} processing (URL import): ${(metadata.duration / 60).toFixed(2)} minutes`
      );

      this.logger.log(`✅ Deducted ${creditsNeeded} credits for URL import`);

      // Cleanup downloaded file
      await downloadService.cleanup(filePath);

      // Update job progress
      await job.updateProgress(80);

      // Update project with video info
      const finalTitle = (customTitle && customTitle.trim()) ? customTitle : info.title;
      this.logger.log(`📝 Setting project title: "${finalTitle}"`);

      await this.prisma.project.update({
        where: { id: projectId },
        data: {
          title: finalTitle,
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
          mimeType: 'video/mp4',
          size: BigInt(fileSize),
        },
      });

      // Update job progress
      await job.updateProgress(90);

      this.logger.log(`✅ Video import complete for project ${projectId}`);

      // ✅ SCALE-FIRST: Trigger transcription via queue (not fire-and-forget)
      this.logger.log(`🎙️ Queuing transcription job for project ${projectId}`);
      await this.transcriptionQueue.add(
        'transcribe',
        { projectId },
        {
          jobId: `transcribe-${projectId}`,
          priority: 2,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
        },
      );

      // Update job progress
      await job.updateProgress(100);

      return {
        projectId,
        title: finalTitle,
        duration: metadata.duration,
        size: fileSize,
      };
    } catch (error) {
      this.logger.error(`❌ Video import failed for project ${projectId}:`, error);
      
      // Update project status to ERROR
      await this.prisma.project.update({
        where: { id: projectId },
        data: { status: 'ERROR' },
      }).catch(err => this.logger.error('Failed to update project status:', err));

      throw error;
    }
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job<VideoImportJobData>) {
    this.logger.log(`✅ Job ${job.id} completed for project ${job.data.projectId}`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job<VideoImportJobData>, error: Error) {
    this.logger.error(`❌ Job ${job.id} failed for project ${job.data.projectId}:`, error.message);
  }

  @OnWorkerEvent('active')
  onActive(job: Job<VideoImportJobData>) {
    this.logger.log(`🔄 Job ${job.id} started for project ${job.data.projectId}`);
  }
}
