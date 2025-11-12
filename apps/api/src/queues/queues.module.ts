import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { StorageModule } from '../storage/storage.module';
import { VideoModule } from '../video/video.module';
import { TranscriptionModule } from '../transcription/transcription.module';
import { ClipsModule } from '../clips/clips.module';

// Processors
import { VideoImportProcessor } from './processors/video-import.processor';
import { TranscriptionProcessor } from './processors/transcription.processor';
import { ClipDetectionProcessor } from './processors/clip-detection.processor';

// Service
import { QueuesService } from './queues.service';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    StorageModule,
    VideoModule,
    TranscriptionModule,
    ClipsModule,
    
    // Register BullMQ with Redis connection
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        connection: {
          host: configService.get('REDIS_HOST') || 'localhost',
          port: configService.get('REDIS_PORT') || 6379,
          password: configService.get('REDIS_PASSWORD'),
        },
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
          removeOnComplete: {
            age: 3600, // Keep completed jobs for 1 hour
            count: 1000, // Keep max 1000 completed jobs
          },
          removeOnFail: {
            age: 86400, // Keep failed jobs for 24 hours
            count: 5000, // Keep max 5000 failed jobs
          },
        },
      }),
      inject: [ConfigService],
    }),

    // Register individual queues
    BullModule.registerQueue(
      { name: 'video-import' },
      { name: 'transcription' },
      { name: 'clip-detection' },
      { name: 'video-export' },
    ),
  ],
  providers: [
    QueuesService,
    VideoImportProcessor,
    TranscriptionProcessor,
    ClipDetectionProcessor,
  ],
  exports: [BullModule, QueuesService],
})
export class QueuesModule {}
