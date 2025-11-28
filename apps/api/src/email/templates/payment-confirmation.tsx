import * as React from 'react';
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface PaymentConfirmationEmailProps {
  userName?: string;
  amount: number;
  tier: string;
  credits: number;
  invoiceUrl?: string;
  nextBillingDate: string;
}

export const PaymentConfirmationEmail = ({
  userName = 'there',
  amount,
  tier,
  credits,
  invoiceUrl,
  nextBillingDate,
}: PaymentConfirmationEmailProps) => {
  const previewText = `Payment confirmed! Your ${tier} plan is now active.`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={h1}>✅ Payment Confirmed</Heading>
          </Section>

          <Section style={content}>
            <Text style={paragraph}>Hi {userName},</Text>
            
            <Text style={paragraph}>
              Thank you for your payment! Your subscription has been successfully processed and your account has been upgraded.
            </Text>

            <Section style={paymentBox}>
              <Text style={paymentTitle}>Payment Details</Text>
              
              <div style={paymentRow}>
                <Text style={paymentLabel}>Plan:</Text>
                <Text style={paymentValue}>{tier}</Text>
              </div>

              <div style={paymentRow}>
                <Text style={paymentLabel}>Amount Paid:</Text>
                <Text style={paymentValue}>${amount.toFixed(2)}</Text>
              </div>

              <div style={paymentRow}>
                <Text style={paymentLabel}>Credits Added:</Text>
                <Text style={paymentValue}>{credits} credits</Text>
              </div>

              <div style={paymentRow}>
                <Text style={paymentLabel}>Next Billing Date:</Text>
                <Text style={paymentValue}>{nextBillingDate}</Text>
              </div>
            </Section>

            <Text style={paragraph}>
              <strong>What's included in your {tier} plan:</strong>
            </Text>

            <ul style={list}>
              {tier === 'STARTER' && (
                <>
                  <li style={listItem}>✨ 150 credits per month</li>
                  <li style={listItem}>🎬 AI-powered clip generation</li>
                  <li style={listItem}>📝 AI subtitles</li>
                  <li style={listItem}>🎯 Video reframing</li>
                  <li style={listItem}>📧 Email support</li>
                </>
              )}
              {tier === 'PRO' && (
                <>
                  <li style={listItem}>✨ 300 credits per month</li>
                  <li style={listItem}>🎬 AI-powered clip generation</li>
                  <li style={listItem}>📝 AI subtitles</li>
                  <li style={listItem}>🎯 Video reframing</li>
                  <li style={listItem}>🚀 Priority processing</li>
                  <li style={listItem}>📧 Priority email support</li>
                  <li style={listItem}>📊 Advanced analytics</li>
                </>
              )}
              {tier === 'BUSINESS' && (
                <>
                  <li style={listItem}>✨ Unlimited credits</li>
                  <li style={listItem}>🎬 AI-powered clip generation</li>
                  <li style={listItem}>📝 AI subtitles</li>
                  <li style={listItem}>🎯 Video reframing</li>
                  <li style={listItem}>🚀 Priority processing</li>
                  <li style={listItem}>👥 Team collaboration</li>
                  <li style={listItem}>📞 Phone & email support</li>
                  <li style={listItem}>📊 Advanced analytics</li>
                  <li style={listItem}>🎨 Custom branding</li>
                </>
              )}
            </ul>

            {invoiceUrl && (
              <Section style={buttonContainer}>
                <Button style={button} href={invoiceUrl}>
                  Download Invoice
                </Button>
              </Section>
            )}

            <Section style={buttonContainer}>
              <Button style={buttonSecondary} href="http://localhost:3001/dashboard">
                Go to Dashboard
              </Button>
            </Section>

            <Text style={paragraph}>
              Your credits have been added to your account and you can start creating immediately!
            </Text>

            <Text style={signature}>
              Thank you for choosing ClipForge! 🚀<br />
              The ClipForge Team
            </Text>
          </Section>

          <Section style={footer}>
            <Text style={footerText}>
              © 2025 ClipForge. All rights reserved.
            </Text>
            <Text style={footerText}>
              Questions? Reply to this email or visit our help center.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default PaymentConfirmationEmail;

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
};

const header = {
  padding: '32px 48px',
  textAlign: 'center' as const,
  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
};

const h1 = {
  color: '#ffffff',
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '0',
  padding: '0',
};

const content = {
  padding: '0 48px',
};

const paragraph = {
  color: '#525f7f',
  fontSize: '16px',
  lineHeight: '24px',
  textAlign: 'left' as const,
  marginBottom: '16px',
};

const paymentBox = {
  backgroundColor: '#f0fdf4',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
  border: '2px solid #10b981',
};

const paymentTitle = {
  color: '#32325d',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 16px 0',
};

const paymentRow = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '12px',
};

const paymentLabel = {
  color: '#525f7f',
  fontSize: '14px',
  margin: '0',
};

const paymentValue = {
  color: '#32325d',
  fontSize: '14px',
  fontWeight: 'bold',
  margin: '0',
};

const list = {
  color: '#525f7f',
  fontSize: '16px',
  lineHeight: '24px',
  paddingLeft: '20px',
  marginBottom: '16px',
};

const listItem = {
  marginBottom: '8px',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '16px 0',
};

const button = {
  backgroundColor: '#10b981',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 32px',
};

const buttonSecondary = {
  backgroundColor: '#667eea',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 32px',
};

const signature = {
  color: '#8898aa',
  fontSize: '16px',
  lineHeight: '24px',
  marginTop: '32px',
};

const footer = {
  padding: '0 48px',
  marginTop: '32px',
  borderTop: '1px solid #e6ebf1',
  paddingTop: '32px',
};

const footerText = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  textAlign: 'center' as const,
  margin: '8px 0',
};
