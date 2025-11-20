import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ProjectsModule } from './projects/projects.module';
import { IngestionModule } from './ingestion/ingestion.module';
import { ClipsModule } from './clips/clips.module';
import { ExportsModule } from './exports/exports.module';
import { BrandKitsModule } from './brand-kits/brand-kits.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { UsageModule } from './usage/usage.module';
import { JobsModule } from './jobs/jobs.module';
import { StorageModule } from './storage/storage.module';
import { ProxyModule } from './proxy/proxy.module';
import { CaptionsModule } from './captions/captions.module';
import { QueuesModule } from './queues/queues.module';
import { HealthModule } from './health/health.module';
import { CreditsModule } from './credits/credits.module';
// import { EmailModule } from './email/email.module'; // TEMPORARILY DISABLED

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    HealthModule, // Health checks for monitoring
    QueuesModule, // Job queue system for scalability
    CreditsModule, // Credit system for billing (Opus Clip parity)
    // EmailModule, // Email notifications // TEMPORARILY DISABLED
    AuthModule,
    ProjectsModule,
    IngestionModule,
    ClipsModule,
    ExportsModule,
    BrandKitsModule,
    WebhooksModule,
    UsageModule,
    JobsModule,
    StorageModule,
    ProxyModule,
    CaptionsModule,
  ],
})
export class AppModule {}
