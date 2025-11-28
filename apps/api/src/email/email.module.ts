import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ResendService } from './resend.service';
import { EmailSchedulerService } from './email-scheduler.service';

@Module({
  imports: [PrismaModule],
  providers: [EmailService, ResendService, EmailSchedulerService],
  exports: [EmailService, ResendService, EmailSchedulerService],
})
export class EmailModule {}
