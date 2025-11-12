import { Module } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';
import { WebhooksController } from './webhooks.controller';
import { AssemblyAIWebhookController } from './assemblyai-webhook.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [WebhooksService],
  controllers: [WebhooksController, AssemblyAIWebhookController],
  exports: [WebhooksService],
})
export class WebhooksModule {}
