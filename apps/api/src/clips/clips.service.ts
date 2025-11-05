import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ClipsService {
  constructor(private prisma: PrismaService) {}

  async findByProject(projectId: string, orgId: string) {
    // Verify org owns project
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project || project.orgId !== orgId) {
      throw new NotFoundException('Project not found');
    }

    return this.prisma.moment.findMany({
      where: { projectId },
      orderBy: { score: 'desc' },
    });
  }

  async findOne(momentId: string, orgId: string) {
    const moment = await this.prisma.moment.findUnique({
      where: { id: momentId },
      include: { project: true },
    });

    if (!moment || moment.project.orgId !== orgId) {
      throw new NotFoundException('Moment not found');
    }

    return moment;
  }
}
