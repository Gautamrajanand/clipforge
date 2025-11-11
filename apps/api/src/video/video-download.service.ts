import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

export interface VideoInfo {
  title: string;
  duration: number;
  thumbnail: string;
  platform: string;
  url: string;
}

export interface DownloadResult {
  filePath: string;
  info: VideoInfo;
}

@Injectable()
export class VideoDownloadService {
  private readonly logger = new Logger(VideoDownloadService.name);
  private readonly TEMP_DIR = '/tmp/clipforge/downloads';

  constructor() {
    // Ensure temp directory exists
    if (!fs.existsSync(this.TEMP_DIR)) {
      fs.mkdirSync(this.TEMP_DIR, { recursive: true });
    }
  }

  /**
   * Detect platform from URL
   */
  detectPlatform(url: string): string {
    const urlLower = url.toLowerCase();
    
    if (urlLower.includes('youtube.com') || urlLower.includes('youtu.be')) {
      return 'youtube';
    }
    if (urlLower.includes('vimeo.com')) {
      return 'vimeo';
    }
    if (urlLower.includes('rumble.com')) {
      return 'rumble';
    }
    if (urlLower.includes('zoom.us')) {
      return 'zoom';
    }
    if (urlLower.includes('twitter.com') || urlLower.includes('x.com')) {
      return 'twitter';
    }
    if (urlLower.includes('tiktok.com')) {
      return 'tiktok';
    }
    
    return 'unknown';
  }

  /**
   * Validate if URL is supported
   */
  validateUrl(url: string): void {
    const platform = this.detectPlatform(url);
    
    const supportedPlatforms = ['youtube', 'vimeo', 'rumble', 'twitter', 'tiktok'];
    
    if (!supportedPlatforms.includes(platform)) {
      throw new BadRequestException(
        `Unsupported platform. Supported: YouTube, Vimeo, Rumble, Twitter, TikTok`
      );
    }

    // Basic URL validation
    try {
      new URL(url);
    } catch (error) {
      throw new BadRequestException('Invalid URL format');
    }
  }

  /**
   * Get video information without downloading
   */
  async getVideoInfo(url: string): Promise<VideoInfo> {
    this.logger.log(`Fetching video info for: ${url}`);
    
    try {
      const command = `yt-dlp --dump-json "${url}"`;
      const { stdout } = await execAsync(command);
      
      const data = JSON.parse(stdout);
      
      const videoInfo = {
        title: data.title || 'Untitled Video',
        duration: data.duration || 0,
        thumbnail: data.thumbnail || '',
        platform: this.detectPlatform(url),
        url: url,
      };
      
      this.logger.log(`📹 Video info extracted: "${videoInfo.title}" (${videoInfo.duration}s)`);
      return videoInfo;
    } catch (error) {
      this.logger.error(`Failed to fetch video info: ${error.message}`);
      throw new BadRequestException('Failed to fetch video information. Please check the URL.');
    }
  }

  /**
   * Download video from URL
   */
  async downloadVideo(url: string, customTitle?: string): Promise<DownloadResult> {
    this.logger.log(`Starting download from: ${url}`);
    
    // Validate URL
    this.validateUrl(url);
    
    // Get video info first
    const info = await this.getVideoInfo(url);
    
    // Generate output filename
    const timestamp = Date.now();
    const sanitizedTitle = (customTitle || info.title)
      .replace(/[^a-z0-9]/gi, '_')
      .substring(0, 50);
    const outputTemplate = path.join(
      this.TEMP_DIR,
      `${sanitizedTitle}_${timestamp}.%(ext)s`
    );
    
    try {
      // Download video with best quality
      // Format: best video + best audio, merge to mp4
      const command = `yt-dlp -f "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best" \
        --merge-output-format mp4 \
        -o "${outputTemplate}" \
        "${url}"`;
      
      this.logger.log(`Executing: ${command}`);
      
      const { stdout, stderr } = await execAsync(command, {
        maxBuffer: 1024 * 1024 * 10, // 10MB buffer
      });
      
      if (stderr && !stderr.includes('[download]')) {
        this.logger.warn(`yt-dlp stderr: ${stderr}`);
      }
      
      // Find the downloaded file
      const files = fs.readdirSync(this.TEMP_DIR);
      const downloadedFile = files.find(
        f => f.startsWith(`${sanitizedTitle}_${timestamp}`) && f.endsWith('.mp4')
      );
      
      if (!downloadedFile) {
        throw new Error('Downloaded file not found');
      }
      
      const filePath = path.join(this.TEMP_DIR, downloadedFile);
      
      this.logger.log(`✅ Video downloaded successfully: ${filePath}`);
      
      return {
        filePath,
        info: {
          ...info,
          title: customTitle || info.title,
        },
      };
    } catch (error) {
      this.logger.error(`Download failed: ${error.message}`);
      throw new BadRequestException(
        `Failed to download video: ${error.message}`
      );
    }
  }

  /**
   * Clean up downloaded file
   */
  async cleanup(filePath: string): Promise<void> {
    try {
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
        this.logger.log(`Cleaned up: ${filePath}`);
      }
    } catch (error) {
      this.logger.warn(`Failed to cleanup ${filePath}: ${error.message}`);
    }
  }

  /**
   * Get supported platforms list
   */
  getSupportedPlatforms(): string[] {
    return [
      'YouTube',
      'Vimeo',
      'Rumble',
      'Twitter/X',
      'TikTok',
    ];
  }
}
