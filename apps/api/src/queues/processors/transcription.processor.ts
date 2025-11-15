import { Processor, WorkerHost, OnWorkerEvent, InjectQueue } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job, Queue } from 'bullmq';
import { TranscriptionService } from '../../transcription/transcription.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ClipDetectionJobData } from './clip-detection.processor';
import { SubtitleExportJobData } from './subtitle-export.processor';

export interface TranscriptionJobData {
  projectId: string;
}

@Processor('transcription', {
  concurrency: 2, // Process 2 transcriptions concurrently
})
export class TranscriptionProcessor extends WorkerHost {
  private readonly logger = new Logger(TranscriptionProcessor.name);

  constructor(
    private transcription: TranscriptionService,
    private prisma: PrismaService,
    @InjectQueue('clip-detection') private clipDetectionQueue: Queue<ClipDetectionJobData>,
    @InjectQueue('subtitle-export') private subtitleExportQueue: Queue<SubtitleExportJobData>,
  ) {
    super();
  }

  async process(job: Job<TranscriptionJobData>): Promise<any> {
    const { projectId } = job.data;

    this.logger.log(`🔄 Processing transcription job ${job.id} for project ${projectId}`);

    try {
      // Update job progress
      await job.updateProgress(10);

      // Trigger transcription
      await this.transcription.transcribeProject(projectId);

      // Update job progress
      await job.updateProgress(80);

      this.logger.log(`✅ Transcription complete for project ${projectId}`);

      // ✅ SCALE-FIRST: Trigger clip detection via queue
      // Get project settings to check mode
      const project = await this.prisma.project.findUnique({
        where: { id: projectId },
      });

      const clipSettings = (project?.clipSettings as any) || {};

      // Skip clip detection if in subtitles-only or reframe-only mode
      if (clipSettings.subtitlesMode || clipSettings.reframeMode) {
        this.logger.log(`⏭️  Skipping clip detection for project ${projectId} (${clipSettings.subtitlesMode ? 'Subtitles' : 'Reframe'} mode)`);
        
        // If subtitles mode, queue subtitle export job
        if (clipSettings.subtitlesMode) {
          this.logger.log(`📝 Queuing subtitle export job for project ${projectId}`);
          await this.subtitleExportQueue.add(
            'export-subtitles',
            { projectId, orgId: project.orgId },
            {
              jobId: `subtitle-export-${projectId}`,
              priority: 2,
              attempts: 2,
              backoff: {
                type: 'exponential',
                delay: 5000,
              },
            },
          );
        } else {
          // Reframe mode - just mark as READY
          await this.prisma.project.update({
            where: { id: projectId },
            data: { status: 'READY' },
          });
        }
      } else {
        // Normal flow: queue clip detection
        this.logger.log(`🎬 Queuing clip detection job for project ${projectId}`);
        await this.clipDetectionQueue.add(
          'detect-clips',
          { projectId, settings: clipSettings },
          {
            jobId: `detect-${projectId}`,
            priority: 3,
            attempts: 3,
            backoff: {
              type: 'exponential',
              delay: 2000,
            },
          },
        );
      }

      // Update job progress
      await job.updateProgress(100);

      return { projectId, status: 'completed' };
    } catch (error) {
      this.logger.error(`❌ Transcription failed for project ${projectId}:`, error);
      throw error;
    }
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job<TranscriptionJobData>) {
    this.logger.log(`✅ Transcription job ${job.id} completed for project ${job.data.projectId}`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job<TranscriptionJobData>, error: Error) {
    this.logger.error(`❌ Transcription job ${job.id} failed:`, error.message);
  }

  @OnWorkerEvent('active')
  onActive(job: Job<TranscriptionJobData>) {
    this.logger.log(`🔄 Transcription job ${job.id} started for project ${job.data.projectId}`);
  }
}
