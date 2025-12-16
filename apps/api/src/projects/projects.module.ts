import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { ProjectsService } from './projects.service';
import { ProjectsController, ProjectsInternalController } from './projects.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { JobsModule } from '../jobs/jobs.module';
import { StorageModule } from '../storage/storage.module';
import { AIModule } from '../ai/ai.module';
import { TranscriptionModule } from '../transcription/transcription.module';
import { VideoService } from '../video/video.service';
import { FFmpegService } from '../video/ffmpeg.service';
import { CaptionsModule } from '../captions/captions.module';
import { QueuesModule } from '../queues/queues.module';
import { CreditsModule } from '../credits/credits.module';
import { AnalyticsModule } from '../analytics/analytics.module';
import { ReferralsModule } from '../referrals/referrals.module';
import { OnboardingModule } from '../onboarding/onboarding.module';
import { EmailModule } from '../email/email.module';
import * as path from 'path';
import * as fs from 'fs';

@Module({
  imports: [
    PrismaModule, 
    AuthModule, 
    JobsModule, 
    StorageModule, 
    AIModule, 
    TranscriptionModule, 
    CaptionsModule, 
    QueuesModule, 
    CreditsModule, 
    AnalyticsModule,
    ReferralsModule,
    OnboardingModule,
    EmailModule,
    // Configure Multer for streaming uploads (disk storage)
    MulterModule.register({
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = '/tmp/clipforge-uploads';
          // Ensure directory exists
          if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
          }
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
          cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
        },
      }),
      limits: {
        fileSize: 5 * 1024 * 1024 * 1024, // 5GB limit
      },
    }),
  ],
  providers: [ProjectsService, VideoService, FFmpegService],
  controllers: [ProjectsController, ProjectsInternalController],
  exports: [ProjectsService],
})
export class ProjectsModule {}
