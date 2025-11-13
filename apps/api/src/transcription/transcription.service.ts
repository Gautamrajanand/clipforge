import { Injectable, Logger } from '@nestjs/common';
import { AssemblyAI } from 'assemblyai';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { FFmpegService } from '../video/ffmpeg.service';
import { VideoService } from '../video/video.service';
import * as path from 'path';

@Injectable()
export class TranscriptionService {
  private readonly logger = new Logger(TranscriptionService.name);
  private assemblyai: AssemblyAI | null = null;

  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
    private ffmpeg: FFmpegService,
    private video: VideoService,
  ) {
    // Initialize AssemblyAI if API key is provided
    const apiKey = process.env.ASSEMBLYAI_API_KEY;
    if (apiKey && apiKey !== '' && !apiKey.includes('your-')) {
      this.assemblyai = new AssemblyAI({ apiKey });
      console.log('✅ AssemblyAI initialized for transcription');
    } else {
      console.warn('⚠️  AssemblyAI API key not configured - transcription disabled');
    }
  }

  /**
   * Transcribe a video/audio file
   * Returns word-level timestamps and speaker diarization
   */
  async transcribeProject(projectId: string): Promise<void> {
    if (!this.assemblyai) {
      console.error('AssemblyAI not configured - skipping transcription');
      return;
    }

    try {
      // Get project
      const project = await this.prisma.project.findUnique({
        where: { id: projectId },
        include: { assets: true },
      });

      if (!project || !project.sourceUrl) {
        throw new Error('Project or source video not found');
      }

      console.log(`🎙️  Starting transcription for project: ${project.title}`);

      // Download file from storage as a stream
      console.log(`📥 Downloading video from storage: ${project.sourceUrl}`);
      const fileStream = this.storage.getFileStream(project.sourceUrl);
      
      // Convert stream to buffer
      const chunks: Buffer[] = [];
      for await (const chunk of fileStream) {
        chunks.push(Buffer.from(chunk));
      }
      const fileBuffer = Buffer.concat(chunks);
      console.log(`✅ Downloaded ${fileBuffer.length} bytes`);

      // Upload to AssemblyAI
      console.log(`📤 Uploading to AssemblyAI...`);
      const uploadUrl = await this.assemblyai.files.upload(fileBuffer);
      console.log(`✅ Uploaded to AssemblyAI: ${uploadUrl}`);

      // Start transcription with AssemblyAI
      console.log(`🎙️  Starting transcription...`);
      const transcript = await this.assemblyai.transcripts.transcribe({
        audio: uploadUrl,
        speaker_labels: true, // Enable speaker diarization
        language_code: 'en', // Auto-detect or specify
      });
      console.log(`✅ Transcription status: ${transcript.status}`);

      if (transcript.status === 'error') {
        throw new Error(`Transcription failed: ${transcript.error}`);
      }

      // Transform AssemblyAI format to our format
      const words = transcript.words?.map((word) => ({
        text: word.text,
        start: word.start / 1000, // Convert ms to seconds
        end: word.end / 1000,
        speaker: word.speaker || 'A',
        confidence: word.confidence,
      })) || [];

      // Save transcript to database
      await this.prisma.transcript.upsert({
        where: { projectId },
        create: {
          projectId,
          language: transcript.language_code || 'en',
          status: 'COMPLETED',
          data: {
            words,
            text: transcript.text,
            confidence: transcript.confidence,
            audio_duration: transcript.audio_duration,
          },
        },
        update: {
          language: transcript.language_code || 'en',
          status: 'COMPLETED',
          data: {
            words,
            text: transcript.text,
            confidence: transcript.confidence,
            audio_duration: transcript.audio_duration,
          },
        },
      });

      console.log(`✅ Transcription completed for project: ${project.title}`);
      console.log(`   Words: ${words.length}, Duration: ${transcript.audio_duration}s`);

      // Auto-trigger clip detection after transcription
      const savedTranscript = await this.prisma.transcript.findUnique({
        where: { projectId },
      });
      
      if (savedTranscript) {
        console.log(`🎬 Auto-triggering clip detection for project: ${projectId}`);
        this.triggerDetection(projectId, savedTranscript.id).catch((error) => {
          console.error('Failed to trigger detection:', error);
        });
      }

    } catch (error) {
      console.error('Error transcribing project:', error);
      console.error('Transcription failed:', error instanceof Error ? error.message : 'Unknown error');
      
      // Update project status to FAILED so frontend knows
      await this.prisma.project.update({
        where: { id: projectId },
        data: { 
          status: 'FAILED'
        },
      });
      
      throw error;
    }
  }

  /**
   * Trigger clip detection on ML worker
   */
  private async triggerDetection(projectId: string, transcriptId: string): Promise<void> {
    try {
      // Get project to fetch clip settings
      const project = await this.prisma.project.findUnique({
        where: { id: projectId },
      });

      const clipSettings = (project?.clipSettings as any) || {};
      
      // Skip clip detection if in subtitles-only or reframe-only mode
      if (clipSettings.subtitlesMode) {
        console.log(`⏭️  Skipping clip detection for project ${projectId} (Subtitles mode)`);
        
        // Update project status to READY since we're done
        await this.prisma.project.update({
          where: { id: projectId },
          data: { status: 'READY' },
        });
        return;
      }
      
      // Trigger reframe processing if in reframe mode
      if (clipSettings.reframeMode) {
        console.log(`📐 Triggering reframe processing for project ${projectId}`);
        console.log(`   Aspect Ratio: ${clipSettings.aspectRatio || '9:16'}`);
        console.log(`   Strategy: ${clipSettings.framingStrategy || 'Smart Crop'}`);
        
        // Update status to DETECTING (reusing this status for reframe processing)
        await this.prisma.project.update({
          where: { id: projectId },
          data: { status: 'DETECTING' },
        });
        
        // Trigger reframe processing (async, don't wait)
        this.processReframe(projectId, clipSettings).catch((error) => {
          console.error('Failed to process reframe:', error);
        });
        return;
      }
      
      const numClips = clipSettings.numberOfClips || 5;
      const clipLength = clipSettings.clipLength || 60;

      console.log(`🎬 Using clip settings: ${numClips} clips, ${clipLength}s each`);

      const mlWorkerUrl = process.env.ML_WORKER_URL || 'http://ml-workers:8000';
      const response = await fetch(`${mlWorkerUrl}/v1/ranker/detect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          transcriptId,
          numClips,
          clipLength,
        }),
      });

      if (!response.ok) {
        throw new Error(`ML worker returned ${response.status}`);
      }

      const result = await response.json();
      console.log(`✅ Detection triggered for project ${projectId}:`, result);
    } catch (error) {
      console.error(`❌ Failed to trigger detection for ${projectId}:`, error);
      throw error;
    }
  }

  /**
   * Get transcript for a project
   */
  async getTranscript(projectId: string) {
    return this.prisma.transcript.findUnique({
      where: { projectId },
    });
  }

  /**
   * Extract text from transcript for a specific time range
   */
  extractTextFromRange(
    transcript: any,
    startTime: number,
    endTime: number,
  ): string {
    if (!transcript || !transcript.data || !transcript.data.words) {
      return '';
    }

    const words = transcript.data.words.filter(
      (w: any) => w.start >= startTime && w.end <= endTime,
    );

    return words.map((w: any) => w.text).join(' ');
  }

  /**
   * Check if AssemblyAI is available
   */
  isAvailable(): boolean {
    return this.assemblyai !== null;
  }

  /**
   * Get transcription status
   */
  getStatus(): {
    available: boolean;
    provider: string;
    message: string;
  } {
    if (this.assemblyai) {
      return {
        available: true,
        provider: 'AssemblyAI',
        message: 'Transcription service is ready',
      };
    }

    return {
      available: false,
      provider: 'none',
      message: 'AssemblyAI API key not configured. Add ASSEMBLYAI_API_KEY to environment.',
    };
  }

  /**
   * Process reframe for a project
   * Downloads source video, applies aspect ratio conversion, uploads result
   */
  private async processReframe(projectId: string, clipSettings: any): Promise<void> {
    try {
      this.logger.log(`📐 Starting reframe processing for project ${projectId}`);
      
      // Get project
      const project = await this.prisma.project.findUnique({
        where: { id: projectId },
      });
      
      if (!project || !project.sourceUrl) {
        throw new Error('Project or source video not found');
      }
      
      // Download source video from storage
      this.logger.log(`📥 Downloading source video: ${project.sourceUrl}`);
      const sourceBuffer = await this.storage.downloadFile(project.sourceUrl);
      const sourcePath = this.video.getTempFilePath('.mp4');
      await require('fs/promises').writeFile(sourcePath, sourceBuffer);
      this.logger.log(`✅ Downloaded ${sourceBuffer.length} bytes`);
      
      // Prepare output path
      const outputPath = this.video.getTempFilePath('.mp4');
      
      // Get reframe settings
      const aspectRatio = clipSettings.aspectRatio || '9:16';
      const strategy = clipSettings.framingStrategy || 'Smart Crop';
      const backgroundColor = clipSettings.backgroundColor || '#000000';
      
      // Map strategy to crop mode
      const cropMode = strategy === 'Letterbox' ? 'pad' : 'crop';
      
      this.logger.log(`🎬 Converting to ${aspectRatio} using ${cropMode} mode`);
      
      // Apply aspect ratio conversion
      await this.ffmpeg.convertAspectRatio(
        sourcePath,
        outputPath,
        aspectRatio,
        cropMode,
        'center',
      );
      
      this.logger.log(`✅ Reframe complete, uploading result...`);
      
      // Upload reframed video
      const reframedBuffer = await require('fs/promises').readFile(outputPath);
      const reframedKey = `projects/${projectId}/reframed.mp4`;
      await this.storage.uploadFile(reframedKey, reframedBuffer, 'video/mp4');
      
      this.logger.log(`✅ Uploaded reframed video: ${reframedKey}`);
      
      // Create asset record for reframed video
      await this.prisma.asset.create({
        data: {
          projectId,
          kind: 'CLIP', // Using CLIP kind for reframed video
          url: reframedKey,
          size: BigInt(reframedBuffer.length),
          mimeType: 'video/mp4',
        },
      });
      
      // Update project status to READY
      await this.prisma.project.update({
        where: { id: projectId },
        data: { status: 'READY' },
      });
      
      this.logger.log(`✅ Reframe processing complete for project ${projectId}`);
      
      // Clean up temp files
      await require('fs/promises').unlink(sourcePath).catch(() => {});
      await require('fs/promises').unlink(outputPath).catch(() => {});
      
    } catch (error) {
      this.logger.error(`❌ Reframe processing failed for project ${projectId}:`, error);
      
      // Update project status to FAILED
      await this.prisma.project.update({
        where: { id: projectId },
        data: { status: 'FAILED' },
      });
      
      throw error;
    }
  }

  /**
   * Generate video with burned-in captions for subtitle projects
   * Downloads source, generates SRT, burns captions, uploads result
   */
  async generateCaptionedVideo(projectId: string): Promise<string> {
    try {
      this.logger.log(`🎬 Generating captioned video for project ${projectId}`);
      
      // Get project with transcript
      const project = await this.prisma.project.findUnique({
        where: { id: projectId },
        include: { transcript: true },
      });
      
      if (!project || !project.sourceUrl) {
        throw new Error('Project or source video not found');
      }
      
      if (!project.transcript) {
        throw new Error('No transcript available for captions');
      }
      
      // Download source video
      this.logger.log(`📥 Downloading source video: ${project.sourceUrl}`);
      const sourceBuffer = await this.storage.downloadFile(project.sourceUrl);
      const sourcePath = this.video.getTempFilePath('.mp4');
      await require('fs/promises').writeFile(sourcePath, sourceBuffer);
      
      // Generate SRT file from transcript
      const srtPath = this.video.getTempFilePath('.srt');
      const srtContent = this.generateSRT(project.transcript.data as any);
      await require('fs/promises').writeFile(srtPath, srtContent, 'utf-8');
      
      // Prepare output path
      const outputPath = this.video.getTempFilePath('.mp4');
      
      this.logger.log(`🎨 Burning captions into video...`);
      
      // Burn captions using FFmpeg
      await this.ffmpeg.burnCaptions(sourcePath, outputPath, srtPath);
      
      this.logger.log(`✅ Captions burned, uploading result...`);
      
      // Upload captioned video
      const captionedBuffer = await require('fs/promises').readFile(outputPath);
      const captionedKey = `projects/${projectId}/captioned.mp4`;
      await this.storage.uploadFile(captionedKey, captionedBuffer, 'video/mp4');
      
      this.logger.log(`✅ Uploaded captioned video: ${captionedKey}`);
      
      // Clean up temp files
      await require('fs/promises').unlink(sourcePath).catch(() => {});
      await require('fs/promises').unlink(srtPath).catch(() => {});
      await require('fs/promises').unlink(outputPath).catch(() => {});
      
      return captionedKey;
      
    } catch (error) {
      this.logger.error(`❌ Failed to generate captioned video:`, error);
      throw error;
    }
  }

  /**
   * Generate SRT subtitle file from transcript data
   */
  private generateSRT(transcriptData: any): string {
    if (!transcriptData || !transcriptData.words) {
      return '';
    }

    const words = transcriptData.words;
    const subtitles: string[] = [];
    let index = 1;

    // Group words into phrases (2-3 words per subtitle for readability)
    const wordsPerSubtitle = 3;
    for (let i = 0; i < words.length; i += wordsPerSubtitle) {
      const phraseWords = words.slice(i, i + wordsPerSubtitle);
      if (phraseWords.length === 0) continue;

      const startTime = phraseWords[0].start;
      const endTime = phraseWords[phraseWords.length - 1].end;
      const text = phraseWords.map((w: any) => w.text).join(' ');

      // Format times as SRT format (HH:MM:SS,mmm)
      const startSRT = this.formatSRTTime(startTime);
      const endSRT = this.formatSRTTime(endTime);

      subtitles.push(`${index}\n${startSRT} --> ${endSRT}\n${text}\n`);
      index++;
    }

    return subtitles.join('\n');
  }

  /**
   * Format time in seconds to SRT format (HH:MM:SS,mmm)
   */
  private formatSRTTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const millis = Math.floor((seconds % 1) * 1000);

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${millis.toString().padStart(3, '0')}`;
  }
}
