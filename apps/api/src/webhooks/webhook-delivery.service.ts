import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';
import axios from 'axios';

@Injectable()
export class WebhookDeliveryService {
  private readonly logger = new Logger(WebhookDeliveryService.name);
  private readonly maxRetries = 5;
  private readonly retryDelayMs = 1000;

  constructor(private prisma: PrismaService) {}

  /**
   * Sign webhook payload with HMAC-SHA256
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

  /**
   * Deliver webhook event with retries
   */
  async deliverWebhook(
    webhookId: string,
    event: string,
    data: any,
    attempt: number = 1,
  ): Promise<boolean> {
    try {
      const webhook = await this.prisma.webhook.findUnique({
        where: { id: webhookId },
      });

      if (!webhook || !webhook.active) {
        this.logger.warn(`Webhook ${webhookId} not found or inactive`);
        return false;
      }

      const payload = {
        event,
        timestamp: new Date().toISOString(),
        data,
      };

      const signature = this.signPayload(webhook.secret, payload);

      this.logger.debug(
        `Delivering webhook ${webhookId} (attempt ${attempt}/${this.maxRetries})`,
      );

      const response = await axios.post(webhook.url, payload, {
        headers: {
          'Content-Type': 'application/json',
          'X-Signature': signature,
          'X-Webhook-ID': webhookId,
          'X-Event': event,
          'User-Agent': 'ClipForge/1.0',
        },
        timeout: 10000,
      });

      if (response.status >= 200 && response.status < 300) {
        this.logger.log(`Webhook ${webhookId} delivered successfully`);
        return true;
      }

      throw new Error(`HTTP ${response.status}`);
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Webhook delivery failed (attempt ${attempt}): ${errorMessage}`,
      );

      if (attempt < this.maxRetries) {
        // Exponential backoff: 1s, 2s, 4s, 8s, 16s
        const delay = this.retryDelayMs * Math.pow(2, attempt - 1);
        this.logger.log(`Retrying webhook in ${delay}ms...`);

        setTimeout(() => {
          this.deliverWebhook(webhookId, event, data, attempt + 1);
        }, delay);

        return false;
      }

      // Max retries exceeded
      this.logger.error(`Webhook ${webhookId} failed after ${this.maxRetries} attempts`);
      return false;
    }
  }

  /**
   * Publish event to all subscribed webhooks
   */
  async publishEvent(orgId: string, event: string, data: any): Promise<void> {
    try {
      const webhooks = await this.prisma.webhook.findMany({
        where: {
          orgId,
          active: true,
          events: {
            has: event,
          },
        },
      });

      this.logger.log(`Publishing event ${event} to ${webhooks.length} webhooks`);

      for (const webhook of webhooks) {
        // Fire and forget with retry logic
        this.deliverWebhook(webhook.id, event, data);
      }
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error publishing event: ${errorMessage}`);
    }
  }

  /**
   * Rotate webhook secret
   */
  async rotateSecret(webhookId: string): Promise<string> {
    const newSecret = crypto.randomBytes(32).toString('hex');

    await this.prisma.webhook.update({
      where: { id: webhookId },
      data: { secret: newSecret },
    });

    this.logger.log(`Webhook ${webhookId} secret rotated`);
    return newSecret;
  }

  /**
   * Test webhook delivery
   */
  async testWebhook(webhookId: string): Promise<boolean> {
    const testPayload = {
      event: 'test',
      timestamp: new Date().toISOString(),
      data: {
        message: 'This is a test webhook delivery',
      },
    };

    return this.deliverWebhook(webhookId, 'test', testPayload.data);
  }
}
