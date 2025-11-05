import { Module } from '@nestjs/common';
import { IngestionService } from './ingestion.service';
import { IngestionController } from './ingestion.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { JobsModule } from '../jobs/jobs.module';

@Module({
  imports: [PrismaModule, JobsModule],
  providers: [IngestionService],
  controllers: [IngestionController],
})
export class IngestionModule {}
