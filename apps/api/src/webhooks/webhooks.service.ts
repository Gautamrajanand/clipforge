import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class WebhooksService {
  constructor(private prisma: PrismaService) {}

  async create(orgId: string, userId: string, dto: any) {
    const secret = crypto.randomBytes(32).toString('hex');

    return this.prisma.webhook.create({
      data: {
        orgId,
        userId,
        url: dto.url,
        secret,
        events: dto.events || ['job.completed', 'export.ready'],
      },
    });
  }

  async findAll(orgId: string) {
    return this.prisma.webhook.findMany({
      where: { orgId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, orgId: string) {
    const webhook = await this.prisma.webhook.findUnique({
      where: { id },
    });

    if (!webhook || webhook.orgId !== orgId) {
      throw new NotFoundException('Webhook not found');
    }

    return webhook;
  }

  async delete(id: string, orgId: string) {
    await this.findOne(id, orgId);
    return this.prisma.webhook.delete({
      where: { id },
    });
  }

  /**
   * Sign webhook payload with HMAC
   */
  signPayload(secret: string, payload: any): string {
    const json = JSON.stringify(payload);
    return crypto
      .createHmac('sha256', secret)
      .update(json)
      .digest('hex');
  }

  /**
   * Verify webhook signature
   */
  verifySignature(secret: string, payload: any, signature: string): boolean {
    const expected = this.signPayload(secret, payload);
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  }
}
