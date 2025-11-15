import { Injectable, Logger } from '@nestjs/common';
import ffmpeg from 'fluent-ffmpeg';
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
   * Convert video to target aspect ratio with smart cropping
   * Premium quality conversion for social media platforms
   * 
   * @param inputPath - Path to input video file
   * @param outputPath - Path to save processed video
   * @param aspectRatio - Target aspect ratio (9:16, 16:9, 1:1, 4:5)
   * @param mode - Conversion mode: 'crop' (zoom to fill), 'pad' (letterbox), 'smart' (AI-guided)
   * @param cropPosition - Custom crop position {x, y} or 'center', 'top', 'bottom'
   * @returns Promise<void>
   */
  async convertAspectRatio(
    inputPath: string,
    outputPath: string,
    aspectRatio: string,
    mode: 'crop' | 'pad' | 'smart' = 'crop',
    cropPosition: 'center' | 'top' | 'bottom' | { x: number; y: number } = 'center',
  ): Promise<void> {
    // Check feature flag
    if (!FeatureFlags.ASPECT_RATIO) {
      this.logger.warn('Aspect ratio processing disabled by feature flag');
      // Just copy the file if feature is disabled
      await fs.copyFile(inputPath, outputPath);
      return;
    }

    return new Promise(async (resolve, reject) => {
      const { width, height } = this.getTargetDimensions(aspectRatio);

      this.logger.log(
        `Converting video to ${aspectRatio} (${width}x${height}) using ${mode} mode`,
      );

      // Get video metadata for smart processing
      const metadata = await this.getVideoMetadata(inputPath);
      const sourceWidth = metadata.width;
      const sourceHeight = metadata.height;

      // Build video filters based on mode
      const filters = this.buildAspectRatioFilters(
        mode,
        width,
        height,
        sourceWidth,
        sourceHeight,
        cropPosition,
      );

      ffmpeg(inputPath)
        .videoFilters(filters)
        .outputOptions([
          '-c:v libx264',     // H.264 codec (universal compatibility)
          '-preset medium',   // Better quality than 'fast', still reasonable speed
          '-crf 20',          // Premium quality (18-23 is visually lossless)
          '-profile:v high',  // High profile for better compression
          '-level 4.2',       // Wide device compatibility
          '-pix_fmt yuv420p', // Maximum compatibility
          '-movflags +faststart', // Enable streaming/fast playback
          '-c:a aac',         // AAC audio (don't just copy, ensure compatibility)
          '-b:a 192k',        // High quality audio
          '-ar 48000',        // 48kHz sample rate (professional standard)
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
   * Build FFmpeg filters for aspect ratio conversion
   * Handles crop, pad, and smart modes with premium quality
   */
  private buildAspectRatioFilters(
    mode: 'crop' | 'pad' | 'smart',
    targetWidth: number,
    targetHeight: number,
    sourceWidth: number,
    sourceHeight: number,
    cropPosition: 'center' | 'top' | 'bottom' | { x: number; y: number },
  ): any[] {
    const sourceRatio = sourceWidth / sourceHeight;
    const targetRatio = targetWidth / targetHeight;

    if (mode === 'pad') {
      // Letterbox/Pillarbox mode - scale down and add black bars
      return [
        {
          filter: 'scale',
          options: `${targetWidth}:${targetHeight}:force_original_aspect_ratio=decrease`,
        },
        {
          filter: 'pad',
          options: `${targetWidth}:${targetHeight}:(ow-iw)/2:(oh-ih)/2:black`,
        },
      ];
    }

    // Crop mode (default) - zoom to fill, crop excess
    // Calculate crop coordinates based on position
    let cropX = '(iw-ow)/2'; // center X (default)
    let cropY = '(ih-oh)/2'; // center Y (default)

    if (cropPosition === 'top') {
      cropY = '0';
    } else if (cropPosition === 'bottom') {
      cropY = 'ih-oh';
    } else if (cropPosition === 'center') {
      // For vertical formats (9:16, 4:5), optimize for talking heads
      // Keep horizontal center, but bias upward to keep faces in frame
      if (targetRatio < 1) { // Portrait orientation
        // cropX stays centered at (iw-ow)/2
        cropY = '(ih-oh)/3.5'; // Upward bias to prevent top-of-head cutoff
      }
    } else if (typeof cropPosition === 'object') {
      cropX = cropPosition.x.toString();
      cropY = cropPosition.y.toString();
    }

    if (sourceRatio > targetRatio) {
      // Source is wider - crop width
      const cropWidth = Math.round(sourceHeight * targetRatio);
      return [
        {
          filter: 'crop',
          options: `${cropWidth}:${sourceHeight}:${cropX}:0`,
        },
        {
          filter: 'scale',
          options: `${targetWidth}:${targetHeight}`,
        },
      ];
    } else {
      // Source is taller - crop height
      const cropHeight = Math.round(sourceWidth / targetRatio);
      return [
        {
          filter: 'crop',
          options: `${sourceWidth}:${cropHeight}:0:${cropY}`,
        },
        {
          filter: 'scale',
          options: `${targetWidth}:${targetHeight}`,
        },
      ];
    }
  }

  /**
   * Get target dimensions for aspect ratio
   * Premium quality dimensions for social media platforms
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

  /**
   * Extract a single segment from video
   * @param inputPath - Source video file
   * @param outputPath - Where to save the segment
   * @param startTime - Start time in seconds
   * @param duration - Duration in seconds
   */
  async extractSegment(
    inputPath: string,
    outputPath: string,
    startTime: number,
    duration: number,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      this.logger.log(
        `Extracting segment: ${startTime}s for ${duration}s`,
      );

      ffmpeg(inputPath)
        .setStartTime(startTime)
        .setDuration(duration)
        .outputOptions([
          '-c:v libx264',      // Video codec
          '-c:a aac',          // Audio codec
          '-preset fast',      // Encoding speed
          '-crf 23',           // Quality (lower = better)
          '-avoid_negative_ts make_zero', // Fix timestamp issues
        ])
        .output(outputPath)
        .on('end', () => {
          this.logger.log(`✅ Segment extracted: ${outputPath}`);
          resolve();
        })
        .on('error', (err) => {
          this.logger.error(`❌ Segment extraction failed: ${err.message}`);
          reject(err);
        })
        .run();
    });
  }

  /**
   * Stitch multiple video segments together
   * @param segmentPaths - Array of video segment file paths (in order)
   * @param outputPath - Final output video path
   * @param withCrossfade - Whether to add crossfade transitions (default: false)
   */
  async stitchSegments(
    segmentPaths: string[],
    outputPath: string,
    withCrossfade: boolean = false,
  ): Promise<void> {
    if (segmentPaths.length === 0) {
      throw new Error('No segments to stitch');
    }

    if (segmentPaths.length === 1) {
      // Just copy the single segment
      await fs.copyFile(segmentPaths[0], outputPath);
      return;
    }

    this.logger.log(
      `Stitching ${segmentPaths.length} segments${withCrossfade ? ' with crossfades' : ''}`,
    );

    if (withCrossfade) {
      return this.stitchWithCrossfade(segmentPaths, outputPath);
    } else {
      return this.stitchSimple(segmentPaths, outputPath);
    }
  }

  /**
   * Simple concatenation without transitions
   */
  private async stitchSimple(
    segmentPaths: string[],
    outputPath: string,
  ): Promise<void> {
    // Create concat file for FFmpeg
    const concatFilePath = outputPath + '.concat.txt';
    const concatContent = segmentPaths
      .map((p) => `file '${p}'`)
      .join('\n');

    await fs.writeFile(concatFilePath, concatContent);

    return new Promise((resolve, reject) => {
      ffmpeg()
        .input(concatFilePath)
        .inputOptions(['-f concat', '-safe 0'])
        .outputOptions([
          '-c copy', // Copy streams without re-encoding (fast!)
        ])
        .output(outputPath)
        .on('end', async () => {
          // Clean up concat file
          await fs.unlink(concatFilePath).catch(() => {});
          this.logger.log(`✅ Segments stitched: ${outputPath}`);
          resolve();
        })
        .on('error', async (err) => {
          // Clean up concat file
          await fs.unlink(concatFilePath).catch(() => {});
          this.logger.error(`❌ Stitching failed: ${err.message}`);
          reject(err);
        })
        .run();
    });
  }

  /**
   * Stitch segments with crossfade transitions
   */
  private async stitchWithCrossfade(
    segmentPaths: string[],
    outputPath: string,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const crossfadeDuration = 0.3; // 300ms crossfade

      // Build complex filter for crossfades
      // For N segments, we need N-1 crossfades
      const filters: string[] = [];
      let currentLabel = '[0:v][0:a]';

      for (let i = 1; i < segmentPaths.length; i++) {
        const nextLabel = `[v${i}][a${i}]`;
        const outLabel = i === segmentPaths.length - 1 ? '' : `[v${i}out][a${i}out]`;

        // Video crossfade
        filters.push(
          `${currentLabel}[${i}:v]xfade=transition=fade:duration=${crossfadeDuration}:offset=${i * 10}${outLabel ? `[v${i}temp]` : '[vout]'}`,
        );

        // Audio crossfade
        filters.push(
          `${currentLabel.replace('v', 'a')}[${i}:a]acrossfade=d=${crossfadeDuration}${outLabel ? `[a${i}temp]` : '[aout]'}`,
        );

        currentLabel = outLabel || '[vout][aout]';
      }

      const command = ffmpeg();

      // Add all input segments
      segmentPaths.forEach((path) => command.input(path));

      command
        .complexFilter(filters)
        .outputOptions([
          '-map [vout]',
          '-map [aout]',
          '-c:v libx264',
          '-c:a aac',
          '-preset fast',
          '-crf 23',
        ])
        .output(outputPath)
        .on('end', () => {
          this.logger.log(`✅ Segments stitched with crossfades: ${outputPath}`);
          resolve();
        })
        .on('error', (err) => {
          this.logger.error(`❌ Crossfade stitching failed: ${err.message}`);
          reject(err);
        })
        .run();
    });
  }

  /**
   * Create a multi-segment clip from a list of segments
   * This is the main entry point for Pro Clips
   * 
   * @param inputPath - Source video file
   * @param segments - Array of {start, end, order} objects
   * @param outputPath - Final output path
   * @param withCrossfade - Add transitions between segments
   */
  async createMultiSegmentClip(
    inputPath: string,
    segments: Array<{ start: number; end: number; order: number }>,
    outputPath: string,
    withCrossfade: boolean = false,
  ): Promise<void> {
    this.logger.log(
      `🎬 Creating multi-segment clip with ${segments.length} segments`,
    );

    // Sort segments by order
    const sortedSegments = [...segments].sort((a, b) => a.order - b.order);

    // Create temp directory for segments
    const tempDir = path.join(path.dirname(outputPath), 'temp_segments');
    await fs.mkdir(tempDir, { recursive: true });

    try {
      // Extract each segment
      const segmentPaths: string[] = [];

      for (let i = 0; i < sortedSegments.length; i++) {
        const segment = sortedSegments[i];
        const duration = segment.end - segment.start;
        const segmentPath = path.join(tempDir, `segment_${i}.mp4`);

        await this.extractSegment(
          inputPath,
          segmentPath,
          segment.start,
          duration,
        );

        segmentPaths.push(segmentPath);
      }

      // Stitch segments together
      await this.stitchSegments(segmentPaths, outputPath, withCrossfade);

      this.logger.log(`✅ Multi-segment clip created: ${outputPath}`);
    } finally {
      // Clean up temp directory
      await fs.rm(tempDir, { recursive: true, force: true }).catch((err) => {
        this.logger.warn(`Failed to clean up temp directory: ${err.message}`);
      });
    }
  }

  /**
   * Burn captions into video using subtitle file
   * Supports SRT, VTT, and ASS formats
   * 
   * @param inputPath - Path to input video file
   * @param outputPath - Path to save video with burned captions
   * @param captionPath - Path to caption file (SRT, VTT, or ASS)
   * @returns Promise<void>
   */
  async burnCaptions(
    inputPath: string,
    outputPath: string,
    captionPath: string,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const captionExt = path.extname(captionPath).toLowerCase();
      
      // Determine subtitle filter based on file type
      let subtitleFilter: string;
      if (captionExt === '.ass' || captionExt === '.ssa') {
        // ASS/SSA format with advanced styling
        subtitleFilter = `ass=${captionPath.replace(/\\/g, '\\\\').replace(/:/g, '\\:')}`;
      } else {
        // SRT/VTT format (basic styling)
        subtitleFilter = `subtitles=${captionPath.replace(/\\/g, '\\\\').replace(/:/g, '\\:')}`;
      }

      this.logger.log(`Burning captions from ${captionPath} into video`);

      ffmpeg(inputPath)
        .videoFilters(subtitleFilter)
        .outputOptions([
          '-c:v libx264',     // H.264 codec
          '-preset medium',   // Balance speed and quality
          '-crf 20',          // Premium quality
          '-profile:v high',  // High profile
          '-level 4.2',       // Wide compatibility
          '-pix_fmt yuv420p', // Maximum compatibility
          '-movflags +faststart', // Fast streaming
          '-c:a copy',        // Copy audio (no re-encoding)
        ])
        .output(outputPath)
        .on('start', (commandLine) => {
          this.logger.debug(`FFmpeg command: ${commandLine}`);
        })
        .on('progress', (progress) => {
          if (progress.percent) {
            this.logger.debug(`Burning captions: ${progress.percent.toFixed(1)}%`);
          }
        })
        .on('end', () => {
          this.logger.log(`✅ Captions burned successfully: ${outputPath}`);
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
   * Overlay caption frames onto video (for animated captions)
   * 
   * @param inputPath - Path to input video file
   * @param outputPath - Path to save video with overlaid captions
   * @param framePattern - Pattern for caption frames (e.g., 'frames/caption_%06d.png')
   * @param fps - Frames per second (default 30)
   * @returns Promise<void>
   */
  async overlayCaptionFrames(
    inputPath: string,
    outputPath: string,
    framePattern: string,
    fps: number = 30,
    addWatermark: boolean = false,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      this.logger.log(`Overlaying caption frames from pattern: ${framePattern}`);

      const filters: any[] = [
        {
          filter: 'overlay',
          options: {
            x: 0,
            y: 0,
          },
        },
      ];

      // Add watermark if requested (FREE tier)
      if (addWatermark) {
        this.logger.log('🏷️  Adding watermark for FREE tier');
        filters.push({
          filter: 'drawtext',
          options: {
            text: 'Made with ClipForge',
            fontsize: 20,
            fontcolor: 'white@0.7',
            x: '(w-text_w-20)',
            y: '20',
            box: 1,
            boxcolor: 'black@0.5',
            boxborderw: 5,
          },
        });
      }

      ffmpeg(inputPath)
        .input(framePattern)
        .inputOptions([`-framerate ${fps}`])
        .complexFilter(filters)
        .outputOptions([
          '-c:v libx264',
          '-preset ultrafast', // Ultra-fast preset for minimal memory
          '-crf 25', // Higher CRF for smaller files
          '-profile:v baseline', // Simpler profile
          '-level 3.1',
          '-pix_fmt yuv420p',
          '-movflags +faststart',
          '-c:a copy',
          '-threads 1', // Single thread to minimize memory
          '-bufsize 512k', // Even smaller buffer
          '-maxrate 2M', // Limit bitrate
        ])
        .output(outputPath)
        .on('start', (commandLine) => {
          this.logger.debug(`FFmpeg command: ${commandLine}`);
        })
        .on('progress', (progress) => {
          if (progress.percent) {
            this.logger.debug(`Overlaying captions: ${progress.percent.toFixed(1)}%`);
          }
        })
        .on('end', () => {
          this.logger.log(`✅ Caption frames overlaid successfully: ${outputPath}`);
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
   * Add watermark to video (for FREE tier)
   * @param inputPath - Path to input video
   * @param outputPath - Path to output video
   * @returns Promise<void>
   */
  async addWatermark(inputPath: string, outputPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.logger.log('🏷️  Adding watermark to video');

      ffmpeg(inputPath)
        .videoFilters([
          {
            filter: 'drawtext',
            options: {
              text: 'Made with ClipForge',
              fontsize: 20,
              fontcolor: 'white@0.7',
              x: '(w-text_w-20)',
              y: '20',
              box: 1,
              boxcolor: 'black@0.5',
              boxborderw: 5,
            },
          },
        ])
        .outputOptions([
          '-c:v libx264',
          '-preset medium',
          '-crf 23',
          '-pix_fmt yuv420p',
          '-movflags +faststart',
          '-c:a copy',
        ])
        .output(outputPath)
        .on('start', (commandLine) => {
          this.logger.debug(`FFmpeg command: ${commandLine}`);
        })
        .on('progress', (progress) => {
          if (progress.percent) {
            this.logger.debug(`Adding watermark: ${progress.percent.toFixed(1)}%`);
          }
        })
        .on('end', () => {
          this.logger.log(`✅ Watermark added successfully: ${outputPath}`);
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
}
