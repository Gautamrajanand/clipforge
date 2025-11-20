import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * RateLimitGuard - Enforces rate limiting based on API key tier
 * 
 * Uses Redis for distributed rate limiting (TODO: implement Redis)
 * For now, uses in-memory tracking (not suitable for production multi-instance)
 */
@Injectable()
export class RateLimitGuard implements CanActivate {
  // In-memory rate limit tracking (TODO: replace with Redis)
  private requestCounts: Map<string, { count: number; resetAt: number }> = new Map();

  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {
    // Clean up old entries every minute
    setInterval(() => this.cleanup(), 60000);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    
    // Skip rate limiting for non-API key requests
    if (!request.apiKey) {
      return true;
    }

    const apiKeyId = request.apiKey.id;
    const rateLimit = request.apiKey.rateLimit;

    // Get current window
    const now = Date.now();
    const windowStart = Math.floor(now / 60000) * 60000; // 1-minute windows
    const key = `${apiKeyId}:${windowStart}`;

    // Get or create counter
    let counter = this.requestCounts.get(key);
    if (!counter || counter.resetAt < now) {
      counter = { count: 0, resetAt: windowStart + 60000 };
      this.requestCounts.set(key, counter);
    }

    // Check if rate limit exceeded
    if (counter.count >= rateLimit) {
      const resetIn = Math.ceil((counter.resetAt - now) / 1000);
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: `Rate limit exceeded. Try again in ${resetIn} seconds.`,
          rateLimit: {
            limit: rateLimit,
            remaining: 0,
            reset: counter.resetAt,
          },
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Increment counter
    counter.count++;

    // Add rate limit headers to response
    const response = context.switchToHttp().getResponse();
    response.setHeader('X-RateLimit-Limit', rateLimit);
    response.setHeader('X-RateLimit-Remaining', rateLimit - counter.count);
    response.setHeader('X-RateLimit-Reset', counter.resetAt);

    return true;
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, counter] of this.requestCounts.entries()) {
      if (counter.resetAt < now) {
        this.requestCounts.delete(key);
      }
    }
  }
}
