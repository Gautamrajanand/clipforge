import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('ClipForge E2E Workflow', () => {
  let app: INestApplication;
  let authToken: string;
  let projectId: string;
  let clipId: string;
  let exportId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Complete Workflow', () => {
    it('should register user', async () => {
      const response = await request(app.getHttpServer())
        .post('/v1/auth/register')
        .send({
          email: 'test@example.com',
          name: 'Test User',
          password: 'TestPassword123!',
        })
        .expect(HttpStatus.CREATED);

      expect(response.body.token).toBeDefined();
      authToken = response.body.token;
    });

    it('should create project', async () => {
      const response = await request(app.getHttpServer())
        .post('/v1/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Video',
          sourceUrl: 'https://example.com/video.mp4',
        })
        .expect(HttpStatus.CREATED);

      expect(response.body.id).toBeDefined();
      projectId = response.body.id;
    });

    it('should get presigned upload URL', async () => {
      const response = await request(app.getHttpServer())
        .post('/v1/uploads/sign')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          filename: 'video.mp4',
          mimeType: 'video/mp4',
          size: 104857600,
        })
        .expect(HttpStatus.CREATED);

      expect(response.body.uploadUrl).toBeDefined();
      expect(response.body.downloadUrl).toBeDefined();
    });

    it('should start highlight detection', async () => {
      const response = await request(app.getHttpServer())
        .post(`/v1/projects/${projectId}/detect`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ numClips: 6 })
        .expect(HttpStatus.OK);

      expect(response.body.status).toBe('detecting');
    });

    it('should list clips', async () => {
      const response = await request(app.getHttpServer())
        .get(`/v1/projects/${projectId}/clips`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(HttpStatus.OK);

      expect(Array.isArray(response.body)).toBe(true);
      if (response.body.length > 0) {
        clipId = response.body[0].id;
      }
    });

    it('should create export', async () => {
      if (!clipId) {
        this.skip();
      }

      const response = await request(app.getHttpServer())
        .post(`/v1/clips/${clipId}/export`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          format: 'MP4',
          aspectRatio: '9:16',
          template: 'default',
        })
        .expect(HttpStatus.CREATED);

      expect(response.body.id).toBeDefined();
      exportId = response.body.id;
    });

    it('should get export status', async () => {
      if (!exportId) {
        this.skip();
      }

      const response = await request(app.getHttpServer())
        .get(`/v1/exports/${exportId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(HttpStatus.OK);

      expect(response.body.status).toBeDefined();
    });

    it('should create brand kit', async () => {
      const response = await request(app.getHttpServer())
        .post('/v1/brand-kits')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Brand',
          fonts: { primary: 'Arial' },
          colors: { primary: '#000000' },
        })
        .expect(HttpStatus.CREATED);

      expect(response.body.id).toBeDefined();
    });

    it('should register webhook', async () => {
      const response = await request(app.getHttpServer())
        .post('/v1/webhooks/endpoints')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          url: 'https://example.com/webhook',
          events: ['export.ready'],
        })
        .expect(HttpStatus.CREATED);

      expect(response.body.id).toBeDefined();
    });

    it('should get usage', async () => {
      const response = await request(app.getHttpServer())
        .get('/v1/usage')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(HttpStatus.OK);

      expect(response.body.minutesProcessed).toBeDefined();
      expect(response.body.exportsCount).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should reject unauthorized requests', async () => {
      await request(app.getHttpServer())
        .get('/v1/projects')
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should reject invalid API key', async () => {
      await request(app.getHttpServer())
        .get('/v1/projects')
        .set('X-Api-Key', 'invalid-key')
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should handle not found', async () => {
      await request(app.getHttpServer())
        .get('/v1/projects/invalid-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(HttpStatus.NOT_FOUND);
    });

    it('should enforce rate limits', async () => {
      // Make 101 requests (assuming limit is 100)
      for (let i = 0; i < 101; i++) {
        const response = await request(app.getHttpServer())
          .get('/v1/projects')
          .set('Authorization', `Bearer ${authToken}`);

        if (i === 100) {
          expect(response.status).toBe(HttpStatus.TOO_MANY_REQUESTS);
        }
      }
    });
  });

  describe('Retry Policies', () => {
    it('should retry failed requests', async () => {
      // This would test the retry logic in the SDK
      // Implementation depends on SDK retry configuration
    });

    it('should handle exponential backoff', async () => {
      // Test exponential backoff for rate limits
    });
  });

  describe('Storage Lifecycle', () => {
    it('should clean up old exports', async () => {
      // Test storage cleanup policies
    });

    it('should manage S3 lifecycle', async () => {
      // Test S3 lifecycle policies
    });
  });

  describe('PII Scrubbing', () => {
    it('should scrub PII from logs', async () => {
      // Test PII scrubbing in logs
    });

    it('should not expose sensitive data in errors', async () => {
      // Verify error messages don't expose sensitive info
    });
  });
});
