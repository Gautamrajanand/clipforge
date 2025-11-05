import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BrandKitsService {
  constructor(private prisma: PrismaService) {}

  async create(orgId: string, dto: any) {
    return this.prisma.brandKit.create({
      data: {
        orgId,
        name: dto.name,
        fonts: dto.fonts || {},
        colors: dto.colors || {},
        logoUrl: dto.logoUrl,
        captionStyle: dto.captionStyle || {},
      },
    });
  }

  async findAll(orgId: string) {
    return this.prisma.brandKit.findMany({
      where: { orgId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, orgId: string) {
    const brandKit = await this.prisma.brandKit.findUnique({
      where: { id },
    });

    if (!brandKit || brandKit.orgId !== orgId) {
      throw new NotFoundException('Brand kit not found');
    }

    return brandKit;
  }

  async update(id: string, orgId: string, dto: any) {
    await this.findOne(id, orgId);
    return this.prisma.brandKit.update({
      where: { id },
      data: dto,
    });
  }

  async delete(id: string, orgId: string) {
    await this.findOne(id, orgId);
    return this.prisma.brandKit.delete({
      where: { id },
    });
  }
}
