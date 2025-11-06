import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { IngestionService } from './ingestion.service';
import { IngestionController } from './ingestion.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { JobsModule } from '../jobs/jobs.module';
import { ProxyModule } from '../proxy/proxy.module';

@Module({
  imports: [PrismaModule, JobsModule, HttpModule, ProxyModule],
  providers: [IngestionService],
  controllers: [IngestionController],
})
export class IngestionModule {}
