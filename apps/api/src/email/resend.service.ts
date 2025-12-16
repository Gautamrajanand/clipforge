import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { render } from '@react-email/render';
import { WelcomeEmail } from './templates/welcome';
import { CreditLowEmail } from './templates/credit-low';
import { CreditAdjustmentEmail } from './templates/credit-adjustment';
import { PaymentConfirmationEmail } from './templates/payment-confirmation';
import { TrialExpiryEmail } from './templates/trial-expiry';
import { OnboardingDay1Email } from './templates/onboarding-day1';
import { OnboardingDay3Email } from './templates/onboarding-day3';
import { WeeklySummaryEmail } from './templates/weekly-summary';
import { InactivityReengagementEmail } from './templates/inactivity-reengagement';

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
      const html = await render(
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
      const html = await render(
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
      const html = await render(
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
      const result = await this.resend.emails.send({
        from: this.fromEmail,
        to: params.to,
        subject: isPositive ? '✨ Credits Added to Your Account' : '📉 Credits Adjusted',
        html,
      });

      this.logger.log(`✅ Credit adjustment email sent to ${params.to}`, { emailId: result.data?.id, error: result.error });
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
      const html = await render(
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
      const html = await render(
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

  // ============================================================================
  // PLG ONBOARDING & ENGAGEMENT EMAILS
  // ============================================================================

  async sendOnboardingDay1Email(params: {
    to: string;
    userName?: string;
    userEmail: string;
    hasCreatedClip: boolean;
    credits: number;
  }): Promise<void> {
    if (!this.resend) {
      this.logger.warn('Resend not configured. Skipping onboarding day 1 email.');
      return;
    }

    try {
      const html = await render(
        OnboardingDay1Email({
          userName: params.userName,
          userEmail: params.userEmail,
          hasCreatedClip: params.hasCreatedClip,
          credits: params.credits,
        })
      );

      await this.resend.emails.send({
        from: this.fromEmail,
        to: params.to,
        subject: params.hasCreatedClip 
          ? '🎉 Great Start! Here\'s What to Do Next'
          : '🚀 Create Your First Clip in 5 Minutes',
        html,
      });

      this.logger.log(`✅ Onboarding Day 1 email sent to ${params.to}`);
    } catch (error) {
      this.logger.error(`❌ Failed to send onboarding day 1 email to ${params.to}:`, error);
    }
  }

  async sendOnboardingDay3Email(params: {
    to: string;
    userName?: string;
    clipsCreated: number;
    creditsUsed: number;
    creditsRemaining: number;
  }): Promise<void> {
    if (!this.resend) {
      this.logger.warn('Resend not configured. Skipping onboarding day 3 email.');
      return;
    }

    try {
      const html = await render(
        OnboardingDay3Email({
          userName: params.userName,
          clipsCreated: params.clipsCreated,
          creditsUsed: params.creditsUsed,
          creditsRemaining: params.creditsRemaining,
        })
      );

      await this.resend.emails.send({
        from: this.fromEmail,
        to: params.to,
        subject: '🎓 Master ClipForge in 5 Minutes',
        html,
      });

      this.logger.log(`✅ Onboarding Day 3 email sent to ${params.to}`);
    } catch (error) {
      this.logger.error(`❌ Failed to send onboarding day 3 email to ${params.to}:`, error);
    }
  }

  async sendWeeklySummaryEmail(params: {
    to: string;
    userName?: string;
    weekStart: string;
    weekEnd: string;
    clipsCreated: number;
    videosProcessed: number;
    creditsUsed: number;
    creditsRemaining: number;
    totalMinutesProcessed: number;
    mostUsedFeature: string;
    tier: string;
  }): Promise<void> {
    if (!this.resend) {
      this.logger.warn('Resend not configured. Skipping weekly summary email.');
      return;
    }

    try {
      const html = await render(
        WeeklySummaryEmail({
          userName: params.userName,
          weekStart: params.weekStart,
          weekEnd: params.weekEnd,
          clipsCreated: params.clipsCreated,
          videosProcessed: params.videosProcessed,
          creditsUsed: params.creditsUsed,
          creditsRemaining: params.creditsRemaining,
          totalMinutesProcessed: params.totalMinutesProcessed,
          mostUsedFeature: params.mostUsedFeature,
          tier: params.tier,
        })
      );

      await this.resend.emails.send({
        from: this.fromEmail,
        to: params.to,
        subject: `📊 Your ClipForge Week: ${params.clipsCreated} Clips Created`,
        html,
      });

      this.logger.log(`✅ Weekly summary email sent to ${params.to}`);
    } catch (error) {
      this.logger.error(`❌ Failed to send weekly summary email to ${params.to}:`, error);
    }
  }

  async sendInactivityReengagementEmail(params: {
    to: string;
    userName?: string;
    daysSinceLastActivity: number;
    lastClipCreated?: string;
    creditsRemaining: number;
    tier: string;
    trialDaysLeft?: number;
  }): Promise<void> {
    if (!this.resend) {
      this.logger.warn('Resend not configured. Skipping inactivity reengagement email.');
      return;
    }

    try {
      const html = await render(
        InactivityReengagementEmail({
          userName: params.userName,
          daysSinceLastActivity: params.daysSinceLastActivity,
          lastClipCreated: params.lastClipCreated,
          creditsRemaining: params.creditsRemaining,
          tier: params.tier,
          trialDaysLeft: params.trialDaysLeft,
        })
      );

      await this.resend.emails.send({
        from: this.fromEmail,
        to: params.to,
        subject: params.daysSinceLastActivity === 7 
          ? '👋 We Miss You at ClipForge!'
          : '🔔 Your ClipForge Account is Waiting',
        html,
      });

      this.logger.log(`✅ Inactivity reengagement email sent to ${params.to}`);
    } catch (error) {
      this.logger.error(`❌ Failed to send inactivity reengagement email to ${params.to}:`, error);
    }
  }

  async sendClipsReadyEmail(params: {
    to: string;
    userName?: string;
    projectTitle: string;
    projectId: string;
    clipCount: number;
  }): Promise<void> {
    if (!this.resend) {
      this.logger.warn('Resend not configured. Skipping clips ready email.');
      return;
    }

    try {
      const projectUrl = `${this.configService.get<string>('APP_URL', 'http://localhost:3001')}/project/${params.projectId}`;
      
      await this.resend.emails.send({
        from: this.fromEmail,
        to: params.to,
        subject: `✨ Your AI Clips Are Ready! (${params.clipCount} clips)`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 32px; text-align: center;">
              <h1 style="color: white; margin: 0;">✨ Your AI Clips Are Ready!</h1>
            </div>
            <div style="padding: 32px; background: white;">
              <p style="font-size: 16px; color: #525f7f;">Hi ${params.userName || 'there'},</p>
              <p style="font-size: 16px; color: #525f7f;">Great news! We've finished analyzing your video and generated <strong>${params.clipCount} AI-powered clips</strong> for your project:</p>
              <div style="background: #f6f9fc; border-radius: 8px; padding: 24px; margin: 24px 0;">
                <p style="font-size: 20px; font-weight: bold; color: #32325d; margin: 0 0 12px 0;">🎬 ${params.projectTitle}</p>
                <p style="font-size: 16px; color: #525f7f; margin: 0;">📊 ${params.clipCount} clips ready to review</p>
              </div>
              <p style="font-size: 16px; color: #525f7f;">Your clips are ready to review, edit, and export. Each clip has been carefully selected based on engagement potential, hooks, and viral moments.</p>
              <div style="text-align: center; margin: 32px 0;">
                <a href="${projectUrl}" style="background: #667eea; color: white; padding: 12px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">View Your Clips</a>
              </div>
              <p style="font-size: 16px; color: #525f7f;">Happy creating! 🚀</p>
              <p style="font-size: 16px; color: #8898aa; margin-top: 32px;">The ClipForge Team</p>
            </div>
            <div style="padding: 32px; border-top: 1px solid #e6ebf1; text-align: center;">
              <p style="font-size: 12px; color: #8898aa; margin: 0;">© 2025 ClipForge. All rights reserved.</p>
            </div>
          </div>
        `,
      });

      this.logger.log(`✅ Clips ready email sent to ${params.to}`);
    } catch (error) {
      this.logger.error(`❌ Failed to send clips ready email to ${params.to}:`, error);
    }
  }

  async sendReframeReadyEmail(params: {
    to: string;
    userName?: string;
    projectTitle: string;
    projectId: string;
    aspectRatio: string;
  }): Promise<void> {
    if (!this.resend) {
      this.logger.warn('Resend not configured. Skipping reframe ready email.');
      return;
    }

    try {
      const projectUrl = `${this.configService.get<string>('APP_URL', 'http://localhost:3001')}/project/${params.projectId}`;
      
      await this.resend.emails.send({
        from: this.fromEmail,
        to: params.to,
        subject: `🎯 Your Reframed Video Is Ready! (${params.aspectRatio})`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 32px; text-align: center;">
              <h1 style="color: white; margin: 0;">🎯 Your Reframed Video Is Ready!</h1>
            </div>
            <div style="padding: 32px; background: white;">
              <p style="font-size: 16px; color: #525f7f;">Hi ${params.userName || 'there'},</p>
              <p style="font-size: 16px; color: #525f7f;">Your video has been successfully reframed to <strong>${params.aspectRatio}</strong> aspect ratio!</p>
              <div style="background: #f6f9fc; border-radius: 8px; padding: 24px; margin: 24px 0;">
                <p style="font-size: 20px; font-weight: bold; color: #32325d; margin: 0 0 12px 0;">🎬 ${params.projectTitle}</p>
                <p style="font-size: 16px; color: #525f7f; margin: 0;">📐 Aspect Ratio: ${params.aspectRatio}</p>
              </div>
              <p style="font-size: 16px; color: #525f7f;">Your reframed video is ready to download and share. The AI has intelligently tracked the most important parts of your video.</p>
              <div style="text-align: center; margin: 32px 0;">
                <a href="${projectUrl}" style="background: #667eea; color: white; padding: 12px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">View Your Video</a>
              </div>
              <p style="font-size: 16px; color: #525f7f;">Happy creating! 🚀</p>
              <p style="font-size: 16px; color: #8898aa; margin-top: 32px;">The ClipForge Team</p>
            </div>
            <div style="padding: 32px; border-top: 1px solid #e6ebf1; text-align: center;">
              <p style="font-size: 12px; color: #8898aa; margin: 0;">© 2025 ClipForge. All rights reserved.</p>
            </div>
          </div>
        `,
      });

      this.logger.log(`✅ Reframe ready email sent to ${params.to}`);
    } catch (error) {
      this.logger.error(`❌ Failed to send reframe ready email to ${params.to}:`, error);
    }
  }

  async sendSubtitlesReadyEmail(params: {
    to: string;
    userName?: string;
    projectTitle: string;
    projectId: string;
  }): Promise<void> {
    if (!this.resend) {
      this.logger.warn('Resend not configured. Skipping subtitles ready email.');
      return;
    }

    try {
      const projectUrl = `${this.configService.get<string>('APP_URL', 'http://localhost:3001')}/project/${params.projectId}`;
      
      await this.resend.emails.send({
        from: this.fromEmail,
        to: params.to,
        subject: `📝 Your Subtitles Are Ready!`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 32px; text-align: center;">
              <h1 style="color: white; margin: 0;">📝 Your Subtitles Are Ready!</h1>
            </div>
            <div style="padding: 32px; background: white;">
              <p style="font-size: 16px; color: #525f7f;">Hi ${params.userName || 'there'},</p>
              <p style="font-size: 16px; color: #525f7f;">Your video with AI-generated subtitles is ready to download!</p>
              <div style="background: #f6f9fc; border-radius: 8px; padding: 24px; margin: 24px 0;">
                <p style="font-size: 20px; font-weight: bold; color: #32325d; margin: 0 0 12px 0;">🎬 ${params.projectTitle}</p>
                <p style="font-size: 16px; color: #525f7f; margin: 0;">✅ Subtitles generated and burned in</p>
              </div>
              <p style="font-size: 16px; color: #525f7f;">Your video now has professional-looking subtitles that will boost engagement and accessibility.</p>
              <div style="text-align: center; margin: 32px 0;">
                <a href="${projectUrl}" style="background: #667eea; color: white; padding: 12px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Download Your Video</a>
              </div>
              <p style="font-size: 16px; color: #525f7f;">Happy creating! 🚀</p>
              <p style="font-size: 16px; color: #8898aa; margin-top: 32px;">The ClipForge Team</p>
            </div>
            <div style="padding: 32px; border-top: 1px solid #e6ebf1; text-align: center;">
              <p style="font-size: 12px; color: #8898aa; margin: 0;">© 2025 ClipForge. All rights reserved.</p>
            </div>
          </div>
        `,
      });

      this.logger.log(`✅ Subtitles ready email sent to ${params.to}`);
    } catch (error) {
      this.logger.error(`❌ Failed to send subtitles ready email to ${params.to}:`, error);
    }
  }
}
