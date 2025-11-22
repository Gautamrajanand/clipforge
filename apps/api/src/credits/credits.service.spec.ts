import { Test, TestingModule } from '@nestjs/testing';
import { CreditsService } from './credits.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';

describe('CreditsService', () => {
  let service: CreditsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    organization: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    creditTransaction: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreditsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<CreditsService>(CreditsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('calculateCredits', () => {
    it('should calculate 1 credit per minute', () => {
      // 60 seconds = 1 minute = 1 credit
      expect(service.calculateCredits(60)).toBe(1);
    });

    it('should round up partial minutes', () => {
      // 61 seconds = 1.02 minutes = 2 credits (rounded up)
      expect(service.calculateCredits(61)).toBe(2);
    });

    it('should handle 10 minute video', () => {
      // 600 seconds = 10 minutes = 10 credits
      expect(service.calculateCredits(600)).toBe(10);
    });

    it('should handle zero duration', () => {
      expect(service.calculateCredits(0)).toBe(0);
    });

    it('should handle very short videos', () => {
      // 30 seconds = 0.5 minutes = 1 credit (rounded up)
      expect(service.calculateCredits(30)).toBe(1);
    });
  });

  describe('getBalance', () => {
    it('should return organization credits', async () => {
      const mockOrg = { id: 'org-1', credits: 150 };
      mockPrismaService.organization.findUnique.mockResolvedValue(mockOrg);

      const balance = await service.getBalance('org-1');

      expect(balance).toBe(150);
      expect(prisma.organization.findUnique).toHaveBeenCalledWith({
        where: { id: 'org-1' },
        select: { credits: true },
      });
    });

    it('should return 0 if organization not found', async () => {
      mockPrismaService.organization.findUnique.mockResolvedValue(null);

      const balance = await service.getBalance('org-999');

      expect(balance).toBe(0);
    });
  });

  describe('hasSufficientCredits', () => {
    it('should return true when credits are sufficient', async () => {
      const mockOrg = { id: 'org-1', credits: 100 };
      mockPrismaService.organization.findUnique.mockResolvedValue(mockOrg);

      const result = await service.hasSufficientCredits('org-1', 50);

      expect(result).toBe(true);
    });

    it('should return false when credits are insufficient', async () => {
      const mockOrg = { id: 'org-1', credits: 30 };
      mockPrismaService.organization.findUnique.mockResolvedValue(mockOrg);

      const result = await service.hasSufficientCredits('org-1', 50);

      expect(result).toBe(false);
    });

    it('should return false when credits are exactly equal', async () => {
      const mockOrg = { id: 'org-1', credits: 50 };
      mockPrismaService.organization.findUnique.mockResolvedValue(mockOrg);

      const result = await service.hasSufficientCredits('org-1', 50);

      expect(result).toBe(false); // Need MORE than required
    });

    it('should return false when organization not found', async () => {
      mockPrismaService.organization.findUnique.mockResolvedValue(null);

      const result = await service.hasSufficientCredits('org-999', 10);

      expect(result).toBe(false);
    });
  });

  describe('deductCredits', () => {
    it('should deduct credits and create transaction', async () => {
      const mockOrg = { id: 'org-1', credits: 100 };
      mockPrismaService.organization.findUnique.mockResolvedValue(mockOrg);
      mockPrismaService.organization.update.mockResolvedValue({
        ...mockOrg,
        credits: 90,
      });
      mockPrismaService.creditTransaction.create.mockResolvedValue({});

      await service.deductCredits(
        'org-1',
        10,
        'CLIPS',
        'project-1',
        10,
        'Test deduction',
      );

      expect(prisma.organization.update).toHaveBeenCalledWith({
        where: { id: 'org-1' },
        data: { credits: { decrement: 10 } },
      });

      expect(prisma.creditTransaction.create).toHaveBeenCalledWith({
        data: {
          orgId: 'org-1',
          amount: -10,
          balanceBefore: 100,
          balanceAfter: 90,
          type: 'DEDUCTION_CLIPS',
          projectId: 'project-1',
          description: 'Test deduction',
        },
      });
    });

    it('should throw error when insufficient credits', async () => {
      const mockOrg = { id: 'org-1', credits: 5 };
      mockPrismaService.organization.findUnique.mockResolvedValue(mockOrg);

      await expect(
        service.deductCredits('org-1', 10, 'CLIPS', 'project-1', 10, 'Test'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('addCredits', () => {
    it('should add credits and create transaction', async () => {
      const mockOrg = { id: 'org-1', credits: 100 };
      mockPrismaService.organization.findUnique.mockResolvedValue(mockOrg);
      mockPrismaService.organization.update.mockResolvedValue({
        ...mockOrg,
        credits: 150,
      });
      mockPrismaService.creditTransaction.create.mockResolvedValue({});

      await service.addCredits('org-1', 50, 'ADDITION_PURCHASE', 'Subscription upgrade');

      expect(prisma.organization.update).toHaveBeenCalledWith({
        where: { id: 'org-1' },
        data: { credits: { increment: 50 } },
      });

      expect(prisma.creditTransaction.create).toHaveBeenCalledWith({
        data: {
          orgId: 'org-1',
          amount: 50,
          balanceBefore: 100,
          balanceAfter: 150,
          type: 'ADDITION_PURCHASE',
          description: 'Subscription upgrade',
        },
      });
    });
  });

  describe('getTransactionHistory', () => {
    it('should return transaction history', async () => {
      const mockTransactions = [
        {
          id: 'tx-1',
          amount: -10,
          type: 'DEDUCTION_CLIPS',
          createdAt: new Date(),
        },
        {
          id: 'tx-2',
          amount: 150,
          type: 'ADDITION_PURCHASE',
          createdAt: new Date(),
        },
      ];

      mockPrismaService.creditTransaction.findMany.mockResolvedValue(
        mockTransactions,
      );

      const result = await service.getTransactionHistory('org-1');

      expect(result).toEqual(mockTransactions);
      expect(prisma.creditTransaction.findMany).toHaveBeenCalledWith({
        where: { orgId: 'org-1' },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle very large video durations', () => {
      // 2 hours = 7200 seconds = 120 minutes = 120 credits
      expect(service.calculateCredits(7200)).toBe(120);
    });

    it('should handle negative duration gracefully', () => {
      expect(service.calculateCredits(-10)).toBe(0);
    });

    it('should handle decimal durations', () => {
      // 90.5 seconds = 1.51 minutes = 2 credits
      expect(service.calculateCredits(90.5)).toBe(2);
    });
  });
});
