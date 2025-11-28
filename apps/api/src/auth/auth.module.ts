import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { ApiKeyStrategy } from './strategies/api-key.strategy';
import { ClerkAuthGuard } from './guards/clerk-auth.guard';
import { ClerkSyncService } from './clerk-sync.service';
import { PrismaModule } from '../prisma/prisma.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    PrismaModule,
    ConfigModule,
    EmailModule, // For PLG welcome emails
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'dev-secret',
      signOptions: { expiresIn: (process.env.JWT_EXPIRY || '24h') as any },
    }),
  ],
  providers: [AuthService, JwtStrategy, ApiKeyStrategy, ClerkAuthGuard, ClerkSyncService],
  controllers: [AuthController],
  exports: [AuthService, ClerkAuthGuard, ClerkSyncService],
})
export class AuthModule {}
