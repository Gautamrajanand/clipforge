import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { ProjectsService } from '../../projects/projects.service';

export interface ClipExportJobData {
  projectId: string;
  orgId: string;
  momentIds: string[];
  aspectRatio: string;
  cropMode?: 'crop' | 'pad' | 'smart';
  cropPosition?: 'center' | 'top' | 'bottom' | { x: number; y: number };
  burnCaptions?: boolean;
  captionStyle?: string;
  primaryColor?: string;
  secondaryColor?: string;
  fontSize?: number;
  position?: 'top' | 'center' | 'bottom';
}

@Processor('video-export', {
  concurrency: 2, // Process 2 exports simultaneously
  lockDuration: 300000, // 5 minutes lock to prevent stalling during video processing
})
export class ClipExportProcessor extends WorkerHost {
  private readonly logger = new Logger(ClipExportProcessor.name);

  constructor(private readonly projectsService: ProjectsService) {
    super();
  }

  async process(job: Job<ClipExportJobData>): Promise<any> {
    const { projectId, orgId, momentIds, ...exportOptions } = job.data;
    
    this.logger.log(
      `🔄 Processing clip export job ${job.id} for project ${projectId} (${momentIds.length} clips)`
    );

    try {
      // Call the existing export logic
      const result = await this.projectsService.exportMoments(
        projectId,
        orgId,
        {
          momentIds,
          aspectRatio: exportOptions.aspectRatio,
          cropMode: exportOptions.cropMode,
          cropPosition: exportOptions.cropPosition,
          burnCaptions: exportOptions.burnCaptions,
          captionStyle: exportOptions.captionStyle,
          primaryColor: exportOptions.primaryColor,
          secondaryColor: exportOptions.secondaryColor,
          fontSize: exportOptions.fontSize,
          position: exportOptions.position,
        }
      );

      this.logger.log(`✅ Clip export job ${job.id} completed for project ${projectId}`);
      
      return result;
    } catch (error) {
      this.logger.error(
        `❌ Clip export job ${job.id} failed for project ${projectId}:`,
        error.message
      );
      throw error;
    }
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`✅ Job ${job.id} completed`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    this.logger.error(`❌ Job ${job.id} failed:`, error.message);
  }

  @OnWorkerEvent('active')
  onActive(job: Job) {
    this.logger.log(`⚡ Job ${job.id} is now active`);
  }
}
