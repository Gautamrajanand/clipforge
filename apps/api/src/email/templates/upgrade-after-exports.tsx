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

interface UpgradeAfterExportsEmailProps {
  userName?: string;
  exportCount: number;
  tier: string;
}

export const UpgradeAfterExportsEmail = ({
  userName = 'there',
  exportCount,
  tier,
}: UpgradeAfterExportsEmailProps) => {
  const previewText = `You've exported ${exportCount} clips! Time to unlock more features`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>🎉 You're a Power User!</Heading>
          
          <Text style={text}>Hi {userName},</Text>
          
          <Text style={text}>
            We noticed you've exported <strong>{exportCount} clips</strong> already. You're clearly getting value from ClipForge!
          </Text>

          <Section style={highlightBox}>
            <Text style={highlightText}>
              💡 <strong>Did you know?</strong> Upgrading removes watermarks, gives you 2.5x more credits, 
              and unlocks all premium features.
            </Text>
          </Section>

          <Text style={text}>
            <strong>Here's what you're missing out on:</strong>
          </Text>

          <Section style={featureBox}>
            <Text style={featureItem}>✅ <strong>No Watermark</strong> - Professional exports without branding</Text>
            <Text style={featureItem}>✅ <strong>150-300 Minutes/Month</strong> - 2.5-5x more credits</Text>
            <Text style={featureItem}>✅ <strong>All Caption Styles</strong> - 14+ viral styles unlocked</Text>
            <Text style={featureItem}>✅ <strong>90-Day Storage</strong> - Keep projects longer</Text>
            <Text style={featureItem}>✅ <strong>Priority Support</strong> - Get help faster</Text>
          </Section>

          <Section style={pricingBox}>
            <div style={pricingColumn}>
              <Text style={planName}>Starter</Text>
              <Text style={planPrice}>$29<span style={planPeriod}>/mo</span></Text>
              <Text style={planFeature}>150 minutes</Text>
              <Text style={planFeature}>No watermark</Text>
            </div>
            <div style={pricingColumn}>
              <Text style={planNamePro}>Pro</Text>
              <Text style={planPricePro}>$79<span style={planPeriod}>/mo</span></Text>
              <Text style={planFeature}>300 minutes</Text>
              <Text style={planFeature}>Team features</Text>
            </div>
          </Section>

          <Section style={buttonContainer}>
            <Button
              style={button}
              href={`${process.env.FRONTEND_URL || 'http://localhost:3001'}/pricing`}
            >
              Upgrade Now
            </Button>
          </Section>

          <Text style={guaranteeText}>
            💯 <strong>30-day money-back guarantee.</strong> No questions asked.
          </Text>

          <Hr style={hr} />

          <Text style={footer}>
            <strong>ClipForge</strong> - AI-Powered Video Repurposing
            <br />
            <Link href={`${process.env.FRONTEND_URL || 'http://localhost:3001'}/pricing`} style={link}>
              View Pricing
            </Link>
            {' · '}
            <Link href="mailto:support@clipforge.ai" style={link}>
              Support
            </Link>
            {' · '}
            <Link href={`${process.env.FRONTEND_URL || 'http://localhost:3001'}/settings/email-preferences`} style={link}>
              Email Preferences
            </Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default UpgradeAfterExportsEmail;

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

const highlightBox = {
  backgroundColor: '#fef3c7',
  borderRadius: '8px',
  padding: '20px 24px',
  margin: '24px 40px',
  border: '2px solid #fbbf24',
};

const highlightText = {
  fontSize: '16px',
  color: '#92400e',
  margin: '0',
  lineHeight: '24px',
};

const featureBox = {
  margin: '24px 40px',
};

const featureItem = {
  fontSize: '16px',
  color: '#374151',
  margin: '12px 0',
  lineHeight: '24px',
};

const pricingBox = {
  display: 'flex',
  gap: '16px',
  margin: '32px 40px',
};

const pricingColumn = {
  flex: 1,
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
  padding: '24px',
  border: '2px solid #e5e7eb',
  textAlign: 'center' as const,
};

const planName = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#6b7280',
  margin: '0 0 12px 0',
};

const planNamePro = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#8b5cf6',
  margin: '0 0 12px 0',
};

const planPrice = {
  fontSize: '36px',
  fontWeight: 'bold',
  color: '#1f2937',
  margin: '0 0 16px 0',
};

const planPricePro = {
  fontSize: '36px',
  fontWeight: 'bold',
  color: '#8b5cf6',
  margin: '0 0 16px 0',
};

const planPeriod = {
  fontSize: '18px',
  color: '#6b7280',
};

const planFeature = {
  fontSize: '14px',
  color: '#6b7280',
  margin: '8px 0',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 40px',
};

const button = {
  backgroundColor: '#16a34a',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '18px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 40px',
};

const guaranteeText = {
  fontSize: '14px',
  color: '#374151',
  textAlign: 'center' as const,
  margin: '16px 40px',
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
