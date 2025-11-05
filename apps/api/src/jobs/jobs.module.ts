import { Module } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [JobsService],
  exports: [JobsService],
})
export class JobsModule {}
