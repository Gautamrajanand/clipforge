import { Module } from '@nestjs/common';
import { TranscriptionService } from './transcription.service';
import { PrismaModule } from '../prisma/prisma.module';
import { StorageModule } from '../storage/storage.module';
import { VideoModule } from '../video/video.module';
import { CaptionsModule } from '../captions/captions.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [PrismaModule, StorageModule, VideoModule, CaptionsModule, EmailModule],
  providers: [TranscriptionService],
  exports: [TranscriptionService],
})
export class TranscriptionModule {}
