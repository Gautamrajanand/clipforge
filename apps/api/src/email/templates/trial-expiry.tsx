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

interface TrialExpiryEmailProps {
  userName?: string;
  daysLeft: number;
  expiryDate: string;
}

export const TrialExpiryEmail = ({
  userName = 'there',
  daysLeft,
  expiryDate,
}: TrialExpiryEmailProps) => {
  const previewText = `Your ClipForge trial expires in ${daysLeft} days`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={h1}>⏰ Trial Ending Soon</Heading>
          </Section>

          <Section style={content}>
            <Text style={paragraph}>Hi {userName},</Text>
            
            <Text style={paragraph}>
              Your ClipForge trial is ending soon! You have <strong>{daysLeft} days</strong> remaining to enjoy all the premium features.
            </Text>

            <Section style={warningBox}>
              <Text style={warningTitle}>Trial Expires: {expiryDate}</Text>
              <Text style={warningText}>
                After your trial ends, your account will be downgraded to the FREE plan with limited features.
              </Text>
            </Section>

            <Text style={paragraph}>
              <strong>Don't lose access to:</strong>
            </Text>

            <ul style={list}>
              <li style={listItem}>✨ AI-powered clip generation</li>
              <li style={listItem}>📝 AI subtitles</li>
              <li style={listItem}>🎯 Video reframing</li>
              <li style={listItem}>🚀 Priority processing</li>
              <li style={listItem}>📊 Advanced analytics</li>
              <li style={listItem}>💬 Priority support</li>
            </ul>

            <Text style={paragraph}>
              <strong>Choose a plan that fits your needs:</strong>
            </Text>

            <table style={plansTable}>
              <tr>
                <td style={planCell}>
                  <div style={planCard}>
                    <Text style={planName}>Starter</Text>
                    <Text style={planPrice}>$29<span style={planPeriod}>/month</span></Text>
                    <ul style={planFeatures}>
                      <li>150 credits/month</li>
                      <li>All AI tools</li>
                      <li>Email support</li>
                    </ul>
                    <div style={planButtonContainer}>
                      <Button style={planButton} href="http://localhost:3001/subscription?plan=STARTER">
                        Choose Starter
                      </Button>
                    </div>
                  </div>
                </td>
                <td style={planCell}>
                  <div style={planCardFeatured}>
                    <div style={popularBadge}>Most Popular</div>
                    <Text style={planName}>Pro</Text>
                    <Text style={planPrice}>$79<span style={planPeriod}>/month</span></Text>
                    <ul style={planFeatures}>
                      <li>300 credits/month</li>
                      <li>All AI tools</li>
                      <li>Priority processing</li>
                      <li>Priority support</li>
                      <li>Advanced analytics</li>
                    </ul>
                    <div style={planButtonContainer}>
                      <Button style={planButtonFeatured} href="http://localhost:3001/subscription?plan=PRO">
                        Choose Pro
                      </Button>
                    </div>
                  </div>
                </td>
              </tr>
            </table>

            <Text style={paragraph}>
              Have questions? Our team is here to help you choose the right plan for your needs.
            </Text>

            <Text style={signature}>
              The ClipForge Team
            </Text>
          </Section>

          <Section style={footer}>
            <Text style={footerText}>
              © 2025 ClipForge. All rights reserved.
            </Text>
            <Text style={footerText}>
              Want to continue with the FREE plan? No action needed.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default TrialExpiryEmail;

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
  textAlign: 'center' as const,
};

const warningTitle = {
  color: '#92400e',
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '0 0 12px 0',
};

const warningText = {
  color: '#92400e',
  fontSize: '16px',
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

const plansTable = {
  width: '100%',
  margin: '24px 0',
  borderCollapse: 'collapse' as const,
};

const planCell = {
  width: '50%',
  padding: '8px',
  verticalAlign: 'top' as const,
};

const planCard = {
  backgroundColor: '#f6f9fc',
  borderRadius: '12px',
  padding: '24px',
  border: '2px solid #e6ebf1',
  width: '100%',
};

const planCardFeatured = {
  backgroundColor: '#f6f9fc',
  borderRadius: '12px',
  padding: '24px',
  border: '3px solid #667eea',
  position: 'relative' as const,
  width: '100%',
};

const popularBadge = {
  position: 'absolute' as const,
  top: '-12px',
  left: '50%',
  transform: 'translateX(-50%)',
  backgroundColor: '#667eea',
  color: '#ffffff',
  fontSize: '12px',
  fontWeight: 'bold',
  padding: '4px 12px',
  borderRadius: '12px',
};

const planName = {
  color: '#32325d',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 8px 0',
  textAlign: 'center' as const,
};

const planPrice = {
  color: '#667eea',
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '0 0 16px 0',
  textAlign: 'center' as const,
};

const planPeriod = {
  fontSize: '16px',
  color: '#8898aa',
};

const planFeatures = {
  color: '#525f7f',
  fontSize: '14px',
  lineHeight: '20px',
  paddingLeft: '20px',
  margin: '0 0 16px 0',
};

const planButtonContainer = {
  textAlign: 'center' as const,
};

const planButton = {
  backgroundColor: '#667eea',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '14px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '10px 20px',
  width: '100%',
};

const planButtonFeatured = {
  backgroundColor: '#667eea',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '14px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '10px 20px',
  width: '100%',
  boxShadow: '0 4px 6px rgba(102, 126, 234, 0.3)',
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
