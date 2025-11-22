import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsService } from './payments.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

describe('PaymentsService', () => {
  let service: PaymentsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    organization: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    creditTransaction: {
      create: jest.fn(),
    },
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config = {
        STRIPE_SECRET_KEY: 'sk_test_mock',
        STRIPE_WEBHOOK_SECRET: 'whsec_mock',
      };
      return config[key];
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Subscription Webhook Handling', () => {
    it('should add credits when subscription is created', async () => {
      const mockOrg = {
        id: 'org-1',
        credits: 60,
        tier: 'FREE',
      };

      const mockSubscription = {
        id: 'sub_123',
        customer: 'cus_123',
        metadata: { tier: 'STARTER' },
        current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
      } as Stripe.Subscription;

      mockPrismaService.organization.findFirst.mockResolvedValue(mockOrg);
      mockPrismaService.organization.update.mockResolvedValue({
        ...mockOrg,
        credits: 210, // 60 + 150
        tier: 'STARTER',
      });

      await service['handleSubscriptionUpdated'](mockSubscription);

      expect(prisma.organization.update).toHaveBeenCalledWith({
        where: { id: 'org-1' },
        data: {
          tier: 'STARTER',
          stripeSubscriptionId: 'sub_123',
          stripeCurrentPeriodEnd: expect.any(Date),
          credits: { increment: 150 },
        },
      });

      expect(prisma.creditTransaction.create).toHaveBeenCalledWith({
        data: {
          orgId: 'org-1',
          amount: 150,
          balanceBefore: 60,
          balanceAfter: 210,
          type: 'ADDITION_PURCHASE',
          description: 'STARTER subscription activated - monthly credits',
        },
      });
    });

    it('should add 300 credits for PRO tier', async () => {
      const mockOrg = {
        id: 'org-1',
        credits: 60,
        tier: 'FREE',
      };

      const mockSubscription = {
        id: 'sub_123',
        customer: 'cus_123',
        metadata: { tier: 'PRO' },
        current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
      } as Stripe.Subscription;

      mockPrismaService.organization.findFirst.mockResolvedValue(mockOrg);
      mockPrismaService.organization.update.mockResolvedValue({
        ...mockOrg,
        credits: 360,
        tier: 'PRO',
      });

      await service['handleSubscriptionUpdated'](mockSubscription);

      expect(prisma.organization.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            credits: { increment: 300 },
          }),
        }),
      );
    });

    it('should add 1000 credits for BUSINESS tier', async () => {
      const mockOrg = {
        id: 'org-1',
        credits: 60,
        tier: 'FREE',
      };

      const mockSubscription = {
        id: 'sub_123',
        customer: 'cus_123',
        metadata: { tier: 'BUSINESS' },
        current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
      } as Stripe.Subscription;

      mockPrismaService.organization.findFirst.mockResolvedValue(mockOrg);
      mockPrismaService.organization.update.mockResolvedValue({
        ...mockOrg,
        credits: 1060,
        tier: 'BUSINESS',
      });

      await service['handleSubscriptionUpdated'](mockSubscription);

      expect(prisma.organization.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            credits: { increment: 1000 },
          }),
        }),
      );
    });

    it('should handle organization not found', async () => {
      const mockSubscription = {
        id: 'sub_123',
        customer: 'cus_999',
        metadata: { tier: 'STARTER' },
        current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
      } as Stripe.Subscription;

      mockPrismaService.organization.findFirst.mockResolvedValue(null);

      // Should not throw, just log warning
      await expect(
        service['handleSubscriptionUpdated'](mockSubscription),
      ).resolves.not.toThrow();

      expect(prisma.organization.update).not.toHaveBeenCalled();
    });
  });

  describe('Subscription Cancellation', () => {
    it('should downgrade to FREE tier on cancellation', async () => {
      const mockOrg = {
        id: 'org-1',
        credits: 150,
        tier: 'STARTER',
      };

      const mockSubscription = {
        id: 'sub_123',
        customer: 'cus_123',
        status: 'canceled',
      } as Stripe.Subscription;

      mockPrismaService.organization.findFirst.mockResolvedValue(mockOrg);
      mockPrismaService.organization.update.mockResolvedValue({
        ...mockOrg,
        tier: 'FREE',
      });

      await service['handleSubscriptionDeleted'](mockSubscription);

      expect(prisma.organization.update).toHaveBeenCalledWith({
        where: { id: 'org-1' },
        data: {
          tier: 'FREE',
          stripeSubscriptionId: null,
          stripeCurrentPeriodEnd: null,
        },
      });
    });
  });

  describe('Price ID Mapping', () => {
    it('should have correct Stripe price IDs', () => {
      const plans = service['plans'];

      expect(plans.STARTER.stripe.monthly).toBe('price_1SWBfe62BJnrL0SqUcbjUWR8');
      expect(plans.PRO.stripe.monthly).toBe('price_1SWBiG62BJnrL0SqYZu4Adx9');
      expect(plans.BUSINESS.stripe.monthly).toBe('price_1SWBjo62BJnrL0SqAGKawrxE');
    });

    it('should have correct pricing amounts', () => {
      const plans = service['plans'];

      expect(plans.STARTER.amount).toBe(2900); // $29
      expect(plans.PRO.amount).toBe(7900); // $79
      expect(plans.BUSINESS.amount).toBe(9900); // $99
    });
  });

  describe('Checkout Session Creation', () => {
    it('should create checkout session with correct parameters', async () => {
      const mockOrg = {
        id: 'org-1',
        stripeCustomerId: 'cus_123',
      };

      mockPrismaService.organization.findUnique.mockResolvedValue(mockOrg);

      // Mock Stripe checkout session creation
      const createSessionSpy = jest.spyOn(
        service['stripe'].checkout.sessions,
        'create',
      );
      createSessionSpy.mockResolvedValue({
        id: 'cs_123',
        url: 'https://checkout.stripe.com/pay/cs_123',
      } as any);

      const result = await service.createCheckoutSession(
        'org-1',
        'STARTER',
        'monthly',
      );

      expect(result.url).toBe('https://checkout.stripe.com/pay/cs_123');
      expect(createSessionSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          customer: 'cus_123',
          mode: 'subscription',
          line_items: [
            {
              price: 'price_1SWBfe62BJnrL0SqUcbjUWR8',
              quantity: 1,
            },
          ],
        }),
      );

      createSessionSpy.mockRestore();
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing metadata gracefully', async () => {
      const mockOrg = {
        id: 'org-1',
        credits: 60,
        tier: 'FREE',
      };

      const mockSubscription = {
        id: 'sub_123',
        customer: 'cus_123',
        metadata: {}, // No tier in metadata
        current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
      } as Stripe.Subscription;

      mockPrismaService.organization.findFirst.mockResolvedValue(mockOrg);
      mockPrismaService.organization.update.mockResolvedValue({
        ...mockOrg,
        credits: 360,
        tier: 'PRO', // Default to PRO
      });

      await service['handleSubscriptionUpdated'](mockSubscription);

      // Should default to PRO tier (300 credits)
      expect(prisma.organization.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            tier: 'PRO',
            credits: { increment: 300 },
          }),
        }),
      );
    });
  });
});
