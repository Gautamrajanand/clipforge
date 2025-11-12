import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { TranscriptionService } from '../../transcription/transcription.service';

export interface TranscriptionJobData {
  projectId: string;
}

@Processor('transcription', {
  concurrency: 2, // Process 2 transcriptions concurrently
})
export class TranscriptionProcessor extends WorkerHost {
  private readonly logger = new Logger(TranscriptionProcessor.name);

  constructor(private transcription: TranscriptionService) {
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
      await job.updateProgress(100);

      this.logger.log(`✅ Transcription complete for project ${projectId}`);

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
