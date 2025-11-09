import { Injectable, Logger } from '@nestjs/common';
import { createCanvas, Canvas, CanvasRenderingContext2D } from 'canvas';
import * as fs from 'fs';
import * as path from 'path';
import { CaptionStylePreset } from './caption-styles';

interface Word {
  text: string;
  start: number;
  end: number;
}

interface AnimationFrame {
  frameNumber: number;
  timestamp: number;
  text: string;
  words: Word[];
  animationProgress: number; // 0-1
}

/**
 * Caption Animator Service
 * Renders captions frame-by-frame with animations
 * Provides full control over caption appearance and motion
 */
@Injectable()
export class CaptionAnimatorService {
  private readonly logger = new Logger(CaptionAnimatorService.name);

  /**
   * Generate caption frames for a video
   * @param words Word-level transcript
   * @param style Caption style preset
   * @param duration Video duration in seconds
   * @param fps Frames per second (default 30)
   * @param outputDir Directory to save frames
   */
  async generateCaptionFrames(
    words: Word[],
    style: CaptionStylePreset,
    duration: number,
    fps: number = 30,
    outputDir: string,
  ): Promise<string[]> {
    this.logger.log(`Generating caption frames: ${words.length} words, ${duration}s, ${fps}fps`);

    // Create output directory
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const totalFrames = Math.ceil(duration * fps);
    const framePaths: string[] = [];

    // Group words into caption lines
    const captionLines = this.groupWordsIntoLines(words, 42);

    // Generate each frame
    for (let frameNum = 0; frameNum < totalFrames; frameNum++) {
      const timestamp = frameNum / fps;
      const framePath = path.join(outputDir, `caption_${frameNum.toString().padStart(6, '0')}.png`);

      // Find active caption at this timestamp
      const activeCaption = this.getActiveCaptionAtTime(captionLines, timestamp);

      if (activeCaption) {
        // Calculate animation progress
        const progress = this.calculateAnimationProgress(activeCaption, timestamp);

        // Render frame with animation
        await this.renderFrame(framePath, activeCaption, style, progress, 1920, 1080);
      } else {
        // Render transparent frame (no caption)
        await this.renderTransparentFrame(framePath, 1920, 1080);
      }

      framePaths.push(framePath);
    }

    this.logger.log(`Generated ${framePaths.length} caption frames`);
    return framePaths;
  }

  /**
   * Group words into caption lines
   */
  private groupWordsIntoLines(words: Word[], maxCharsPerLine: number): Array<{ words: Word[]; start: number; end: number; text: string }> {
    const lines: Array<{ words: Word[]; start: number; end: number; text: string }> = [];
    let currentLine: Word[] = [];
    let currentLength = 0;

    for (const word of words) {
      const wordLength = word.text.length + 1;

      if (currentLength + wordLength > maxCharsPerLine && currentLine.length > 0) {
        lines.push({
          words: currentLine,
          start: currentLine[0].start,
          end: currentLine[currentLine.length - 1].end,
          text: currentLine.map(w => w.text).join(' '),
        });
        currentLine = [word];
        currentLength = wordLength;
      } else {
        currentLine.push(word);
        currentLength += wordLength;
      }

      // Break on sentence end
      if (word.text.match(/[.!?]$/) && currentLine.length > 0) {
        lines.push({
          words: currentLine,
          start: currentLine[0].start,
          end: currentLine[currentLine.length - 1].end,
          text: currentLine.map(w => w.text).join(' '),
        });
        currentLine = [];
        currentLength = 0;
      }
    }

    if (currentLine.length > 0) {
      lines.push({
        words: currentLine,
        start: currentLine[0].start,
        end: currentLine[currentLine.length - 1].end,
        text: currentLine.map(w => w.text).join(' '),
      });
    }

    return lines;
  }

  /**
   * Get active caption at specific timestamp
   */
  private getActiveCaptionAtTime(
    lines: Array<{ words: Word[]; start: number; end: number; text: string }>,
    timestamp: number,
  ): { words: Word[]; start: number; end: number; text: string } | null {
    return lines.find(line => timestamp >= line.start && timestamp <= line.end) || null;
  }

  /**
   * Calculate animation progress (0-1) for current timestamp
   */
  private calculateAnimationProgress(
    caption: { words: Word[]; start: number; end: number; text: string },
    timestamp: number,
  ): number {
    const elapsed = timestamp - caption.start;
    const duration = caption.end - caption.start;
    return Math.min(1, Math.max(0, elapsed / duration));
  }

  /**
   * Render a single frame with caption and animation
   */
  private async renderFrame(
    outputPath: string,
    caption: { words: Word[]; start: number; end: number; text: string },
    style: CaptionStylePreset,
    animationProgress: number,
    width: number,
    height: number,
  ): Promise<void> {
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Transparent background
    ctx.clearRect(0, 0, width, height);

    // Apply style-specific animation
    switch (style.id) {
      case 'bold':
        this.renderBoldAnimation(ctx, caption.text, style, animationProgress, width, height);
        break;
      case 'modern':
        this.renderFadeAnimation(ctx, caption.text, style, animationProgress, width, height);
        break;
      case 'elegant':
        this.renderSlideAnimation(ctx, caption.text, style, animationProgress, width, height);
        break;
      case 'karaoke':
        this.renderKaraokeAnimation(ctx, caption, style, animationProgress, width, height);
        break;
      default:
        this.renderStaticCaption(ctx, caption.text, style, width, height);
    }

    // Save frame
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(outputPath, buffer);
  }

  /**
   * Bold style: Pop/bounce animation
   */
  private renderBoldAnimation(
    ctx: CanvasRenderingContext2D,
    text: string,
    style: CaptionStylePreset,
    progress: number,
    width: number,
    height: number,
  ): void {
    // Pop animation: scale from 0.8 to 1.0 in first 10% of duration
    const animDuration = 0.1;
    let scale = 1.0;
    
    if (progress < animDuration) {
      const animProgress = progress / animDuration;
      // Ease-out cubic for bounce effect
      scale = 0.8 + (0.2 * (1 - Math.pow(1 - animProgress, 3)));
    }

    ctx.save();
    
    // Position based on style
    const y = style.position === 'center' ? height / 2 : height - 150;
    
    // Apply scale transform
    ctx.translate(width / 2, y);
    ctx.scale(scale, scale);
    ctx.translate(-width / 2, -y);

    // Draw caption
    this.drawStyledText(ctx, text, style, width / 2, y, 1.0);
    
    ctx.restore();
  }

  /**
   * Modern style: Fade-in animation
   */
  private renderFadeAnimation(
    ctx: CanvasRenderingContext2D,
    text: string,
    style: CaptionStylePreset,
    progress: number,
    width: number,
    height: number,
  ): void {
    // Fade in over first 20% of duration
    const animDuration = 0.2;
    const opacity = progress < animDuration ? progress / animDuration : 1.0;

    const y = height - 150;
    this.drawStyledText(ctx, text, style, width / 2, y, opacity);
  }

  /**
   * Elegant style: Slide-up animation
   */
  private renderSlideAnimation(
    ctx: CanvasRenderingContext2D,
    text: string,
    style: CaptionStylePreset,
    progress: number,
    width: number,
    height: number,
  ): void {
    // Slide up 30 pixels over first 15% of duration
    const animDuration = 0.15;
    let offsetY = 0;
    
    if (progress < animDuration) {
      const animProgress = progress / animDuration;
      // Ease-out for smooth deceleration
      offsetY = 30 * (1 - animProgress);
    }

    const y = height - 150 + offsetY;
    this.drawStyledText(ctx, text, style, width / 2, y, 1.0);
  }

  /**
   * Karaoke style: Word-by-word color highlighting
   */
  private renderKaraokeAnimation(
    ctx: CanvasRenderingContext2D,
    caption: { words: Word[]; start: number; end: number; text: string },
    style: CaptionStylePreset,
    progress: number,
    width: number,
    height: number,
  ): void {
    const y = height - 150;
    const fontSize = style.fontSize;
    
    ctx.font = `bold ${fontSize}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Calculate total width
    const totalWidth = ctx.measureText(caption.text).width;
    let currentX = (width - totalWidth) / 2;

    // Draw each word with appropriate color
    for (const word of caption.words) {
      const wordProgress = (progress * (caption.end - caption.start) + caption.start - word.start) / (word.end - word.start);
      const isHighlighted = wordProgress >= 0 && wordProgress <= 1;

      // Green for unhighlighted, yellow for highlighted
      const color = isHighlighted ? '#FFFF00' : '#00FF00';

      // Draw stroke
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 4;
      ctx.strokeText(word.text, currentX, y);

      // Draw fill
      ctx.fillStyle = color;
      ctx.fillText(word.text, currentX, y);

      currentX += ctx.measureText(word.text + ' ').width;
    }
  }

  /**
   * Static caption (no animation)
   */
  private renderStaticCaption(
    ctx: CanvasRenderingContext2D,
    text: string,
    style: CaptionStylePreset,
    width: number,
    height: number,
  ): void {
    const y = style.position === 'center' ? height / 2 : height - 150;
    this.drawStyledText(ctx, text, style, width / 2, y, 1.0);
  }

  /**
   * Draw styled text with stroke and fill
   */
  private drawStyledText(
    ctx: CanvasRenderingContext2D,
    text: string,
    style: CaptionStylePreset,
    x: number,
    y: number,
    opacity: number,
  ): void {
    const fontSize = style.fontSize;
    const fontFamily = style.fontFamily;
    const isBold = ['bold', 'karaoke'].includes(style.id);

    ctx.font = `${isBold ? 'bold' : 'normal'} ${fontSize}px ${fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.globalAlpha = opacity;

    // Draw background if specified
    if (style.backgroundColor && style.backgroundColor !== 'rgba(0, 0, 0, 0)') {
      const metrics = ctx.measureText(text);
      const padding = 20;
      ctx.fillStyle = style.backgroundColor;
      ctx.fillRect(
        x - metrics.width / 2 - padding,
        y - fontSize / 2 - padding / 2,
        metrics.width + padding * 2,
        fontSize + padding,
      );
    }

    // Draw stroke
    if (style.stroke) {
      ctx.strokeStyle = style.stroke.color;
      ctx.lineWidth = style.stroke.width;
      ctx.strokeText(text, x, y);
    }

    // Draw fill
    ctx.fillStyle = style.textColor;
    ctx.fillText(text, x, y);

    ctx.globalAlpha = 1.0;
  }

  /**
   * Render transparent frame (no caption)
   */
  private async renderTransparentFrame(
    outputPath: string,
    width: number,
    height: number,
  ): Promise<void> {
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, width, height);

    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(outputPath, buffer);
  }

  /**
   * Clean up generated frames
   */
  async cleanupFrames(frameDir: string): Promise<void> {
    if (fs.existsSync(frameDir)) {
      const files = fs.readdirSync(frameDir);
      for (const file of files) {
        fs.unlinkSync(path.join(frameDir, file));
      }
      fs.rmdirSync(frameDir);
    }
  }
}
