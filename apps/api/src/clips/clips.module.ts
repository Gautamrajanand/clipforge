import { Module } from '@nestjs/common';
import { ClipsService } from './clips.service';
import { ClipsController } from './clips.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { VideoModule } from '../video/video.module';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [PrismaModule, VideoModule, StorageModule],
  providers: [ClipsService],
  controllers: [ClipsController],
  exports: [ClipsService],
})
export class ClipsModule {}
