import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import Stripe from 'stripe';
import Razorpay from 'razorpay';

/**
 * PaymentsService - Unified payment gateway service
 * 
 * Supports:
 * - Stripe (Global markets)
 * - Razorpay (India)
 * 
 * Features:
 * - Customer creation
 * - Subscription management
 * - Payment method handling
 * - Webhook processing
 * - Plan upgrades/downgrades
 */
@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private stripe: Stripe;
  private razorpay: any;

  // Plan pricing (in cents for Stripe, paise for Razorpay)
  private readonly plans = {
    STARTER: {
      stripe: {
        monthly: 'price_1SWBfe62BJnrL0SqUcbjUWR8', // ✅ Real Stripe Price ID
        yearly: 'price_starter_yearly',
        amount: 2900, // $29/month
      },
      razorpay: {
        monthly: 'plan_starter_monthly', // TODO: Create in Razorpay Dashboard
        yearly: 'plan_starter_yearly',
        amount: 229900, // ₹2299/month (~$29 USD)
      },
    },
    PRO: {
      stripe: {
        monthly: 'price_1SWBiG62BJnrL0SqYZu4Adx9', // ✅ Real Stripe Price ID
        yearly: 'price_pro_yearly',
        amount: 7900, // $79/month
      },
      razorpay: {
        monthly: 'plan_pro_monthly',
        yearly: 'plan_pro_yearly',
        amount: 599900, // ₹5999/month (~$79 USD)
      },
    },
    BUSINESS: {
      stripe: {
        monthly: 'price_1SWBjo62BJnrL0SqAGKawrxE', // ✅ Real Stripe Price ID
        yearly: 'price_business_yearly',
        amount: 9900, // $99/month
      },
      razorpay: {
        monthly: 'plan_business_monthly',
        yearly: 'plan_business_yearly',
        amount: 799900, // ₹7999/month (~$99 USD)
      },
    },
  };

  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
  ) {
    // Initialize Stripe
    const stripeKey = this.config.get('STRIPE_SECRET_KEY');
    if (stripeKey) {
      this.stripe = new Stripe(stripeKey, {
        apiVersion: '2023-08-16',
      });
      this.logger.log('✅ Stripe initialized');
    } else {
      this.logger.warn('⚠️  Stripe not configured (missing STRIPE_SECRET_KEY)');
    }

    // Initialize Razorpay
    const razorpayKey = this.config.get('RAZORPAY_KEY_ID');
    const razorpaySecret = this.config.get('RAZORPAY_KEY_SECRET');
    if (razorpayKey && razorpaySecret) {
      this.razorpay = new Razorpay({
        key_id: razorpayKey,
        key_secret: razorpaySecret,
      });
      this.logger.log('✅ Razorpay initialized');
    } else {
      this.logger.warn('⚠️  Razorpay not configured (missing keys)');
    }
  }

  /**
   * Detect payment gateway based on organization location
   */
  private getGateway(orgId: string): 'stripe' | 'razorpay' {
    // TODO: Detect based on org country/currency
    // For now, default to Stripe
    return 'stripe';
  }

  /**
   * Create a customer in the payment gateway
   */
  async createCustomer(
    orgId: string,
    email: string,
    name: string,
    gateway: 'stripe' | 'razorpay' = 'stripe',
  ): Promise<string> {
    try {
      if (gateway === 'stripe' && this.stripe) {
        const customer = await this.stripe.customers.create({
          email,
          name,
          metadata: { orgId },
        });

        await this.prisma.organization.update({
          where: { id: orgId },
          data: { stripeCustomerId: customer.id },
        });

        this.logger.log(`✅ Created Stripe customer: ${customer.id}`);
        return customer.id;
      } else if (gateway === 'razorpay' && this.razorpay) {
        const customer = await this.razorpay.customers.create({
          email,
          name,
          notes: { orgId },
        });

        // Store Razorpay customer ID in a custom field
        await this.prisma.organization.update({
          where: { id: orgId },
          data: { 
            stripeCustomerId: customer.id, // Reuse field for Razorpay
          },
        });

        this.logger.log(`✅ Created Razorpay customer: ${customer.id}`);
        return customer.id;
      }

      throw new BadRequestException('Payment gateway not configured');
    } catch (error) {
      this.logger.error('Failed to create customer:', error);
      throw error;
    }
  }

  /**
   * Create a checkout session for subscription
   */
  async createCheckoutSession(
    orgId: string,
    tier: 'STARTER' | 'PRO' | 'BUSINESS',
    interval: 'monthly' | 'yearly',
    gateway: 'stripe' | 'razorpay' = 'stripe',
  ): Promise<{ sessionId: string; url: string }> {
    const org = await this.prisma.organization.findUnique({
      where: { id: orgId },
      include: { memberships: { include: { user: true } } },
    });

    if (!org) {
      throw new BadRequestException('Organization not found');
    }

    const user = org.memberships[0]?.user;
    if (!user) {
      throw new BadRequestException('No user found for organization');
    }

    try {
      if (gateway === 'stripe' && this.stripe) {
        // Get or create Stripe customer
        let customerId = org.stripeCustomerId;
        if (!customerId) {
          customerId = await this.createCustomer(
            orgId,
            user.email,
            org.name,
            'stripe',
          );
        }

        // Create checkout session
        const session = await this.stripe.checkout.sessions.create({
          customer: customerId,
          mode: 'subscription',
          payment_method_types: ['card'],
          line_items: [
            {
              price: this.plans[tier].stripe[interval],
              quantity: 1,
            },
          ],
          success_url: `${this.config.get('FRONTEND_URL')}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${this.config.get('FRONTEND_URL')}/payment/cancel`,
          metadata: {
            orgId,
            tier,
            interval,
          },
        });

        this.logger.log(`✅ Created Stripe checkout session: ${session.id}`);
        return { sessionId: session.id, url: session.url };
      } else if (gateway === 'razorpay' && this.razorpay) {
        // Get or create Razorpay customer
        let customerId = org.stripeCustomerId; // Reusing field
        if (!customerId) {
          customerId = await this.createCustomer(
            orgId,
            user.email,
            org.name,
            'razorpay',
          );
        }

        // Create Razorpay subscription
        const subscription = await this.razorpay.subscriptions.create({
          plan_id: this.plans[tier].razorpay[interval],
          customer_notify: 1,
          quantity: 1,
          total_count: interval === 'yearly' ? 1 : 12, // 12 months for monthly
          notes: {
            orgId,
            tier,
            interval,
          },
        });

        this.logger.log(`✅ Created Razorpay subscription: ${subscription.id}`);
        
        // Return payment link
        return {
          sessionId: subscription.id,
          url: subscription.short_url,
        };
      }

      throw new BadRequestException('Payment gateway not configured');
    } catch (error) {
      this.logger.error('Failed to create checkout session:', error);
      throw error;
    }
  }

  /**
   * Create a billing portal session (Stripe only)
   */
  async createPortalSession(orgId: string): Promise<{ url: string }> {
    if (!this.stripe) {
      throw new BadRequestException('Stripe not configured');
    }

    const org = await this.prisma.organization.findUnique({
      where: { id: orgId },
      select: { stripeCustomerId: true },
    });

    if (!org?.stripeCustomerId) {
      throw new BadRequestException('No Stripe customer found');
    }

    try {
      const session = await this.stripe.billingPortal.sessions.create({
        customer: org.stripeCustomerId,
        return_url: `${this.config.get('FRONTEND_URL')}/subscription`,
      });

      return { url: session.url };
    } catch (error) {
      this.logger.error('Failed to create portal session:', error);
      throw error;
    }
  }

  /**
   * Handle Stripe webhook events
   */
  async handleStripeWebhook(event: Stripe.Event): Promise<void> {
    this.logger.log(`📥 Stripe webhook: ${event.type}`);

    try {
      switch (event.type) {
        case 'checkout.session.completed':
          await this.handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
          break;

        case 'customer.subscription.created':
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
          break;

        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
          break;

        case 'invoice.payment_succeeded':
          await this.handlePaymentSucceeded(event.data.object as Stripe.Invoice);
          break;

        case 'invoice.payment_failed':
          await this.handlePaymentFailed(event.data.object as Stripe.Invoice);
          break;

        default:
          this.logger.log(`Unhandled event type: ${event.type}`);
      }
    } catch (error) {
      this.logger.error(`Failed to handle webhook ${event.type}:`, error);
      throw error;
    }
  }

  /**
   * Handle Razorpay webhook events
   */
  async handleRazorpayWebhook(event: any): Promise<void> {
    this.logger.log(`📥 Razorpay webhook: ${event.event}`);

    try {
      switch (event.event) {
        case 'subscription.activated':
          await this.handleRazorpaySubscriptionActivated(event.payload.subscription.entity);
          break;

        case 'subscription.cancelled':
          await this.handleRazorpaySubscriptionCancelled(event.payload.subscription.entity);
          break;

        case 'payment.captured':
          await this.handleRazorpayPaymentCaptured(event.payload.payment.entity);
          break;

        default:
          this.logger.log(`Unhandled Razorpay event: ${event.event}`);
      }
    } catch (error) {
      this.logger.error(`Failed to handle Razorpay webhook ${event.event}:`, error);
      throw error;
    }
  }

  // ============ Private Helper Methods ============

  private async handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    const orgId = session.metadata?.orgId;
    if (!orgId) return;

    this.logger.log(`✅ Checkout completed for org: ${orgId}`);

    // Subscription will be updated via subscription.created event
  }

  private async handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    const customerId = subscription.customer as string;
    
    const org = await this.prisma.organization.findFirst({
      where: { stripeCustomerId: customerId },
    });

    if (!org) {
      this.logger.warn(`Organization not found for customer: ${customerId}`);
      return;
    }

    // Extract tier from subscription metadata or price
    const tier = subscription.metadata?.tier || 'PRO';
    const currentPeriodEnd = new Date(subscription.current_period_end * 1000);

    // Calculate credits based on tier
    const tierCredits = {
      STARTER: 150,
      PRO: 300,
      BUSINESS: 1000,
    };
    const creditsToAdd = tierCredits[tier as keyof typeof tierCredits] || 300;

    // Update organization tier and add credits
    await this.prisma.organization.update({
      where: { id: org.id },
      data: {
        tier: tier as any,
        stripeSubscriptionId: subscription.id,
        stripeCurrentPeriodEnd: currentPeriodEnd,
        credits: {
          increment: creditsToAdd,
        },
      },
    });

    // Log credit transaction
    await this.prisma.creditTransaction.create({
      data: {
        orgId: org.id,
        amount: creditsToAdd,
        balanceBefore: org.credits,
        balanceAfter: org.credits + creditsToAdd,
        type: 'ADDITION_PURCHASE',
        description: `${tier} subscription activated - monthly credits`,
      },
    });

    this.logger.log(`✅ Updated subscription for org ${org.id}: ${tier} (+${creditsToAdd} credits)`);
  }

  private async handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    const customerId = subscription.customer as string;
    
    const org = await this.prisma.organization.findFirst({
      where: { stripeCustomerId: customerId },
    });

    if (!org) return;

    await this.prisma.organization.update({
      where: { id: org.id },
      data: {
        tier: 'FREE',
        stripeSubscriptionId: null,
        stripeCurrentPeriodEnd: null,
      },
    });

    this.logger.log(`✅ Subscription cancelled for org ${org.id}`);
  }

  private async handlePaymentSucceeded(invoice: Stripe.Invoice) {
    this.logger.log(`✅ Payment succeeded: ${invoice.id}`);
    // TODO: Send receipt email
  }

  private async handlePaymentFailed(invoice: Stripe.Invoice) {
    this.logger.error(`❌ Payment failed: ${invoice.id}`);
    // TODO: Send payment failed email
  }

  private async handleRazorpaySubscriptionActivated(subscription: any) {
    const orgId = subscription.notes?.orgId;
    if (!orgId) return;

    const tier = subscription.notes?.tier || 'PRO';

    await this.prisma.organization.update({
      where: { id: orgId },
      data: {
        tier: tier as any,
        stripeSubscriptionId: subscription.id, // Reuse field
      },
    });

    this.logger.log(`✅ Razorpay subscription activated for org ${orgId}`);
  }

  private async handleRazorpaySubscriptionCancelled(subscription: any) {
    const orgId = subscription.notes?.orgId;
    if (!orgId) return;

    await this.prisma.organization.update({
      where: { id: orgId },
      data: {
        tier: 'FREE',
        stripeSubscriptionId: null,
      },
    });

    this.logger.log(`✅ Razorpay subscription cancelled for org ${orgId}`);
  }

  private async handleRazorpayPaymentCaptured(payment: any) {
    this.logger.log(`✅ Razorpay payment captured: ${payment.id}`);
    // TODO: Send receipt email
  }

  /**
   * Get pricing information
   */
  getPricing() {
    return {
      STARTER: {
        stripe: {
          monthly: { amount: 19, currency: 'USD' },
          yearly: { amount: 190, currency: 'USD' }, // ~17% discount
        },
        razorpay: {
          monthly: { amount: 1499, currency: 'INR' },
          yearly: { amount: 14990, currency: 'INR' },
        },
      },
      PRO: {
        stripe: {
          monthly: { amount: 49, currency: 'USD' },
          yearly: { amount: 490, currency: 'USD' },
        },
        razorpay: {
          monthly: { amount: 3999, currency: 'INR' },
          yearly: { amount: 39990, currency: 'INR' },
        },
      },
      BUSINESS: {
        stripe: {
          monthly: { amount: 99, currency: 'USD' },
          yearly: { amount: 990, currency: 'USD' },
        },
        razorpay: {
          monthly: { amount: 7999, currency: 'INR' },
          yearly: { amount: 79990, currency: 'INR' },
        },
      },
    };
  }
}
