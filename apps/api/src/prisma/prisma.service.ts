import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      // Connection pool configuration for high concurrency
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
      // Logging configuration
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'error' },
        { emit: 'event', level: 'warn' },
      ],
    });

    // Log slow queries (>1s)
    this.$on('query' as never, (e: any) => {
      if (e.duration > 1000) {
        this.logger.warn(`Slow query detected (${e.duration}ms): ${e.query}`);
      }
    });

    // Log errors
    this.$on('error' as never, (e: any) => {
      this.logger.error('Prisma error:', e);
    });
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('✅ Database connected with optimized connection pool');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Database disconnected');
  }
}
