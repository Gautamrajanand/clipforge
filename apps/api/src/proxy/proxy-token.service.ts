import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

/**
 * Proxy Token Service
 * Generates and validates short-lived JWT tokens for secure media access
 * Used by AssemblyAI to access videos from MinIO via proxy
 */

interface ProxyTokenPayload {
  assetId: string;
  projectId: string;
  orgId: string;
  type: 'media-proxy';
  iat?: number;
  exp?: number;
}

@Injectable()
export class ProxyTokenService {
  private readonly logger = new Logger(ProxyTokenService.name);
  private readonly secret: string;
  private readonly tokenLifetime = 15 * 60; // 15 minutes in seconds

  constructor() {
    this.secret = process.env.JWT_SECRET || 'dev-secret-change-in-production';
    if (this.secret === 'dev-secret-change-in-production') {
      this.logger.warn('Using default JWT secret - set JWT_SECRET in production!');
    }
  }

  /**
   * Generate a short-lived token for media proxy access
   * 
   * @param assetId - Asset/Project ID
   * @param projectId - Project ID
   * @param orgId - Organization ID
   * @returns JWT token string
   */
  generateToken(assetId: string, projectId: string, orgId: string): string {
    const payload: ProxyTokenPayload = {
      assetId,
      projectId,
      orgId,
      type: 'media-proxy',
    };

    const token = jwt.sign(payload, this.secret, {
      expiresIn: this.tokenLifetime,
      issuer: 'clipforge-api',
      audience: 'assemblyai-proxy',
    });

    this.logger.debug(`Generated proxy token for asset ${assetId} (expires in ${this.tokenLifetime}s)`);
    return token;
  }

  /**
   * Validate and decode a proxy token
   * 
   * @param token - JWT token string
   * @returns Decoded payload
   * @throws UnauthorizedException if token is invalid or expired
   */
  validateToken(token: string): ProxyTokenPayload {
    try {
      const payload = jwt.verify(token, this.secret, {
        issuer: 'clipforge-api',
        audience: 'assemblyai-proxy',
      }) as ProxyTokenPayload;

      // Verify token type
      if (payload.type !== 'media-proxy') {
        throw new UnauthorizedException('Invalid token type');
      }

      this.logger.debug(`Validated proxy token for asset ${payload.assetId}`);
      return payload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        this.logger.warn('Proxy token expired');
        throw new UnauthorizedException('Token expired');
      } else if (error instanceof jwt.JsonWebTokenError) {
        this.logger.warn('Invalid proxy token');
        throw new UnauthorizedException('Invalid token');
      }
      throw error;
    }
  }

  /**
   * Generate a proxy URL for external services
   * 
   * @param assetId - Asset/Project ID
   * @param projectId - Project ID
   * @param orgId - Organization ID
   * @param baseUrl - Base URL of the API (e.g., https://api.clipforge.com)
   * @returns Full proxy URL with token
   */
  generateProxyUrl(
    assetId: string,
    projectId: string,
    orgId: string,
    baseUrl: string,
  ): string {
    const token = this.generateToken(assetId, projectId, orgId);
    return `${baseUrl}/internal/assemblyai/pull/${assetId}?token=${token}`;
  }
}
