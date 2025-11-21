import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { CreditsService } from './credits.service';
import { CreditsCronService } from './credits-cron.service';
import { CreditsController } from './credits.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule, // For ClerkAuthGuard
    ScheduleModule.forRoot(), // Enable cron jobs
  ],
  controllers: [CreditsController],
  providers: [CreditsService, CreditsCronService],
  exports: [CreditsService],
})
export class CreditsModule {}
