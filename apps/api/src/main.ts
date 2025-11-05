import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security - configure helmet to allow video streaming
  app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginEmbedderPolicy: false,
  }));

  // CORS
  app.enableCors({
    origin: true, // Allow all origins for demo
    credentials: true,
    exposedHeaders: ['Content-Length', 'Content-Type', 'Accept-Ranges'],
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
    .setDescription('AI video/audio clipping platform API')
    .setVersion('1.0.0')
    .addBearerAuth()
    .addApiKey({ type: 'apiKey', name: 'X-Api-Key', in: 'header' }, 'api-key')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.API_PORT || 3000;
  await app.listen(port, process.env.API_HOST || '0.0.0.0');
  console.log(`🚀 ClipForge API running on http://localhost:${port}`);
}

bootstrap();
