import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Admin Guard
 * 
 * Protects routes that require admin access.
 * Must be used AFTER ClerkAuthGuard to ensure user is authenticated.
 * 
 * Usage:
 * @UseGuards(ClerkAuthGuard, AdminGuard)
 * @Get('admin/users')
 * async getUsers() { ... }
 */
@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.id) {
      throw new UnauthorizedException('User not authenticated');
    }

    // Check if user is admin - try by ID first, then by email
    let dbUser = await this.prisma.user.findUnique({
      where: { id: user.id },
      select: { isAdmin: true, email: true },
    });

    // If not found by ID, try by email (for Clerk users)
    if (!dbUser && user.email) {
      dbUser = await this.prisma.user.findUnique({
        where: { email: user.email },
        select: { isAdmin: true, email: true },
      });
    }

    console.log('Admin check:', { 
      userId: user.id, 
      userEmail: user.email,
      dbUser,
      isAdmin: dbUser?.isAdmin 
    });

    if (!dbUser || !dbUser.isAdmin) {
      throw new ForbiddenException('Admin access required');
    }

    return true;
  }
}
