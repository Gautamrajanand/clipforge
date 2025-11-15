import { Injectable, Logger } from '@nestjs/common';
import { AssemblyAI } from 'assemblyai';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { FFmpegService } from '../video/ffmpeg.service';
import { VideoService } from '../video/video.service';
import { CaptionsService } from '../captions/captions.service';
// import { EmailService } from '../email/email.service'; // TEMPORARILY DISABLED
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
    private captions: CaptionsService,
    // private email: EmailService, // TEMPORARILY DISABLED
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
      
      // Get project with organization
      const project = await this.prisma.project.findUnique({
        where: { id: projectId },
        include: { org: true },
      });
      
      if (!project || !project.sourceUrl) {
        throw new Error('Project or source video not found');
      }

      // Check organization tier for watermark
      const organization: any = await this.prisma.organization.findUnique({
        where: { id: project.orgId },
        // @ts-ignore - Prisma types not updated yet
        select: { tier: true },
      });
      const addWatermark = organization?.tier === 'FREE';
      if (addWatermark) {
        this.logger.log('🏷️  FREE tier detected - watermark will be added to AI Reframe export');
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
      
      // Add watermark if FREE tier
      let finalOutputPath = outputPath;
      if (addWatermark) {
        this.logger.log('🏷️  Adding watermark to reframed video');
        const watermarkedPath = this.video.getTempFilePath('.mp4');
        await this.ffmpeg.addWatermark(outputPath, watermarkedPath);
        finalOutputPath = watermarkedPath;
        // Clean up non-watermarked file
        await require('fs/promises').unlink(outputPath).catch(() => {});
      }
      
      this.logger.log(`✅ Reframe complete, uploading result...`);
      
      // Upload reframed video
      const reframedBuffer = await require('fs/promises').readFile(finalOutputPath);
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
      
      // Send email notification - TEMPORARILY DISABLED
      /* try {
        const projectWithUser: any = await this.prisma.project.findUnique({
          where: { id: projectId },
          include: {
            org: {
              include: {
                // @ts-ignore - Prisma types not updated yet
                members: {
                  include: {
                    user: true,
                  },
                },
              },
            },
          },
        });

        if (projectWithUser?.org?.members?.[0]?.user) {
          const user = projectWithUser.org.members[0].user;
          await this.email.sendReframeReadyEmail(
            user.email,
            user.name || 'there',
            projectWithUser.title,
            projectId,
            aspectRatio,
          );
        }
      } catch (emailError) {
        this.logger.error('Failed to send reframe ready email:', emailError);
        // Don't fail the whole operation if email fails
      } */
      
      // Clean up temp files
      await require('fs/promises').unlink(sourcePath).catch(() => {});
      await require('fs/promises').unlink(finalOutputPath).catch(() => {});
      
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
  async generateCaptionedVideo(projectId: string, orgId?: string): Promise<string> {
    try {
      this.logger.log(`🎬 Generating captioned video for project ${projectId}`);
      
      // Check if captioned video already exists (CACHE)
      const captionedKey = `projects/${projectId}/captioned.mp4`;
      try {
        const exists = await this.storage.fileExists(captionedKey);
        if (exists) {
          this.logger.log(`✅ Captioned video already exists, returning cached version: ${captionedKey}`);
          return captionedKey;
        }
      } catch (error) {
        this.logger.log(`ℹ️  No cached captioned video found, will generate new one`);
      }
      
      // Get project with transcript and organization
      const project = await this.prisma.project.findUnique({
        where: { id: projectId },
        include: { 
          transcript: true,
          org: true,
        },
      });
      
      if (!project || !project.sourceUrl) {
        throw new Error('Project or source video not found');
      }
      
      if (!project.transcript) {
        throw new Error('No transcript available for captions');
      }

      // Check organization tier for watermark
      const actualOrgId = orgId || project.orgId;
      const organization: any = await this.prisma.organization.findUnique({
        where: { id: actualOrgId },
        // @ts-ignore - Prisma types not updated yet
        select: { tier: true },
      });
      const addWatermark = organization?.tier === 'FREE';
      if (addWatermark) {
        this.logger.log('🏷️  FREE tier detected - watermark will be added to AI Subtitles export');
      }
      
      // Download source video
      this.logger.log(`📥 Downloading source video: ${project.sourceUrl}`);
      const sourceBuffer = await this.storage.downloadFile(project.sourceUrl);
      const sourcePath = this.video.getTempFilePath('.mp4');
      await require('fs/promises').writeFile(sourcePath, sourceBuffer);
      
      // Get caption style from clipSettings
      const clipSettings = project.clipSettings as any;
      const rawCaptionStyle = (clipSettings?.captionStyle as string) || 'mr_beast';

      // Normalize legacy IDs from older subtitles flow to canonical IDs
      const normalizeCaptionStyle = (style: string): string => {
        switch (style) {
          case 'mr_beast':
            return 'mrbeast';
          case 'neon_glow':
            return 'neon';
          case 'bold_impact':
          case 'deep_diver':
            return 'bold';
          case 'pod_p':
            return 'podcast';
          case 'viral_captions':
            return 'rainbow';
          case 'minimalist':
            return 'minimal';
          case 'classic_subtitle':
            return 'minimal';
          default:
            return style;
        }
      };

      const captionStyle = normalizeCaptionStyle(rawCaptionStyle);
      const primaryColor = clipSettings?.primaryColor || '#FFFFFF';
      const secondaryColor = clipSettings?.secondaryColor || '#FFD700';
      const fontSize = clipSettings?.fontSize || 48;
      const position = clipSettings?.position || 'bottom';
      
      this.logger.log(`🎨 Applying caption style: ${captionStyle} (raw: ${rawCaptionStyle})`);
      
      // Get transcript words
      const transcriptData = project.transcript.data as any;
      const words = transcriptData.words.map((w: any) => ({
        text: w.text,
        start: w.start,
        end: w.end,
        confidence: w.confidence || 1.0,
      }));
      
      // Determine rendering path based on caption style
      const animatedStyles = [
        'bold',
        'modern',
        'elegant',
        'mrbeast',
        'neon',
        'highlight',
        'rainbow',
        'fill',
        'shadow3d',
        'tricolor',
        'bounce',
      ];

      // Get video metadata for duration and dimensions
      const metadata = await this.ffmpeg.getVideoMetadata(sourcePath);
      const actualDuration = metadata.duration;
      this.logger.log(`⏱️  Video duration for subtitles: ${actualDuration.toFixed(1)}s`);

      const useAnimatedPipeline = animatedStyles.includes(captionStyle);
      let outputPath = this.video.getTempFilePath('.mp4');

      if (useAnimatedPipeline) {
        this.logger.log(`🎞️ Using animated caption pipeline for style: ${captionStyle} with custom params`);
        this.logger.log(`🎨 Caption params: color=${primaryColor}, size=${fontSize}, position=${position}`);

        const fs = await import('fs/promises');
        const { CaptionAnimatorService } = await import('../captions/caption-animator.service');
        const { ChunkManagerService } = await import('../captions/chunk-manager.service');
        const { VideoMergerService } = await import('../captions/video-merger.service');
        const { getCaptionStylePreset } = await import('../captions/caption-styles');

        const animator = new CaptionAnimatorService();
        const chunkManager = new ChunkManagerService();
        const videoMerger = new VideoMergerService();

        // Use the same preset as AI Clips and apply custom colors, size, and position
        let stylePreset = getCaptionStylePreset(captionStyle);
        
        // Override preset with custom values (same logic as AI Clips)
        if (primaryColor || secondaryColor || fontSize || position) {
          this.logger.log(`🎨 [AI Subtitles] Overriding caption style: primaryColor=${primaryColor}, fontSize=${fontSize}, position=${position}`);
          stylePreset = {
            ...stylePreset,
            ...(primaryColor && { textColor: primaryColor }),
            ...(fontSize && { fontSize }),
            ...(position && { position }),
          };
          this.logger.log(`🎨 [AI Subtitles] Final stylePreset: textColor=${stylePreset.textColor}, fontSize=${stylePreset.fontSize}, position=${stylePreset.position}`);
        }

        const fps = 30;

        if (actualDuration <= 15) {
          // Single-pass rendering for short videos (same as renderAnimatedCaptions)
          this.logger.log('🎨 Using single-pass animated rendering for subtitles');

          const frameDir = this.video.getTempFilePath('_frames_full');
          await fs.mkdir(frameDir, { recursive: true });

          await animator.generateCaptionFrames(
            words,
            stylePreset,
            actualDuration,
            fps,
            frameDir,
            metadata.width,
            metadata.height,
            { index: 0, total: 1, startTime: 0 },
          );

          const framePattern = `${frameDir}/caption_%06d.png`;
          await this.ffmpeg.overlayCaptionFrames(sourcePath, outputPath, framePattern, fps, addWatermark);

          await animator.cleanupFrames(frameDir);
        } else {
          // Chunked rendering for long videos (same as renderChunkedCaptions)
          this.logger.log('⚡ Using chunked animated rendering for long subtitles video');

          const chunks = chunkManager.splitIntoChunks(words, actualDuration, 8);
          const chunkMetadata = chunkManager.getChunkMetadata(chunks);
          this.logger.log(
            `📊 Split into ${chunkMetadata.totalChunks} chunks (avg ${chunkMetadata.averageChunkSize.toFixed(
              1,
            )}s each)`,
          );

          const validation = chunkManager.validateChunks(chunks);
          if (!validation.valid) {
            this.logger.error(`❌ Chunk validation failed: ${validation.errors.join(', ')}`);
            throw new Error('Chunk validation failed');
          }

          const chunkVideoPaths: string[] = [];

          for (const chunk of chunks) {
            this.logger.log(
              `🎨 Processing chunk ${chunk.index + 1}/${chunks.length}: ${chunk.startTime.toFixed(
                1,
              )}s - ${chunk.endTime.toFixed(1)}s`,
            );

            // Extract chunk from original video
            const chunkInputPath = this.video.getTempFilePath(`_chunk_${chunk.index}_input.mp4`);
            await this.ffmpeg.extractSegment(
              sourcePath,
              chunkInputPath,
              chunk.startTime,
              chunk.duration,
            );

            // Generate caption frames for this chunk
            const frameDir = this.video.getTempFilePath(`_frames_chunk_${chunk.index}`);
            await fs.mkdir(frameDir, { recursive: true });

            await animator.generateCaptionFrames(
              chunk.words,
              stylePreset,
              chunk.duration,
              fps,
              frameDir,
              metadata.width,
              metadata.height,
              { index: chunk.index, total: chunks.length, startTime: chunk.startTime },
            );

            // Overlay captions on chunk (watermark on ALL chunks for FREE tier)
            const chunkOutputPath = this.video.getTempFilePath(`_chunk_${chunk.index}_output.mp4`);
            const framePattern = `${frameDir}/caption_%06d.png`;
            await this.ffmpeg.overlayCaptionFrames(chunkInputPath, chunkOutputPath, framePattern, fps, addWatermark);

            // Cleanup chunk frames and input
            await animator.cleanupFrames(frameDir);
            await fs.unlink(chunkInputPath);

            chunkVideoPaths.push(chunkOutputPath);

            // Optional GC + small delay between chunks for memory stability
            if (global.gc) {
              global.gc();
            }
            await new Promise((resolve) => setTimeout(resolve, 2000));

            this.logger.log(`✅ Chunk ${chunk.index + 1}/${chunks.length} completed`);
          }

          // Concatenate all chunks into final output
          this.logger.log(`🔗 Concatenating ${chunkVideoPaths.length} chunks for subtitles video...`);
          await videoMerger.concatenate(chunkVideoPaths, {
            transition: 'cut',
            outputPath,
          });

          await videoMerger.cleanupChunks(chunkVideoPaths);
          this.logger.log('✅ Chunked animated subtitles rendering completed successfully');
        }
      } else {
        this.logger.log('🎨 Using ASS-based styled captions (static/karaoke style)');

        // Generate styled ASS file (static path, same as before)
        const assPath = this.video.getTempFilePath('.ass');
        const assContent = this.captions.generateASS(words, {
          preset: captionStyle as any,
          textColor: primaryColor,
          backgroundColor: secondaryColor,
          fontSize,
          position,
        });
        await require('fs/promises').writeFile(assPath, assContent, 'utf-8');

        this.logger.log(`🎨 Burning styled captions into video via ASS...`);
        await this.ffmpeg.burnCaptions(sourcePath, outputPath, assPath);

        // Cleanup ASS file
        await require('fs/promises').unlink(assPath).catch(() => {});

        // Add watermark if needed (for non-animated styles)
        if (addWatermark) {
          this.logger.log('🏷️  Adding watermark to ASS-captioned video');
          const watermarkedPath = this.video.getTempFilePath('.mp4');
          await this.ffmpeg.addWatermark(outputPath, watermarkedPath);
          await require('fs/promises').unlink(outputPath);
          outputPath = watermarkedPath;
        }
      }

      this.logger.log(`✅ Captions burned, uploading result...`);
      
      // Upload captioned video
      const captionedBuffer = await require('fs/promises').readFile(outputPath);
      const captionedKey = `projects/${projectId}/captioned.mp4`;
      await this.storage.uploadFile(captionedKey, captionedBuffer, 'video/mp4');
      
      this.logger.log(`✅ Uploaded captioned video: ${captionedKey}`);
      
      // Send email notification - TEMPORARILY DISABLED
      /* try {
        const projectWithUser: any = await this.prisma.project.findUnique({
          where: { id: projectId },
          include: {
            org: {
              include: {
                // @ts-ignore - Prisma types not updated yet
                members: {
                  include: {
                    user: true,
                  },
                },
              },
            },
          },
        });

        if (projectWithUser?.org?.members?.[0]?.user) {
          const user = projectWithUser.org.members[0].user;
          await this.email.sendSubtitlesReadyEmail(
            user.email,
            user.name || 'there',
            projectWithUser.title,
            projectId,
          );
        }
      } catch (emailError) {
        this.logger.error('Failed to send subtitles ready email:', emailError);
        // Don't fail the whole operation if email fails
      } */
      
      // Clean up temp files
      await require('fs/promises').unlink(sourcePath).catch(() => {});
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
