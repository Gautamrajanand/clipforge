import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { TranscriptionService } from './transcription.service';
import { PrismaModule } from '../prisma/prisma.module';
import { StorageModule } from '../storage/storage.module';
import { VideoModule } from '../video/video.module';
import { CaptionsModule } from '../captions/captions.module';
// import { EmailModule } from '../email/email.module'; // TEMPORARILY DISABLED

@Module({
  imports: [
    PrismaModule,
    StorageModule,
    VideoModule,
    CaptionsModule,
    BullModule.registerQueue({ name: 'subtitle-export' }),
    // EmailModule, // TEMPORARILY DISABLED
  ],
  providers: [TranscriptionService],
  exports: [TranscriptionService],
})
export class TranscriptionModule {}
