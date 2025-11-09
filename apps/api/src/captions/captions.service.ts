import { Injectable, Logger } from '@nestjs/common';
import { getCaptionStylePreset, CaptionStylePreset } from './caption-styles';

export interface Word {
  text: string;
  start: number;
  end: number;
  confidence: number;
  speaker?: string;
}

export interface CaptionStyle {
  preset?: 'minimal' | 'bold' | 'elegant' | 'modern' | 'karaoke' | 'podcast';
  fontFamily?: string;
  fontSize?: number;
  textColor?: string;
  backgroundColor?: string;
  position?: 'top' | 'center' | 'bottom';
  alignment?: 'left' | 'center' | 'right';
  animation?: 'none' | 'fade' | 'slide' | 'pop';
  stroke?: {
    color: string;
    width: number;
  };
}

@Injectable()
export class CaptionsService {
  private readonly logger = new Logger(CaptionsService.name);

  /**
   * Generate SRT (SubRip) format captions from word-level timestamps
   * SRT format:
   * 1
   * 00:00:00,000 --> 00:00:02,000
   * Caption text here
   */
  generateSRT(words: Word[], maxCharsPerLine: number = 42): string {
    if (!words || words.length === 0) {
      this.logger.warn('No words provided for SRT generation');
      return '';
    }

    const captions: string[] = [];
    let captionIndex = 1;
    let currentLine: Word[] = [];
    let currentLength = 0;

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const wordLength = word.text.length + 1; // +1 for space

      // Check if adding this word would exceed max chars
      if (currentLength + wordLength > maxCharsPerLine && currentLine.length > 0) {
        // Create caption from current line
        captions.push(this.createSRTCaption(captionIndex++, currentLine));
        currentLine = [word];
        currentLength = wordLength;
      } else {
        currentLine.push(word);
        currentLength += wordLength;
      }

      // Also break on sentence boundaries (period, question mark, exclamation)
      if (word.text.match(/[.!?]$/) && currentLine.length > 0) {
        captions.push(this.createSRTCaption(captionIndex++, currentLine));
        currentLine = [];
        currentLength = 0;
      }
    }

    // Add remaining words
    if (currentLine.length > 0) {
      captions.push(this.createSRTCaption(captionIndex, currentLine));
    }

    return captions.join('\n\n');
  }

  /**
   * Generate VTT (WebVTT) format captions
   * VTT format:
   * WEBVTT
   * 
   * 00:00:00.000 --> 00:00:02.000
   * Caption text here
   */
  generateVTT(words: Word[], maxCharsPerLine: number = 42): string {
    const srt = this.generateSRT(words, maxCharsPerLine);
    
    // Convert SRT to VTT
    const vtt = srt
      .replace(/(\d+)\n(\d{2}):(\d{2}):(\d{2}),(\d{3}) --> (\d{2}):(\d{2}):(\d{2}),(\d{3})/g, 
               '$2:$3:$4.$5 --> $6:$7:$8.$9');
    
    return `WEBVTT\n\n${vtt}`;
  }

  /**
   * Generate ASS (Advanced SubStation Alpha) format with styling
   * Used for advanced caption styling with FFmpeg
   */
  generateASS(words: Word[], style: CaptionStyle = {}): string {
    // If preset is specified, load it and merge with custom overrides
    let styleConfig: CaptionStylePreset;
    if (style.preset) {
      styleConfig = getCaptionStylePreset(style.preset);
      // Merge custom overrides
      styleConfig = {
        ...styleConfig,
        ...style,
      };
    } else {
      // Use provided style or defaults
      styleConfig = {
        id: 'custom',
        name: 'Custom',
        description: 'Custom style',
        fontFamily: style.fontFamily || 'Arial',
        fontSize: style.fontSize || 24,
        textColor: style.textColor || '#FFFFFF',
        backgroundColor: style.backgroundColor || 'rgba(0,0,0,0.7)',
        position: style.position || 'bottom',
        alignment: style.alignment || 'center',
        stroke: style.stroke || { color: '#000000', width: 2 },
      };
    }

    const {
      fontFamily,
      fontSize,
      textColor,
      backgroundColor,
      position,
      alignment,
      stroke = { color: '#000000', width: 2 },
    } = styleConfig;

    // Convert colors to ASS format (&HAABBGGRR)
    const primaryColor = this.rgbToASS(textColor);
    const outlineColor = this.rgbToASS(stroke.color);
    const backColor = this.rgbaToASS(backgroundColor);

    // Alignment: 1=left, 2=center, 3=right, 9=top-center, 10=center, 11=bottom-center
    const alignmentMap = {
      'top-left': 7, 'top-center': 8, 'top-right': 9,
      'center-left': 4, 'center': 5, 'center-right': 6,
      'bottom-left': 1, 'bottom-center': 2, 'bottom-right': 3,
    };
    const alignmentValue = alignmentMap[`${position}-${alignment}`] || 2;

    const header = `[Script Info]
Title: ClipForge Captions
ScriptType: v4.00+
WrapStyle: 0
PlayResX: 1920
PlayResY: 1080
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,${fontFamily},${fontSize},${primaryColor},&H000000FF,${outlineColor},${backColor},0,0,0,0,100,100,0,0,1,${stroke.width},2,${alignmentValue},10,10,10,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;

    const events: string[] = [];
    let currentLine: Word[] = [];
    let currentLength = 0;
    const maxCharsPerLine = 42;

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const wordLength = word.text.length + 1;

      if (currentLength + wordLength > maxCharsPerLine && currentLine.length > 0) {
        events.push(this.createASSEvent(currentLine));
        currentLine = [word];
        currentLength = wordLength;
      } else {
        currentLine.push(word);
        currentLength += wordLength;
      }

      if (word.text.match(/[.!?]$/) && currentLine.length > 0) {
        events.push(this.createASSEvent(currentLine));
        currentLine = [];
        currentLength = 0;
      }
    }

    if (currentLine.length > 0) {
      events.push(this.createASSEvent(currentLine));
    }

    return header + events.join('\n');
  }

  /**
   * Create a single SRT caption entry
   */
  private createSRTCaption(index: number, words: Word[]): string {
    const startTime = this.formatSRTTime(words[0].start);
    const endTime = this.formatSRTTime(words[words.length - 1].end);
    const text = words.map(w => w.text).join(' ');

    return `${index}\n${startTime} --> ${endTime}\n${text}`;
  }

  /**
   * Create a single ASS event entry
   */
  private createASSEvent(words: Word[]): string {
    const startTime = this.formatASSTime(words[0].start);
    const endTime = this.formatASSTime(words[words.length - 1].end);
    const text = words.map(w => w.text).join(' ');

    return `Dialogue: 0,${startTime},${endTime},Default,,0,0,0,,${text}`;
  }

  /**
   * Format time for SRT (HH:MM:SS,mmm)
   */
  private formatSRTTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`;
  }

  /**
   * Format time for ASS (H:MM:SS.cc)
   */
  private formatASSTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const cs = Math.floor((seconds % 1) * 100); // centiseconds

    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${cs.toString().padStart(2, '0')}`;
  }

  /**
   * Convert RGB hex color to ASS format (&HAABBGGRR)
   */
  private rgbToASS(color: string): string {
    // Remove # if present
    color = color.replace('#', '');
    
    // Parse RGB
    const r = parseInt(color.substring(0, 2), 16);
    const g = parseInt(color.substring(2, 4), 16);
    const b = parseInt(color.substring(4, 6), 16);
    
    // ASS format: &HAABBGGRR (alpha, blue, green, red)
    return `&H00${b.toString(16).padStart(2, '0').toUpperCase()}${g.toString(16).padStart(2, '0').toUpperCase()}${r.toString(16).padStart(2, '0').toUpperCase()}`;
  }

  /**
   * Convert RGBA color to ASS format with alpha
   */
  private rgbaToASS(color: string): string {
    // Parse rgba(r, g, b, a)
    const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
    if (!match) {
      return this.rgbToASS(color);
    }

    const r = parseInt(match[1]);
    const g = parseInt(match[2]);
    const b = parseInt(match[3]);
    const a = match[4] ? Math.floor((1 - parseFloat(match[4])) * 255) : 0; // Invert alpha

    return `&H${a.toString(16).padStart(2, '0').toUpperCase()}${b.toString(16).padStart(2, '0').toUpperCase()}${g.toString(16).padStart(2, '0').toUpperCase()}${r.toString(16).padStart(2, '0').toUpperCase()}`;
  }
}
