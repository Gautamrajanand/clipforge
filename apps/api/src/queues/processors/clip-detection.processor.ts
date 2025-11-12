import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { ClipsService } from '../../clips/clips.service';

export interface ClipDetectionJobData {
  projectId: string;
  settings?: {
    numberOfClips?: number;
    clipLength?: number;
    platform?: string;
  };
}

@Processor('clip-detection', {
  concurrency: 5, // Process 5 detections concurrently
})
export class ClipDetectionProcessor extends WorkerHost {
  private readonly logger = new Logger(ClipDetectionProcessor.name);

  constructor(private clips: ClipsService) {
    super();
  }

  async process(job: Job<ClipDetectionJobData>): Promise<any> {
    const { projectId, settings } = job.data;

    this.logger.log(`🔄 Processing clip detection job ${job.id} for project ${projectId}`);

    try {
      // Update job progress
      await job.updateProgress(10);

      // Trigger clip generation
      // Note: This will be called after transcription completes
      // For now, we just mark the job as complete
      // The actual clip generation is triggered by the transcription completion
      
      // Update job progress
      await job.updateProgress(100);

      this.logger.log(`✅ Clip detection job queued for project ${projectId}`);

      return {
        projectId,
        status: 'queued',
      };
    } catch (error) {
      this.logger.error(`❌ Clip detection failed for project ${projectId}:`, error);
      throw error;
    }
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job<ClipDetectionJobData>) {
    this.logger.log(`✅ Clip detection job ${job.id} completed for project ${job.data.projectId}`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job<ClipDetectionJobData>, error: Error) {
    this.logger.error(`❌ Clip detection job ${job.id} failed:`, error.message);
  }

  @OnWorkerEvent('active')
  onActive(job: Job<ClipDetectionJobData>) {
    this.logger.log(`🔄 Clip detection job ${job.id} started for project ${job.data.projectId}`);
  }
}
