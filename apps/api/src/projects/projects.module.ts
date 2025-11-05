import { Module } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { JobsModule } from '../jobs/jobs.module';
import { StorageModule } from '../storage/storage.module';
import { AIModule } from '../ai/ai.module';
import { TranscriptionModule } from '../transcription/transcription.module';
import { VideoService } from '../video/video.service';

@Module({
  imports: [PrismaModule, JobsModule, StorageModule, AIModule, TranscriptionModule],
  providers: [ProjectsService, VideoService],
  controllers: [ProjectsController],
  exports: [ProjectsService],
})
export class ProjectsModule {}
