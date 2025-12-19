import { Injectable, NestMiddleware, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import * as Redis from 'redis';

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  private redis: any;

  constructor(private prisma: PrismaService) {
    let redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    
    // Convert redis:// to rediss:// for Upstash (requires TLS)
    if (redisUrl.includes('upstash.io') && redisUrl.startsWith('redis://')) {
      redisUrl = redisUrl.replace('redis://', 'rediss://');
    }
    
    this.redis = Redis.createClient({
      url: redisUrl,
    });
  }

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      // Get API key from header
      const apiKey = req.headers['x-api-key'] as string;
      const userId = (req as any).user?.id;

      if (!apiKey && !userId) {
        return next();
      }

      // Determine rate limit key
      const limitKey = apiKey ? `api-key:${apiKey}` : `user:${userId}`;

      // Get API key or user quota
      let rateLimit = 100; // Default: 100 requests per minute
      let quotaMinutes = 10000; // Default: 10,000 minutes per month
      let quotaExports = 1000; // Default: 1,000 exports per month

      if (apiKey) {
        const key = await this.prisma.apiKey.findUnique({
          where: { keyHash: apiKey },
        });

        if (key) {
          rateLimit = key.rateLimit;
          quotaMinutes = key.quotaMinutes;
          quotaExports = key.quotaExports;
        }
      }

      // Check rate limit (requests per minute)
      const requestCount = await this.getRequestCount(limitKey);
      if (requestCount >= rateLimit) {
        throw new HttpException(
          {
            statusCode: HttpStatus.TOO_MANY_REQUESTS,
            message: 'Rate limit exceeded',
            retryAfter: 60,
          },
          HttpStatus.TOO_MANY_REQUESTS,
          { cause: new Error('Rate limit exceeded') },
        );
      }

      // Increment request count
      await this.incrementRequestCount(limitKey);

      // Store quota info for later use
      (req as any).rateLimit = {
        limitKey,
        rateLimit,
        quotaMinutes,
        quotaExports,
        requestCount: requestCount + 1,
      };

      next();
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      // Log error but don't block request
      console.error('Rate limit check error:', error);
      next();
    }
  }

  private async getRequestCount(key: string): Promise<number> {
    return new Promise((resolve) => {
      this.redis.get(`rate-limit:${key}`, (err, count) => {
        if (err) {
          console.error('Redis error:', err);
          resolve(0);
        } else {
          resolve(parseInt(count || '0', 10));
        }
      });
    });
  }

  private async incrementRequestCount(key: string): Promise<void> {
    return new Promise((resolve) => {
      const redisKey = `rate-limit:${key}`;
      this.redis.incr(redisKey, (err) => {
        if (!err) {
          // Set expiry to 1 minute
          this.redis.expire(redisKey, 60);
        }
        resolve();
      });
    });
  }
}
