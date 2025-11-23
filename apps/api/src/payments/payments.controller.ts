import {
  Controller,
  Post,
  Get,
  Body,
  Request,
  UseGuards,
  BadRequestException,
  Headers,
  RawBodyRequest,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiBody } from '@nestjs/swagger';
import { ClerkAuthGuard } from '../auth/guards/clerk-auth.guard';
import { PaymentsService } from './payments.service';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import * as crypto from 'crypto';

@ApiTags('Payments')
@Controller('v1/payments')
export class PaymentsController {
  private stripe: Stripe;

  constructor(
    private paymentsService: PaymentsService,
    private config: ConfigService,
  ) {
    const stripeKey = this.config.get('STRIPE_SECRET_KEY');
    if (stripeKey) {
      this.stripe = new Stripe(stripeKey, {
        apiVersion: '2023-08-16',
      });
    }
  }

  /**
   * Get pricing information
   */
  @Get('pricing')
  @ApiOperation({ 
    summary: 'Get pricing for all plans',
    description: 'Returns pricing information for all subscription tiers (STARTER, PRO, BUSINESS) with monthly and yearly intervals.',
  })
  @ApiResponse({
    status: 200,
    description: 'Pricing information retrieved successfully',
    schema: {
      example: {
        plans: [
          {
            tier: 'STARTER',
            name: 'Starter',
            monthly: { price: 29, priceId: 'price_starter_monthly' },
            yearly: { price: 290, priceId: 'price_starter_yearly' },
            credits: 150,
            features: ['150 credits/month', 'No watermark', 'AI clipping'],
          },
          {
            tier: 'PRO',
            name: 'Pro',
            monthly: { price: 79, priceId: 'price_pro_monthly' },
            yearly: { price: 790, priceId: 'price_pro_yearly' },
            credits: 300,
            features: ['300 credits/month', 'Team workspace', 'Brand templates'],
          },
        ],
      },
    },
  })
  getPricing() {
    return this.paymentsService.getPricing();
  }

  /**
   * Create a checkout session
   */
  @Post('checkout')
  @UseGuards(ClerkAuthGuard)
  @ApiBearerAuth('clerk-jwt')
  @ApiOperation({ 
    summary: 'Create a checkout session',
    description: 'Creates a Stripe or Razorpay checkout session for subscribing to a paid plan. Returns a checkout URL to redirect the user to.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['tier', 'interval'],
      properties: {
        tier: {
          type: 'string',
          enum: ['STARTER', 'PRO', 'BUSINESS'],
          description: 'Subscription tier',
          example: 'STARTER',
        },
        interval: {
          type: 'string',
          enum: ['monthly', 'yearly'],
          description: 'Billing interval',
          example: 'monthly',
        },
        gateway: {
          type: 'string',
          enum: ['stripe', 'razorpay'],
          description: 'Payment gateway (default: stripe)',
          example: 'stripe',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Checkout session created successfully',
    schema: {
      example: {
        checkoutUrl: 'https://checkout.stripe.com/c/pay/cs_test_...',
        sessionId: 'cs_test_123',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request or organization not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async createCheckout(
    @Request() req: any,
    @Body()
    body: {
      tier: 'STARTER' | 'PRO' | 'BUSINESS';
      interval: 'monthly' | 'yearly';
      gateway?: 'stripe' | 'razorpay';
    },
  ) {
    const orgId = req.user.memberships[0]?.org?.id;
    if (!orgId) {
      throw new BadRequestException('No organization found');
    }

    const gateway = body.gateway || 'stripe';
    const result = await this.paymentsService.createCheckoutSession(
      orgId,
      body.tier,
      body.interval,
      gateway,
    );

    return result;
  }

  /**
   * Create a billing portal session (Stripe only)
   */
  @Post('portal')
  @UseGuards(ClerkAuthGuard)
  @ApiBearerAuth('clerk-jwt')
  @ApiOperation({ 
    summary: 'Create a billing portal session',
    description: 'Creates a Stripe billing portal session for managing subscription, payment methods, and invoices. Stripe only.',
  })
  @ApiResponse({
    status: 201,
    description: 'Portal session created successfully',
    schema: {
      example: {
        portalUrl: 'https://billing.stripe.com/p/session/test_...',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'No Stripe customer found or organization not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async createPortal(@Request() req: any) {
    const orgId = req.user.memberships[0]?.org?.id;
    if (!orgId) {
      throw new BadRequestException('No organization found');
    }

    return this.paymentsService.createPortalSession(orgId);
  }

  /**
   * Stripe webhook endpoint
   */
  @Post('webhooks/stripe')
  @ApiOperation({ summary: 'Handle Stripe webhooks' })
  async handleStripeWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: RawBodyRequest<Request>,
  ) {
    if (!this.stripe) {
      throw new BadRequestException('Stripe not configured');
    }

    const webhookSecret = this.config.get('STRIPE_WEBHOOK_SECRET');
    if (!webhookSecret) {
      throw new BadRequestException('Webhook secret not configured');
    }

    let event: Stripe.Event;

    try {
      // Verify webhook signature
      event = this.stripe.webhooks.constructEvent(
        req.rawBody,
        signature,
        webhookSecret,
      );
    } catch (err) {
      throw new BadRequestException(`Webhook signature verification failed: ${err.message}`);
    }

    // Handle the event
    await this.paymentsService.handleStripeWebhook(event);

    return { received: true };
  }

  /**
   * Razorpay webhook endpoint
   */
  @Post('webhooks/razorpay')
  @ApiOperation({ summary: 'Handle Razorpay webhooks' })
  async handleRazorpayWebhook(
    @Headers('x-razorpay-signature') signature: string,
    @Body() body: any,
  ) {
    const webhookSecret = this.config.get('RAZORPAY_WEBHOOK_SECRET');
    if (!webhookSecret) {
      throw new BadRequestException('Webhook secret not configured');
    }

    // Verify Razorpay signature
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(JSON.stringify(body))
      .digest('hex');

    if (signature !== expectedSignature) {
      throw new BadRequestException('Invalid webhook signature');
    }

    // Handle the event
    await this.paymentsService.handleRazorpayWebhook(body);

    return { received: true };
  }

  /**
   * Get current subscription status
   */
  @Get('subscription')
  @UseGuards(ClerkAuthGuard)
  @ApiBearerAuth('clerk-jwt')
  @ApiOperation({ 
    summary: 'Get current subscription status',
    description: 'Returns the current subscription tier, status, and billing period information.',
  })
  @ApiResponse({
    status: 200,
    description: 'Subscription status retrieved successfully',
    schema: {
      example: {
        tier: 'STARTER',
        hasActiveSubscription: true,
        currentPeriodEnd: '2025-12-23T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async getSubscription(@Request() req: any) {
    const orgId = req.user.memberships[0]?.org?.id;
    if (!orgId) {
      throw new BadRequestException('No organization found');
    }

    // TODO: Fetch subscription details from Stripe/Razorpay
    // For now, return org data
    const org = await this.paymentsService['prisma'].organization.findUnique({
      where: { id: orgId },
      select: {
        tier: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
        stripeCurrentPeriodEnd: true,
      },
    });

    return {
      tier: org.tier,
      hasActiveSubscription: !!org.stripeSubscriptionId,
      currentPeriodEnd: org.stripeCurrentPeriodEnd,
    };
  }

  /**
   * Cancel subscription and downgrade to FREE
   */
  @Post('subscription/cancel')
  @UseGuards(ClerkAuthGuard)
  @ApiBearerAuth('clerk-jwt')
  @ApiOperation({ 
    summary: 'Cancel subscription and downgrade to FREE plan',
    description: 'Cancels the active subscription at the end of the billing period. User will be downgraded to FREE tier. Projects will expire in 48 hours.',
  })
  @ApiResponse({
    status: 200,
    description: 'Subscription cancelled successfully',
    schema: {
      example: {
        message: 'Subscription cancelled. You will be downgraded to FREE plan at the end of your billing period.',
        currentPeriodEnd: '2025-12-23T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'No active subscription to cancel',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async cancelSubscription(@Request() req: any) {
    const orgId = req.user.memberships[0]?.org?.id;
    if (!orgId) {
      throw new BadRequestException('No organization found');
    }

    return this.paymentsService.cancelSubscription(orgId);
  }
}
