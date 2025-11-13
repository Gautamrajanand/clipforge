import { Module } from '@nestjs/common';
import { TranscriptionService } from './transcription.service';
import { PrismaModule } from '../prisma/prisma.module';
import { StorageModule } from '../storage/storage.module';
import { VideoModule } from '../video/video.module';

@Module({
  imports: [PrismaModule, StorageModule, VideoModule],
  providers: [TranscriptionService],
  exports: [TranscriptionService],
})
export class TranscriptionModule {}
