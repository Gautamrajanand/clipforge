import { Injectable, NotFoundException, ForbiddenException, BadRequestException, Logger } from '@nestjs/common';
import { Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { VideoService } from '../video/video.service';
import { FFmpegService } from '../video/ffmpeg.service';
import { AIService } from '../ai/ai.service';
import { TranscriptionService } from '../transcription/transcription.service';
import { CaptionsService } from '../captions/captions.service';
import { CreateProjectDto } from './dto/create-project.dto';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class ProjectsService {
  private readonly logger = new Logger(ProjectsService.name);

  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
    private video: VideoService,
    private ffmpeg: FFmpegService,
    private ai: AIService,
    private transcription: TranscriptionService,
    private captions: CaptionsService,
  ) {}

  // Helper to convert BigInt to number for JSON serialization
  private serializeProject(project: any) {
    if (!project) return project;
    
    return {
      ...project,
      assets: project.assets?.map((asset: any) => ({
        ...asset,
        size: asset.size ? Number(asset.size) : null,
      })),
    };
  }

  async create(orgId: string, dto: CreateProjectDto) {
    // Process clip settings if provided
    const clipSettings = dto.settings ? {
      aspectRatio: dto.settings.aspectRatio || '16:9',
      clipLength: dto.settings.clipLength || 60,
      numberOfClips: dto.settings.numberOfClips || 5,
      timeframe: dto.settings.timeframe,
      targetPlatform: dto.settings.targetPlatform,
    } : null;

    console.log('📝 Creating project with settings:', JSON.stringify(clipSettings, null, 2));

    return this.prisma.project.create({
      data: {
        orgId,
        title: dto.title,
        sourceUrl: dto.sourceUrl,
        clipSettings: clipSettings as any,
      },
    });
  }

  async findAll(orgId: string, skip = 0, take = 20) {
    const projects = await this.prisma.project.findMany({
      where: { orgId },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        assets: true,
        transcript: true,
        moments: { orderBy: { score: 'desc' }, take: 5 },
      },
    });
    
    return projects.map(p => this.serializeProject(p));
  }

  async findOne(projectId: string, orgId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        assets: true,
        moments: { orderBy: { score: 'desc' } },
        exports: { orderBy: { createdAt: 'desc' }, take: 10 },
        transcript: true,
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.orgId !== orgId) {
      throw new ForbiddenException('Access denied');
    }

    return this.serializeProject(project);
  }

  async detect(projectId: string, orgId: string, dto: any) {
    const project = await this.findOne(projectId, orgId);

    // Extract clip settings from dto
    const settings = dto?.settings || {};
    console.log('🎬 Received clip settings:', JSON.stringify(settings, null, 2));
    
    const clipSettings = {
      aspectRatio: settings.aspectRatio || '16:9',
      clipLength: settings.clipLength || 60,
      numberOfClips: settings.numberOfClips || 3,
      timeframe: settings.timeframe,
      targetPlatform: settings.targetPlatform,
    };
    
    console.log('🎬 Processed clip settings:', JSON.stringify(clipSettings, null, 2));

    // Update project status to DETECTING and save settings
    await this.prisma.project.update({
      where: { id: projectId },
      data: { 
        status: 'DETECTING',
        clipSettings: clipSettings as any,
      },
    });

    // Call ML worker for real detection
    this.callMLWorkerDetection(projectId, clipSettings);

    return {
      projectId,
      status: 'detecting',
      message: 'Highlight detection started with custom settings',
      settings: clipSettings,
    };
  }

  /**
   * Extract transcript text for a specific time range
   */
  private extractTranscriptText(
    transcript: any,
    startTime: number,
    endTime: number,
  ): string {
    if (!transcript || !transcript.data) {
      return '';
    }

    try {
      const words = transcript.data.words || [];
      
      // Find words in this time range
      const clipWords = words.filter(
        (w: any) => w.start >= startTime && w.end <= endTime,
      );

      if (clipWords.length === 0) {
        return '';
      }

      // Get the text
      return clipWords.map((w: any) => w.text).join(' ');
    } catch (error) {
      console.error('Error extracting transcript text:', error);
      return '';
    }
  }

  /**
   * Call ML worker for real clip detection
   */
  private async callMLWorkerDetection(projectId: string, settings?: any) {
    try {
      // Get transcript for this project
      const transcript = await this.prisma.transcript.findUnique({
        where: { projectId },
      });

      if (!transcript) {
        console.error(`No transcript found for project ${projectId}`);
        await this.prisma.project.update({
          where: { id: projectId },
          data: { status: 'FAILED' },
        });
        return;
      }

      // Call ML worker detection endpoint
      const mlWorkerUrl = process.env.ML_WORKER_URL || 'http://ml-workers:8000';
      const response = await fetch(`${mlWorkerUrl}/v1/ranker/detect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          transcriptId: transcript.id,
          numClips: settings?.numberOfClips || 6,
        }),
      });

      if (!response.ok) {
        throw new Error(`ML worker returned ${response.status}`);
      }

      const result = await response.json();
      console.log(`✅ Detection queued for project ${projectId}:`, result);
    } catch (error) {
      console.error(`❌ ML worker detection failed for ${projectId}:`, error);
      await this.prisma.project.update({
        where: { id: projectId },
        data: { status: 'FAILED' },
      });
    }
  }

  private async simulateDetection(projectId: string, settings?: any) {
    // Wait 3 seconds to simulate processing
    await new Promise(resolve => setTimeout(resolve, 3000));

    try {
      // Get transcript and project for this project
      const [transcript, projectData] = await Promise.all([
        this.prisma.transcript.findUnique({
          where: { projectId },
        }),
        this.prisma.project.findUnique({
          where: { id: projectId },
        }),
      ]);

      // Extract settings
      const clipLength = settings?.clipLength || 60;
      const numberOfClips = settings?.numberOfClips || 3;
      const aspectRatio = settings?.aspectRatio || '16:9';
      const targetPlatform = settings?.targetPlatform;
      const timeframe = settings?.timeframe;

      // Generate moments based on settings
      // Dynamically create the requested number of clips
      const reasons = [
        'Strong hook • Emotional',
        'Well-structured • Novel',
        'Novel content • Clarity',
        'Engaging story • Clear',
        'Emotional impact • Hook',
        'Great pacing • Structure',
        'Compelling narrative',
        'High engagement potential',
        'Clear message • Impact',
        'Strong storytelling',
      ];

      const baseMoments = [];
      const startTime = timeframe?.start || 10;
      const spacing = 10; // seconds between clips

      for (let i = 0; i < numberOfClips; i++) {
        const score = 92 - (i * 3); // Decreasing scores
        const tStart = startTime + (i * (clipLength + spacing));
        
        baseMoments.push({
          projectId,
          score,
          reason: reasons[i % reasons.length],
          tStart,
          duration: clipLength,
          features: { 
            hook: 0.9 - (i * 0.05), 
            emotion: 0.85 - (i * 0.05), 
            structure: 0.8, 
            novelty: 0.7, 
            clarity: 0.75, 
            quote: 0.6, 
            vision_focus: 0.7 
          },
          aspectRatio,
          targetPlatform,
        });
      }

      // Map to add tEnd
      const moments = baseMoments.map(m => ({
        ...m,
        tEnd: m.tStart + m.duration,
      }));

      // Generate AI-powered titles and descriptions for each moment
      const momentsWithTitles = await Promise.all(
        moments.map(async (moment) => {
          // Extract transcript text for this clip
          const clipText = this.extractTranscriptText(
            transcript,
            moment.tStart,
            moment.tEnd,
          );

          // Generate professional title and description using AI
          const { title, description } = await this.ai.generateClipMetadata(
            clipText,
            {
              videoTitle: projectData?.title,
              duration: moment.duration,
              score: moment.score,
            },
          );

          return { ...moment, title, description };
        }),
      );

      await this.prisma.moment.createMany({
        data: momentsWithTitles,
      });

      // Update project status to READY
      await this.prisma.project.update({
        where: { id: projectId },
        data: { status: 'READY' },
      });
    } catch (error) {
      console.error('Error creating moments:', error);
    }
  }

  async update(projectId: string, orgId: string, dto: any) {
    const project = await this.findOne(projectId, orgId);
    return this.prisma.project.update({
      where: { id: projectId },
      data: dto,
    });
  }

  async uploadVideo(projectId: string, orgId: string, file: any) {
    const project = await this.findOne(projectId, orgId);

    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Upload to MinIO
    const key = `projects/${projectId}/source${path.extname(file.originalname)}`;
    const result = await this.storage.uploadFile(key, file.buffer, file.mimetype);

    // Get video metadata
    const tempPath = this.video.getTempFilePath(path.extname(file.originalname));
    await fs.writeFile(tempPath, file.buffer);
    const metadata = await this.video.getVideoMetadata(tempPath);
    await this.video.cleanupTempFile(tempPath);

    // Update project with video info
    await this.prisma.project.update({
      where: { id: projectId },
      data: {
        sourceUrl: result.key,
        status: 'INGESTING',
      },
    });

    // Create asset record
    await this.prisma.asset.create({
      data: {
        projectId,
        kind: 'ORIGINAL',
        url: result.key,
        duration: metadata.duration,
        mimeType: file.mimetype,
        size: BigInt(file.size),
      },
    });

    // Trigger transcription asynchronously (don't wait for it)
    if (this.transcription.isAvailable()) {
      console.log(`🎙️  Triggering transcription for project: ${projectId}`);
      this.transcription.transcribeProject(projectId).catch((error) => {
        console.error('Transcription failed:', error);
      });
    } else {
      console.warn('⚠️  Transcription not available - skipping');
    }

    return {
      message: 'Video uploaded successfully',
      key: result.key,
      metadata: {
        ...metadata,
        size: file.size, // Return as number, not BigInt
      },
    };
  }

  async importVideoFromUrl(projectId: string, orgId: string, url: string, customTitle?: string) {
    const project = await this.findOne(projectId, orgId);

    this.logger.log(`📥 Importing video from URL for project ${projectId}: ${url}`);

    // Update project status to IMPORTING immediately
    await this.prisma.project.update({
      where: { id: projectId },
      data: {
        status: 'IMPORTING',
      },
    });

    // Start the import process asynchronously (don't wait for it)
    this.processUrlImport(projectId, url, customTitle).catch((error) => {
      this.logger.error(`URL import failed for project ${projectId}:`, error);
      // Update project status to ERROR
      this.prisma.project.update({
        where: { id: projectId },
        data: {
          status: 'ERROR',
        },
      }).catch(err => this.logger.error('Failed to update project status:', err));
    });

    // Return immediately
    return {
      message: 'Video import started',
      projectId,
      status: 'IMPORTING',
    };
  }

  private async processUrlImport(projectId: string, url: string, customTitle?: string) {
    this.logger.log(`🔄 Processing URL import for project ${projectId}`);

    // Import VideoDownloadService dynamically
    const { VideoDownloadService } = await import('../video/video-download.service');
    const downloadService = new VideoDownloadService();

    // Download video from URL
    const { filePath, info } = await downloadService.downloadVideo(url, customTitle);

    // Read the downloaded file
    const fileBuffer = await fs.readFile(filePath);
    const fileSize = (await fs.stat(filePath)).size;

    // Upload to MinIO
    const key = `projects/${projectId}/source.mp4`;
    const result = await this.storage.uploadFile(key, fileBuffer, 'video/mp4');

    // Get video metadata
    const metadata = await this.video.getVideoMetadata(filePath);

    // Cleanup downloaded file
    await downloadService.cleanup(filePath);

    // Update project with video info
    // Use video title from metadata if no custom title provided
    const finalTitle = (customTitle && customTitle.trim()) ? customTitle : info.title;
    await this.prisma.project.update({
      where: { id: projectId },
      data: {
        title: finalTitle,
        sourceUrl: result.key,
        status: 'INGESTING',
      },
    });

    // Create asset record
    await this.prisma.asset.create({
      data: {
        projectId,
        kind: 'ORIGINAL',
        url: result.key,
        duration: metadata.duration,
        mimeType: 'video/mp4',
        size: BigInt(fileSize),
      },
    });

    this.logger.log(`✅ URL import complete for project ${projectId}`);

    // Trigger transcription asynchronously
    if (this.transcription.isAvailable()) {
      this.logger.log(`🎙️  Triggering transcription for project: ${projectId}`);
      this.transcription.transcribeProject(projectId).catch((error) => {
        this.logger.error('Transcription failed:', error);
      });
    } else {
      this.logger.warn('⚠️  Transcription not available - skipping');
    }
  }

  async streamVideo(projectId: string, orgId: string, res: Response) {
    const project = await this.findOne(projectId, orgId);

    if (!project.sourceUrl) {
      throw new NotFoundException('No video file found for this project');
    }

    const metadata = await this.storage.getFileMetadata(project.sourceUrl);
    const stream = this.storage.getFileStream(project.sourceUrl);

    res.set({
      'Content-Type': metadata.ContentType || 'video/mp4',
      'Content-Length': metadata.ContentLength,
      'Accept-Ranges': 'bytes',
    });

    return new Promise((resolve, reject) => {
      stream.pipe(res);
      stream.on('error', reject);
      stream.on('end', resolve);
    });
  }

  async exportMoments(
    projectId: string,
    orgId: string,
    dto: {
      momentIds: string[];
      aspectRatio?: string;
      cropMode?: 'crop' | 'pad' | 'smart';
      cropPosition?: 'center' | 'top' | 'bottom' | { x: number; y: number };
      burnCaptions?: boolean;
      captionStyle?: string;
    },
  ) {
    const {
      momentIds,
      aspectRatio = 'original',
      cropMode = 'crop',
      cropPosition = 'center',
      burnCaptions = false,
      captionStyle = 'minimal',
    } = dto;
    
    this.logger.log(`Export request: aspectRatio=${aspectRatio}, burnCaptions=${burnCaptions}, captionStyle=${captionStyle}`);
    const project = await this.findOne(projectId, orgId);

    if (!project.sourceUrl) {
      throw new BadRequestException('No source video found');
    }

    if (!momentIds || momentIds.length === 0) {
      throw new BadRequestException('No moments selected');
    }

    // Get the moments
    const moments = await this.prisma.moment.findMany({
      where: {
        id: { in: momentIds },
        projectId,
      },
    });

    if (moments.length === 0) {
      throw new NotFoundException('No moments found');
    }

    // Download source video to temp
    const sourceBuffer = await this.storage.downloadFile(project.sourceUrl);
    const sourcePath = this.video.getTempFilePath(path.extname(project.sourceUrl));
    await fs.writeFile(sourcePath, sourceBuffer);

    const exports = [];

    for (const moment of moments) {
      let clipKey: string;
      
      // Check if this is a Pro Clip (multi-segment)
      const features = moment.features as any;
      const isProClip = features?.isProClip && moment.proxyUrl;
      
      this.logger.log(`Moment ${moment.id}: isProClip=${features?.isProClip}, hasProxyUrl=${!!moment.proxyUrl}, proxyUrl=${moment.proxyUrl}`);
      
      if (isProClip) {
        // Pro Clip: Use the already-generated multi-segment video
        this.logger.log(`Exporting Pro Clip ${moment.id} (multi-segment) from ${moment.proxyUrl}`);
        
        // Download the Pro Clip to temp
        const proClipBuffer = await this.storage.downloadFile(moment.proxyUrl);
        const proClipPath = this.video.getTempFilePath('.mp4');
        await fs.writeFile(proClipPath, proClipBuffer);
        
        // Apply aspect ratio conversion if requested
        let finalPath = proClipPath;
        if (aspectRatio && aspectRatio !== 'original') {
          this.logger.log(`Converting Pro Clip to aspect ratio ${aspectRatio} using ${cropMode} mode`);
          const convertedPath = this.video.getTempFilePath('.mp4');
          await this.ffmpeg.convertAspectRatio(
            proClipPath,
            convertedPath,
            aspectRatio,
            cropMode,
            cropPosition,
          );
          finalPath = convertedPath;
          // Clean up the original pro clip file
          await this.video.cleanupTempFile(proClipPath);
        }
        
        // Apply caption burning if requested
        if (burnCaptions) {
          this.logger.log(`Burning captions for Pro Clip ${moment.id}`);
          const captionedPath = this.video.getTempFilePath('.mp4');
          await this.burnCaptionsForMoment(moment, finalPath, captionedPath, captionStyle);
          // Clean up the non-captioned file
          await this.video.cleanupTempFile(finalPath);
          finalPath = captionedPath;
        }
        
        // Upload the final clip
        const finalBuffer = await fs.readFile(finalPath);
        clipKey = `projects/${projectId}/exports/${moment.id}.mp4`;
        await this.storage.uploadFile(clipKey, finalBuffer, 'video/mp4');
        
        // Cleanup temp file
        await this.video.cleanupTempFile(finalPath);
      } else {
        // Regular clip: Cut from source video
        this.logger.log(`Exporting regular clip ${moment.id} (${moment.tStart}s - ${moment.tEnd}s)`);
        const cutPath = this.video.getTempFilePath('.mp4');
        await this.video.cutVideoSegment(
          sourcePath,
          cutPath,
          moment.tStart,
          moment.tEnd,
        );

        // Apply aspect ratio conversion if requested
        let finalPath = cutPath;
        if (aspectRatio && aspectRatio !== 'original') {
          this.logger.log(`Converting to aspect ratio ${aspectRatio} using ${cropMode} mode`);
          const convertedPath = this.video.getTempFilePath('.mp4');
          await this.ffmpeg.convertAspectRatio(
            cutPath,
            convertedPath,
            aspectRatio,
            cropMode,
            cropPosition,
          );
          finalPath = convertedPath;
          // Clean up the cut file
          await this.video.cleanupTempFile(cutPath);
        }

        // Apply caption burning if requested
        if (burnCaptions) {
          this.logger.log(`Burning captions for clip ${moment.id}`);
          const captionedPath = this.video.getTempFilePath('.mp4');
          await this.burnCaptionsForMoment(moment, finalPath, captionedPath, captionStyle);
          // Clean up the non-captioned file
          await this.video.cleanupTempFile(finalPath);
          finalPath = captionedPath;
        }

        // Upload the final clip to MinIO
        const clipBuffer = await fs.readFile(finalPath);
        clipKey = `projects/${projectId}/exports/${moment.id}.mp4`;
        await this.storage.uploadFile(clipKey, clipBuffer, 'video/mp4');

        // Cleanup temp file
        await this.video.cleanupTempFile(finalPath);
      }

      // Create export record with aspect ratio metadata
      const exportRecord = await this.prisma.export.create({
        data: {
          projectId,
          momentId: moment.id,
          format: 'MP4',
          artifacts: {
            mp4_url: clipKey,
          },
          status: 'COMPLETED',
          aspectRatio: aspectRatio !== 'original' ? aspectRatio : null,
          cropMode: aspectRatio !== 'original' ? cropMode : null,
          cropPosition: aspectRatio !== 'original' ? cropPosition : null,
          burnCaptions,
          captionStyle,
        },
      });

      exports.push(exportRecord);
    }

    // Cleanup source temp file
    await this.video.cleanupTempFile(sourcePath);

    return {
      message: `Exported ${exports.length} clips successfully`,
      exports,
    };
  }

  /**
   * Helper method to burn captions for a moment
   * Fetches transcript words for the moment's time range and generates captions
   * Uses frame-by-frame rendering for animated styles (bold, modern, elegant)
   */
  private async burnCaptionsForMoment(
    moment: any,
    inputPath: string,
    outputPath: string,
    captionStyle: string,
  ): Promise<void> {
    try {
      // Fetch the project's transcript
      const project = await this.prisma.project.findUnique({
        where: { id: moment.projectId },
        include: {
          transcript: true,
        },
      });

      const transcriptData = project?.transcript?.data as any;
      if (!transcriptData?.words) {
        this.logger.warn(`No transcript found for project ${moment.projectId}, skipping captions`);
        // Just copy the file if no transcript
        await fs.copyFile(inputPath, outputPath);
        return;
      }

      // Extract words for this moment's time range
      const words = (transcriptData.words as any[])
        .filter((w: any) => w.start >= moment.tStart && w.end <= moment.tEnd)
        .map((w: any) => ({
          text: w.text,
          start: w.start - moment.tStart, // Adjust to clip time
          end: w.end - moment.tStart,
          confidence: w.confidence || 1.0,
          speaker: w.speaker,
        }));

      if (words.length === 0) {
        this.logger.warn(`No words found for moment ${moment.id}, skipping captions`);
        await fs.copyFile(inputPath, outputPath);
        return;
      }

      // Determine if we need frame-by-frame rendering (for animated styles)
      const animatedStyles = ['bold', 'modern', 'elegant', 'mrbeast', 'neon', 'highlight', 'rainbow', 'fill', 'shadow3d', 'tricolor', 'bounce'];
      const useFrameByFrame = animatedStyles.includes(captionStyle);

      if (useFrameByFrame) {
        this.logger.log(`Using frame-by-frame rendering for ${captionStyle} style`);
        await this.renderAnimatedCaptions(inputPath, outputPath, words, captionStyle, moment);
      } else {
        // Use ASS subtitle burning for karaoke and static styles
        this.logger.log(`Using ASS subtitle burning for ${captionStyle} style`);
        const captionPath = this.video.getTempFilePath('.ass');
        const captionContent = this.captions.generateASS(words, {
          preset: captionStyle as any,
        });
        await fs.writeFile(captionPath, captionContent, 'utf-8');
        await this.ffmpeg.burnCaptions(inputPath, outputPath, captionPath);
        await this.video.cleanupTempFile(captionPath);
      }
    } catch (error) {
      this.logger.error(`Failed to burn captions: ${error.message}`);
      // Fallback: copy without captions
      await fs.copyFile(inputPath, outputPath);
    }
  }

  /**
   * Render animated captions using chunked approach for long clips
   */
  private async renderChunkedCaptions(
    inputPath: string,
    outputPath: string,
    words: any[],
    captionStyle: string,
    moment: any,
  ): Promise<void> {
    const { ChunkManagerService } = await import('../captions/chunk-manager.service');
    const { VideoMergerService } = await import('../captions/video-merger.service');
    const { CaptionAnimatorService } = await import('../captions/caption-animator.service');
    const { getCaptionStylePreset } = await import('../captions/caption-styles');
    
    const chunkManager = new ChunkManagerService();
    const videoMerger = new VideoMergerService();
    const animator = new CaptionAnimatorService();
    const stylePreset = getCaptionStylePreset(captionStyle);
    
    // Get video metadata
    const metadata = await this.ffmpeg.getVideoMetadata(inputPath);
    const actualDuration = metadata.duration;
    
    this.logger.log(`🎬 Starting chunked rendering for ${actualDuration.toFixed(1)}s clip`);
    
    // Split into chunks (8s for ultra-conservative memory management)
    const chunks = chunkManager.splitIntoChunks(words, actualDuration, 8);
    const chunkMetadata = chunkManager.getChunkMetadata(chunks);
    
    this.logger.log(
      `📊 Split into ${chunkMetadata.totalChunks} chunks (avg ${chunkMetadata.averageChunkSize.toFixed(1)}s each)`,
    );
    
    // Validate chunks
    const validation = chunkManager.validateChunks(chunks);
    if (!validation.valid) {
      this.logger.error(`❌ Chunk validation failed: ${validation.errors.join(', ')}`);
      throw new Error('Chunk validation failed');
    }
    
    // Process each chunk
    const chunkVideoPaths: string[] = [];
    
    for (const chunk of chunks) {
      this.logger.log(
        `🎨 Processing chunk ${chunk.index + 1}/${chunks.length}: ${chunk.startTime.toFixed(1)}s - ${chunk.endTime.toFixed(1)}s`,
      );
      
      // Extract chunk from original video
      const chunkInputPath = this.video.getTempFilePath(`_chunk_${chunk.index}_input.mp4`);
      await this.ffmpeg.extractSegment(
        inputPath,
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
        30,
        frameDir,
        metadata.width,
        metadata.height,
        { index: chunk.index, total: chunks.length, startTime: chunk.startTime },
      );
      
      // Overlay captions on chunk
      const chunkOutputPath = this.video.getTempFilePath(`_chunk_${chunk.index}_output.mp4`);
      const framePattern = `${frameDir}/caption_%06d.png`;
      await this.ffmpeg.overlayCaptionFrames(chunkInputPath, chunkOutputPath, framePattern, 30);
      
      // Cleanup chunk frames
      await animator.cleanupFrames(frameDir);
      await fs.unlink(chunkInputPath);
      
      chunkVideoPaths.push(chunkOutputPath);
      
      // Force garbage collection after each chunk to free memory
      if (global.gc) {
        global.gc();
      }
      
      // Add a small delay to let memory settle between chunks
      await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second pause
      
      this.logger.log(`✅ Chunk ${chunk.index + 1}/${chunks.length} completed`);
    }
    
    // Concatenate all chunks
    this.logger.log(`🔗 Concatenating ${chunkVideoPaths.length} chunks...`);
    await videoMerger.concatenate(chunkVideoPaths, {
      transition: 'cut',
      outputPath,
    });
    
    // Cleanup chunk videos
    await videoMerger.cleanupChunks(chunkVideoPaths);
    
    this.logger.log(`✅ Chunked rendering completed successfully`);
  }

  /**
   * Render animated captions using frame-by-frame approach
   */
  private async renderAnimatedCaptions(
    inputPath: string,
    outputPath: string,
    words: any[],
    captionStyle: string,
    moment: any,
  ): Promise<void> {
    const { CaptionAnimatorService } = await import('../captions/caption-animator.service');
    const { getCaptionStylePreset } = await import('../captions/caption-styles');
    
    const animator = new CaptionAnimatorService();
    const stylePreset = getCaptionStylePreset(captionStyle);
    
    // Get video metadata and actual duration from the file
    const metadata = await this.ffmpeg.getVideoMetadata(inputPath);
    const actualDuration = metadata.duration;
    
    this.logger.log(`Clip actual duration: ${actualDuration.toFixed(1)}s (moment span: ${(moment.tEnd - moment.tStart).toFixed(1)}s)`);
    
    // Check if we need chunked rendering for long clips
    const MAX_SINGLE_PASS_DURATION = 15; // 15 seconds max for single-pass rendering
    if (actualDuration > MAX_SINGLE_PASS_DURATION) {
      this.logger.log(`⚡ Clip exceeds ${MAX_SINGLE_PASS_DURATION}s, using chunked rendering`);
      return this.renderChunkedCaptions(inputPath, outputPath, words, captionStyle, moment);
    }
    
    // Generate caption frames with correct video dimensions
    const frameDir = this.video.getTempFilePath('_frames');
    await fs.mkdir(frameDir, { recursive: true });
    
    this.logger.log(`Generating ${Math.ceil(actualDuration * 30)} caption frames at ${metadata.width}x${metadata.height}...`);
    await animator.generateCaptionFrames(
      words,
      stylePreset,
      actualDuration,
      30, // 30 FPS
      frameDir,
      metadata.width,
      metadata.height,
    );
    
    // Overlay frames onto video
    const framePattern = `${frameDir}/caption_%06d.png`;
    await this.ffmpeg.overlayCaptionFrames(inputPath, outputPath, framePattern, 30);
    
    // Cleanup frames
    await animator.cleanupFrames(frameDir);
    this.logger.log(`✅ Animated captions rendered successfully`);
  }

  async downloadExport(exportId: string, orgId: string, res: Response) {
    const exportRecord = await this.prisma.export.findUnique({
      where: { id: exportId },
      include: { 
        project: true,
        moment: true, // Include moment to get title
      },
    });

    if (!exportRecord) {
      throw new NotFoundException('Export not found');
    }

    if (exportRecord.project.orgId !== orgId) {
      throw new ForbiddenException('Access denied');
    }

    const artifacts = exportRecord.artifacts as any;
    const clipUrl = artifacts.mp4_url;
    
    const metadata = await this.storage.getFileMetadata(clipUrl);
    const stream = this.storage.getFileStream(clipUrl);

    // Create a safe filename from the moment's title
    const safeTitle = exportRecord.moment?.title
      ? exportRecord.moment.title
          .replace(/[^a-z0-9\s-]/gi, '') // Remove special characters
          .replace(/\s+/g, '-') // Replace spaces with hyphens
          .toLowerCase()
          .substring(0, 50) // Limit length
      : `clip-${exportRecord.momentId}`;

    res.set({
      'Content-Type': 'video/mp4',
      'Content-Length': metadata.ContentLength,
      'Content-Disposition': `attachment; filename="${safeTitle}.mp4"`,
    });

    return new Promise((resolve, reject) => {
      stream.pipe(res);
      stream.on('error', reject);
      stream.on('end', resolve);
    });
  }

  async delete(projectId: string, orgId: string) {
    const project = await this.findOne(projectId, orgId);
    return this.prisma.project.delete({
      where: { id: projectId },
    });
  }

  async getTranscript(projectId: string, orgId: string) {
    // Verify org owns project
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project || project.orgId !== orgId) {
      throw new NotFoundException('Project not found');
    }

    // Fetch transcript
    const transcript = await this.prisma.transcript.findUnique({
      where: { projectId },
    });

    if (!transcript) {
      throw new NotFoundException('Transcript not found');
    }

    return transcript;
  }
}
