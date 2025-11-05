import { Module } from '@nestjs/common';
import { BrandKitsService } from './brand-kits.service';
import { BrandKitsController } from './brand-kits.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [BrandKitsService],
  controllers: [BrandKitsController],
  exports: [BrandKitsService],
})
export class BrandKitsModule {}
