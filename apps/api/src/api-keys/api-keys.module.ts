import { Module } from '@nestjs/common';
import { ApiKeysService } from './api-keys.service';
import { ApiKeysController } from './api-keys.controller';
import { ApiKeyAuthGuard } from './guards/api-key-auth.guard';
import { RateLimitGuard } from './guards/rate-limit.guard';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ApiKeysController],
  providers: [ApiKeysService, ApiKeyAuthGuard, RateLimitGuard],
  exports: [ApiKeysService, ApiKeyAuthGuard, RateLimitGuard],
})
export class ApiKeysModule {}
