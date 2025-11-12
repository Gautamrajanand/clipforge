import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { ProxyTokenService } from '../proxy/proxy-token.service';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class IngestionService {
  private readonly logger = new Logger(IngestionService.name);

  constructor(
    private prisma: PrismaService,
    private httpService: HttpService,
    private configService: ConfigService,
    private proxyTokenService: ProxyTokenService,
  ) {}

  async ingest(projectId: string, orgId: string, dto: any) {
    // Verify org owns project
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project || project.orgId !== orgId) {
      throw new NotFoundException('Project not found');
    }

    // Create asset
    const asset = await this.prisma.asset.create({
      data: {
        projectId,
        kind: 'ORIGINAL',
        url: dto.sourceUrl || '',
        mimeType: dto.mimeType,
      },
    });

    // Update project status
    await this.prisma.project.update({
      where: { id: projectId },
      data: { status: 'INGESTING' },
    });

    // Create transcript record
    const transcript = await this.prisma.transcript.create({
      data: {
        projectId,
        status: 'PENDING',
        language: 'en',
        data: {},
      },
    });

    // Start transcription with AssemblyAI
    await this.startTranscription(projectId, asset.id, orgId);

    return { assetId: asset.id, status: 'ingesting' };
  }

  private async startTranscription(
    projectId: string,
    assetId: string,
    orgId: string,
  ) {
    try {
      const assemblyAiKey = this.configService.get('ASSEMBLYAI_API_KEY');
      if (!assemblyAiKey) {
        this.logger.warn('AssemblyAI API key not configured, skipping transcription');
        return;
      }

      // Generate proxy URL for AssemblyAI to access the video
      const baseUrl = this.configService.get('API_BASE_URL') || 'http://localhost:3000';
      const proxyUrl = this.proxyTokenService.generateProxyUrl(
        assetId,
        projectId,
        orgId,
        baseUrl,
      );

      this.logger.log(`Starting transcription for project ${projectId}`);

      // Submit to AssemblyAI
      const response = await firstValueFrom(
        this.httpService.post(
          'https://api.assemblyai.com/v2/transcript',
          {
            audio_url: proxyUrl,
            language_code: 'en',
            speaker_labels: true,
            word_boost: [],
            boost_param: 'default',
          },
          {
            headers: {
              authorization: assemblyAiKey,
              'content-type': 'application/json',
            },
          },
        ),
      );

      const transcriptId = response.data.id;

      // Update transcript with external ID
      await this.prisma.transcript.update({
        where: { projectId },
        data: {
          externalId: transcriptId,
          status: 'PROCESSING',
        },
      });

      this.logger.log(
        `Transcription started: ${transcriptId} for project ${projectId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to start transcription for project ${projectId}:`,
        error,
      );
      
      // Update transcript status to failed
      await this.prisma.transcript.update({
        where: { projectId },
        data: { status: 'FAILED' },
      });
    }
  }
}
