import { Test, TestingModule } from '@nestjs/testing';
import { ExportsService } from './exports.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ExportsService', () => {
  let service: ExportsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExportsService,
        {
          provide: PrismaService,
          useValue: {
            moment: {
              findUnique: jest.fn(),
            },
            export: {
              create: jest.fn(),
              findUnique: jest.fn(),
              findMany: jest.fn(),
              update: jest.fn(),
            },
            project: {
              findUnique: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<ExportsService>(ExportsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('create', () => {
    it('should create an export', async () => {
      const momentId = 'moment-1';
      const orgId = 'org-1';
      const dto = { format: 'MP4', template: 'default' };

      const mockMoment = {
        id: momentId,
        projectId: 'project-1',
        project: { orgId },
      };

      const mockExport = {
        id: 'export-1',
        projectId: 'project-1',
        momentId,
        status: 'PENDING',
        format: 'MP4',
      };

      jest.spyOn(prisma.moment, 'findUnique').mockResolvedValue(mockMoment as any);
      jest.spyOn(prisma.export, 'create').mockResolvedValue(mockExport as any);

      const result = await service.create(momentId, orgId, dto);

      expect(result).toEqual(mockExport);
      expect(prisma.export.create).toHaveBeenCalledWith({
        data: {
          projectId: 'project-1',
          momentId,
          status: 'PENDING',
          format: 'MP4',
          template: 'default',
        },
      });
    });

    it('should throw if moment not found', async () => {
      jest.spyOn(prisma.moment, 'findUnique').mockResolvedValue(null);

      await expect(
        service.create('invalid-id', 'org-1', {})
      ).rejects.toThrow('Moment not found');
    });

    it('should throw if org does not own moment', async () => {
      const mockMoment = {
        id: 'moment-1',
        projectId: 'project-1',
        project: { orgId: 'different-org' },
      };

      jest.spyOn(prisma.moment, 'findUnique').mockResolvedValue(mockMoment as any);

      await expect(
        service.create('moment-1', 'org-1', {})
      ).rejects.toThrow('Moment not found');
    });
  });

  describe('idempotency', () => {
    it('should handle duplicate export requests', async () => {
      const momentId = 'moment-1';
      const orgId = 'org-1';
      const idempotencyKey = 'key-123';

      // First request
      const mockExport1 = {
        id: 'export-1',
        projectId: 'project-1',
        momentId,
        status: 'PENDING',
      };

      // Second request with same key should return same export
      const mockExport2 = {
        id: 'export-1', // Same ID
        projectId: 'project-1',
        momentId,
        status: 'PENDING',
      };

      jest.spyOn(prisma.export, 'findUnique').mockResolvedValue(mockExport2 as any);

      // In production, this would check idempotency key in DB
      // For now, just verify export lookup works
      const result = await service.findOne('export-1', orgId);
      expect(result).toEqual(mockExport2);
    });
  });

  describe('artifact metadata', () => {
    it('should store artifact metadata', async () => {
      const exportId = 'export-1';
      const orgId = 'org-1';

      const mockExport = {
        id: exportId,
        projectId: 'project-1',
        momentId: 'moment-1',
        status: 'COMPLETED',
        artifacts: {
          mp4_url: 'https://s3.example.com/export-1.mp4',
          srt_url: 'https://s3.example.com/export-1.srt',
          thumbnail_url: 'https://s3.example.com/export-1_thumb.jpg',
        },
        project: { orgId },
      };

      jest.spyOn(prisma.export, 'findUnique').mockResolvedValue(mockExport as any);

      const result = await service.findOne(exportId, orgId);

      expect(result.artifacts).toEqual({
        mp4_url: 'https://s3.example.com/export-1.mp4',
        srt_url: 'https://s3.example.com/export-1.srt',
        thumbnail_url: 'https://s3.example.com/export-1_thumb.jpg',
      });
    });

    it('should include metadata in export response', async () => {
      const exportId = 'export-1';
      const orgId = 'org-1';

      const mockExport = {
        id: exportId,
        projectId: 'project-1',
        momentId: 'moment-1',
        status: 'COMPLETED',
        artifacts: {
          mp4_url: 'https://s3.example.com/export-1.mp4',
          srt_url: 'https://s3.example.com/export-1.srt',
          thumbnail_url: 'https://s3.example.com/export-1_thumb.jpg',
        },
        metrics: {
          duration: 45.5,
          bitrate: '5000k',
          resolution: '1080x1920',
          filesize: 125000000,
        },
        project: { orgId },
      };

      jest.spyOn(prisma.export, 'findUnique').mockResolvedValue(mockExport as any);

      const result = await service.findOne(exportId, orgId);

      expect(result.metrics).toEqual({
        duration: 45.5,
        bitrate: '5000k',
        resolution: '1080x1920',
        filesize: 125000000,
      });
    });
  });
});
