import { Module, forwardRef } from '@nestjs/common';
import { EmailService } from './email.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ResendService } from './resend.service';
import { EmailSchedulerService } from './email-scheduler.service';
import { EmailTestController } from './email-test.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, forwardRef(() => AuthModule)],
  controllers: [EmailTestController],
  providers: [EmailService, ResendService, EmailSchedulerService],
  exports: [EmailService, ResendService, EmailSchedulerService],
})
export class EmailModule {}
