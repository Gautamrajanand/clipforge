import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClerkSyncService } from '../clerk-sync.service';
import * as jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

/**
 * ClerkAuthGuard - Validates Clerk JWT tokens
 * 
 * Verifies JWT tokens issued by Clerk and attaches user data to request
 */
@Injectable()
export class ClerkAuthGuard implements CanActivate {
  constructor(
    private configService: ConfigService,
    private clerkSync: ClerkSyncService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // Extract token from Authorization header
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedException('Missing Authorization header');
    }

    const [type, token] = authHeader.split(' ');
    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException('Invalid Authorization header format');
    }

    try {
      // Decode token to get the issuer (Clerk instance URL)
      const decoded: any = jwt.decode(token, { complete: true });
      if (!decoded || !decoded.header || !decoded.payload) {
        throw new Error('Invalid token format');
      }

      const issuer = decoded.payload.iss;
      if (!issuer) {
        throw new Error('Token missing issuer');
      }

      // Create JWKS client for Clerk's public keys
      const client = jwksClient({
        jwksUri: `${issuer}/.well-known/jwks.json`,
        cache: true,
        rateLimit: true,
      });

      // Get signing key
      const key = await client.getSigningKey(decoded.header.kid);
      const publicKey = key.getPublicKey();

      // Verify token
      const payload: any = jwt.verify(token, publicKey, {
        algorithms: ['RS256'],
        issuer,
      });

      // Sync Clerk user with database
      const user = await this.clerkSync.syncUser(
        payload.sub,
        payload.email,
        payload.name || payload.first_name || payload.username,
      );

      // Attach user data to request
      request.clerkUser = payload;
      request.user = user;

      return true;
    } catch (error) {
      console.error('Clerk token verification failed:', error);
      console.error('Error details:', {
        message: error.message,
        name: error.name,
      });
      throw new UnauthorizedException(`Invalid or expired token: ${error.message}`);
    }
  }
}
