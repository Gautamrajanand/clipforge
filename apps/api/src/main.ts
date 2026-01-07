import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';

export async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false, // Disable default body parser
    logger: ['error', 'warn', 'log'], // Enable logging
  });

  // Increase max HTTP header size and connections for high concurrency
  const server = app.getHttpServer();
  server.maxHeadersCount = 2000; // Increase from default 2000
  server.timeout = 30000; // 30 second timeout
  server.keepAliveTimeout = 65000; // 65 seconds (higher than ALB default)
  server.headersTimeout = 66000; // Slightly higher than keepAliveTimeout

  // Custom body parser with 5GB limit for video uploads
  app.use(bodyParser.json({ limit: '5gb' }));
  app.use(bodyParser.urlencoded({ limit: '5gb', extended: true }));

  // Security - Enhanced helmet configuration
  app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "https:"],
        fontSrc: ["'self'", "data:"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'", "https:"],
        frameSrc: ["'none'"],
      },
    },
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    noSniff: true,
    xssFilter: true,
    hidePoweredBy: true,
  }));

  // CORS - Restrict to known origins in production
  const allowedOrigins = process.env.NODE_ENV === 'production'
    ? [
        'https://clipforge.ai',
        'https://www.clipforge.ai',
        'https://clipforge-seven.vercel.app',
        'https://app.clipforge.ai',
        process.env.FRONTEND_URL,
      ].filter(Boolean)
    : true; // Allow all in development

  console.log('🌐 CORS Configuration:', {
    nodeEnv: process.env.NODE_ENV,
    allowedOrigins: Array.isArray(allowedOrigins) ? allowedOrigins : 'all',
  });

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
    exposedHeaders: ['Content-Length', 'Content-Type', 'Accept-Ranges'],
    maxAge: 86400, // 24 hours
  });

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger/OpenAPI
  const config = new DocumentBuilder()
    .setTitle('ClipForge API')
    .setDescription(
      'ClipForge API - AI-powered video clipping platform\n\n' +
      '## Authentication\n' +
      'All endpoints require a valid Clerk JWT token in the Authorization header:\n' +
      '```\nAuthorization: Bearer <clerk-jwt-token>\n```\n\n' +
      '## Rate Limiting\n' +
      '- **Short-term:** 100 requests per minute per IP/user\n' +
      '- **Long-term:** 1000 requests per hour per IP/user\n' +
      '- **Headers:** `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`\n' +
      '- **Response:** 429 Too Many Requests when limit exceeded\n' +
      '- **Retry-After:** Header indicates when to retry\n\n' +
      '## Credits System\n' +
      '- 1 credit = 1 minute of video processing\n' +
      '- FREE: 60 credits/mo (rollover to 120)\n' +
      '- STARTER: 150 credits/mo (rollover to 300)\n' +
      '- PRO: 300 credits/mo (rollover to 600)\n\n' +
      '## Free Trial\n' +
      '- New users get 7-day STARTER trial\n' +
      '- 150 credits during trial\n' +
      '- Auto-downgrade to FREE after trial\n\n' +
      '## Base URL\n' +
      '- Development: http://localhost:3000\n' +
      '- Production: https://api.clipforge.ai'
    )
    .setVersion('1.1.0')
    .setContact(
      'ClipForge Support',
      'https://clipforge.ai',
      'support@clipforge.ai'
    )
    .setLicense('Proprietary', 'https://clipforge.ai/license')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter your Clerk JWT token',
        in: 'header',
      },
      'clerk-jwt',
    )
    .addTag('Authentication', 'User authentication and authorization')
    .addTag('Credits', 'Credit balance and transaction management')
    .addTag('Projects', 'Video project CRUD operations')
    .addTag('Upload', 'Video file upload and URL import')
    .addTag('Clips', 'AI clip detection and management')
    .addTag('Reframe', 'AI video reframing (aspect ratio conversion)')
    .addTag('Subtitles', 'AI subtitle generation and styling')
    .addTag('Export', 'Video export and rendering')
    .addTag('Payments', 'Stripe and Razorpay payment integration')
    .addTag('Subscriptions', 'Subscription management')
    .addTag('Trial', 'Free trial management')
    .addTag('Admin', 'Admin panel endpoints')
    .addTag('Webhooks', 'Payment gateway webhooks')
    .addServer('http://localhost:3000', 'Development')
    .addServer('https://api.clipforge.ai', 'Production')
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
  });
  
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'ClipForge API Documentation',
    customfavIcon: 'https://clipforge.ai/favicon.ico',
    customCss: '.swagger-ui .topbar { display: none }',
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
    },
  });

  const port = process.env.API_PORT || 3000;
  await app.listen(port, process.env.API_HOST || '0.0.0.0', () => {
    console.log(`🚀 ClipForge API running on http://localhost:${port}`);
    console.log(`📊 Server optimizations:`);
    console.log(`   - Max headers: ${server.maxHeadersCount}`);
    console.log(`   - Timeout: ${server.timeout}ms`);
    console.log(`   - Keep-alive: ${server.keepAliveTimeout}ms`);
  });
}

// Only run bootstrap if this file is executed directly (not imported by cluster.ts)
if (require.main === module) {
  bootstrap();
}
