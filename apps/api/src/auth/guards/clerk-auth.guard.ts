import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { verifyToken } from '@clerk/clerk-sdk-node';
import { ClerkSyncService } from '../clerk-sync.service';

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
      // Verify Clerk JWT token
      const secretKey = this.configService.get<string>('CLERK_SECRET_KEY');
      if (!secretKey) {
        throw new Error('CLERK_SECRET_KEY not configured');
      }

      const payload = await verifyToken(token, {
        secretKey,
        issuer: (iss) => iss.startsWith('https://'),
      });

      // Sync Clerk user with database
      const user = await this.clerkSync.syncUser(
        payload.sub,
        payload.email as string,
        payload.name as string,
      );

      // Attach user data to request
      request.clerkUser = payload;
      request.user = user;

      return true;
    } catch (error) {
      console.error('Clerk token verification failed:', error);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
