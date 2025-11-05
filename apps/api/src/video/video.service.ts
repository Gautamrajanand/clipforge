import { Injectable } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';

const ffmpeg = require('fluent-ffmpeg');

@Injectable()
export class VideoService {
  private readonly tempDir = '/tmp/clipforge';

  constructor() {
    // Ensure temp directory exists
    this.ensureTempDir();
  }

  private async ensureTempDir() {
    try {
      await fs.mkdir(this.tempDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create temp directory:', error);
    }
  }

  /**
   * Cut a video segment using FFmpeg
   */
  async cutVideoSegment(
    inputPath: string,
    outputPath: string,
    startTime: number,
    endTime: number,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .setStartTime(startTime)
        .setDuration(endTime - startTime)
        .output(outputPath)
        .videoCodec('libx264')
        .audioCodec('aac')
        .on('end', () => resolve())
        .on('error', (err) => reject(err))
        .run();
    });
  }

  /**
   * Get video metadata
   */
  async getVideoMetadata(inputPath: string): Promise<{
    duration: number;
    width: number;
    height: number;
    format: string;
  }> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(inputPath, (err, metadata) => {
        if (err) {
          reject(err);
          return;
        }

        const videoStream = metadata.streams.find((s) => s.codec_type === 'video');
        resolve({
          duration: metadata.format.duration || 0,
          width: videoStream?.width || 0,
          height: videoStream?.height || 0,
          format: metadata.format.format_name || '',
        });
      });
    });
  }

  /**
   * Generate a temporary file path
   */
  getTempFilePath(extension: string): string {
    return path.join(this.tempDir, `${uuidv4()}${extension}`);
  }

  /**
   * Clean up temporary file
   */
  async cleanupTempFile(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.error('Failed to cleanup temp file:', error);
    }
  }
}
