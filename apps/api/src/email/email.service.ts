import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const smtpHost = this.configService.get<string>('SMTP_HOST');
    const smtpPort = this.configService.get<number>('SMTP_PORT', 587);
    const smtpUser = this.configService.get<string>('SMTP_USER');
    const smtpPass = this.configService.get<string>('SMTP_PASS');
    const smtpFrom = this.configService.get<string>('SMTP_FROM', 'noreply@clipforge.ai');

    if (!smtpHost || !smtpUser || !smtpPass) {
      this.logger.warn('⚠️  SMTP credentials not configured. Email notifications will be disabled.');
      return;
    }

    this.transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465, // true for 465, false for other ports
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    this.logger.log(`✅ Email service initialized with SMTP host: ${smtpHost}`);
  }

  async sendClipsReadyEmail(
    userEmail: string,
    userName: string,
    projectTitle: string,
    projectId: string,
    clipCount: number,
  ): Promise<void> {
    if (!this.transporter) {
      this.logger.warn('Email transporter not configured. Skipping email.');
      return;
    }

    const appUrl = this.configService.get<string>('APP_URL', 'http://localhost:3001');
    const projectUrl = `${appUrl}/project/${projectId}`;

    const html = this.getClipsReadyTemplate(userName, projectTitle, projectUrl, clipCount);

    try {
      await this.transporter.sendMail({
        from: this.configService.get<string>('SMTP_FROM', 'ClipForge <noreply@clipforge.ai>'),
        to: userEmail,
        subject: '🎉 Your Clips are Ready!',
        html,
      });

      this.logger.log(`✅ Clips ready email sent to ${userEmail} for project ${projectId}`);
    } catch (error) {
      this.logger.error(`❌ Failed to send clips ready email to ${userEmail}:`, error);
    }
  }

  async sendSubtitlesReadyEmail(
    userEmail: string,
    userName: string,
    projectTitle: string,
    projectId: string,
  ): Promise<void> {
    if (!this.transporter) {
      this.logger.warn('Email transporter not configured. Skipping email.');
      return;
    }

    const appUrl = this.configService.get<string>('APP_URL', 'http://localhost:3001');
    const projectUrl = `${appUrl}/project/${projectId}`;

    const html = this.getSubtitlesReadyTemplate(userName, projectTitle, projectUrl);

    try {
      await this.transporter.sendMail({
        from: this.configService.get<string>('SMTP_FROM', 'ClipForge <noreply@clipforge.ai>'),
        to: userEmail,
        subject: '✨ Your Subtitles are Ready!',
        html,
      });

      this.logger.log(`✅ Subtitles ready email sent to ${userEmail} for project ${projectId}`);
    } catch (error) {
      this.logger.error(`❌ Failed to send subtitles ready email to ${userEmail}:`, error);
    }
  }

  async sendReframeReadyEmail(
    userEmail: string,
    userName: string,
    projectTitle: string,
    projectId: string,
    aspectRatio: string,
  ): Promise<void> {
    if (!this.transporter) {
      this.logger.warn('Email transporter not configured. Skipping email.');
      return;
    }

    const appUrl = this.configService.get<string>('APP_URL', 'http://localhost:3001');
    const projectUrl = `${appUrl}/project/${projectId}`;

    const html = this.getReframeReadyTemplate(userName, projectTitle, projectUrl, aspectRatio);

    try {
      await this.transporter.sendMail({
        from: this.configService.get<string>('SMTP_FROM', 'ClipForge <noreply@clipforge.ai>'),
        to: userEmail,
        subject: '📐 Your Reframed Video is Ready!',
        html,
      });

      this.logger.log(`✅ Reframe ready email sent to ${userEmail} for project ${projectId}`);
    } catch (error) {
      this.logger.error(`❌ Failed to send reframe ready email to ${userEmail}:`, error);
    }
  }

  async sendWelcomeEmail(userEmail: string, userName: string): Promise<void> {
    if (!this.transporter) {
      this.logger.warn('Email transporter not configured. Skipping email.');
      return;
    }

    const appUrl = this.configService.get<string>('APP_URL', 'http://localhost:3001');
    const html = this.getWelcomeTemplate(userName, appUrl);

    try {
      await this.transporter.sendMail({
        from: this.configService.get<string>('SMTP_FROM', 'ClipForge <noreply@clipforge.ai>'),
        to: userEmail,
        subject: '👋 Welcome to ClipForge!',
        html,
      });

      this.logger.log(`✅ Welcome email sent to ${userEmail}`);
    } catch (error) {
      this.logger.error(`❌ Failed to send welcome email to ${userEmail}:`, error);
    }
  }

  async sendLowCreditsEmail(
    userEmail: string,
    userName: string,
    creditsRemaining: number,
    tier: string,
  ): Promise<void> {
    if (!this.transporter) {
      this.logger.warn('Email transporter not configured. Skipping email.');
      return;
    }

    const appUrl = this.configService.get<string>('APP_URL', 'http://localhost:3001');
    const html = this.getLowCreditsTemplate(userName, creditsRemaining, tier, appUrl);

    try {
      await this.transporter.sendMail({
        from: this.configService.get<string>('SMTP_FROM', 'ClipForge <noreply@clipforge.ai>'),
        to: userEmail,
        subject: '⚠️ Running Low on Credits',
        html,
      });

      this.logger.log(`✅ Low credits email sent to ${userEmail}`);
    } catch (error) {
      this.logger.error(`❌ Failed to send low credits email to ${userEmail}:`, error);
    }
  }

  async sendPaymentSuccessEmail(
    userEmail: string,
    userName: string,
    tier: string,
    amount: number,
    credits: number,
  ): Promise<void> {
    if (!this.transporter) {
      this.logger.warn('Email transporter not configured. Skipping email.');
      return;
    }

    const appUrl = this.configService.get<string>('APP_URL', 'http://localhost:3001');
    const html = this.getPaymentSuccessTemplate(userName, tier, amount, credits, appUrl);

    try {
      await this.transporter.sendMail({
        from: this.configService.get<string>('SMTP_FROM', 'ClipForge <noreply@clipforge.ai>'),
        to: userEmail,
        subject: '✅ Payment Successful - Welcome to ' + tier + '!',
        html,
      });

      this.logger.log(`✅ Payment success email sent to ${userEmail}`);
    } catch (error) {
      this.logger.error(`❌ Failed to send payment success email to ${userEmail}:`, error);
    }
  }

  async sendExportFailedEmail(
    userEmail: string,
    userName: string,
    projectTitle: string,
    projectId: string,
    error: string,
  ): Promise<void> {
    if (!this.transporter) {
      this.logger.warn('Email transporter not configured. Skipping email.');
      return;
    }

    const appUrl = this.configService.get<string>('APP_URL', 'http://localhost:3001');
    const html = this.getExportFailedTemplate(userName, projectTitle, error, appUrl);

    try {
      await this.transporter.sendMail({
        from: this.configService.get<string>('SMTP_FROM', 'ClipForge <noreply@clipforge.ai>'),
        to: userEmail,
        subject: '❌ Export Failed - Credits Refunded',
        html,
      });

      this.logger.log(`✅ Export failed email sent to ${userEmail}`);
    } catch (error) {
      this.logger.error(`❌ Failed to send export failed email to ${userEmail}:`, error);
    }
  }

  private getClipsReadyTemplate(
    userName: string,
    projectTitle: string,
    projectUrl: string,
    clipCount: number,
  ): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Clips are Ready!</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">ClipForge</h1>
            </td>
          </tr>
          
          <!-- Celebration Icon -->
          <tr>
            <td style="padding: 40px; text-align: center;">
              <div style="width: 120px; height: 120px; margin: 0 auto; background: linear-gradient(135deg, #e0f7e0 0%, #c8e6c9 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 60px;">🎉</span>
              </div>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 0 40px 40px;">
              <h2 style="margin: 0 0 20px; color: #1a1a1a; font-size: 24px; font-weight: 600; text-align: center;">
                Download Your Clips
              </h2>
              
              <p style="margin: 0 0 20px; color: #4a4a4a; font-size: 16px; line-height: 1.6;">
                Hey there,
              </p>
              
              <p style="margin: 0 0 20px; color: #4a4a4a; font-size: 16px; line-height: 1.6;">
                Your ${clipCount} clip${clipCount > 1 ? 's are' : ' is'} ready to go! 🎬 Click the button below to jump into your project and check them out.
              </p>
              
              <p style="margin: 0 0 30px; color: #6b6b6b; font-size: 14px; line-height: 1.6;">
                <strong>Project:</strong> ${projectTitle}
              </p>
              
              <!-- CTA Button -->
              <div style="text-align: center; margin: 30px 0;">
                <a href="${projectUrl}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 50px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);">
                  View My Clips
                </a>
              </div>
              
              <p style="margin: 30px 0 0; color: #6b6b6b; font-size: 14px; line-height: 1.6;">
                Whether you're downloading, or giving them a quick tweak, everything's waiting for you inside.
              </p>
              
              <p style="margin: 20px 0 0; color: #6b6b6b; font-size: 14px; line-height: 1.6;">
                The ClipForge team
              </p>
              
              <p style="margin: 20px 0 0; color: #9b9b9b; font-size: 12px; line-height: 1.6;">
                PS: If you have any questions, our team is more than happy to assist.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f8f9fa; border-radius: 0 0 8px 8px; text-align: center;">
              <p style="margin: 0; color: #9b9b9b; font-size: 12px;">
                © ${new Date().getFullYear()} ClipForge. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;
  }

  private getSubtitlesReadyTemplate(
    userName: string,
    projectTitle: string,
    projectUrl: string,
  ): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Subtitles are Ready!</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">ClipForge</h1>
            </td>
          </tr>
          
          <!-- Celebration Icon -->
          <tr>
            <td style="padding: 40px; text-align: center;">
              <div style="width: 120px; height: 120px; margin: 0 auto; background: linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 60px;">✨</span>
              </div>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 0 40px 40px;">
              <h2 style="margin: 0 0 20px; color: #1a1a1a; font-size: 24px; font-weight: 600; text-align: center;">
                Your Subtitles are Ready
              </h2>
              
              <p style="margin: 0 0 20px; color: #4a4a4a; font-size: 16px; line-height: 1.6;">
                Hey there,
              </p>
              
              <p style="margin: 0 0 20px; color: #4a4a4a; font-size: 16px; line-height: 1.6;">
                Your video with AI-generated subtitles is ready! 🎬 Click the button below to preview and download it.
              </p>
              
              <p style="margin: 0 0 30px; color: #6b6b6b; font-size: 14px; line-height: 1.6;">
                <strong>Project:</strong> ${projectTitle}
              </p>
              
              <!-- CTA Button -->
              <div style="text-align: center; margin: 30px 0;">
                <a href="${projectUrl}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 50px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);">
                  View My Video
                </a>
              </div>
              
              <p style="margin: 30px 0 0; color: #6b6b6b; font-size: 14px; line-height: 1.6;">
                Your subtitled video is waiting for you. Download it or make any adjustments you need.
              </p>
              
              <p style="margin: 20px 0 0; color: #6b6b6b; font-size: 14px; line-height: 1.6;">
                The ClipForge team
              </p>
              
              <p style="margin: 20px 0 0; color: #9b9b9b; font-size: 12px; line-height: 1.6;">
                PS: If you have any questions, our team is more than happy to assist.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f8f9fa; border-radius: 0 0 8px 8px; text-align: center;">
              <p style="margin: 0; color: #9b9b9b; font-size: 12px;">
                © ${new Date().getFullYear()} ClipForge. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;
  }

  private getReframeReadyTemplate(
    userName: string,
    projectTitle: string,
    projectUrl: string,
    aspectRatio: string,
  ): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Reframed Video is Ready!</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">ClipForge</h1>
            </td>
          </tr>
          
          <!-- Celebration Icon -->
          <tr>
            <td style="padding: 40px; text-align: center;">
              <div style="width: 120px; height: 120px; margin: 0 auto; background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 60px;">📐</span>
              </div>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 0 40px 40px;">
              <h2 style="margin: 0 0 20px; color: #1a1a1a; font-size: 24px; font-weight: 600; text-align: center;">
                Your Reframed Video is Ready
              </h2>
              
              <p style="margin: 0 0 20px; color: #4a4a4a; font-size: 16px; line-height: 1.6;">
                Hey there,
              </p>
              
              <p style="margin: 0 0 20px; color: #4a4a4a; font-size: 16px; line-height: 1.6;">
                Your video has been reframed to ${aspectRatio}! 🎬 Click the button below to preview and download it.
              </p>
              
              <p style="margin: 0 0 30px; color: #6b6b6b; font-size: 14px; line-height: 1.6;">
                <strong>Project:</strong> ${projectTitle}
              </p>
              
              <!-- CTA Button -->
              <div style="text-align: center; margin: 30px 0;">
                <a href="${projectUrl}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 50px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);">
                  View My Video
                </a>
              </div>
              
              <p style="margin: 30px 0 0; color: #6b6b6b; font-size: 14px; line-height: 1.6;">
                Your reframed video is ready. Download it or make any adjustments you need.
              </p>
              
              <p style="margin: 20px 0 0; color: #6b6b6b; font-size: 14px; line-height: 1.6;">
                The ClipForge team
              </p>
              
              <p style="margin: 20px 0 0; color: #9b9b9b; font-size: 12px; line-height: 1.6;">
                PS: If you have any questions, our team is more than happy to assist.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f8f9fa; border-radius: 0 0 8px 8px; text-align: center;">
              <p style="margin: 0; color: #9b9b9b; font-size: 12px;">
                © ${new Date().getFullYear()} ClipForge. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;
  }

  private getWelcomeTemplate(userName: string, appUrl: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to ClipForge!</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">ClipForge</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px; text-align: center;">
              <div style="width: 120px; height: 120px; margin: 0 auto; background: linear-gradient(135deg, #fce4ec 0%, #f8bbd0 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 60px;">👋</span>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 40px 40px;">
              <h2 style="margin: 0 0 20px; color: #1a1a1a; font-size: 24px; font-weight: 600; text-align: center;">
                Welcome to ClipForge!
              </h2>
              <p style="margin: 0 0 20px; color: #4a4a4a; font-size: 16px; line-height: 1.6;">
                Hey ${userName},
              </p>
              <p style="margin: 0 0 20px; color: #4a4a4a; font-size: 16px; line-height: 1.6;">
                We're thrilled to have you on board! 🎉 You're now ready to transform your long-form videos into viral short clips with AI.
              </p>
              <p style="margin: 0 0 20px; color: #4a4a4a; font-size: 16px; line-height: 1.6;">
                <strong>Here's what you can do:</strong>
              </p>
              <ul style="margin: 0 0 20px; padding-left: 20px; color: #4a4a4a; font-size: 16px; line-height: 1.8;">
                <li>Upload videos or import from URL</li>
                <li>AI automatically detects viral moments</li>
                <li>Export clips with professional captions</li>
                <li>Reframe for TikTok, Instagram Reels, YouTube Shorts</li>
              </ul>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${appUrl}/dashboard" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 50px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);">
                  Get Started
                </a>
              </div>
              <p style="margin: 30px 0 0; color: #6b6b6b; font-size: 14px; line-height: 1.6;">
                You have <strong>60 free credits</strong> to get started. That's enough to process several videos!
              </p>
              <p style="margin: 20px 0 0; color: #6b6b6b; font-size: 14px; line-height: 1.6;">
                The ClipForge team
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px 40px; background-color: #f8f9fa; border-radius: 0 0 8px 8px; text-align: center;">
              <p style="margin: 0; color: #9b9b9b; font-size: 12px;">
                © ${new Date().getFullYear()} ClipForge. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;
  }

  private getLowCreditsTemplate(userName: string, creditsRemaining: number, tier: string, appUrl: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Running Low on Credits</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">ClipForge</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px; text-align: center;">
              <div style="width: 120px; height: 120px; margin: 0 auto; background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 60px;">⚠️</span>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 40px 40px;">
              <h2 style="margin: 0 0 20px; color: #1a1a1a; font-size: 24px; font-weight: 600; text-align: center;">
                You're Running Low on Credits
              </h2>
              <p style="margin: 0 0 20px; color: #4a4a4a; font-size: 16px; line-height: 1.6;">
                Hey ${userName},
              </p>
              <p style="margin: 0 0 20px; color: #4a4a4a; font-size: 16px; line-height: 1.6;">
                You have <strong>${creditsRemaining} credits</strong> remaining on your ${tier} plan.
              </p>
              <p style="margin: 0 0 20px; color: #4a4a4a; font-size: 16px; line-height: 1.6;">
                Don't let your creative momentum stop! Upgrade now to get more credits and unlock premium features.
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${appUrl}/pricing" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 50px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);">
                  Upgrade Now
                </a>
              </div>
              <p style="margin: 30px 0 0; color: #6b6b6b; font-size: 14px; line-height: 1.6;">
                The ClipForge team
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px 40px; background-color: #f8f9fa; border-radius: 0 0 8px 8px; text-align: center;">
              <p style="margin: 0; color: #9b9b9b; font-size: 12px;">
                © ${new Date().getFullYear()} ClipForge. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;
  }

  private getPaymentSuccessTemplate(userName: string, tier: string, amount: number, credits: number, appUrl: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Successful</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">ClipForge</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px; text-align: center;">
              <div style="width: 120px; height: 120px; margin: 0 auto; background: linear-gradient(135deg, #e0f7e0 0%, #c8e6c9 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 60px;">✅</span>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 40px 40px;">
              <h2 style="margin: 0 0 20px; color: #1a1a1a; font-size: 24px; font-weight: 600; text-align: center;">
                Payment Successful!
              </h2>
              <p style="margin: 0 0 20px; color: #4a4a4a; font-size: 16px; line-height: 1.6;">
                Hey ${userName},
              </p>
              <p style="margin: 0 0 20px; color: #4a4a4a; font-size: 16px; line-height: 1.6;">
                Welcome to the <strong>${tier}</strong> plan! 🎉 Your payment of <strong>$${amount}</strong> was successful.
              </p>
              <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <p style="margin: 0 0 10px; color: #4a4a4a; font-size: 14px;">
                  <strong>Plan:</strong> ${tier}
                </p>
                <p style="margin: 0 0 10px; color: #4a4a4a; font-size: 14px;">
                  <strong>Credits:</strong> ${credits}
                </p>
                <p style="margin: 0; color: #4a4a4a; font-size: 14px;">
                  <strong>Amount:</strong> $${amount}
                </p>
              </div>
              <p style="margin: 0 0 20px; color: #4a4a4a; font-size: 16px; line-height: 1.6;">
                Your credits have been added to your account and you're ready to create amazing content!
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${appUrl}/dashboard" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 50px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);">
                  Start Creating
                </a>
              </div>
              <p style="margin: 30px 0 0; color: #6b6b6b; font-size: 14px; line-height: 1.6;">
                The ClipForge team
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px 40px; background-color: #f8f9fa; border-radius: 0 0 8px 8px; text-align: center;">
              <p style="margin: 0; color: #9b9b9b; font-size: 12px;">
                © ${new Date().getFullYear()} ClipForge. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;
  }

  private getExportFailedTemplate(userName: string, projectTitle: string, error: string, appUrl: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Export Failed</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">ClipForge</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px; text-align: center;">
              <div style="width: 120px; height: 120px; margin: 0 auto; background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 60px;">❌</span>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 40px 40px;">
              <h2 style="margin: 0 0 20px; color: #1a1a1a; font-size: 24px; font-weight: 600; text-align: center;">
                Export Failed
              </h2>
              <p style="margin: 0 0 20px; color: #4a4a4a; font-size: 16px; line-height: 1.6;">
                Hey ${userName},
              </p>
              <p style="margin: 0 0 20px; color: #4a4a4a; font-size: 16px; line-height: 1.6;">
                We're sorry, but your export for <strong>${projectTitle}</strong> failed to process.
              </p>
              <div style="background-color: #fff3e0; border-left: 4px solid #ff9800; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0; color: #e65100; font-size: 14px;">
                  <strong>Error:</strong> ${error}
                </p>
              </div>
              <p style="margin: 0 0 20px; color: #4a4a4a; font-size: 16px; line-height: 1.6;">
                <strong>Good news:</strong> Your credits have been automatically refunded! You can try again or contact support if the issue persists.
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${appUrl}/dashboard" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 50px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);">
                  Try Again
                </a>
              </div>
              <p style="margin: 30px 0 0; color: #6b6b6b; font-size: 14px; line-height: 1.6;">
                The ClipForge team
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px 40px; background-color: #f8f9fa; border-radius: 0 0 8px 8px; text-align: center;">
              <p style="margin: 0; color: #9b9b9b; font-size: 12px;">
                © ${new Date().getFullYear()} ClipForge. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;
  }
}
