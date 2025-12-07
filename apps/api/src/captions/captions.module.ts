import { Module } from '@nestjs/common';
import { CaptionsService } from './captions.service';
import { CaptionsController } from './captions.controller';
import { CaptionAnimatorService } from './caption-animator.service';
import { ChunkManagerService } from './chunk-manager.service';
import { VideoMergerService } from './video-merger.service';
import { FontLoaderService } from './font-loader.service';

@Module({
  controllers: [CaptionsController],
  providers: [
    CaptionsService,
    CaptionAnimatorService,
    ChunkManagerService,
    VideoMergerService,
    FontLoaderService,
  ],
  exports: [
    CaptionsService,
    CaptionAnimatorService,
    ChunkManagerService,
    VideoMergerService,
    FontLoaderService,
  ],
})
export class CaptionsModule {}
