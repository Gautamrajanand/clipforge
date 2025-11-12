import { Module } from '@nestjs/common';
import { FFmpegService } from './ffmpeg.service';
import { VideoService } from './video.service';

@Module({
  providers: [FFmpegService, VideoService],
  exports: [FFmpegService, VideoService],
})
export class VideoModule {}
