import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class IngestionService {
  constructor(private prisma: PrismaService) {}

  async ingest(projectId: string, orgId: string, dto: any) {
    // Verify org owns project
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project || project.orgId !== orgId) {
      throw new NotFoundException('Project not found');
    }

    // Create asset
    const asset = await this.prisma.asset.create({
      data: {
        projectId,
        kind: 'ORIGINAL',
        url: dto.sourceUrl || '',
        mimeType: dto.mimeType,
      },
    });

    // Update project status
    await this.prisma.project.update({
      where: { id: projectId },
      data: { status: 'INGESTING' },
    });

    // TODO: Enqueue job to ML workers for transcription

    return { assetId: asset.id, status: 'ingesting' };
  }
}
