import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class StorageService {
  private s3: AWS.S3;

  constructor() {
    this.s3 = new AWS.S3({
      endpoint: process.env.S3_ENDPOINT,
      region: process.env.S3_REGION || 'us-east-1',
      accessKeyId: process.env.S3_ACCESS_KEY_ID,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
      s3ForcePathStyle: true, // For MinIO compatibility
    });
  }

  /**
   * Generate presigned upload URL
   */
  async generatePresignedUploadUrl(
    filename: string,
    mimeType: string,
    size: number,
  ): Promise<{
    uploadUrl: string;
    downloadUrl: string;
    key: string;
    expiresIn: number;
  }> {
    const key = `uploads/${uuidv4()}/${filename}`;
    const expiresIn = 3600; // 1 hour

    const uploadUrl = this.s3.getSignedUrl('putObject', {
      Bucket: process.env.S3_BUCKET || 'clipforge',
      Key: key,
      ContentType: mimeType,
      ContentLength: size,
      Expires: expiresIn,
    });

    const downloadUrl = this.s3.getSignedUrl('getObject', {
      Bucket: process.env.S3_BUCKET || 'clipforge',
      Key: key,
      Expires: expiresIn * 24, // 24 hours for download
    });

    return {
      uploadUrl,
      downloadUrl,
      key,
      expiresIn,
    };
  }

  /**
   * Generate presigned download URL
   */
  async generatePresignedDownloadUrl(key: string, expiresIn = 3600): Promise<string> {
    return this.s3.getSignedUrl('getObject', {
      Bucket: process.env.S3_BUCKET || 'clipforge',
      Key: key,
      Expires: expiresIn,
    });
  }

  /**
   * Get signed URL for a file (alias for generatePresignedDownloadUrl)
   * Used by transcription service
   */
  async getSignedUrl(key: string, expiresIn = 7200): Promise<string> {
    return this.generatePresignedDownloadUrl(key, expiresIn);
  }

  /**
   * Upload file to S3
   */
  async uploadFile(
    key: string,
    body: Buffer,
    contentType: string,
  ): Promise<{ url: string; key: string }> {
    await this.s3
      .putObject({
        Bucket: process.env.S3_BUCKET || 'clipforge',
        Key: key,
        Body: body,
        ContentType: contentType,
      })
      .promise();

    const url = await this.generatePresignedDownloadUrl(key);
    return { url, key };
  }

  /**
   * Download file from S3
   */
  async downloadFile(key: string): Promise<Buffer> {
    const result = await this.s3
      .getObject({
        Bucket: process.env.S3_BUCKET || 'clipforge',
        Key: key,
      })
      .promise();

    return result.Body as Buffer;
  }

  /**
   * Delete file from S3
   */
  async deleteFile(key: string): Promise<void> {
    await this.s3
      .deleteObject({
        Bucket: process.env.S3_BUCKET || 'clipforge',
        Key: key,
      })
      .promise();
  }

  /**
   * Check if file exists
   */
  async fileExists(key: string): Promise<boolean> {
    try {
      await this.s3
        .headObject({
          Bucket: process.env.S3_BUCKET || 'clipforge',
          Key: key,
        })
        .promise();
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get file stream from S3
   */
  getFileStream(key: string) {
    return this.s3
      .getObject({
        Bucket: process.env.S3_BUCKET || 'clipforge',
        Key: key,
      })
      .createReadStream();
  }

  /**
   * Get file metadata
   */
  async getFileMetadata(key: string) {
    const result = await this.s3
      .headObject({
        Bucket: process.env.S3_BUCKET || 'clipforge',
        Key: key,
      })
      .promise();
    
    return {
      ContentType: result.ContentType,
      ContentLength: result.ContentLength,
      LastModified: result.LastModified,
    };
  }

  /**
   * Download file range (for HTTP Range requests)
   * Supports streaming large files
   */
  async downloadFileRange(key: string, start: number, end: number): Promise<Buffer> {
    const result = await this.s3
      .getObject({
        Bucket: process.env.S3_BUCKET || 'clipforge',
        Key: key,
        Range: `bytes=${start}-${end}`,
      })
      .promise();

    return result.Body as Buffer;
  }
}
