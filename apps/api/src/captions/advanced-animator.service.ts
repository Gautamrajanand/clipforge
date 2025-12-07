import { Injectable, Logger } from '@nestjs/common';
import { createCanvas, Canvas, CanvasRenderingContext2D, registerFont } from 'canvas';
import * as fs from 'fs';
import * as path from 'path';
import {
  CaptionStyle,
  WordTiming,
  AnimationConfig,
  AnimationInterpolator,
  Easing,
  RenderFrame,
} from './animation-types';
import { getCaptionStyle } from './caption-style-registry';
import { FontLoaderService } from './font-loader.service';

interface RenderState {
  lineOpacity: number;
  lineScale: number;
  lineTranslateX: number;
  lineTranslateY: number;
  lineRotate: number;
  lineBlur: number;
  glowIntensity: number;
  glowRadius: number;
  backgroundWidth: number;
  backgroundHeight: number;
  rgbSplitX: number;
  rgbSplitY: number;
}

interface WordRenderState extends RenderState {
  wordIndex: number;
  wordOpacity: number;
  wordScale: number;
  wordTranslateX: number;
  wordTranslateY: number;
  wordColor: string;
  backgroundWidth: number;
}

@Injectable()
export class AdvancedAnimatorService {
  private readonly logger = new Logger(AdvancedAnimatorService.name);

  constructor(private readonly fontLoader?: FontLoaderService) {
    if (this.fontLoader && !this.fontLoader.areFontsLoaded()) {
      this.logger.warn('Fonts not loaded yet, loading now...');
      this.fontLoader.loadFonts();
    }
  }

  /**
   * Generate caption frames with advanced animations
   */
  async generateCaptionFrames(
    words: WordTiming[],
    styleId: string,
    videoDuration: number,
    videoWidth: number,
    videoHeight: number,
    fps: number = 30,
    outputDir: string
  ): Promise<string[]> {
    const style = getCaptionStyle(styleId);
    const totalFrames = Math.ceil(videoDuration * fps);
    const framePaths: string[] = [];

    this.logger.log(`🎬 Generating ${totalFrames} frames for ${styleId} style`);
    this.logger.log(`📐 Video: ${videoWidth}x${videoHeight} @ ${fps}fps`);
    this.logger.log(`📝 Words: ${words.length}`);

    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Group words into caption lines (based on timing gaps)
    const captionLines = this.groupWordsIntoLines(words, 3.0); // 3 second max per line

    // Generate each frame
    for (let frameNum = 0; frameNum < totalFrames; frameNum++) {
      const timestamp = frameNum / fps;
      const framePath = path.join(outputDir, `frame_${String(frameNum).padStart(6, '0')}.png`);

      await this.renderFrame(
        frameNum,
        timestamp,
        captionLines,
        style,
        videoWidth,
        videoHeight,
        framePath
      );

      framePaths.push(framePath);

      // Progress logging
      if (frameNum % 100 === 0 || frameNum === totalFrames - 1) {
        const progress = ((frameNum + 1) / totalFrames * 100).toFixed(1);
        this.logger.log(`📊 Progress: ${progress}% (${frameNum + 1}/${totalFrames} frames)`);
      }
    }

    this.logger.log(`✅ Generated ${framePaths.length} frames`);
    return framePaths;
  }

  /**
   * Group words into caption lines based on timing
   */
  private groupWordsIntoLines(words: WordTiming[], maxDuration: number): WordTiming[][] {
    const lines: WordTiming[][] = [];
    let currentLine: WordTiming[] = [];
    let lineStartTime = words[0]?.start || 0;

    for (const word of words) {
      const lineDuration = word.end - lineStartTime;

      if (lineDuration > maxDuration && currentLine.length > 0) {
        lines.push(currentLine);
        currentLine = [word];
        lineStartTime = word.start;
      } else {
        currentLine.push(word);
      }
    }

    if (currentLine.length > 0) {
      lines.push(currentLine);
    }

    return lines;
  }

  /**
   * Render a single frame
   */
  private async renderFrame(
    frameNum: number,
    timestamp: number,
    captionLines: WordTiming[][],
    style: CaptionStyle,
    width: number,
    height: number,
    outputPath: string
  ): Promise<void> {
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Clear canvas (transparent)
    ctx.clearRect(0, 0, width, height);

    // Find active caption line(s) at this timestamp
    for (const line of captionLines) {
      const lineStart = line[0].start;
      const lineEnd = line[line.length - 1].end;

      if (timestamp >= lineStart && timestamp <= lineEnd) {
        await this.renderCaptionLine(ctx, line, style, timestamp, width, height);
      }
    }

    // Save frame
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(outputPath, buffer);
  }

  /**
   * Render a caption line with animations
   */
  private async renderCaptionLine(
    ctx: CanvasRenderingContext2D,
    words: WordTiming[],
    style: CaptionStyle,
    timestamp: number,
    width: number,
    height: number
  ): Promise<void> {
    const lineStart = words[0].start;
    const lineEnd = words[words.length - 1].end;
    const lineDuration = lineEnd - lineStart;
    const lineProgress = Math.min(1, (timestamp - lineStart) / lineDuration);

    // Calculate line-level animation state
    const lineState = this.calculateLineState(style, timestamp, lineStart, lineEnd);

    // Apply line-level transformations
    ctx.save();
    ctx.globalAlpha = lineState.lineOpacity;

    // Position based on style
    const y = this.getYPosition(style, height);

    // Render based on animation type
    if (style.animation.perWord || style.animation.stagger?.type === 'word') {
      // Per-word animation (MrBeast, Neon, Highlight, Bounce)
      await this.renderPerWordAnimation(ctx, words, style, timestamp, width, y, lineState);
    } else if (style.animation.perChar || style.animation.stagger?.type === 'char') {
      // Per-character animation (Typewriter, Karaoke)
      await this.renderPerCharAnimation(ctx, words, style, timestamp, width, y, lineState);
    } else {
      // Line-level animation only (Minimal, Subtitle, etc.)
      await this.renderLineAnimation(ctx, words, style, timestamp, width, y, lineState);
    }

    ctx.restore();

    // Apply special effects
    if (style.glitchEffect?.enabled) {
      this.applyGlitchEffect(ctx, style, timestamp, width, height);
    }
  }

  /**
   * Calculate line-level animation state
   */
  private calculateLineState(
    style: CaptionStyle,
    timestamp: number,
    lineStart: number,
    lineEnd: number
  ): RenderState {
    const state: RenderState = {
      lineOpacity: 1,
      lineScale: 1,
      lineTranslateX: 0,
      lineTranslateY: 0,
      lineRotate: 0,
      lineBlur: 0,
      glowIntensity: style.glow?.intensity || 0,
      glowRadius: style.glow?.radius || 0,
      backgroundWidth: 1,
      backgroundHeight: 1,
      rgbSplitX: 0,
      rgbSplitY: 0,
    };

    const timeSinceStart = timestamp - lineStart;
    const timeUntilEnd = lineEnd - timestamp;

    // Entry animation
    const entryDuration = style.animation.entry.duration / 1000;
    if (timeSinceStart < entryDuration) {
      const progress = timeSinceStart / entryDuration;
      this.applyAnimationConfig(state, style.animation.entry, progress);
    }

    // Exit animation
    const exitDuration = style.animation.exit.duration / 1000;
    if (timeUntilEnd < exitDuration) {
      const progress = 1 - (timeUntilEnd / exitDuration);
      this.applyAnimationConfig(state, style.animation.exit, progress);
    }

    // Loop animation
    if (style.animation.loop && timeSinceStart >= entryDuration && timeUntilEnd >= exitDuration) {
      const loopDuration = style.animation.loop.duration / 1000;
      const loopProgress = (timeSinceStart % loopDuration) / loopDuration;
      this.applyAnimationConfig(state, style.animation.loop, loopProgress);
    }

    return state;
  }

  /**
   * Apply animation config to state
   */
  private applyAnimationConfig(
    state: RenderState,
    config: AnimationConfig,
    progress: number
  ): void {
    const props = config.properties;
    const easing = config.easing || 'linear';

    if (props.opacity) {
      state.lineOpacity = AnimationInterpolator.interpolate(
        props.opacity.from,
        props.opacity.to,
        progress,
        easing
      );
    }

    if (props.scale) {
      state.lineScale = AnimationInterpolator.interpolate(
        props.scale.from,
        props.scale.to,
        progress,
        easing
      );
    }

    if (props.translateX) {
      state.lineTranslateX = AnimationInterpolator.interpolate(
        props.translateX.from,
        props.translateX.to,
        progress,
        easing
      );
    }

    if (props.translateY) {
      state.lineTranslateY = AnimationInterpolator.interpolate(
        props.translateY.from,
        props.translateY.to,
        progress,
        easing
      );
    }

    if (props.blur) {
      state.lineBlur = AnimationInterpolator.interpolate(
        props.blur.from,
        props.blur.to,
        progress,
        easing
      );
    }

    if (props.glowIntensity) {
      state.glowIntensity = AnimationInterpolator.interpolate(
        props.glowIntensity.from,
        props.glowIntensity.to,
        progress,
        easing
      );
    }

    if (props.backgroundWidth) {
      state.backgroundWidth = AnimationInterpolator.interpolate(
        props.backgroundWidth.from,
        props.backgroundWidth.to,
        progress,
        easing
      );
    }

    if (props.rgbSplitX) {
      state.rgbSplitX = AnimationInterpolator.interpolate(
        props.rgbSplitX.from,
        props.rgbSplitX.to,
        progress,
        easing
      );
    }
  }

  /**
   * Render per-word animation
   */
  private async renderPerWordAnimation(
    ctx: CanvasRenderingContext2D,
    words: WordTiming[],
    style: CaptionStyle,
    timestamp: number,
    width: number,
    y: number,
    lineState: RenderState
  ): Promise<void> {
    // Set font
    const fontWeight = typeof style.fontWeight === 'number' ? style.fontWeight : 400;
    ctx.font = `${fontWeight} ${style.fontSize}px ${style.fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Calculate total width and positions
    const wordWidths = words.map(w => ctx.measureText(w.text).width);
    const spacing = 20;
    const totalWidth = wordWidths.reduce((sum, w) => sum + w, 0) + (spacing * (words.length - 1));
    let currentX = (width - totalWidth) / 2;

    // Render each word
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const wordWidth = wordWidths[i];
      const wordCenter = currentX + wordWidth / 2;

      // Calculate word-specific state
      const wordState = this.calculateWordState(word, style, timestamp, lineState, i);

      // Apply word transformations
      ctx.save();
      ctx.globalAlpha = wordState.wordOpacity;
      ctx.translate(wordCenter + wordState.wordTranslateX, y + wordState.wordTranslateY);
      ctx.scale(wordState.wordScale, wordState.wordScale);

      // Draw background if needed (Highlight style)
      if (style.background && wordState.backgroundWidth > 0) {
        this.drawWordBackground(ctx, word.text, style, wordState.backgroundWidth);
      }

      // Draw glow effect (Neon style)
      if (style.glow && wordState.glowIntensity > 0) {
        this.drawGlow(ctx, word.text, style, wordState.glowIntensity);
      }

      // Draw stroke
      if (style.stroke) {
        ctx.strokeStyle = style.stroke.color;
        ctx.lineWidth = style.stroke.width;
        ctx.strokeText(word.text, 0, 0);
      }

      // Draw text
      ctx.fillStyle = wordState.wordColor;
      ctx.fillText(word.text, 0, 0);

      ctx.restore();

      currentX += wordWidth + spacing;
    }
  }

  /**
   * Calculate word-specific animation state
   */
  private calculateWordState(
    word: WordTiming,
    style: CaptionStyle,
    timestamp: number,
    lineState: RenderState,
    wordIndex: number
  ): WordRenderState {
    const state: WordRenderState = {
      ...lineState,
      wordIndex,
      wordOpacity: lineState.lineOpacity,
      wordScale: lineState.lineScale,
      wordTranslateX: lineState.lineTranslateX,
      wordTranslateY: lineState.lineTranslateY,
      wordColor: style.textColor,
      backgroundWidth: 0,
    };

    // Per-word animation
    if (style.animation.perWord) {
      const timeSinceWordStart = timestamp - word.start;
      const wordDuration = style.animation.perWord.duration / 1000;

      if (timeSinceWordStart >= 0 && timeSinceWordStart < wordDuration) {
        const progress = timeSinceWordStart / wordDuration;
        const props = style.animation.perWord.properties;
        const easing = style.animation.perWord.easing || 'linear';

        if (props.scale) {
          state.wordScale *= AnimationInterpolator.interpolate(
            props.scale.from,
            props.scale.to,
            progress,
            easing
          );
        }

        if (props.translateY) {
          state.wordTranslateY += AnimationInterpolator.interpolate(
            props.translateY.from,
            props.translateY.to,
            progress,
            easing
          );
        }

        if (props.glowIntensity) {
          state.glowIntensity = AnimationInterpolator.interpolate(
            props.glowIntensity.from,
            props.glowIntensity.to,
            progress,
            easing
          );
        }

        if (props.backgroundWidth) {
          state.backgroundWidth = AnimationInterpolator.interpolate(
            props.backgroundWidth.from,
            props.backgroundWidth.to,
            progress,
            easing
          );
        }
      } else if (timeSinceWordStart >= wordDuration) {
        // Animation complete
        if (style.animation.perWord.properties.backgroundWidth) {
          state.backgroundWidth = 1;
        }
      }
    }

    // Keyword emphasis (Hormozi style)
    if (style.keywordEmphasis?.enabled && word.isKeyword) {
      const timeSinceWordStart = timestamp - word.start;
      const emphasisDuration = style.keywordEmphasis.animation?.duration || 120;
      const duration = emphasisDuration / 1000;

      if (timeSinceWordStart >= 0 && timeSinceWordStart < duration) {
        const progress = timeSinceWordStart / duration;
        
        if (style.keywordEmphasis.color) {
          state.wordColor = AnimationInterpolator.interpolateColor(
            style.textColor,
            style.keywordEmphasis.color,
            progress,
            'easeOutBack'
          );
        }

        if (style.keywordEmphasis.scale) {
          state.wordScale *= AnimationInterpolator.interpolate(
            1.0,
            style.keywordEmphasis.scale,
            progress,
            'easeOutBack'
          );
        }
      } else if (timeSinceWordStart >= duration && style.keywordEmphasis.color) {
        state.wordColor = style.keywordEmphasis.color;
      }
    }

    return state;
  }

  /**
   * Render per-character animation (Typewriter, Karaoke)
   */
  private async renderPerCharAnimation(
    ctx: CanvasRenderingContext2D,
    words: WordTiming[],
    style: CaptionStyle,
    timestamp: number,
    width: number,
    y: number,
    lineState: RenderState
  ): Promise<void> {
    const fullText = words.map(w => w.text).join(' ');
    
    // Set font
    const fontWeight = typeof style.fontWeight === 'number' ? style.fontWeight : 400;
    ctx.font = `${fontWeight} ${style.fontSize}px ${style.fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const x = width / 2;

    // Apply line transformations
    ctx.save();
    ctx.globalAlpha = lineState.lineOpacity;
    ctx.translate(x + lineState.lineTranslateX, y + lineState.lineTranslateY);
    ctx.scale(lineState.lineScale, lineState.lineScale);

    // Draw background
    if (style.background) {
      this.drawLineBackground(ctx, fullText, style);
    }

    // Typewriter mode: Reveal characters one by one
    if (style.animation.stagger?.type === 'char' && !style.karaokeMode?.enabled) {
      await this.renderTypewriterAnimation(ctx, words, style, timestamp, lineState);
    }
    // Karaoke mode: Progressive fill
    else if (style.karaokeMode?.enabled) {
      await this.renderKaraokeAnimation(ctx, words, style, timestamp, lineState);
    }

    ctx.restore();
  }

  /**
   * Render typewriter animation (character-by-character reveal)
   */
  private async renderTypewriterAnimation(
    ctx: CanvasRenderingContext2D,
    words: WordTiming[],
    style: CaptionStyle,
    timestamp: number,
    lineState: RenderState
  ): Promise<void> {
    const lineStart = words[0].start;
    const charDelay = (style.animation.stagger?.delay || 40) / 1000; // Convert to seconds
    
    let charIndex = 0;
    let currentX = 0;
    
    // Calculate total text width for centering
    const fullText = words.map(w => w.text).join(' ');
    const totalWidth = ctx.measureText(fullText).width;
    currentX = -totalWidth / 2;

    // Render each character
    for (const word of words) {
      for (let i = 0; i < word.text.length; i++) {
        const char = word.text[i];
        const charStartTime = lineStart + (charIndex * charDelay);
        const timeSinceCharStart = timestamp - charStartTime;

        // Only render if character should be visible
        if (timeSinceCharStart >= 0) {
          const charDuration = (style.animation.perChar?.duration || 40) / 1000;
          const charProgress = Math.min(1, timeSinceCharStart / charDuration);

          // Calculate character opacity
          const charOpacity = style.animation.perChar?.properties.opacity
            ? AnimationInterpolator.interpolate(
                style.animation.perChar.properties.opacity.from,
                style.animation.perChar.properties.opacity.to,
                charProgress,
                style.animation.perChar.easing || 'linear'
              )
            : 1;

          ctx.save();
          ctx.globalAlpha = charOpacity;

          // Draw stroke
          if (style.stroke) {
            ctx.strokeStyle = style.stroke.color;
            ctx.lineWidth = style.stroke.width;
            ctx.strokeText(char, currentX, 0);
          }

          // Draw character
          ctx.fillStyle = style.textColor;
          ctx.fillText(char, currentX, 0);

          ctx.restore();
        }

        currentX += ctx.measureText(char).width;
        charIndex++;
      }

      // Add space between words
      currentX += ctx.measureText(' ').width;
      charIndex++;
    }

    // Optional blinking cursor
    const totalChars = fullText.replace(/ /g, '').length;
    const totalTypingTime = lineStart + (totalChars * charDelay);
    const cursorBlinkInterval = 0.5; // 500ms
    
    if (timestamp >= totalTypingTime && timestamp < totalTypingTime + 1.0) {
      const blinkProgress = ((timestamp - totalTypingTime) % cursorBlinkInterval) / cursorBlinkInterval;
      const cursorOpacity = blinkProgress < 0.5 ? 1 : 0;

      ctx.save();
      ctx.globalAlpha = cursorOpacity;
      ctx.fillStyle = style.textColor;
      ctx.fillText('|', currentX, 0);
      ctx.restore();
    }
  }

  /**
   * Render karaoke animation (progressive fill)
   */
  private async renderKaraokeAnimation(
    ctx: CanvasRenderingContext2D,
    words: WordTiming[],
    style: CaptionStyle,
    timestamp: number,
    lineState: RenderState
  ): Promise<void> {
    if (!style.karaokeMode) return;

    const fullText = words.map(w => w.text).join(' ');
    const totalWidth = ctx.measureText(fullText).width;
    let currentX = -totalWidth / 2;

    // First pass: Draw all text in inactive color with stroke
    if (style.stroke) {
      ctx.strokeStyle = style.stroke.color;
      ctx.lineWidth = style.stroke.width;
      ctx.strokeText(fullText, 0, 0);
    }

    ctx.fillStyle = style.karaokeMode.inactiveColor;
    ctx.fillText(fullText, 0, 0);

    // Second pass: Draw active fill progressively
    for (const word of words) {
      const wordProgress = this.getWordProgress(word, timestamp);

      if (wordProgress > 0) {
        const wordWidth = ctx.measureText(word.text).width;
        const fillWidth = wordWidth * wordProgress;

        // Create clipping region for progressive fill
        ctx.save();
        ctx.beginPath();
        ctx.rect(currentX, -style.fontSize / 2, fillWidth, style.fontSize);
        ctx.clip();

        // Draw active color
        ctx.fillStyle = style.karaokeMode.activeColor;
        
        // Add glow for active text
        ctx.shadowColor = style.karaokeMode.activeColor;
        ctx.shadowBlur = 20;
        
        ctx.fillText(word.text, currentX + wordWidth / 2, 0);

        ctx.restore();
      }

      currentX += ctx.measureText(word.text + ' ').width;
    }
  }

  /**
   * Get word progress (0-1) for karaoke fill
   */
  private getWordProgress(word: WordTiming, timestamp: number): number {
    if (timestamp < word.start) return 0;
    if (timestamp > word.end) return 1;
    
    const wordDuration = word.end - word.start;
    const timeSinceStart = timestamp - word.start;
    return timeSinceStart / wordDuration;
  }

  /**
   * Render line-level animation (simple styles)
   */
  private async renderLineAnimation(
    ctx: CanvasRenderingContext2D,
    words: WordTiming[],
    style: CaptionStyle,
    timestamp: number,
    width: number,
    y: number,
    lineState: RenderState
  ): Promise<void> {
    const text = words.map(w => w.text).join(' ');

    // Set font
    const fontWeight = typeof style.fontWeight === 'number' ? style.fontWeight : 400;
    ctx.font = `${fontWeight} ${style.fontSize}px ${style.fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const x = width / 2;

    // Apply transformations
    ctx.save();
    ctx.translate(x + lineState.lineTranslateX, y + lineState.lineTranslateY);
    ctx.scale(lineState.lineScale, lineState.lineScale);

    // Draw background
    if (style.background) {
      this.drawLineBackground(ctx, text, style);
    }

    // Draw shadow
    if (style.shadow) {
      ctx.shadowOffsetX = style.shadow.offsetX;
      ctx.shadowOffsetY = style.shadow.offsetY;
      ctx.shadowBlur = style.shadow.blur;
      ctx.shadowColor = style.shadow.color;
    }

    // Draw stroke
    if (style.stroke) {
      ctx.strokeStyle = style.stroke.color;
      ctx.lineWidth = style.stroke.width;
      ctx.strokeText(text, 0, 0);
    }

    // Draw text
    ctx.fillStyle = style.textColor;
    ctx.fillText(text, 0, 0);

    ctx.restore();
  }

  /**
   * Helper methods
   */

  private getYPosition(style: CaptionStyle, height: number): number {
    // Default to bottom 20% of screen
    return height * 0.80;
  }

  private drawWordBackground(
    ctx: CanvasRenderingContext2D,
    text: string,
    style: CaptionStyle,
    widthProgress: number
  ): void {
    if (!style.background) return;

    const metrics = ctx.measureText(text);
    const padding = style.background.padding || { x: 12, y: 6 };
    const width = (metrics.width + padding.x * 2) * widthProgress;
    const height = style.fontSize + padding.y * 2;

    ctx.fillStyle = style.background.color;
    ctx.globalAlpha = style.background.opacity;

    if (style.background.borderRadius) {
      this.roundRect(ctx, -width / 2, -height / 2, width, height, style.background.borderRadius);
    } else {
      ctx.fillRect(-width / 2, -height / 2, width, height);
    }

    ctx.globalAlpha = 1;
  }

  private drawLineBackground(ctx: CanvasRenderingContext2D, text: string, style: CaptionStyle): void {
    if (!style.background) return;

    const metrics = ctx.measureText(text);
    const padding = style.background.padding || { x: 20, y: 10 };
    const width = metrics.width + padding.x * 2;
    const height = style.fontSize + padding.y * 2;

    ctx.fillStyle = style.background.color;
    ctx.globalAlpha = style.background.opacity;

    if (style.background.borderRadius) {
      this.roundRect(ctx, -width / 2, -height / 2, width, height, style.background.borderRadius);
    } else {
      ctx.fillRect(-width / 2, -height / 2, width, height);
    }

    ctx.globalAlpha = 1;
  }

  private drawGlow(
    ctx: CanvasRenderingContext2D,
    text: string,
    style: CaptionStyle,
    intensity: number
  ): void {
    if (!style.glow) return;

    const radius = style.glow.radius * intensity;
    ctx.shadowColor = style.glow.color;
    ctx.shadowBlur = radius;
    ctx.fillStyle = style.glow.color;
    ctx.globalAlpha = 0.3 * intensity;
    ctx.fillText(text, 0, 0);
    ctx.globalAlpha = 1;
  }

  private roundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ): void {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();
  }

  private applyGlitchEffect(
    ctx: CanvasRenderingContext2D,
    style: CaptionStyle,
    timestamp: number,
    width: number,
    height: number
  ): void {
    if (!style.glitchEffect) return;

    const { frequency, duration, intensity } = style.glitchEffect;
    const timeSinceLastGlitch = (timestamp * 1000) % frequency;

    if (timeSinceLastGlitch < duration) {
      // Apply glitch effect
      const glitchProgress = timeSinceLastGlitch / duration;
      const offset = Math.random() * 10 * intensity;

      // This is a simplified glitch - full implementation would use image data manipulation
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = `rgba(255, 0, 0, ${0.3 * intensity})`;
      ctx.fillRect(0, 0, width, height);
      ctx.globalAlpha = 1;
    }
  }
}
