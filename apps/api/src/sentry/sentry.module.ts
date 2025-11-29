import { Module, Global } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import * as Sentry from '@sentry/node';
import { SentryInterceptor } from './sentry.interceptor';

@Global()
@Module({
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: SentryInterceptor,
    },
  ],
  exports: [],
})
export class SentryModule {
  constructor() {
    // Initialize Sentry
    if (process.env.SENTRY_DSN) {
      Sentry.init({
        dsn: process.env.SENTRY_DSN,
        environment: process.env.NODE_ENV || 'development',
        tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
        
        // Performance monitoring
        integrations: [
          Sentry.httpIntegration(),
        ],

        // Filter out sensitive data
        beforeSend(event, hint) {
          // Remove sensitive headers
          if (event.request?.headers) {
            delete event.request.headers.authorization;
            delete event.request.headers.cookie;
          }

          // Remove sensitive query params
          if (event.request?.query_string) {
            const params = new URLSearchParams(event.request.query_string);
            if (params.has('token')) params.delete('token');
            if (params.has('apiKey')) params.delete('apiKey');
            event.request.query_string = params.toString();
          }

          return event;
        },

        // Ignore certain errors
        ignoreErrors: [
          'UnauthorizedException',
          'NotFoundException',
          'BadRequestException',
          'ForbiddenException',
        ],
      });

      console.log('✅ Sentry initialized:', {
        environment: process.env.NODE_ENV,
        dsn: process.env.SENTRY_DSN ? '***configured***' : 'missing',
      });
    } else {
      console.warn('⚠️  Sentry DSN not configured. Error tracking disabled.');
    }
  }
}
