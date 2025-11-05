import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsageService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get current month usage
   */
  async getCurrentUsage(orgId: string) {
    const now = new Date();
    const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    let usage = await this.prisma.usageLedger.findUnique({
      where: {
        orgId_period: {
          orgId,
          period,
        },
      },
    });

    if (!usage) {
      usage = await this.prisma.usageLedger.create({
        data: {
          orgId,
          period,
          minutesProcessed: 0,
          exportsCount: 0,
        },
      });
    }

    return usage;
  }

  /**
   * Track minutes processed
   */
  async trackMinutesProcessed(orgId: string, minutes: number) {
    const usage = await this.getCurrentUsage(orgId);
    return this.prisma.usageLedger.update({
      where: { id: usage.id },
      data: {
        minutesProcessed: {
          increment: minutes,
        },
      },
    });
  }

  /**
   * Track export
   */
  async trackExport(orgId: string) {
    const usage = await this.getCurrentUsage(orgId);
    return this.prisma.usageLedger.update({
      where: { id: usage.id },
      data: {
        exportsCount: {
          increment: 1,
        },
      },
    });
  }
}
