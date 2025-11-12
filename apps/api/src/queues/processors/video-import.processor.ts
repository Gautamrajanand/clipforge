import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from '../../storage/storage.service';
import { VideoService } from '../../video/video.service';
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
      await job.updateProgress(100);

      this.logger.log(`✅ Video import complete for project ${projectId}`);

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
