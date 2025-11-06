import {
  Controller,
  Post,
  Body,
  Headers,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';

/**
 * AssemblyAI Webhook Handler
 * Receives transcription completion webhooks from AssemblyAI
 * Validates signature and persists transcript data
 */

interface AssemblyAIWebhookPayload {
  transcript_id: string;
  status: 'completed' | 'error';
  text?: string;
  words?: Array<{
    text: string;
    start: number;
    end: number;
    confidence: number;
  }>;
  utterances?: Array<{
    text: string;
    start: number;
    end: number;
    speaker: string;
    confidence: number;
  }>;
  language_code?: string;
  audio_duration?: number;
  error?: string;
}

@Controller('webhooks')
export class AssemblyAIWebhookController {
  private readonly logger = new Logger(AssemblyAIWebhookController.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * AssemblyAI webhook endpoint
   * POST /webhooks/assemblyai
   * 
   * Receives transcription completion events
   * Validates signature and persists transcript data
   */
  @Post('assemblyai')
  async handleWebhook(
    @Body() payload: AssemblyAIWebhookPayload,
    @Headers('x-assemblyai-signature') signature: string,
  ) {
    this.logger.log(`Received AssemblyAI webhook: ${payload.transcript_id} - ${payload.status}`);

    // Verify signature (if configured)
    if (process.env.ASSEMBLYAI_WEBHOOK_SECRET) {
      this.verifySignature(JSON.stringify(payload), signature);
    }

    // Handle completion
    if (payload.status === 'completed') {
      await this.handleTranscriptionComplete(payload);
    } else if (payload.status === 'error') {
      await this.handleTranscriptionError(payload);
    }

    return { received: true };
  }

  /**
   * Handle successful transcription
   */
  private async handleTranscriptionComplete(payload: AssemblyAIWebhookPayload) {
    try {
      // Find transcript by external ID
      const transcript = await this.prisma.transcript.findFirst({
        where: { externalId: payload.transcript_id },
        include: { project: true },
      });

      if (!transcript) {
        this.logger.warn(`Transcript not found for ID: ${payload.transcript_id}`);
        return;
      }

      // Calculate WPM (words per minute)
      const wordCount = payload.words?.length || 0;
      const durationMinutes = (payload.audio_duration || 0) / 60;
      const wpm = durationMinutes > 0 ? Math.round(wordCount / durationMinutes) : 0;

      // Prepare transcript data
      const transcriptData = {
        text: payload.text || '',
        words: payload.words || [],
        segments: payload.utterances || [],
        language: payload.language_code || 'en',
        wpm,
        confidence: this.calculateAverageConfidence(payload.words || []),
      };

      // Update transcript
      await this.prisma.transcript.update({
        where: { id: transcript.id },
        data: {
          status: 'COMPLETED' as any,
          data: transcriptData,
          completedAt: new Date(),
        },
      });

      // Mark project as transcribed
      await this.prisma.project.update({
        where: { id: transcript.projectId },
        data: {
          status: 'TRANSCRIBED' as any,
        },
      });

      this.logger.log(
        `Transcript completed: ${transcript.id} (${wordCount} words, ${wpm} WPM)`,
      );
    } catch (error) {
      this.logger.error(`Failed to process transcription: ${error.message}`);
      throw error;
    }
  }

  /**
   * Handle transcription error
   */
  private async handleTranscriptionError(payload: AssemblyAIWebhookPayload) {
    try {
      const transcript = await this.prisma.transcript.findFirst({
        where: { externalId: payload.transcript_id },
      });

      if (!transcript) {
        this.logger.warn(`Transcript not found for ID: ${payload.transcript_id}`);
        return;
      }

      await this.prisma.transcript.update({
        where: { id: transcript.id },
        data: {
          status: 'FAILED' as any,
          data: { error: payload.error || 'Unknown error' },
        },
      });

      this.logger.error(`Transcript failed: ${transcript.id} - ${payload.error}`);
    } catch (error) {
      this.logger.error(`Failed to process error: ${error.message}`);
    }
  }

  /**
   * Verify webhook signature
   */
  private verifySignature(body: string, signature: string) {
    if (!signature) {
      throw new BadRequestException('Missing signature');
    }

    const secret = process.env.ASSEMBLYAI_WEBHOOK_SECRET;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');

    if (signature !== expectedSignature) {
      this.logger.warn('Invalid webhook signature');
      throw new BadRequestException('Invalid signature');
    }
  }

  /**
   * Calculate average confidence from words
   */
  private calculateAverageConfidence(
    words: Array<{ confidence: number }>,
  ): number {
    if (words.length === 0) return 0;
    const sum = words.reduce((acc, word) => acc + word.confidence, 0);
    return sum / words.length;
  }
}
