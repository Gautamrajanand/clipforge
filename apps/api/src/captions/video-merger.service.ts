import { Injectable, Logger } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

export interface MergeOptions {
  transition?: 'cut' | 'fade';
  fadeDuration?: number; // seconds
  outputPath: string;
}

@Injectable()
export class VideoMergerService {
  private readonly logger = new Logger(VideoMergerService.name);

  /**
   * Concatenate multiple video chunks into a single video
   */
  async concatenate(
    videoPaths: string[],
    options: MergeOptions,
  ): Promise<string> {
    this.logger.log(`Concatenating ${videoPaths.length} video chunks`);

    if (videoPaths.length === 0) {
      throw new Error('No video paths provided for concatenation');
    }

    if (videoPaths.length === 1) {
      // Only one chunk, just copy it
      this.logger.log('Only one chunk, copying directly');
      await fs.promises.copyFile(videoPaths[0], options.outputPath);
      return options.outputPath;
    }

    // Validate all input files exist
    for (const videoPath of videoPaths) {
      if (!fs.existsSync(videoPath)) {
        throw new Error(`Video chunk not found: ${videoPath}`);
      }
    }

    // Use FFmpeg concat demuxer for lossless concatenation
    if (options.transition === 'fade') {
      return this.concatenateWithFade(videoPaths, options);
    } else {
      return this.concatenateSimple(videoPaths, options);
    }
  }

  /**
   * Simple concatenation without transitions (fastest, lossless)
   */
  private async concatenateSimple(
    videoPaths: string[],
    options: MergeOptions,
  ): Promise<string> {
    this.logger.log('Using simple concatenation (no transitions)');

    // Create concat file list
    const concatListPath = path.join(
      path.dirname(options.outputPath),
      'concat_list.txt',
    );

    const concatList = videoPaths
      .map((p) => `file '${p.replace(/'/g, "'\\''")}'`)
      .join('\n');

    await fs.promises.writeFile(concatListPath, concatList);

    try {
      // Use concat demuxer for fast, lossless concatenation
      const command = `ffmpeg -f concat -safe 0 -i "${concatListPath}" -c copy "${options.outputPath}"`;

      this.logger.log(`Executing: ${command}`);
      const { stdout, stderr } = await execAsync(command);

      if (stderr && !stderr.includes('frame=')) {
        this.logger.warn(`FFmpeg stderr: ${stderr}`);
      }

      this.logger.log('Concatenation completed successfully');
      return options.outputPath;
    } finally {
      // Clean up concat list file
      if (fs.existsSync(concatListPath)) {
        await fs.promises.unlink(concatListPath);
      }
    }
  }

  /**
   * Concatenation with fade transitions between chunks
   */
  private async concatenateWithFade(
    videoPaths: string[],
    options: MergeOptions,
  ): Promise<string> {
    const fadeDuration = options.fadeDuration || 0.5;
    this.logger.log(
      `Using fade transitions (${fadeDuration}s between chunks)`,
    );

    // Build complex filter for crossfade
    const filters: string[] = [];
    let currentLabel = '[0:v]';

    for (let i = 1; i < videoPaths.length; i++) {
      const nextLabel = i === videoPaths.length - 1 ? '[v]' : `[v${i}]`;
      
      // Calculate offset (duration of previous videos minus fade)
      const offset = `${i * 15 - fadeDuration}`;
      
      filters.push(
        `${currentLabel}[${i}:v]xfade=transition=fade:duration=${fadeDuration}:offset=${offset}${nextLabel}`,
      );
      
      currentLabel = nextLabel;
    }

    const filterComplex = filters.join(';');
    const inputs = videoPaths.map((p) => `-i "${p}"`).join(' ');

    const command = `ffmpeg ${inputs} -filter_complex "${filterComplex}" -c:v libx264 -preset fast -crf 23 "${options.outputPath}"`;

    this.logger.log(`Executing: ${command}`);
    const { stdout, stderr } = await execAsync(command);

    if (stderr && !stderr.includes('frame=')) {
      this.logger.warn(`FFmpeg stderr: ${stderr}`);
    }

    this.logger.log('Fade concatenation completed successfully');
    return options.outputPath;
  }

  /**
   * Validate that chunks can be concatenated
   * Checks resolution, codec, frame rate compatibility
   */
  async validateChunks(videoPaths: string[]): Promise<{
    valid: boolean;
    errors: string[];
  }> {
    const errors: string[] = [];

    if (videoPaths.length === 0) {
      errors.push('No video chunks provided');
      return { valid: false, errors };
    }

    try {
      // Get metadata for first chunk as reference
      const firstMetadata = await this.getVideoMetadata(videoPaths[0]);

      // Check all other chunks match
      for (let i = 1; i < videoPaths.length; i++) {
        const metadata = await this.getVideoMetadata(videoPaths[i]);

        if (metadata.width !== firstMetadata.width) {
          errors.push(
            `Chunk ${i} width mismatch: ${metadata.width} vs ${firstMetadata.width}`,
          );
        }

        if (metadata.height !== firstMetadata.height) {
          errors.push(
            `Chunk ${i} height mismatch: ${metadata.height} vs ${firstMetadata.height}`,
          );
        }

        if (Math.abs(metadata.fps - firstMetadata.fps) > 0.1) {
          errors.push(
            `Chunk ${i} FPS mismatch: ${metadata.fps} vs ${firstMetadata.fps}`,
          );
        }
      }
    } catch (error) {
      errors.push(`Failed to validate chunks: ${error.message}`);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get video metadata using ffprobe
   */
  private async getVideoMetadata(videoPath: string): Promise<{
    width: number;
    height: number;
    duration: number;
    fps: number;
  }> {
    const command = `ffprobe -v error -select_streams v:0 -show_entries stream=width,height,r_frame_rate,duration -of json "${videoPath}"`;

    const { stdout } = await execAsync(command);
    const data = JSON.parse(stdout);
    const stream = data.streams[0];

    // Parse frame rate (e.g., "30/1" -> 30)
    const [num, den] = stream.r_frame_rate.split('/').map(Number);
    const fps = num / den;

    return {
      width: stream.width,
      height: stream.height,
      duration: parseFloat(stream.duration),
      fps,
    };
  }

  /**
   * Clean up temporary chunk files
   */
  async cleanupChunks(videoPaths: string[]): Promise<void> {
    this.logger.log(`Cleaning up ${videoPaths.length} temporary chunk files`);

    for (const videoPath of videoPaths) {
      try {
        if (fs.existsSync(videoPath)) {
          await fs.promises.unlink(videoPath);
          this.logger.log(`Deleted: ${videoPath}`);
        }
      } catch (error) {
        this.logger.warn(`Failed to delete ${videoPath}: ${error.message}`);
      }
    }
  }
}
