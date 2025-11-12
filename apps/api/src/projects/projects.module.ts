import { Module } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { JobsModule } from '../jobs/jobs.module';
import { StorageModule } from '../storage/storage.module';
import { AIModule } from '../ai/ai.module';
import { TranscriptionModule } from '../transcription/transcription.module';
import { VideoService } from '../video/video.service';
import { FFmpegService } from '../video/ffmpeg.service';
import { CaptionsModule } from '../captions/captions.module';
import { QueuesModule } from '../queues/queues.module';

@Module({
  imports: [PrismaModule, JobsModule, StorageModule, AIModule, TranscriptionModule, CaptionsModule, QueuesModule],
  providers: [ProjectsService, VideoService, FFmpegService],
  controllers: [ProjectsController],
  exports: [ProjectsService],
})
export class ProjectsModule {}
