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
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ClerkAuthGuard } from '../auth/guards/clerk-auth.guard';
import { PaymentsService } from './payments.service';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import * as crypto from 'crypto';

@ApiTags('payments')
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
  @ApiOperation({ summary: 'Get pricing for all plans' })
  getPricing() {
    return this.paymentsService.getPricing();
  }

  /**
   * Create a checkout session
   */
  @Post('checkout')
  @UseGuards(ClerkAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a checkout session' })
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
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a billing portal session' })
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
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current subscription status' })
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
}
