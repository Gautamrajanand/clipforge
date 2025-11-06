import { Module } from '@nestjs/common';
import { ProxyController } from './proxy.controller';
import { ProxyTokenService } from './proxy-token.service';
import { PrismaModule } from '../prisma/prisma.module';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [PrismaModule, StorageModule],
  controllers: [ProxyController],
  providers: [ProxyTokenService],
  exports: [ProxyTokenService],
})
export class ProxyModule {}
