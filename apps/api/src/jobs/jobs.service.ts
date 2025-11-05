import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JobsService {
  constructor(private prisma: PrismaService) {}

  async createJob(
    type: string,
    projectId: string,
    input: any,
  ) {
    return this.prisma.job.create({
      data: {
        type: type as any,
        projectId,
        input,
        status: 'PENDING' as any,
      },
    });
  }

  async updateJobStatus(
    jobId: string,
    status: string,
    output?: any,
    error?: string,
  ) {
    return this.prisma.job.update({
      where: { id: jobId },
      data: {
        status: status as any,
        output,
        error,
      },
    });
  }

  async getJob(jobId: string) {
    return this.prisma.job.findUnique({
      where: { id: jobId },
    });
  }

  async getPendingJobs(type?: string) {
    return this.prisma.job.findMany({
      where: {
        status: 'PENDING' as any,
        ...(type && { type: type as any }),
      },
      orderBy: { createdAt: 'asc' },
      take: 10,
    });
  }
}
