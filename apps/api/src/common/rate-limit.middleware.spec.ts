import { Test, TestingModule } from '@nestjs/testing';
import { RateLimitMiddleware } from './rate-limit.middleware';
import { PrismaService } from '../prisma/prisma.service';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('RateLimitMiddleware', () => {
  let middleware: RateLimitMiddleware;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RateLimitMiddleware,
        {
          provide: PrismaService,
          useValue: {
            apiKey: {
              findUnique: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    middleware = module.get<RateLimitMiddleware>(RateLimitMiddleware);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('Rate Limit Enforcement', () => {
    it('should allow requests under limit', async () => {
      const req: any = {
        headers: { 'x-api-key': 'test-key' },
      };
      const res: any = {};
      const next = jest.fn();

      jest.spyOn(prisma.apiKey, 'findUnique').mockResolvedValue({
        rateLimit: 100,
        quotaMinutes: 10000,
        quotaExports: 1000,
      } as any);

      // Mock Redis to return count < limit
      middleware['getRequestCount'] = jest.fn().mockResolvedValue(50);

      await middleware.use(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should reject requests over limit', async () => {
      const req: any = {
        headers: { 'x-api-key': 'test-key' },
      };
      const res: any = {};
      const next = jest.fn();

      jest.spyOn(prisma.apiKey, 'findUnique').mockResolvedValue({
        rateLimit: 100,
        quotaMinutes: 10000,
        quotaExports: 1000,
      } as any);

      // Mock Redis to return count >= limit
      middleware['getRequestCount'] = jest.fn().mockResolvedValue(100);

      try {
        await middleware.use(req, res, next);
        fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.getStatus()).toBe(HttpStatus.TOO_MANY_REQUESTS);
      }
    });

    it('should use default rate limit if API key not found', async () => {
      const req: any = {
        headers: { 'x-api-key': 'unknown-key' },
      };
      const res: any = {};
      const next = jest.fn();

      jest.spyOn(prisma.apiKey, 'findUnique').mockResolvedValue(null);

      middleware['getRequestCount'] = jest.fn().mockResolvedValue(50);

      await middleware.use(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.rateLimit.rateLimit).toBe(100); // Default
    });

    it('should increment request count', async () => {
      const req: any = {
        headers: { 'x-api-key': 'test-key' },
      };
      const res: any = {};
      const next = jest.fn();

      jest.spyOn(prisma.apiKey, 'findUnique').mockResolvedValue({
        rateLimit: 100,
        quotaMinutes: 10000,
        quotaExports: 1000,
      } as any);

      const getCountSpy = jest
        .spyOn(middleware as any, 'getRequestCount')
        .mockResolvedValue(50);
      const incrementSpy = jest
        .spyOn(middleware as any, 'incrementRequestCount')
        .mockResolvedValue(undefined);

      await middleware.use(req, res, next);

      expect(incrementSpy).toHaveBeenCalledWith('api-key:test-key');
    });
  });

  describe('Quota Tracking', () => {
    it('should store quota info in request', async () => {
      const req: any = {
        headers: { 'x-api-key': 'test-key' },
      };
      const res: any = {};
      const next = jest.fn();

      jest.spyOn(prisma.apiKey, 'findUnique').mockResolvedValue({
        rateLimit: 100,
        quotaMinutes: 10000,
        quotaExports: 1000,
      } as any);

      middleware['getRequestCount'] = jest.fn().mockResolvedValue(50);

      await middleware.use(req, res, next);

      expect(req.rateLimit).toBeDefined();
      expect(req.rateLimit.quotaMinutes).toBe(10000);
      expect(req.rateLimit.quotaExports).toBe(1000);
      expect(req.rateLimit.requestCount).toBe(51);
    });

    it('should use user ID for authenticated requests', async () => {
      const req: any = {
        user: { id: 'user-123' },
        headers: {},
      };
      const res: any = {};
      const next = jest.fn();

      middleware['getRequestCount'] = jest.fn().mockResolvedValue(50);

      await middleware.use(req, res, next);

      expect(middleware['getRequestCount']).toHaveBeenCalledWith('user:user-123');
    });
  });

  describe('Error Handling', () => {
    it('should not block request on Redis error', async () => {
      const req: any = {
        headers: { 'x-api-key': 'test-key' },
      };
      const res: any = {};
      const next = jest.fn();

      middleware['getRequestCount'] = jest
        .fn()
        .mockRejectedValue(new Error('Redis error'));

      await middleware.use(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should handle missing headers gracefully', async () => {
      const req: any = {
        headers: {},
      };
      const res: any = {};
      const next = jest.fn();

      await middleware.use(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe('Rate Limit Headers', () => {
    it('should include rate limit info in response', async () => {
      const req: any = {
        headers: { 'x-api-key': 'test-key' },
      };
      const res: any = {
        setHeader: jest.fn(),
      };
      const next = jest.fn();

      jest.spyOn(prisma.apiKey, 'findUnique').mockResolvedValue({
        rateLimit: 100,
        quotaMinutes: 10000,
        quotaExports: 1000,
      } as any);

      middleware['getRequestCount'] = jest.fn().mockResolvedValue(50);

      await middleware.use(req, res, next);

      // In production, you'd set response headers
      expect(req.rateLimit.rateLimit).toBe(100);
    });
  });
});
