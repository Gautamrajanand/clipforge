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

interface CreditLowEmailProps {
  userName?: string;
  currentCredits: number;
  totalCredits: number;
  tier: string;
  resetDate?: string;
}

export const CreditLowEmail = ({
  userName = 'there',
  currentCredits,
  totalCredits,
  tier,
  resetDate,
}: CreditLowEmailProps) => {
  const percentage = Math.round((currentCredits / totalCredits) * 100);
  const previewText = `Your ClipForge credits are running low (${currentCredits} remaining)`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={h1}>⚠️ Credits Running Low</Heading>
          </Section>

          <Section style={content}>
            <Text style={paragraph}>Hi {userName},</Text>
            
            <Text style={paragraph}>
              Your ClipForge credits are running low. You have <strong>{currentCredits} credits</strong> remaining out of your {totalCredits} monthly allocation.
            </Text>

            <Section style={warningBox}>
              <div style={progressBarContainer}>
                <div style={{...progressBar, width: `${percentage}%`}} />
              </div>
              <Text style={statsText}>
                {currentCredits} / {totalCredits} credits ({percentage}% remaining)
              </Text>
            </Section>

            <Text style={paragraph}>
              <strong>What happens when you run out?</strong>
            </Text>

            <ul style={list}>
              <li style={listItem}>You won't be able to process new videos</li>
              <li style={listItem}>Existing projects will remain accessible</li>
              {resetDate && (
                <li style={listItem}>Your credits will reset on {resetDate}</li>
              )}
            </ul>

            {tier === 'FREE' && (
              <>
                <Text style={paragraph}>
                  <strong>Want more credits?</strong> Upgrade to a paid plan and get:
                </Text>

                <Section style={planBox}>
                  <div style={planItem}>
                    <Text style={planName}>Starter Plan</Text>
                    <Text style={planPrice}>$29/month</Text>
                    <Text style={planCredits}>150 credits/month</Text>
                  </div>
                  <div style={planItem}>
                    <Text style={planName}>Pro Plan</Text>
                    <Text style={planPrice}>$79/month</Text>
                    <Text style={planCredits}>300 credits/month</Text>
                  </div>
                  <div style={planItem}>
                    <Text style={planName}>Business Plan</Text>
                    <Text style={planPrice}>$99/month</Text>
                    <Text style={planCredits}>Unlimited credits</Text>
                  </div>
                </Section>

                <Section style={buttonContainer}>
                  <Button style={button} href="http://localhost:3001/subscription">
                    Upgrade Now
                  </Button>
                </Section>
              </>
            )}

            {tier !== 'FREE' && (
              <>
                <Text style={paragraph}>
                  Need more credits this month? Contact our support team for options.
                </Text>

                <Section style={buttonContainer}>
                  <Button style={button} href="http://localhost:3001/dashboard">
                    View Dashboard
                  </Button>
                </Section>
              </>
            )}

            <Text style={signature}>
              The ClipForge Team
            </Text>
          </Section>

          <Section style={footer}>
            <Text style={footerText}>
              © 2025 ClipForge. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default CreditLowEmail;

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
  background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
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

const warningBox = {
  backgroundColor: '#fef3c7',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
  border: '2px solid #f59e0b',
};

const progressBarContainer = {
  backgroundColor: '#e5e7eb',
  borderRadius: '8px',
  height: '24px',
  overflow: 'hidden',
  marginBottom: '12px',
};

const progressBar = {
  backgroundColor: '#f59e0b',
  height: '100%',
  transition: 'width 0.3s ease',
};

const statsText = {
  color: '#92400e',
  fontSize: '16px',
  fontWeight: 'bold',
  textAlign: 'center' as const,
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

const planBox = {
  display: 'flex',
  gap: '16px',
  margin: '24px 0',
  flexWrap: 'wrap' as const,
};

const planItem = {
  flex: '1',
  minWidth: '150px',
  backgroundColor: '#f6f9fc',
  borderRadius: '8px',
  padding: '16px',
  textAlign: 'center' as const,
};

const planName = {
  color: '#32325d',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 8px 0',
};

const planPrice = {
  color: '#667eea',
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '0 0 8px 0',
};

const planCredits = {
  color: '#525f7f',
  fontSize: '14px',
  margin: '0',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#f59e0b',
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
