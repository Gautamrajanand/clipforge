import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ClerkSyncService } from '../clerk-sync.service';
import * as jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { clerkClient } from '@clerk/clerk-sdk-node';

/**
 * ClerkAuthGuard - Validates Clerk JWT tokens
 * 
 * Verifies JWT tokens issued by Clerk and attaches user data to request
 */
@Injectable()
export class ClerkAuthGuard implements CanActivate {
  private readonly logger = new Logger(ClerkAuthGuard.name);

  constructor(
    private configService: ConfigService,
    private clerkSync: ClerkSyncService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (isPublic) {
      return true;
    }

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

      // Extract email from Clerk JWT (try multiple fields)
      let email = payload.email || 
                  payload.email_address ||
                  payload.primary_email_address ||
                  (payload.email_addresses && payload.email_addresses[0]?.email_address);
      
      // Extract name from Clerk JWT
      let name = payload.name || 
                 `${payload.first_name || ''} ${payload.last_name || ''}`.trim() ||
                 payload.username ||
                 'User';

      // If no email in JWT or it's a clerk.local email, fetch from Clerk API
      if (!email || email.includes('@clerk.local')) {
        try {
          this.logger.log(`📧 Email not in JWT (${email}), fetching from Clerk API for user ${payload.sub}`);
          const clerkUser = await clerkClient.users.getUser(payload.sub);
          
          // Get primary email
          const primaryEmail = clerkUser.emailAddresses.find(
            e => e.id === clerkUser.primaryEmailAddressId
          );
          
          if (primaryEmail) {
            email = primaryEmail.emailAddress;
            this.logger.log(`✅ Retrieved email from Clerk API: ${email}`);
          }
          
          // Get full name if not in JWT
          if (!name || name === 'User') {
            name = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 
                   clerkUser.username || 
                   'User';
          }
        } catch (error) {
          this.logger.error(`❌ Failed to fetch user from Clerk API:`, error.message);
          // Continue with whatever email we have (might be clerk.local)
        }
      }

      // Sync Clerk user with database
      const user = await this.clerkSync.syncUser(
        payload.sub,
        email,
        name,
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
