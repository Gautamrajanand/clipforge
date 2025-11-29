import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { StorageModule } from '../storage/storage.module';
import { VideoModule } from '../video/video.module';
import { TranscriptionModule } from '../transcription/transcription.module';
import { ClipsModule } from '../clips/clips.module';
import { CreditsModule } from '../credits/credits.module';
import { ProjectsModule } from '../projects/projects.module';

// Processors
import { VideoImportProcessor } from './processors/video-import.processor';
import { TranscriptionProcessor } from './processors/transcription.processor';
import { ClipDetectionProcessor } from './processors/clip-detection.processor';
import { SubtitleExportProcessor } from './processors/subtitle-export.processor';
import { ClipExportProcessor } from './processors/clip-export.processor';

// Service
import { QueuesService } from './queues.service';

// Controller
import { QueuesController } from './queues.controller';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    StorageModule,
    VideoModule,
    TranscriptionModule,
    ClipsModule,
    CreditsModule,
    ProjectsModule,
    
    // Register BullMQ with Redis connection
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        // Parse REDIS_URL (format: redis://host:port)
        const redisUrl = configService.get('REDIS_URL') || 'redis://localhost:6379';
        console.log('🔧 BullMQ Redis URL:', redisUrl);
        const url = new URL(redisUrl);
        console.log('🔧 BullMQ connecting to:', url.hostname, ':', url.port);
        
        return {
          connection: {
            host: url.hostname,
            port: parseInt(url.port) || 6379,
            password: url.password || configService.get('REDIS_PASSWORD'),
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
        };
      },
      inject: [ConfigService],
    }),

    // Register individual queues
    BullModule.registerQueue(
      { name: 'video-import' },
      { name: 'transcription' },
      { name: 'clip-detection' },
      { name: 'video-export' },
      { name: 'subtitle-export' },
    ),
  ],
  providers: [
    QueuesService,
    VideoImportProcessor,
    TranscriptionProcessor,
    ClipDetectionProcessor,
    SubtitleExportProcessor,
    ClipExportProcessor,
  ],
  controllers: [QueuesController],
  exports: [BullModule, QueuesService],
})
export class QueuesModule {}
