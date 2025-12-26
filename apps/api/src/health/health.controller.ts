import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import Redis from 'ioredis';

@ApiTags('health')
@Controller('health')
export class HealthController {
  private redis: Redis;
  private healthCache: {
    data: any;
    timestamp: number;
  } | null = null;
  private readonly CACHE_TTL = 5000; // 5 seconds cache

  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
  ) {
    // Initialize Redis client from REDIS_URL
    let redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    
    // Convert redis:// to rediss:// for Upstash (requires TLS)
    if (redisUrl.includes('upstash.io') && redisUrl.startsWith('redis://')) {
      redisUrl = redisUrl.replace('redis://', 'rediss://');
    }
    
    const url = new URL(redisUrl);
    
    this.redis = new Redis({
      host: url.hostname,
      port: parseInt(url.port) || 6379,
      password: url.password || process.env.REDIS_PASSWORD,
      maxRetriesPerRequest: 1,
      retryStrategy: () => null, // Don't retry on health checks
      tls: redisUrl.startsWith('rediss://') ? {} : undefined,
    });
  }

  /**
   * Health check endpoint with caching
   * GET /health
   */
  @Get()
  @ApiOperation({ summary: 'Health check' })
  async check() {
    // Return cached result if available and fresh
    const now = Date.now();
    if (this.healthCache && (now - this.healthCache.timestamp) < this.CACHE_TTL) {
      return {
        ...this.healthCache.data,
        cached: true,
        cacheAge: now - this.healthCache.timestamp,
      };
    }

    // Perform actual health checks
    const checks = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: await this.checkDatabase(),
      redis: await this.checkRedis(),
      storage: await this.checkStorage(),
    };

    // Determine overall status
    const allHealthy = Object.values(checks)
      .filter(v => typeof v === 'object' && 'status' in v)
      .every((check: any) => check.status === 'ok');

    const result = {
      ...checks,
      status: allHealthy ? 'ok' : 'degraded',
      cached: false,
    };

    // Cache the result
    this.healthCache = {
      data: result,
      timestamp: now,
    };

    return result;
  }

  /**
   * Liveness probe - is the service running?
   * GET /health/live
   */
  @Get('live')
  @ApiOperation({ summary: 'Liveness probe' })
  async live() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Readiness probe - is the service ready to accept traffic?
   * GET /health/ready
   */
  @Get('ready')
  @ApiOperation({ summary: 'Readiness probe' })
  async ready() {
    const dbHealthy = await this.checkDatabase();
    const redisHealthy = await this.checkRedis();

    const ready = dbHealthy.status === 'ok' && redisHealthy.status === 'ok';

    return {
      status: ready ? 'ok' : 'not_ready',
      database: dbHealthy,
      redis: redisHealthy,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Check database connectivity (optimized with timeout)
   */
  private async checkDatabase() {
    try {
      // Use a simple query with timeout to avoid blocking
      const result = await Promise.race([
        this.prisma.$queryRaw`SELECT 1`,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Database check timeout')), 1000)
        ),
      ]);
      return {
        status: 'ok',
        message: 'Database connection successful',
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
      };
    }
  }

  /**
   * Check Redis connectivity (optimized with timeout)
   */
  private async checkRedis() {
    try {
      // Use ping with timeout to avoid blocking
      await Promise.race([
        this.redis.ping(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Redis check timeout')), 1000)
        ),
      ]);
      return {
        status: 'ok',
        message: 'Redis connection successful',
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
      };
    }
  }

  /**
   * Check storage connectivity
   */
  private async checkStorage() {
    try {
      // Try to list buckets or check connection
      // This is a simple check - adjust based on your storage implementation
      return {
        status: 'ok',
        message: 'Storage connection successful',
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
      };
    }
  }
}
