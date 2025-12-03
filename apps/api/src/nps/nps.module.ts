import { Module } from '@nestjs/common';
import { NPSController } from './nps.controller';
import { NPSService } from './nps.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [NPSController],
  providers: [NPSService],
  exports: [NPSService],
})
export class NPSModule {}
