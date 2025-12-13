import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from '../../storage/storage.service';
import { AdvancedFramingService } from '../../video/advanced-framing.service';
import { ReframeDto } from '../../projects/dto/reframe.dto';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

export interface ReframeJobData {
  projectId: string;
  orgId: string;
  settings: ReframeDto;
  sourceUrl: string;
}

@Processor('reframe', {
  concurrency: 2, // Process 2 reframe jobs concurrently
})
export class ReframeProcessor extends WorkerHost {
  private readonly logger = new Logger(ReframeProcessor.name);

  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
    private advancedFraming: AdvancedFramingService,
  ) {
    super();
  }

  async process(job: Job<ReframeJobData>): Promise<any> {
    const { projectId, orgId, settings, sourceUrl } = job.data;

    this.logger.log(`🎬 Processing reframe job ${job.id} for project ${projectId}`);
    this.logger.log(`   Strategy: ${settings.strategy}`);
    this.logger.log(`   Aspect Ratio: ${settings.aspectRatio}`);

    const tempDir = path.join(os.tmpdir(), `reframe-${projectId}-${Date.now()}`);
    fs.mkdirSync(tempDir, { recursive: true });

    try {
      // Update job progress
      await job.updateProgress(10);

      // Update project status to INGESTING (processing)
      await this.prisma.project.update({
        where: { id: projectId },
        data: { status: 'INGESTING' },
      });

      // Download source video from storage
      this.logger.log(`📥 Downloading source video: ${sourceUrl}`);
      const inputPath = path.join(tempDir, 'input.mp4');
      
      // Get signed URL and download
      const signedUrl = await this.storage.getSignedUrl(sourceUrl);
      const https = require('https');
      const http = require('http');
      const file = fs.createWriteStream(inputPath);
      
      await new Promise((resolve, reject) => {
        const protocol = signedUrl.startsWith('https') ? https : http;
        protocol.get(signedUrl, (response) => {
          response.pipe(file);
          file.on('finish', () => {
            file.close();
            resolve(null);
          });
        }).on('error', (err) => {
          fs.unlinkSync(inputPath);
          reject(err);
        });
      });
      
      await job.updateProgress(30);

      // Apply reframing - for now use basic FFmpeg, advanced modes will be added later
      this.logger.log(`🎨 Applying ${settings.strategy} reframing...`);
      const outputPath = path.join(tempDir, 'reframed.mp4');
      await this.applyBasicReframing(inputPath, outputPath, settings);

      await job.updateProgress(80);

      // Upload reframed video
      this.logger.log(`📤 Uploading reframed video...`);
      const reframedKey = `projects/${projectId}/reframed.mp4`;
      const reframedBuffer = fs.readFileSync(outputPath);
      await this.storage.uploadFile(reframedKey, reframedBuffer, 'video/mp4');
      await job.updateProgress(95);

      // Update project status to READY
      await this.prisma.project.update({
        where: { id: projectId },
        data: {
          status: 'READY',
        },
      });

      // Create asset record for reframed video
      // Store the S3 key, not the signed URL (signed URLs expire)
      await this.prisma.asset.create({
        data: {
          projectId,
          kind: 'CLIP',
          url: reframedKey, // Store the key, not the signed URL
          mimeType: 'video/mp4',
        },
      });

      this.logger.log(`✅ Reframe complete for project ${projectId}`);
      await job.updateProgress(100);

      // Cleanup temp files
      fs.rmSync(tempDir, { recursive: true, force: true });

      return {
        projectId,
        reframedKey,
        status: 'completed',
        settings,
      };
    } catch (error) {
      this.logger.error(`❌ Reframe failed for project ${projectId}:`, error);

      // Update project status to FAILED
      await this.prisma.project.update({
        where: { id: projectId },
        data: { status: 'FAILED' },
      });

      // Cleanup temp files
      if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }

      throw error;
    }
  }

  /**
   * Apply basic reframing using simple FFmpeg commands
   */
  private async applyBasicReframing(
    inputPath: string,
    outputPath: string,
    settings: ReframeDto,
  ): Promise<void> {
    const { execSync } = require('child_process');
    const aspectRatio = settings.aspectRatio;
    const [width, height] = this.getTargetDimensions(aspectRatio);

    let ffmpegCmd = '';

    switch (settings.strategy) {
      case 'center_crop':
        ffmpegCmd = `ffmpeg -i "${inputPath}" -vf "scale=${width}:${height}:force_original_aspect_ratio=increase,crop=${width}:${height}" -c:a copy "${outputPath}"`;
        break;

      case 'pad_blur':
        ffmpegCmd = `ffmpeg -i "${inputPath}" -filter_complex "[0:v]scale=${width}:${height}:force_original_aspect_ratio=decrease,boxblur=20:5[fg];[0:v]scale=${width}:${height}:force_original_aspect_ratio=increase,crop=${width}:${height}[bg];[bg][fg]overlay=(W-w)/2:(H-h)/2" -c:a copy "${outputPath}"`;
        break;

      case 'pad_color':
        const bgColor = settings.backgroundColor || '#000000';
        ffmpegCmd = `ffmpeg -i "${inputPath}" -vf "scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2:color=${bgColor}" -c:a copy "${outputPath}"`;
        break;

      case 'picture_in_picture':
        // Main video fills frame with blur, sharp PiP overlay in bottom-right corner
        const pipSize = Math.floor(width * 0.35); // 35% of width
        const pipMargin = Math.floor(width * 0.04); // 4% margin
        // Create blurred background + sharp PiP overlay
        ffmpegCmd = `ffmpeg -i "${inputPath}" -filter_complex "[0:v]split=2[bg][pip];[bg]scale=${width}:${height}:force_original_aspect_ratio=increase,crop=${width}:${height},boxblur=20:5[bgblur];[pip]scale=${pipSize}:-1:force_original_aspect_ratio=decrease[pipscaled];[bgblur][pipscaled]overlay=W-w-${pipMargin}:H-h-${pipMargin}" -c:a copy "${outputPath}"`;
        break;

      case 'side_by_side':
        // Two videos side by side (duplicate the same video for demo)
        const halfWidth = Math.floor(width / 2);
        ffmpegCmd = `ffmpeg -i "${inputPath}" -filter_complex "[0:v]scale=${halfWidth}:${height}:force_original_aspect_ratio=increase,crop=${halfWidth}:${height}[left];[0:v]scale=${halfWidth}:${height}:force_original_aspect_ratio=increase,crop=${halfWidth}:${height}[right];[left][right]hstack=inputs=2" -c:a copy "${outputPath}"`;
        break;

      case 'grid':
        // 2x2 grid layout (duplicate same video 4 times for demo)
        const gridWidth = Math.floor(width / 2);
        const gridHeight = Math.floor(height / 2);
        ffmpegCmd = `ffmpeg -i "${inputPath}" -filter_complex "[0:v]scale=${gridWidth}:${gridHeight}:force_original_aspect_ratio=increase,crop=${gridWidth}:${gridHeight}[v0];[v0]split=4[v1][v2][v3][v4];[v1][v2]hstack[top];[v3][v4]hstack[bottom];[top][bottom]vstack" -c:a copy "${outputPath}"`;
        break;

      case 'above_below':
        // Two videos stacked vertically (duplicate the same video for demo)
        const halfHeight = Math.floor(height / 2);
        ffmpegCmd = `ffmpeg -i "${inputPath}" -filter_complex "[0:v]scale=${width}:${halfHeight}:force_original_aspect_ratio=increase,crop=${width}:${halfHeight}[top];[0:v]scale=${width}:${halfHeight}:force_original_aspect_ratio=increase,crop=${width}:${halfHeight}[bottom];[top][bottom]vstack=inputs=2" -c:a copy "${outputPath}"`;
        break;

      case 'smart_crop':
      default:
        // For smart crop without face detection, use center crop
        ffmpegCmd = `ffmpeg -i "${inputPath}" -vf "scale=${width}:${height}:force_original_aspect_ratio=increase,crop=${width}:${height}" -c:a copy "${outputPath}"`;
        break;
    }

    this.logger.log(`🎬 Executing FFmpeg: ${ffmpegCmd.substring(0, 100)}...`);
    execSync(ffmpegCmd, { stdio: 'inherit' });
  }

  /**
   * Get target dimensions based on aspect ratio
   */
  private getTargetDimensions(aspectRatio: string): [number, number] {
    switch (aspectRatio) {
      case '9:16':
        return [1080, 1920];
      case '16:9':
        return [1920, 1080];
      case '1:1':
        return [1080, 1080];
      case '4:5':
        return [1080, 1350];
      default:
        return [1080, 1920];
    }
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job<ReframeJobData>) {
    this.logger.log(`✅ Reframe job ${job.id} completed for project ${job.data.projectId}`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job<ReframeJobData>, error: Error) {
    this.logger.error(`❌ Reframe job ${job.id} failed:`, error.message);
  }
}
