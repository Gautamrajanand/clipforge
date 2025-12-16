import { Module } from '@nestjs/common';
import { FFmpegService } from './ffmpeg.service';
import { VideoService } from './video.service';
import { AdvancedFramingService } from './advanced-framing.service';

@Module({
  providers: [FFmpegService, VideoService, AdvancedFramingService],
  exports: [FFmpegService, VideoService, AdvancedFramingService],
})
export class VideoModule {}
