import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { VideoImportJobData } from './processors/video-import.processor';
import { TranscriptionJobData } from './processors/transcription.processor';
import { ClipDetectionJobData } from './processors/clip-detection.processor';
import { SubtitleExportJobData } from './processors/subtitle-export.processor';
import { ClipExportJobData } from './processors/clip-export.processor';
import { ReframeJobData } from './processors/reframe.processor';

@Injectable()
export class QueuesService {
  private readonly logger = new Logger(QueuesService.name);

  constructor(
    @InjectQueue('video-import') private videoImportQueue: Queue<VideoImportJobData>,
    @InjectQueue('transcription') private transcriptionQueue: Queue<TranscriptionJobData>,
    @InjectQueue('clip-detection') private clipDetectionQueue: Queue<ClipDetectionJobData>,
    @InjectQueue('subtitle-export') private subtitleExportQueue: Queue<SubtitleExportJobData>,
    @InjectQueue('video-export') private clipExportQueue: Queue<ClipExportJobData>,
    @InjectQueue('reframe') private reframeQueue: Queue<ReframeJobData>,
  ) {}

  /**
   * Add video import job to queue
   */
  async addVideoImportJob(projectId: string, url: string, customTitle?: string) {
    this.logger.log(`📥 Adding video import job for project ${projectId}`);
    
    const job = await this.videoImportQueue.add(
      'import-video',
      { projectId, url, customTitle },
      {
        jobId: `import-${projectId}`,
        priority: 1, // High priority
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      },
    );

    return {
      jobId: job.id,
      projectId,
      status: 'queued',
    };
  }

  /**
   * Add transcription job to queue
   */
  async addTranscriptionJob(projectId: string) {
    this.logger.log(`🎙️ Adding transcription job for project ${projectId}`);
    
    const job = await this.transcriptionQueue.add(
      'transcribe',
      { projectId },
      {
        jobId: `transcribe-${projectId}`,
        priority: 2, // Medium priority
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      },
    );

    return {
      jobId: job.id,
      projectId,
      status: 'queued',
    };
  }

  /**
   * Add clip detection job to queue
   */
  async addClipDetectionJob(projectId: string, settings?: any) {
    this.logger.log(`🎬 Adding clip detection job for project ${projectId}`);
    
    const job = await this.clipDetectionQueue.add(
      'detect-clips',
      { projectId, settings },
      {
        jobId: `detect-${projectId}`,
        priority: 3, // Lower priority
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      },
    );

    return {
      jobId: job.id,
      projectId,
      status: 'queued',
    };
  }

  /**
   * Add clip export job to queue
   */
  async addClipExportJob(data: ClipExportJobData) {
    this.logger.log(`📤 Adding clip export job for project ${data.projectId} (${data.momentIds.length} clips)`);
    
    const job = await this.clipExportQueue.add(
      'export-clip',
      data,
      {
        jobId: `clip-export-${data.projectId}-${Date.now()}`,
        priority: 2, // Medium priority
        attempts: 2, // Fewer retries for long-running jobs
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
      },
    );

    return {
      jobId: job.id,
      projectId: data.projectId,
      status: 'queued',
    };
  }

  /**
   * Add subtitle export job to queue
   */
  async addSubtitleExportJob(projectId: string, orgId: string) {
    this.logger.log(`📝 Adding subtitle export job for project ${projectId}`);
    
    const job = await this.subtitleExportQueue.add(
      'export-subtitles',
      { projectId, orgId },
      {
        jobId: `subtitle-export-${projectId}`,
        priority: 2, // Medium priority
        attempts: 2, // Fewer retries for long-running jobs
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
      },
    );

    return {
      jobId: job.id,
      projectId,
      status: 'queued',
    };
  }

  /**
   * Add reframe job to queue
   */
  async addReframeJob(data: ReframeJobData) {
    this.logger.log(`🎬 Adding reframe job for project ${data.projectId}`);
    
    const job = await this.reframeQueue.add(
      'reframe-video',
      data,
      {
        jobId: `reframe-${data.projectId}-${Date.now()}`,
        priority: 2, // Medium priority
        attempts: 2,
        backoff: {
          type: 'exponential',
          delay: 3000,
        },
      },
    );

    return {
      jobId: job.id,
      projectId: data.projectId,
      status: 'queued',
    };
  }

  /**
   * Get job status
   */
  async getJobStatus(queueName: string, jobId: string) {
    let queue: Queue;
    
    switch (queueName) {
      case 'video-import':
        queue = this.videoImportQueue;
        break;
      case 'transcription':
        queue = this.transcriptionQueue;
        break;
      case 'clip-detection':
        queue = this.clipDetectionQueue;
        break;
      case 'subtitle-export':
        queue = this.subtitleExportQueue;
        break;
      case 'video-export':
        queue = this.clipExportQueue;
        break;
      default:
        throw new Error(`Unknown queue: ${queueName}`);
    }

    const job = await queue.getJob(jobId);
    
    if (!job) {
      return { status: 'not_found' };
    }

    const state = await job.getState();
    const progress = job.progress;

    return {
      jobId: job.id,
      status: state,
      progress,
      data: job.data,
      returnvalue: job.returnvalue,
      failedReason: job.failedReason,
      attemptsMade: job.attemptsMade,
      timestamp: job.timestamp,
    };
  }

  /**
   * Get queue metrics
   */
  async getQueueMetrics(queueName: string) {
    let queue: Queue;
    
    switch (queueName) {
      case 'video-import':
        queue = this.videoImportQueue;
        break;
      case 'transcription':
        queue = this.transcriptionQueue;
        break;
      case 'clip-detection':
        queue = this.clipDetectionQueue;
        break;
      default:
        throw new Error(`Unknown queue: ${queueName}`);
    }

    const [waiting, active, completed, failed, delayed] = await Promise.all([
      queue.getWaitingCount(),
      queue.getActiveCount(),
      queue.getCompletedCount(),
      queue.getFailedCount(),
      queue.getDelayedCount(),
    ]);

    return {
      queue: queueName,
      waiting,
      active,
      completed,
      failed,
      delayed,
      total: waiting + active + completed + failed + delayed,
    };
  }

  /**
   * Get all queue metrics
   */
  async getAllQueueMetrics() {
    const [videoImport, transcription, clipDetection] = await Promise.all([
      this.getQueueMetrics('video-import'),
      this.getQueueMetrics('transcription'),
      this.getQueueMetrics('clip-detection'),
    ]);

    return {
      queues: [videoImport, transcription, clipDetection],
      timestamp: new Date().toISOString(),
    };
  }
}
