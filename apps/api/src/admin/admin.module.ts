import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminPLGController } from './admin-plg.controller';
import { AdminService } from './admin.service';
import { AnalyticsService } from './analytics.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { EmailModule } from '../email/email.module';
import { ReferralsModule } from '../referrals/referrals.module';

@Module({
  imports: [PrismaModule, AuthModule, EmailModule, ReferralsModule],
  controllers: [AdminController, AdminPLGController],
  providers: [AdminService, AnalyticsService],
  exports: [AdminService, AnalyticsService],
})
export class AdminModule {}
