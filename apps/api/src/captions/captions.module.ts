import { Module } from '@nestjs/common';
import { CaptionsService } from './captions.service';
import { CaptionsController } from './captions.controller';
import { CaptionAnimatorService } from './caption-animator.service';

@Module({
  controllers: [CaptionsController],
  providers: [CaptionsService, CaptionAnimatorService],
  exports: [CaptionsService, CaptionAnimatorService],
})
export class CaptionsModule {}
