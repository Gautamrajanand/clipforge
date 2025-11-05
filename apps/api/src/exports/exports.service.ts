import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ExportsService {
  constructor(private prisma: PrismaService) {}

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
}
