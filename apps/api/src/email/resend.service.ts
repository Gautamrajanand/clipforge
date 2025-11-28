import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { render } from '@react-email/render';
import { WelcomeEmail } from './templates/welcome';
import { CreditLowEmail } from './templates/credit-low';
import { CreditAdjustmentEmail } from './templates/credit-adjustment';
import { PaymentConfirmationEmail } from './templates/payment-confirmation';
import { TrialExpiryEmail } from './templates/trial-expiry';

@Injectable()
export class ResendService {
  private readonly logger = new Logger(ResendService.name);
  private resend: Resend | null = null;
  private readonly fromEmail: string;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    this.fromEmail = this.configService.get<string>('FROM_EMAIL', 'ClipForge <noreply@clipforge.ai>');

    if (!apiKey) {
      this.logger.warn('⚠️  RESEND_API_KEY not configured. Email notifications will be disabled.');
      return;
    }

    this.resend = new Resend(apiKey);
    this.logger.log('✅ Resend email service initialized');
  }

  async sendWelcomeEmail(params: {
    to: string;
    userName?: string;
    userEmail: string;
    tier: string;
    credits: number;
  }): Promise<void> {
    if (!this.resend) {
      this.logger.warn('Resend not configured. Skipping welcome email.');
      return;
    }

    try {
      const html = render(
        WelcomeEmail({
          userName: params.userName,
          userEmail: params.userEmail,
          tier: params.tier,
          credits: params.credits,
        })
      );

      await this.resend.emails.send({
        from: this.fromEmail,
        to: params.to,
        subject: '🎬 Welcome to ClipForge!',
        html,
      });

      this.logger.log(`✅ Welcome email sent to ${params.to}`);
    } catch (error) {
      this.logger.error(`❌ Failed to send welcome email to ${params.to}:`, error);
    }
  }

  async sendCreditLowEmail(params: {
    to: string;
    userName?: string;
    currentCredits: number;
    totalCredits: number;
    tier: string;
    resetDate?: string;
  }): Promise<void> {
    if (!this.resend) {
      this.logger.warn('Resend not configured. Skipping credit low email.');
      return;
    }

    try {
      const html = render(
        CreditLowEmail({
          userName: params.userName,
          currentCredits: params.currentCredits,
          totalCredits: params.totalCredits,
          tier: params.tier,
          resetDate: params.resetDate,
        })
      );

      await this.resend.emails.send({
        from: this.fromEmail,
        to: params.to,
        subject: '⚠️ Credits Running Low',
        html,
      });

      this.logger.log(`✅ Credit low email sent to ${params.to}`);
    } catch (error) {
      this.logger.error(`❌ Failed to send credit low email to ${params.to}:`, error);
    }
  }

  async sendCreditAdjustmentEmail(params: {
    to: string;
    userName?: string;
    amount: number;
    reason: string;
    balanceBefore: number;
    balanceAfter: number;
    adjustedBy: string;
  }): Promise<void> {
    if (!this.resend) {
      this.logger.warn('Resend not configured. Skipping credit adjustment email.');
      return;
    }

    try {
      const html = render(
        CreditAdjustmentEmail({
          userName: params.userName,
          amount: params.amount,
          reason: params.reason,
          balanceBefore: params.balanceBefore,
          balanceAfter: params.balanceAfter,
          adjustedBy: params.adjustedBy,
        })
      );

      const isPositive = params.amount > 0;
      await this.resend.emails.send({
        from: this.fromEmail,
        to: params.to,
        subject: isPositive ? '✨ Credits Added to Your Account' : '📉 Credits Adjusted',
        html,
      });

      this.logger.log(`✅ Credit adjustment email sent to ${params.to}`);
    } catch (error) {
      this.logger.error(`❌ Failed to send credit adjustment email to ${params.to}:`, error);
    }
  }

  async sendPaymentConfirmationEmail(params: {
    to: string;
    userName?: string;
    amount: number;
    tier: string;
    credits: number;
    invoiceUrl?: string;
    nextBillingDate: string;
  }): Promise<void> {
    if (!this.resend) {
      this.logger.warn('Resend not configured. Skipping payment confirmation email.');
      return;
    }

    try {
      const html = render(
        PaymentConfirmationEmail({
          userName: params.userName,
          amount: params.amount,
          tier: params.tier,
          credits: params.credits,
          invoiceUrl: params.invoiceUrl,
          nextBillingDate: params.nextBillingDate,
        })
      );

      await this.resend.emails.send({
        from: this.fromEmail,
        to: params.to,
        subject: `✅ Payment Confirmed - Welcome to ${params.tier}!`,
        html,
      });

      this.logger.log(`✅ Payment confirmation email sent to ${params.to}`);
    } catch (error) {
      this.logger.error(`❌ Failed to send payment confirmation email to ${params.to}:`, error);
    }
  }

  async sendTrialExpiryEmail(params: {
    to: string;
    userName?: string;
    daysLeft: number;
    expiryDate: string;
  }): Promise<void> {
    if (!this.resend) {
      this.logger.warn('Resend not configured. Skipping trial expiry email.');
      return;
    }

    try {
      const html = render(
        TrialExpiryEmail({
          userName: params.userName,
          daysLeft: params.daysLeft,
          expiryDate: params.expiryDate,
        })
      );

      await this.resend.emails.send({
        from: this.fromEmail,
        to: params.to,
        subject: `⏰ Your Trial Expires in ${params.daysLeft} Days`,
        html,
      });

      this.logger.log(`✅ Trial expiry email sent to ${params.to}`);
    } catch (error) {
      this.logger.error(`❌ Failed to send trial expiry email to ${params.to}:`, error);
    }
  }
}
