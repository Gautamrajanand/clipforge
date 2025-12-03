import { Module } from '@nestjs/common';
import { PLGContentController, PLGContentUserController } from './plg-content.controller';
import { PLGContentService } from './plg-content.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [PLGContentController, PLGContentUserController],
  providers: [PLGContentService],
  exports: [PLGContentService],
})
export class PLGContentModule {}
