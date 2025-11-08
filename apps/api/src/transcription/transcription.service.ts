import { Injectable } from '@nestjs/common';
import { AssemblyAI } from 'assemblyai';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class TranscriptionService {
  private assemblyai: AssemblyAI | null = null;

  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
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
}
