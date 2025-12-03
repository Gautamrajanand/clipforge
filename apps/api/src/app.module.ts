import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
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
import { ApiKeysModule } from './api-keys/api-keys.module';
import { PaymentsModule } from './payments/payments.module';
import { EmailModule } from './email/email.module';
import { AdminModule } from './admin/admin.module';
import { TrialModule } from './trial/trial.module';
import { ReferralsModule } from './referrals/referrals.module';
import { OnboardingModule } from './onboarding/onboarding.module';
import { NPSModule } from './nps/nps.module';
import { PLGContentModule } from './plg-content/plg-content.module';
import { CacheModule } from './cache/cache.module';
// import { SentryModule } from './sentry/sentry.module'; // TEMPORARILY DISABLED - missing deps in Docker

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // SentryModule, // Error tracking and monitoring - TEMPORARILY DISABLED
    CacheModule, // Redis caching for performance
    // Rate Limiting: Increased for load testing and high concurrency
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 60000, // 1 minute in milliseconds
        limit: 10000, // 10,000 requests per minute (increased for load testing)
      },
      {
        name: 'long',
        ttl: 3600000, // 1 hour in milliseconds
        limit: 100000, // 100,000 requests per hour (increased for load testing)
      },
    ]),
    PrismaModule,
    HealthModule, // Health checks for monitoring
    QueuesModule, // Job queue system for scalability
    CreditsModule, // Credit system for billing (Opus Clip parity)
    ApiKeysModule, // API key management for external API access
    PaymentsModule, // Payment gateway integration (Stripe + Razorpay)
    EmailModule, // Email notifications and cron jobs
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
    AdminModule,
    TrialModule,
    ReferralsModule, // PLG growth engine - referral system
    OnboardingModule, // PLG growth engine - onboarding flow
    NPSModule, // PLG growth engine - NPS & feedback
    PLGContentModule, // PLG growth engine - content management
  ],
  providers: [
    // Global rate limiting guard
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
