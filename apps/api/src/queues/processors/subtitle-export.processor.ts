import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { TranscriptionService } from '../../transcription/transcription.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ResendService } from '../../email/resend.service';

export interface SubtitleExportJobData {
  projectId: string;
  orgId: string;
}

@Processor('subtitle-export', {
  concurrency: 2, // Process 2 subtitle exports concurrently
})
export class SubtitleExportProcessor extends WorkerHost {
  private readonly logger = new Logger(SubtitleExportProcessor.name);

  constructor(
    private transcription: TranscriptionService,
    private prisma: PrismaService,
    private resend: ResendService,
  ) {
    super();
  }

  async process(job: Job<SubtitleExportJobData>): Promise<any> {
    const { projectId, orgId } = job.data;

    this.logger.log(`🔄 Processing subtitle export job ${job.id} for project ${projectId}`);

    try {
      // Update job progress
      await job.updateProgress(10);

      // Update project status to TRANSCRIBING (generating captions)
      await this.prisma.project.update({
        where: { id: projectId },
        data: { status: 'TRANSCRIBING' },
      });

      // Generate captioned video (this takes 10-15 minutes)
      this.logger.log(`🎬 Generating captioned video for project ${projectId}`);
      const captionedKey = await this.transcription.generateCaptionedVideo(projectId, orgId);

      // Update job progress
      await job.updateProgress(90);

      // Update project status to READY
      const updatedProject = await this.prisma.project.update({
        where: { id: projectId },
        data: { status: 'READY' },
      });

      // Send email notification
      try {
        const membership = await this.prisma.membership.findFirst({
          where: { orgId: updatedProject.orgId, role: 'OWNER' },
          include: { user: true },
        });
        if (membership?.user?.email) {
          await this.resend.sendSubtitlesReadyEmail({
            to: membership.user.email,
            userName: membership.user.name || 'there',
            projectTitle: updatedProject.title,
            projectId,
          });
          this.logger.log(`📧 Sent subtitles ready email to ${membership.user.email}`);
        }
      } catch (emailError) {
        this.logger.warn(`⚠️ Failed to send subtitles ready email for project ${projectId}:`, emailError);
      }

      this.logger.log(`✅ Subtitle export complete for project ${projectId}: ${captionedKey}`);

      // Update job progress
      await job.updateProgress(100);

      return { projectId, captionedKey, status: 'completed' };
    } catch (error) {
      this.logger.error(`❌ Subtitle export failed for project ${projectId}:`, error);
      
      // Update project status to FAILED
      await this.prisma.project.update({
        where: { id: projectId },
        data: { status: 'FAILED' },
      });

      throw error;
    }
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job<SubtitleExportJobData>) {
    this.logger.log(`✅ Subtitle export job ${job.id} completed for project ${job.data.projectId}`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job<SubtitleExportJobData>, error: Error) {
    this.logger.error(`❌ Subtitle export job ${job.id} failed:`, error.message);
  }

  @OnWorkerEvent('active')
  onActive(job: Job<SubtitleExportJobData>) {
    this.logger.log(`🔄 Subtitle export job ${job.id} started for project ${job.data.projectId}`);
  }
}
