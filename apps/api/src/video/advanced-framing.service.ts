import { Injectable, Logger } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import * as fs from 'fs/promises';
import { FramingStrategy, AdvancedLayoutDto, OverlayPosition } from '../projects/dto/reframe.dto';

const execAsync = promisify(exec);

interface VideoInfo {
  width: number;
  height: number;
  duration: number;
  fps: number;
}

interface FaceDetectionData {
  primaryRegion?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

@Injectable()
export class AdvancedFramingService {
  private readonly logger = new Logger(AdvancedFramingService.name);

  /**
   * Get video information using ffprobe
   */
  async getVideoInfo(videoPath: string): Promise<VideoInfo> {
    const command = `ffprobe -v quiet -print_format json -show_format -show_streams "${videoPath}"`;
    const { stdout } = await execAsync(command);
    const data = JSON.parse(stdout);
    
    const videoStream = data.streams.find((s: any) => s.codec_type === 'video');
    
    return {
      width: videoStream.width,
      height: videoStream.height,
      duration: parseFloat(data.format.duration),
      fps: eval(videoStream.r_frame_rate), // e.g., "30/1" -> 30
    };
  }

  /**
   * Apply Side-by-Side layout
   * Creates two video sections side by side
   */
  async applySideBySide(
    videoPath: string,
    outputPath: string,
    targetWidth: number,
    targetHeight: number,
    layout: AdvancedLayoutDto,
  ): Promise<void> {
    this.logger.log('🎬 Applying Side-by-Side layout');

    const leftRatio = layout.leftRatio || 0.5;
    const rightRatio = layout.rightRatio || 0.5;
    const gap = layout.gap || 10;

    const leftWidth = Math.floor(targetWidth * leftRatio - gap / 2);
    const rightWidth = Math.floor(targetWidth * rightRatio - gap / 2);

    // FFmpeg filter: Split video, crop each side, stack horizontally
    const filter = [
      `[0:v]split=2[left][right]`,
      `[left]crop=${leftWidth}:${targetHeight}:0:0,scale=${leftWidth}:${targetHeight}[left_scaled]`,
      `[right]crop=${rightWidth}:${targetHeight}:${leftWidth + gap}:0,scale=${rightWidth}:${targetHeight}[right_scaled]`,
      `[left_scaled][right_scaled]hstack=inputs=2[out]`,
    ].join(';');

    const command = `ffmpeg -i "${videoPath}" -filter_complex "${filter}" -map "[out]" -c:v libx264 -preset medium -crf 23 -c:a copy "${outputPath}"`;

    this.logger.log(`Executing: ${command}`);
    await execAsync(command);
    this.logger.log('✅ Side-by-Side layout applied');
  }

  /**
   * Apply Picture-in-Picture layout
   * Overlays a smaller video on top of the main video
   */
  async applyPictureInPicture(
    videoPath: string,
    outputPath: string,
    targetWidth: number,
    targetHeight: number,
    layout: AdvancedLayoutDto,
  ): Promise<void> {
    this.logger.log('🎬 Applying Picture-in-Picture layout');

    const overlaySize = layout.overlaySize || 0.25;
    const overlayPadding = layout.overlayPadding || 20;
    const position = layout.overlayPosition || OverlayPosition.BOTTOM_RIGHT;
    const borderWidth = layout.borderWidth || 3;
    const borderColor = layout.borderColor || '#ffffff';

    // Calculate overlay dimensions
    const overlayWidth = Math.floor(targetWidth * overlaySize);
    const overlayHeight = Math.floor(targetHeight * overlaySize);

    // Calculate overlay position
    let x: string, y: string;
    switch (position) {
      case OverlayPosition.TOP_LEFT:
        x = String(overlayPadding);
        y = String(overlayPadding);
        break;
      case OverlayPosition.TOP_RIGHT:
        x = `W-w-${overlayPadding}`;
        y = String(overlayPadding);
        break;
      case OverlayPosition.BOTTOM_LEFT:
        x = String(overlayPadding);
        y = `H-h-${overlayPadding}`;
        break;
      case OverlayPosition.BOTTOM_RIGHT:
        x = `W-w-${overlayPadding}`;
        y = `H-h-${overlayPadding}`;
        break;
      case OverlayPosition.CENTER:
        x = '(W-w)/2';
        y = '(H-h)/2';
        break;
    }

    // FFmpeg filter: Main video + scaled overlay with border
    const filter = [
      `[0:v]scale=${targetWidth}:${targetHeight}[main]`,
      `[0:v]scale=${overlayWidth}:${overlayHeight}[pip_base]`,
      `[pip_base]pad=${overlayWidth + borderWidth * 2}:${overlayHeight + borderWidth * 2}:${borderWidth}:${borderWidth}:${borderColor}[pip]`,
      `[main][pip]overlay=${x}:${y}[out]`,
    ].join(';');

    const command = `ffmpeg -i "${videoPath}" -filter_complex "${filter}" -map "[out]" -c:v libx264 -preset medium -crf 23 -c:a copy "${outputPath}"`;

    this.logger.log(`Executing: ${command}`);
    await execAsync(command);
    this.logger.log('✅ Picture-in-Picture layout applied');
  }

  /**
   * Apply Grid layout
   * Creates a grid of video sections (2x2, 3x3, etc.)
   */
  async applyGrid(
    videoPath: string,
    outputPath: string,
    targetWidth: number,
    targetHeight: number,
    layout: AdvancedLayoutDto,
  ): Promise<void> {
    this.logger.log('🎬 Applying Grid layout');

    const rows = layout.rows || 2;
    const columns = layout.columns || 2;
    const gap = layout.gap || 5;

    const cellWidth = Math.floor((targetWidth - gap * (columns - 1)) / columns);
    const cellHeight = Math.floor((targetHeight - gap * (rows - 1)) / rows);

    // Build filter for grid layout
    const filters: string[] = [];
    const cells: string[] = [];

    // Split video into cells
    filters.push(`[0:v]split=${rows * columns}${Array.from({ length: rows * columns }, (_, i) => `[v${i}]`).join('')}`);

    // Crop and scale each cell
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        const index = row * columns + col;
        const x = col * (cellWidth + gap);
        const y = row * (cellHeight + gap);
        
        filters.push(`[v${index}]crop=${cellWidth}:${cellHeight}:${x}:${y},scale=${cellWidth}:${cellHeight}[cell${index}]`);
        cells.push(`[cell${index}]`);
      }
    }

    // Stack cells horizontally for each row
    const rowOutputs: string[] = [];
    for (let row = 0; row < rows; row++) {
      const rowCells = cells.slice(row * columns, (row + 1) * columns);
      filters.push(`${rowCells.join('')}hstack=inputs=${columns}[row${row}]`);
      rowOutputs.push(`[row${row}]`);
    }

    // Stack rows vertically
    filters.push(`${rowOutputs.join('')}vstack=inputs=${rows}[out]`);

    const filter = filters.join(';');
    const command = `ffmpeg -i "${videoPath}" -filter_complex "${filter}" -map "[out]" -c:v libx264 -preset medium -crf 23 -c:a copy "${outputPath}"`;

    this.logger.log(`Executing: ${command}`);
    await execAsync(command);
    this.logger.log('✅ Grid layout applied');
  }

  /**
   * Apply Above/Below layout
   * Stacks two video sections vertically
   */
  async applyAboveBelow(
    videoPath: string,
    outputPath: string,
    targetWidth: number,
    targetHeight: number,
    layout: AdvancedLayoutDto,
  ): Promise<void> {
    this.logger.log('🎬 Applying Above/Below layout');

    const topRatio = layout.topRatio || 0.6;
    const bottomRatio = layout.bottomRatio || 0.4;
    const gap = layout.gap || 10;

    const topHeight = Math.floor(targetHeight * topRatio - gap / 2);
    const bottomHeight = Math.floor(targetHeight * bottomRatio - gap / 2);

    // FFmpeg filter: Split video, crop each section, stack vertically
    const filter = [
      `[0:v]split=2[top][bottom]`,
      `[top]crop=${targetWidth}:${topHeight}:0:0,scale=${targetWidth}:${topHeight}[top_scaled]`,
      `[bottom]crop=${targetWidth}:${bottomHeight}:0:${topHeight + gap},scale=${targetWidth}:${bottomHeight}[bottom_scaled]`,
      `[top_scaled][bottom_scaled]vstack=inputs=2[out]`,
    ].join(';');

    const command = `ffmpeg -i "${videoPath}" -filter_complex "${filter}" -map "[out]" -c:v libx264 -preset medium -crf 23 -c:a copy "${outputPath}"`;

    this.logger.log(`Executing: ${command}`);
    await execAsync(command);
    this.logger.log('✅ Above/Below layout applied');
  }

  /**
   * Apply Smart Crop with Face Detection
   * Uses face detection data to intelligently crop video
   */
  async applySmartCropWithFaces(
    videoPath: string,
    outputPath: string,
    targetWidth: number,
    targetHeight: number,
    faceData: FaceDetectionData,
  ): Promise<void> {
    this.logger.log('🎬 Applying Smart Crop with Face Detection');

    const videoInfo = await this.getVideoInfo(videoPath);
    const sourceWidth = videoInfo.width;
    const sourceHeight = videoInfo.height;

    let cropX = 0;
    let cropY = 0;
    let cropWidth = sourceWidth;
    let cropHeight = sourceHeight;

    if (faceData.primaryRegion) {
      // Calculate crop region centered on face
      const face = faceData.primaryRegion;
      const faceCenterX = face.x + face.width / 2;
      const faceCenterY = face.y + face.height / 2;

      // Calculate crop dimensions maintaining target aspect ratio
      const targetAspect = targetWidth / targetHeight;
      const sourceAspect = sourceWidth / sourceHeight;

      if (targetAspect > sourceAspect) {
        // Target is wider - crop height
        cropWidth = sourceWidth;
        cropHeight = Math.floor(cropWidth / targetAspect);
      } else {
        // Target is taller - crop width
        cropHeight = sourceHeight;
        cropWidth = Math.floor(cropHeight * targetAspect);
      }

      // Center crop on face
      cropX = Math.max(0, Math.min(faceCenterX - cropWidth / 2, sourceWidth - cropWidth));
      cropY = Math.max(0, Math.min(faceCenterY - cropHeight / 2, sourceHeight - cropHeight));
    } else {
      // No face detected - fall back to center crop
      this.logger.warn('No face detected, falling back to center crop');
      const targetAspect = targetWidth / targetHeight;
      const sourceAspect = sourceWidth / sourceHeight;

      if (targetAspect > sourceAspect) {
        cropWidth = sourceWidth;
        cropHeight = Math.floor(cropWidth / targetAspect);
        cropY = Math.floor((sourceHeight - cropHeight) / 2);
      } else {
        cropHeight = sourceHeight;
        cropWidth = Math.floor(cropHeight * targetAspect);
        cropX = Math.floor((sourceWidth - cropWidth) / 2);
      }
    }

    const filter = `crop=${cropWidth}:${cropHeight}:${cropX}:${cropY},scale=${targetWidth}:${targetHeight}`;
    const command = `ffmpeg -i "${videoPath}" -vf "${filter}" -c:v libx264 -preset medium -crf 23 -c:a copy "${outputPath}"`;

    this.logger.log(`Executing: ${command}`);
    await execAsync(command);
    this.logger.log('✅ Smart Crop with Face Detection applied');
  }

  /**
   * Apply smooth transitions between video sections
   * Uses xfade filter for professional transitions
   */
  async applyTransition(
    input1Path: string,
    input2Path: string,
    outputPath: string,
    transitionType: 'fade' | 'wipeleft' | 'wiperight' | 'slideleft' | 'slideright' | 'dissolve',
    duration: number,
    offset: number,
  ): Promise<void> {
    this.logger.log(`🎬 Applying ${transitionType} transition`);

    const filter = `[0:v][1:v]xfade=transition=${transitionType}:duration=${duration}:offset=${offset}[out]`;
    const command = `ffmpeg -i "${input1Path}" -i "${input2Path}" -filter_complex "${filter}" -map "[out]" -c:v libx264 -preset medium -crf 23 "${outputPath}"`;

    this.logger.log(`Executing: ${command}`);
    await execAsync(command);
    this.logger.log('✅ Transition applied');
  }

  /**
   * Main entry point for advanced framing
   * Routes to appropriate framing method based on strategy
   */
  async applyAdvancedFraming(
    videoPath: string,
    outputPath: string,
    targetWidth: number,
    targetHeight: number,
    strategy: FramingStrategy,
    layout?: AdvancedLayoutDto,
    faceData?: FaceDetectionData,
  ): Promise<void> {
    this.logger.log(`🎯 Applying advanced framing: ${strategy}`);

    switch (strategy) {
      case FramingStrategy.SIDE_BY_SIDE:
        await this.applySideBySide(videoPath, outputPath, targetWidth, targetHeight, layout || {});
        break;

      case FramingStrategy.PICTURE_IN_PICTURE:
        await this.applyPictureInPicture(videoPath, outputPath, targetWidth, targetHeight, layout || {});
        break;

      case FramingStrategy.GRID:
        await this.applyGrid(videoPath, outputPath, targetWidth, targetHeight, layout || {});
        break;

      case FramingStrategy.ABOVE_BELOW:
        await this.applyAboveBelow(videoPath, outputPath, targetWidth, targetHeight, layout || {});
        break;

      case FramingStrategy.SMART_CROP:
        if (faceData) {
          await this.applySmartCropWithFaces(videoPath, outputPath, targetWidth, targetHeight, faceData);
        } else {
          // Fall back to basic smart crop (will be handled by existing FFmpegService)
          throw new Error('Face detection data required for smart crop');
        }
        break;

      default:
        throw new Error(`Unsupported framing strategy: ${strategy}`);
    }

    this.logger.log('✅ Advanced framing complete');
  }
}
