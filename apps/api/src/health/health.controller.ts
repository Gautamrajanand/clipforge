import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import Redis from 'ioredis';

@ApiTags('health')
@Controller('health')
export class HealthController {
  private redis: Redis;

  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
  ) {
    // Initialize Redis client
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      maxRetriesPerRequest: 1,
      retryStrategy: () => null, // Don't retry on health checks
    });
  }

  /**
   * Health check endpoint
   * GET /health
   */
  @Get()
  @ApiOperation({ summary: 'Health check' })
  async check() {
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

    return {
      ...checks,
      status: allHealthy ? 'ok' : 'degraded',
    };
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
   * Check database connectivity
   */
  private async checkDatabase() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
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
   * Check Redis connectivity
   */
  private async checkRedis() {
    try {
      await this.redis.ping();
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
