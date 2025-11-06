import {
  Controller,
  Get,
  Param,
  Query,
  Res,
  Headers,
  NotFoundException,
  Logger,
  StreamableFile,
} from '@nestjs/common';
import { Response } from 'express';
import { ProxyTokenService } from './proxy-token.service';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';

/**
 * Proxy Controller
 * Provides secure, time-limited access to media files for external services
 * Supports HTTP Range requests for streaming
 */
@Controller('internal/assemblyai')
export class ProxyController {
  private readonly logger = new Logger(ProxyController.name);

  constructor(
    private readonly tokenService: ProxyTokenService,
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  /**
   * Proxy endpoint for AssemblyAI to pull media files
   * 
   * GET /internal/assemblyai/pull/:assetId?token=xxx
   * 
   * Features:
   * - JWT token validation (15min expiry)
   * - Org/project access verification
   * - HTTP Range support for streaming
   * - Correct Content-Type and Content-Length headers
   */
  @Get('pull/:assetId')
  async pullMedia(
    @Param('assetId') assetId: string,
    @Query('token') token: string,
    @Headers('range') range: string | undefined,
    @Res({ passthrough: true }) res: Response,
  ) {
    // Validate token
    if (!token) {
      this.logger.warn(`Missing token for asset ${assetId}`);
      throw new NotFoundException('Token required');
    }

    let payload;
    try {
      payload = this.tokenService.validateToken(token);
    } catch (error) {
      this.logger.error(`Token validation failed: ${error.message}`);
      throw error;
    }

    // Verify asset exists and belongs to org
    const project = await this.prisma.project.findUnique({
      where: { id: assetId },
    });

    if (!project) {
      this.logger.warn(`Project not found: ${assetId}`);
      throw new NotFoundException('Asset not found');
    }

    if (project.orgId !== payload.orgId) {
      this.logger.warn(`Org mismatch for asset ${assetId}: ${project.orgId} !== ${payload.orgId}`);
      throw new NotFoundException('Asset not found');
    }

    if (!project.sourceUrl) {
      this.logger.warn(`No source URL for project ${assetId}`);
      throw new NotFoundException('Media not available');
    }

    // Extract S3 key from URL
    const s3Key = this.extractS3Key(project.sourceUrl);
    this.logger.log(`Proxying media: ${s3Key} for AssemblyAI`);

    try {
      // Get file metadata
      const metadata = await this.storage.getFileMetadata(s3Key);
      const fileSize = metadata.ContentLength || 0;
      const contentType = metadata.ContentType || 'video/mp4';

      // Handle Range requests for streaming
      if (range) {
        return this.handleRangeRequest(s3Key, range, fileSize, contentType, res);
      }

      // Full file download
      const fileBuffer = await this.storage.downloadFile(s3Key);

      res.set({
        'Content-Type': contentType,
        'Content-Length': fileSize.toString(),
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'private, max-age=900', // 15 minutes
      });

      return new StreamableFile(fileBuffer);
    } catch (error) {
      this.logger.error(`Failed to proxy media: ${error.message}`);
      throw new NotFoundException('Media not available');
    }
  }

  /**
   * Handle HTTP Range request for partial content
   */
  private async handleRangeRequest(
    s3Key: string,
    rangeHeader: string,
    fileSize: number,
    contentType: string,
    res: Response,
  ) {
    // Parse range header (e.g., "bytes=0-1023")
    const parts = rangeHeader.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunkSize = end - start + 1;

    this.logger.debug(`Range request: ${start}-${end}/${fileSize}`);

    // Download the range from S3
    // Note: MinIO/S3 supports Range header
    const rangeBuffer = await this.storage.downloadFileRange(s3Key, start, end);

    res.status(206); // Partial Content
    res.set({
      'Content-Type': contentType,
      'Content-Length': chunkSize.toString(),
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'private, max-age=900',
    });

    return new StreamableFile(rangeBuffer);
  }

  /**
   * Extract S3 key from full URL
   */
  private extractS3Key(url: string): string {
    // URL format: http://localhost:9000/clipforge/projects/xxx/source.mp4
    const urlObj = new URL(url);
    // Remove leading slash and bucket name
    return urlObj.pathname.split('/').slice(2).join('/');
  }
}
