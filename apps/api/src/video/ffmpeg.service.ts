import { Injectable, Logger } from '@nestjs/common';
import * as ffmpeg from 'fluent-ffmpeg';
import * as path from 'path';
import * as fs from 'fs/promises';
import { FeatureFlags } from '../config/feature-flags';

/**
 * FFmpeg Service for video processing
 * Handles aspect ratio conversion, cropping, and padding
 */
@Injectable()
export class FFmpegService {
  private readonly logger = new Logger(FFmpegService.name);

  /**
   * Convert video to target aspect ratio
   * Crops or pads video to fit the target ratio without distortion
   * 
   * @param inputPath - Path to input video file
   * @param outputPath - Path to save processed video
   * @param aspectRatio - Target aspect ratio (9:16, 16:9, 1:1, 4:5)
   * @returns Promise<void>
   */
  async convertAspectRatio(
    inputPath: string,
    outputPath: string,
    aspectRatio: string,
  ): Promise<void> {
    // Check feature flag
    if (!FeatureFlags.ASPECT_RATIO) {
      this.logger.warn('Aspect ratio processing disabled by feature flag');
      // Just copy the file if feature is disabled
      await fs.copyFile(inputPath, outputPath);
      return;
    }

    return new Promise((resolve, reject) => {
      const { width, height } = this.getTargetDimensions(aspectRatio);

      this.logger.log(
        `Converting video to ${aspectRatio} (${width}x${height})`,
      );

      ffmpeg(inputPath)
        .videoFilters([
          // Scale and pad to maintain aspect ratio without distortion
          // This ensures the video fits the target dimensions
          {
            filter: 'scale',
            options: `${width}:${height}:force_original_aspect_ratio=decrease`,
          },
          {
            filter: 'pad',
            options: `${width}:${height}:(ow-iw)/2:(oh-ih)/2:black`,
          },
        ])
        .outputOptions([
          '-c:v libx264', // H.264 codec
          '-preset fast', // Fast encoding
          '-crf 23', // Good quality
          '-c:a copy', // Copy audio without re-encoding
        ])
        .output(outputPath)
        .on('start', (commandLine) => {
          this.logger.debug(`FFmpeg command: ${commandLine}`);
        })
        .on('progress', (progress) => {
          if (progress.percent) {
            this.logger.debug(`Processing: ${progress.percent.toFixed(1)}%`);
          }
        })
        .on('end', () => {
          this.logger.log(`Video converted successfully: ${outputPath}`);
          resolve();
        })
        .on('error', (err, stdout, stderr) => {
          this.logger.error(`FFmpeg error: ${err.message}`);
          this.logger.error(`FFmpeg stderr: ${stderr}`);
          reject(err);
        })
        .run();
    });
  }

  /**
   * Get target dimensions for aspect ratio
   * Returns standard dimensions that maintain quality
   */
  private getTargetDimensions(aspectRatio: string): {
    width: number;
    height: number;
  } {
    switch (aspectRatio) {
      case '9:16': // Vertical (TikTok, Shorts, Reels)
        return { width: 1080, height: 1920 };
      case '16:9': // Landscape (YouTube, LinkedIn)
        return { width: 1920, height: 1080 };
      case '1:1': // Square (Instagram Feed)
        return { width: 1080, height: 1080 };
      case '4:5': // Portrait (Instagram Feed)
        return { width: 1080, height: 1350 };
      default:
        this.logger.warn(`Unknown aspect ratio: ${aspectRatio}, using 16:9`);
        return { width: 1920, height: 1080 };
    }
  }

  /**
   * Get video metadata (duration, resolution, etc.)
   */
  async getVideoMetadata(filePath: string): Promise<{
    duration: number;
    width: number;
    height: number;
    aspectRatio: string;
  }> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(filePath, (err, metadata) => {
        if (err) {
          reject(err);
          return;
        }

        const videoStream = metadata.streams.find((s) => s.codec_type === 'video');
        if (!videoStream) {
          reject(new Error('No video stream found'));
          return;
        }

        const duration = metadata.format.duration || 0;
        const width = videoStream.width || 0;
        const height = videoStream.height || 0;
        const aspectRatio = width && height ? `${width}:${height}` : '16:9';

        resolve({ duration, width, height, aspectRatio });
      });
    });
  }
}
