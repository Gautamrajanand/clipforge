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
    width: number = 1920,
    height: number = 1080,
  ): Promise<string[]> {
    this.logger.log(`Generating caption frames: ${words.length} words, ${duration}s, ${fps}fps`);

    // Create output directory
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const totalFrames = Math.ceil(duration * fps);
    const framePaths: string[] = [];

    // Group words into caption lines (shorter for more impact)
    const captionLines = this.groupWordsIntoLines(words, 20); // Reduced from 42 to show 1-2 words at a time

    // Generate each frame with progress logging and memory management
    const batchSize = 100; // Process 100 frames at a time
    for (let frameNum = 0; frameNum < totalFrames; frameNum++) {
      const timestamp = frameNum / fps;
      const framePath = path.join(outputDir, `caption_${frameNum.toString().padStart(6, '0')}.png`);

      // Find active caption at this timestamp
      const activeCaption = this.getActiveCaptionAtTime(captionLines, timestamp);

      if (activeCaption) {
        // Calculate animation progress
        const progress = this.calculateAnimationProgress(activeCaption, timestamp);

        // Render frame with animation
        await this.renderFrame(framePath, activeCaption, style, progress, width, height);
      } else {
        // Render transparent frame (no caption)
        await this.renderTransparentFrame(framePath, width, height);
      }

      framePaths.push(framePath);

      // Log progress every 100 frames
      if ((frameNum + 1) % batchSize === 0 || frameNum === totalFrames - 1) {
        const percent = ((frameNum + 1) / totalFrames * 100).toFixed(1);
        this.logger.log(`Frame generation progress: ${frameNum + 1}/${totalFrames} (${percent}%)`);
        
        // Force garbage collection hint (if available)
        if (global.gc) {
          global.gc();
        }
      }
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
      case 'mrbeast':
        this.renderMrBeastAnimation(ctx, caption, style, animationProgress, width, height);
        break;
      case 'neon':
        this.renderNeonAnimation(ctx, caption.text, style, animationProgress, width, height);
        break;
      case 'highlight':
        this.renderHighlightAnimation(ctx, caption, style, animationProgress, width, height);
        break;
      case 'rainbow':
        this.renderRainbowAnimation(ctx, caption, style, animationProgress, width, height);
        break;
      case 'fill':
        this.renderFillAnimation(ctx, caption, style, animationProgress, width, height);
        break;
      case 'shadow3d':
        this.render3DShadowAnimation(ctx, caption, style, animationProgress, width, height);
        break;
      case 'tricolor':
        this.renderTricolorAnimation(ctx, caption, style, animationProgress, width, height);
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
   * MrBeast style: Word-by-word pop with elastic bounce
   */
  private renderMrBeastAnimation(
    ctx: CanvasRenderingContext2D,
    caption: { words: Word[]; start: number; end: number; text: string },
    style: CaptionStylePreset,
    progress: number,
    width: number,
    height: number,
  ): void {
    // Position at 55-60% height (below subject's head)
    const y = height * 0.58;
    const fontSize = style.fontSize;
    const wordSpacing = 30; // Add extra spacing between words
    
    ctx.font = `bold ${fontSize}px ${style.fontFamily}`;
    ctx.textAlign = 'center'; // Center each word individually
    ctx.textBaseline = 'middle';

    // Calculate positions for each word with proper spacing
    const words = caption.words;
    const wordWidths = words.map(w => ctx.measureText(w.text).width);
    const totalWidth = wordWidths.reduce((sum, w) => sum + w, 0) + (wordSpacing * (words.length - 1));
    let currentX = (width - totalWidth) / 2;

    // Render each word with individual bounce animation
    const totalDuration = caption.end - caption.start;
    
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const wordWidth = wordWidths[i];
      const wordCenter = currentX + wordWidth / 2;
      const wordStart = (word.start - caption.start) / totalDuration;
      
      // Check if this word should be animated
      if (progress >= wordStart) {
        const wordProgress = Math.min(1, (progress - wordStart) / 0.2); // 20% duration for more visible bounce
        
        // Stronger elastic bounce: 0.5 → 1.3 → 1.0 (more pronounced)
        let scale = 1.0;
        if (wordProgress < 1) {
          const t = wordProgress;
          // More dramatic bounce effect
          scale = 0.5 + (0.8 * (1 - Math.pow(1 - t, 3))) - (0.3 * Math.sin(t * Math.PI));
        }
        
        ctx.save();
        ctx.translate(wordCenter, y);
        ctx.scale(scale, scale);
        ctx.translate(-wordCenter, -y);
        
        // Draw stroke (thick black outline)
        if (style.stroke) {
          ctx.strokeStyle = style.stroke.color;
          ctx.lineWidth = style.stroke.width;
          ctx.strokeText(word.text, wordCenter, y);
        }
        
        // Draw fill (yellow/gold)
        ctx.fillStyle = style.textColor;
        ctx.fillText(word.text, wordCenter, y);
        
        ctx.restore();
      }
      
      currentX += wordWidth + wordSpacing;
    }
  }

  /**
   * Neon style: Glow pulse effect with bright colors
   */
  private renderNeonAnimation(
    ctx: CanvasRenderingContext2D,
    text: string,
    style: CaptionStylePreset,
    progress: number,
    width: number,
    height: number,
  ): void {
    // Position at bottom (70-75% for Neon style)
    const y = height * 0.72;
    const fontSize = style.fontSize;
    
    ctx.font = `bold ${fontSize}px ${style.fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Pulsing glow effect (more intense)
    const glowIntensity = 0.6 + 0.4 * Math.sin(progress * Math.PI * 4); // Pulse 4 times
    const glowBlur = 20 + glowIntensity * 40; // Stronger glow
    
    // Draw multiple glow layers for intense effect
    for (let i = 0; i < 4; i++) {
      ctx.save();
      ctx.shadowColor = style.textColor;
      ctx.shadowBlur = glowBlur * (4 - i);
      ctx.globalAlpha = 0.4 * glowIntensity;
      
      ctx.fillStyle = style.textColor;
      ctx.fillText(text, width / 2, y);
      
      ctx.restore();
    }
    
    // Draw main text with thick stroke
    if (style.stroke && style.stroke.width > 0) {
      ctx.strokeStyle = style.stroke.color;
      ctx.lineWidth = style.stroke.width;
      ctx.strokeText(text, width / 2, y);
    }
    
    // Draw bright fill
    ctx.fillStyle = style.textColor;
    ctx.fillText(text, width / 2, y);
  }

  /**
   * Highlight style: Yellow box slides in behind words
   */
  private renderHighlightAnimation(
    ctx: CanvasRenderingContext2D,
    caption: { words: Word[]; start: number; end: number; text: string },
    style: CaptionStylePreset,
    progress: number,
    width: number,
    height: number,
  ): void {
    // Position at 55-60% height (below subject's head)
    const y = height * 0.58;
    const fontSize = style.fontSize;
    const padding = 25; // Increased from 15 for more breathing room
    
    ctx.font = `bold ${fontSize}px ${style.fontFamily}`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';

    // Calculate total width for centering
    const totalWidth = ctx.measureText(caption.text).width;
    let currentX = (width - totalWidth) / 2;

    // Render each word with sliding box animation
    const totalDuration = caption.end - caption.start;
    
    for (const word of caption.words) {
      const wordStart = (word.start - caption.start) / totalDuration;
      
      if (progress >= wordStart) {
        // Faster, snappier animation (5% duration instead of 10%)
        const wordProgress = Math.min(1, (progress - wordStart) / 0.05);
        const wordWidth = ctx.measureText(word.text).width;
        
        // Ease-out for snappier feel
        const easeProgress = 1 - Math.pow(1 - wordProgress, 3);
        
        // Slide box from left to right
        const boxWidth = wordWidth + padding * 2;
        
        // Draw yellow background box with rounded corners effect
        ctx.fillStyle = style.backgroundColor;
        ctx.fillRect(
          currentX - padding,
          y - fontSize / 2 - padding / 2,
          boxWidth * easeProgress,
          fontSize + padding,
        );
        
        // Draw black text on top
        ctx.fillStyle = style.textColor;
        ctx.fillText(word.text, currentX, y);
      }
      
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
   * Rainbow style: Rotating colors for each word
   */
  private renderRainbowAnimation(
    ctx: CanvasRenderingContext2D,
    caption: { words: Word[]; start: number; end: number; text: string },
    style: CaptionStylePreset,
    progress: number,
    width: number,
    height: number,
  ): void {
    // Position at 55-60% height (below subject's head)
    const y = height * 0.58;
    const fontSize = style.fontSize;
    const wordSpacing = 30;
    
    // Color palette for rotation
    const colors = ['#FFD700', '#00FFFF', '#00FF00', '#FF1493', '#FF8C00']; // Yellow, Cyan, Green, Pink, Orange
    
    ctx.font = `bold ${fontSize}px ${style.fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Calculate positions
    const words = caption.words;
    const wordWidths = words.map(w => ctx.measureText(w.text).width);
    const totalWidth = wordWidths.reduce((sum, w) => sum + w, 0) + (wordSpacing * (words.length - 1));
    let currentX = (width - totalWidth) / 2;

    const totalDuration = caption.end - caption.start;
    
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const wordWidth = wordWidths[i];
      const wordCenter = currentX + wordWidth / 2;
      const wordStart = (word.start - caption.start) / totalDuration;
      
      if (progress >= wordStart) {
        const wordProgress = Math.min(1, (progress - wordStart) / 0.15);
        
        // Stronger pop animation (0.3 → 1.5 → 1.0)
        let scale = 1.0;
        if (wordProgress < 1) {
          const t = wordProgress;
          scale = 0.3 + (1.2 * (1 - Math.pow(1 - t, 3))) - (0.5 * Math.sin(t * Math.PI));
        }
        
        // Rotate color based on word index
        const colorIndex = i % colors.length;
        const wordColor = colors[colorIndex];
        
        ctx.save();
        ctx.translate(wordCenter, y);
        ctx.scale(scale, scale);
        ctx.translate(-wordCenter, -y);
        
        // Draw thick black outline
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = style.stroke.width;
        ctx.strokeText(word.text, wordCenter, y);
        
        // Draw colored fill
        ctx.fillStyle = wordColor;
        ctx.fillText(word.text, wordCenter, y);
        
        ctx.restore();
      }
      
      currentX += wordWidth + wordSpacing;
    }
  }

  /**
   * Fill style: Progressive fill effect as words are spoken
   */
  private renderFillAnimation(
    ctx: CanvasRenderingContext2D,
    caption: { words: Word[]; start: number; end: number; text: string },
    style: CaptionStylePreset,
    progress: number,
    width: number,
    height: number,
  ): void {
    const y = height * 0.58;
    const fontSize = style.fontSize;
    const padding = 25;
    
    ctx.font = `bold ${fontSize}px ${style.fontFamily}`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';

    const totalWidth = ctx.measureText(caption.text).width;
    let currentX = (width - totalWidth) / 2;

    const totalDuration = caption.end - caption.start;
    
    for (const word of caption.words) {
      const wordStart = (word.start - caption.start) / totalDuration;
      const wordEnd = (word.end - caption.start) / totalDuration;
      
      if (progress >= wordStart) {
        const wordWidth = ctx.measureText(word.text).width;
        
        // Calculate fill progress (0 to 1 during word duration)
        const fillProgress = Math.min(1, Math.max(0, (progress - wordStart) / (wordEnd - wordStart)));
        
        // Draw background box with progressive fill
        const boxWidth = wordWidth + padding * 2;
        const boxHeight = fontSize + padding;
        
        ctx.fillStyle = style.backgroundColor;
        ctx.fillRect(
          currentX - padding,
          y - fontSize / 2 - padding / 2,
          boxWidth * fillProgress,
          boxHeight,
        );
        
        // Draw black outline
        if (style.stroke && style.stroke.width > 0) {
          ctx.strokeStyle = style.stroke.color;
          ctx.lineWidth = style.stroke.width;
          ctx.strokeText(word.text, currentX, y);
        }
        
        // Draw white text
        ctx.fillStyle = style.textColor;
        ctx.fillText(word.text, currentX, y);
      }
      
      currentX += ctx.measureText(word.text + ' ').width;
    }
  }

  /**
   * 3D Shadow style: Bold text with 3D shadow effect
   */
  private render3DShadowAnimation(
    ctx: CanvasRenderingContext2D,
    caption: { words: Word[]; start: number; end: number; text: string },
    style: CaptionStylePreset,
    progress: number,
    width: number,
    height: number,
  ): void {
    const y = height * 0.58;
    const fontSize = style.fontSize;
    const wordSpacing = 30;
    
    ctx.font = `bold ${fontSize}px ${style.fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const words = caption.words;
    const wordWidths = words.map(w => ctx.measureText(w.text).width);
    const totalWidth = wordWidths.reduce((sum, w) => sum + w, 0) + (wordSpacing * (words.length - 1));
    let currentX = (width - totalWidth) / 2;

    const totalDuration = caption.end - caption.start;
    
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const wordWidth = wordWidths[i];
      const wordCenter = currentX + wordWidth / 2;
      const wordStart = (word.start - caption.start) / totalDuration;
      
      if (progress >= wordStart) {
        const wordProgress = Math.min(1, (progress - wordStart) / 0.15);
        
        // Strong pop animation
        let scale = 1.0;
        if (wordProgress < 1) {
          const t = wordProgress;
          scale = 0.3 + (1.2 * (1 - Math.pow(1 - t, 3))) - (0.5 * Math.sin(t * Math.PI));
        }
        
        ctx.save();
        ctx.translate(wordCenter, y);
        ctx.scale(scale, scale);
        ctx.translate(-wordCenter, -y);
        
        // Draw 3D shadow layers (multiple offset shadows for depth)
        for (let layer = 3; layer > 0; layer--) {
          ctx.fillStyle = `rgba(0, 0, 0, ${0.3 * layer / 3})`;
          ctx.fillText(word.text, wordCenter + (layer * 2), y + (layer * 2));
        }
        
        // Draw main black outline
        ctx.strokeStyle = style.stroke.color;
        ctx.lineWidth = style.stroke.width;
        ctx.strokeText(word.text, wordCenter, y);
        
        // Draw white fill
        ctx.fillStyle = style.textColor;
        ctx.fillText(word.text, wordCenter, y);
        
        ctx.restore();
      }
      
      currentX += wordWidth + wordSpacing;
    }
  }

  /**
   * Tricolor style: Three words with accent color on middle word
   */
  private renderTricolorAnimation(
    ctx: CanvasRenderingContext2D,
    caption: { words: Word[]; start: number; end: number; text: string },
    style: CaptionStylePreset,
    progress: number,
    width: number,
    height: number,
  ): void {
    const y = height * 0.58;
    const fontSize = style.fontSize;
    const wordSpacing = 30;
    
    // Accent colors to rotate through
    const accentColors = ['#FFD700', '#00FFFF', '#00FF00', '#FF1493']; // Yellow, Cyan, Green, Pink
    
    ctx.font = `bold ${fontSize}px ${style.fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const words = caption.words;
    const wordWidths = words.map(w => ctx.measureText(w.text).width);
    const totalWidth = wordWidths.reduce((sum, w) => sum + w, 0) + (wordSpacing * (words.length - 1));
    let currentX = (width - totalWidth) / 2;

    const totalDuration = caption.end - caption.start;
    
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const wordWidth = wordWidths[i];
      const wordCenter = currentX + wordWidth / 2;
      const wordStart = (word.start - caption.start) / totalDuration;
      
      if (progress >= wordStart) {
        const wordProgress = Math.min(1, (progress - wordStart) / 0.15);
        
        // Strong pop animation
        let scale = 1.0;
        if (wordProgress < 1) {
          const t = wordProgress;
          scale = 0.3 + (1.2 * (1 - Math.pow(1 - t, 3))) - (0.5 * Math.sin(t * Math.PI));
        }
        
        // Middle word gets accent color, others white
        const isMiddleWord = i === Math.floor(words.length / 2);
        const accentIndex = Math.floor(i / 3) % accentColors.length;
        const wordColor = isMiddleWord ? accentColors[accentIndex] : style.textColor;
        
        ctx.save();
        ctx.translate(wordCenter, y);
        ctx.scale(scale, scale);
        ctx.translate(-wordCenter, -y);
        
        // Draw black outline
        ctx.strokeStyle = style.stroke.color;
        ctx.lineWidth = style.stroke.width;
        ctx.strokeText(word.text, wordCenter, y);
        
        // Draw colored fill
        ctx.fillStyle = wordColor;
        ctx.fillText(word.text, wordCenter, y);
        
        ctx.restore();
      }
      
      currentX += wordWidth + wordSpacing;
    }
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
