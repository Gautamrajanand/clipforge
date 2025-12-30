import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { PrismaService } from '../prisma/prisma.service';
import { OnboardingProgressService } from '../onboarding/onboarding-progress.service';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ExportsService {
  private readonly logger = new Logger(ExportsService.name);
  private readonly workerUrl = process.env.ML_WORKER_URL || 'http://localhost:8000';

  constructor(
    private prisma: PrismaService,
    private httpService: HttpService,
    private onboardingProgress: OnboardingProgressService,
  ) {}

  async create(momentId: string, orgId: string, dto: any) {
    // Verify org owns moment
    const moment = await this.prisma.moment.findUnique({
      where: { id: momentId },
      include: { project: true },
    });

    if (!moment || moment.project.orgId !== orgId) {
      throw new NotFoundException('Moment not found');
    }

    // Create export record
    const exportRecord = await this.prisma.export.create({
      data: {
        projectId: moment.projectId,
        momentId,
        status: 'PENDING' as any,
        format: (dto.format || 'MP4') as any,
        template: dto.template || null,
        artifacts: {},
        metrics: {},
        publishedTo: [],
      } as any,
    });

    // Update onboarding progress - export created
    try {
      const project = await this.prisma.project.findUnique({
        where: { id: moment.projectId },
        include: {
          org: {
            include: {
              memberships: {
                include: {
                  user: true,
                },
              },
            },
          },
        },
      });

      const userId = project?.org?.memberships?.[0]?.user?.id;
      if (userId) {
        await this.onboardingProgress.updateFeatureProgress(userId, 'export');
        this.logger.log(`✅ Updated onboarding progress for user ${userId}: export`);
      }
    } catch (error) {
      this.logger.error(`Failed to update onboarding progress:`, error);
    }

    // TODO: Enqueue render job to ML workers

    return exportRecord;
  }

  async findOne(exportId: string, orgId: string) {
    const exportRecord = await this.prisma.export.findUnique({
      where: { id: exportId },
      include: { project: true },
    });

    if (!exportRecord || exportRecord.project.orgId !== orgId) {
      throw new NotFoundException('Export not found');
    }

    return exportRecord;
  }

  async findByProject(projectId: string, orgId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project || project.orgId !== orgId) {
      throw new NotFoundException('Project not found');
    }

    return this.prisma.export.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Process export with aspect ratio conversion via Python worker
   * Delegates to ML worker for FFmpeg processing
   */
  async processExport(exportId: string, orgId: string): Promise<void> {
    const exportRecord = await this.findOne(exportId, orgId);
    const moment = await this.prisma.moment.findUnique({
      where: { id: exportRecord.momentId },
      include: { project: true },
    });

    if (!moment) {
      throw new NotFoundException('Moment not found');
    }

    // Update status to processing
    await this.prisma.export.update({
      where: { id: exportId },
      data: {
        processingStatus: 'PROCESSING',
        processingStartedAt: new Date(),
      },
    });

    try {
      // Call Python worker to render clip
      this.logger.log(`Calling ML worker to render export ${exportId}`);
      
      const renderRequest = {
        exportId: exportRecord.id,
        projectId: moment.projectId,
        momentId: moment.id,
        sourceUrl: moment.project.sourceUrl,
        tStart: moment.tStart,
        tEnd: moment.tEnd,
        format: exportRecord.format,
        aspectRatio: moment.aspectRatio,
        template: exportRecord.template,
        brandKitId: null, // TODO: Get from project/org
        captionStyle: exportRecord.captionStyle || 'karaoke',
        captionsEnabled: exportRecord.captionsEnabled ?? true,
      };

      const response = await firstValueFrom(
        this.httpService.post(
          `${this.workerUrl}/v1/render/export`,
          renderRequest,
        ),
      );

      this.logger.log(`ML worker queued render: ${response.data.status}`);
      
      // Worker will update export status when complete
      // For now, mark as queued
      await this.prisma.export.update({
        where: { id: exportId },
        data: {
          processingStatus: 'QUEUED',
        },
      });

    } catch (error) {
      this.logger.error(`Failed to queue export ${exportId}:`, error);
      
      await this.prisma.export.update({
        where: { id: exportId },
        data: {
          processingStatus: 'FAILED',
          processingError: error.message,
          processingCompletedAt: new Date(),
        },
      });

      throw error;
    }
  }

  async update(exportId: string, dto: { status?: string; artifacts?: any }) {
    this.logger.log(`Updating export ${exportId}: status=${dto.status}`);
    
    const updateData: any = {};
    
    if (dto.status) {
      updateData.status = dto.status;
      updateData.processingStatus = dto.status;
      
      if (dto.status === 'COMPLETED') {
        updateData.processingCompletedAt = new Date();
      }
    }
    
    if (dto.artifacts) {
      updateData.artifacts = dto.artifacts;
    }
    
    const exportRecord = await this.prisma.export.update({
      where: { id: exportId },
      data: updateData,
    });
    
    this.logger.log(`✅ Export ${exportId} updated successfully`);
    return exportRecord;
  }
}
