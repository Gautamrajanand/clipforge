import { Module } from '@nestjs/common';
import { ClipsService } from './clips.service';
import { ClipsController } from './clips.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [ClipsService],
  controllers: [ClipsController],
  exports: [ClipsService],
})
export class ClipsModule {}
