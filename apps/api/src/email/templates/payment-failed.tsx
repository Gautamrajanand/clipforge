import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface PaymentFailedEmailProps {
  userName?: string;
  amount: number;
  currency: string;
  reason?: string;
  retryDate?: string;
}

export const PaymentFailedEmail = ({
  userName = 'there',
  amount,
  currency,
  reason = 'Your payment method was declined',
  retryDate,
}: PaymentFailedEmailProps) => {
  const previewText = `Payment failed - Action required`;
  const formattedAmount = currency === 'USD' ? `$${amount}` : `₹${amount}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>⚠️ Payment Failed</Heading>
          
          <Text style={text}>Hi {userName},</Text>
          
          <Text style={text}>
            We were unable to process your payment for your ClipForge subscription.
          </Text>

          <Section style={alertBox}>
            <Text style={alertTitle}>Payment Details</Text>
            <Text style={alertInfo}>
              <strong>Amount:</strong> {formattedAmount}
            </Text>
            <Text style={alertInfo}>
              <strong>Reason:</strong> {reason}
            </Text>
            {retryDate && (
              <Text style={alertInfo}>
                <strong>Next retry:</strong> {retryDate}
              </Text>
            )}
          </Section>

          <Text style={text}>
            To continue using ClipForge without interruption, please update your payment method or try a different card.
          </Text>

          <Section style={buttonContainer}>
            <Button
              style={button}
              href={`${process.env.FRONTEND_URL || 'http://localhost:3001'}/dashboard/billing`}
            >
              Update Payment Method
            </Button>
          </Section>

          <Text style={helpText}>
            <strong>Need help?</strong> If you believe this is an error or need assistance, please contact our support team.
          </Text>

          <Hr style={hr} />

          <Text style={footer}>
            <strong>ClipForge</strong> - AI-Powered Video Repurposing
            <br />
            <Link href={`${process.env.FRONTEND_URL || 'http://localhost:3001'}/dashboard/billing`} style={link}>
              Billing
            </Link>
            {' · '}
            <Link href="mailto:support@clipforge.ai" style={link}>
              Support
            </Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default PaymentFailedEmail;

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

const h1 = {
  color: '#1f2937',
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0 40px',
  textAlign: 'center' as const,
};

const text = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 40px',
};

const alertBox = {
  backgroundColor: '#fef2f2',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 40px',
  border: '1px solid #fca5a5',
};

const alertTitle = {
  color: '#991b1b',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 12px 0',
};

const alertInfo = {
  color: '#6b7280',
  fontSize: '14px',
  margin: '8px 0',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 40px',
};

const button = {
  backgroundColor: '#dc2626',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 32px',
};

const helpText = {
  color: '#374151',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '24px 40px',
  padding: '16px',
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
};

const hr = {
  borderColor: '#e5e7eb',
  margin: '32px 40px',
};

const footer = {
  color: '#6b7280',
  fontSize: '12px',
  lineHeight: '20px',
  margin: '0 40px',
  textAlign: 'center' as const,
};

const link = {
  color: '#8b5cf6',
  textDecoration: 'underline',
};
