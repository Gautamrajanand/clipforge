import { Module } from '@nestjs/common';
import { TrialService } from './trial.service';
import { TrialController } from './trial.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [TrialService],
  controllers: [TrialController],
  exports: [TrialService],
})
export class TrialModule {}
