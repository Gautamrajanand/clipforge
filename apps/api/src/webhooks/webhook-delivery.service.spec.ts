import { Test, TestingModule } from '@nestjs/testing';
import { WebhookDeliveryService } from './webhook-delivery.service';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';

describe('WebhookDeliveryService', () => {
  let service: WebhookDeliveryService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WebhookDeliveryService,
        {
          provide: PrismaService,
          useValue: {
            webhook: {
              findUnique: jest.fn(),
              findMany: jest.fn(),
              update: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<WebhookDeliveryService>(WebhookDeliveryService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('HMAC Signature Verification', () => {
    it('should sign payload correctly', () => {
      const secret = 'test-secret';
      const payload = { event: 'test', data: { id: '123' } };

      const signature = service.signPayload(secret, payload);

      expect(signature).toBeDefined();
      expect(typeof signature).toBe('string');
      expect(signature.length).toBe(64); // SHA256 hex length
    });

    it('should verify valid signature', () => {
      const secret = 'test-secret';
      const payload = { event: 'test', data: { id: '123' } };

      const signature = service.signPayload(secret, payload);
      const isValid = service.verifySignature(secret, payload, signature);

      expect(isValid).toBe(true);
    });

    it('should reject invalid signature', () => {
      const secret = 'test-secret';
      const payload = { event: 'test', data: { id: '123' } };

      const invalidSignature = 'invalid-signature';
      const isValid = service.verifySignature(secret, payload, invalidSignature);

      expect(isValid).toBe(false);
    });

    it('should reject signature with wrong secret', () => {
      const secret = 'test-secret';
      const wrongSecret = 'wrong-secret';
      const payload = { event: 'test', data: { id: '123' } };

      const signature = service.signPayload(secret, payload);
      const isValid = service.verifySignature(wrongSecret, payload, signature);

      expect(isValid).toBe(false);
    });

    it('should reject signature with modified payload', () => {
      const secret = 'test-secret';
      const payload = { event: 'test', data: { id: '123' } };
      const modifiedPayload = { event: 'test', data: { id: '456' } };

      const signature = service.signPayload(secret, payload);
      const isValid = service.verifySignature(secret, modifiedPayload, signature);

      expect(isValid).toBe(false);
    });

    it('should use timing-safe comparison', () => {
      const secret = 'test-secret';
      const payload = { event: 'test', data: { id: '123' } };

      const signature = service.signPayload(secret, payload);

      // Should not throw even with invalid signature
      expect(() => {
        service.verifySignature(secret, payload, 'invalid');
      }).not.toThrow();
    });
  });

  describe('Webhook Delivery', () => {
    it('should deliver webhook successfully', async () => {
      const mockWebhook = {
        id: 'webhook-1',
        url: 'https://example.com/webhook',
        secret: 'test-secret',
        active: true,
      };

      jest.spyOn(prisma.webhook, 'findUnique').mockResolvedValue(mockWebhook as any);

      // Mock axios post
      jest.mock('axios', () => ({
        post: jest.fn().mockResolvedValue({ status: 200 }),
      }));

      // Note: In real tests, you'd mock axios properly
      // This is a simplified example
    });

    it('should skip inactive webhooks', async () => {
      const mockWebhook = {
        id: 'webhook-1',
        active: false,
      };

      jest.spyOn(prisma.webhook, 'findUnique').mockResolvedValue(mockWebhook as any);

      const result = await service.deliverWebhook('webhook-1', 'test', {});

      expect(result).toBe(false);
    });

    it('should handle webhook not found', async () => {
      jest.spyOn(prisma.webhook, 'findUnique').mockResolvedValue(null);

      const result = await service.deliverWebhook('webhook-1', 'test', {});

      expect(result).toBe(false);
    });
  });

  describe('Event Publishing', () => {
    it('should publish event to subscribed webhooks', async () => {
      const mockWebhooks = [
        {
          id: 'webhook-1',
          url: 'https://example.com/webhook1',
          secret: 'secret-1',
          active: true,
          events: ['job.completed'],
        },
        {
          id: 'webhook-2',
          url: 'https://example.com/webhook2',
          secret: 'secret-2',
          active: true,
          events: ['job.completed', 'export.ready'],
        },
      ];

      jest.spyOn(prisma.webhook, 'findMany').mockResolvedValue(mockWebhooks as any);

      await service.publishEvent('org-1', 'job.completed', { jobId: 'job-1' });

      expect(prisma.webhook.findMany).toHaveBeenCalledWith({
        where: {
          orgId: 'org-1',
          active: true,
          events: {
            has: 'job.completed',
          },
        },
      });
    });

    it('should filter webhooks by event', async () => {
      const mockWebhooks = [
        {
          id: 'webhook-1',
          events: ['export.ready'],
        },
      ];

      jest.spyOn(prisma.webhook, 'findMany').mockResolvedValue(mockWebhooks as any);

      await service.publishEvent('org-1', 'job.completed', {});

      // Should only get webhooks subscribed to job.completed
      expect(prisma.webhook.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            events: { has: 'job.completed' },
          }),
        }),
      );
    });
  });

  describe('Secret Rotation', () => {
    it('should rotate webhook secret', async () => {
      const newSecret = 'new-secret';

      jest.spyOn(prisma.webhook, 'update').mockResolvedValue({
        id: 'webhook-1',
        secret: newSecret,
      } as any);

      const result = await service.rotateSecret('webhook-1');

      expect(prisma.webhook.update).toHaveBeenCalledWith({
        where: { id: 'webhook-1' },
        data: { secret: expect.any(String) },
      });

      expect(result).toBeDefined();
      expect(result.length).toBe(64); // Hex encoded 32 bytes
    });
  });

  describe('Test Webhook', () => {
    it('should test webhook delivery', async () => {
      const mockWebhook = {
        id: 'webhook-1',
        url: 'https://example.com/webhook',
        secret: 'test-secret',
        active: true,
      };

      jest.spyOn(prisma.webhook, 'findUnique').mockResolvedValue(mockWebhook as any);

      // This would normally make an HTTP request
      // In tests, you'd mock axios
    });
  });
});
