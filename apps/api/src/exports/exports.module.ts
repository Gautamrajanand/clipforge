import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ExportsService } from './exports.service';
import { ExportsController } from './exports.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { StorageModule } from '../storage/storage.module';
import { OnboardingModule } from '../onboarding/onboarding.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    PrismaModule,
    StorageModule,
    HttpModule,
    OnboardingModule,
    AuthModule,
  ],
  providers: [ExportsService],
  controllers: [ExportsController],
  exports: [ExportsService],
})
export class ExportsModule {}
