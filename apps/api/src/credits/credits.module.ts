import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { CreditsService } from './credits.service';
import { CreditsCronService } from './credits-cron.service';
import { CreditMonitorService } from './credit-monitor.service';
import { CreditsController } from './credits.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { AnalyticsModule } from '../analytics/analytics.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule, // For ClerkAuthGuard
    AnalyticsModule, // For analytics tracking
    EmailModule, // For PLG email triggers
    ScheduleModule.forRoot(), // Enable cron jobs
  ],
  controllers: [CreditsController],
  providers: [CreditsService, CreditsCronService, CreditMonitorService],
  exports: [CreditsService, CreditMonitorService],
})
export class CreditsModule {}
