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

interface FeatureAnnouncementEmailProps {
  userName?: string;
  featureTitle: string;
  featureDescription: string;
  featureBenefits: string[];
  ctaText?: string;
  ctaUrl?: string;
}

export const FeatureAnnouncementEmail = ({
  userName = 'there',
  featureTitle,
  featureDescription,
  featureBenefits,
  ctaText = 'Try It Now',
  ctaUrl,
}: FeatureAnnouncementEmailProps) => {
  const previewText = `New Feature: ${featureTitle}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={badge}>
            <Text style={badgeText}>🎉 NEW FEATURE</Text>
          </Section>

          <Heading style={h1}>{featureTitle}</Heading>
          
          <Text style={text}>Hi {userName},</Text>
          
          <Text style={text}>
            {featureDescription}
          </Text>

          <Section style={benefitsBox}>
            <Text style={benefitsTitle}>What you can do:</Text>
            {featureBenefits.map((benefit, index) => (
              <Text key={index} style={benefitItem}>
                ✨ {benefit}
              </Text>
            ))}
          </Section>

          {ctaUrl && (
            <Section style={buttonContainer}>
              <Button style={button} href={ctaUrl}>
                {ctaText}
              </Button>
            </Section>
          )}

          <Text style={helpText}>
            Have questions or feedback? We'd love to hear from you! Reply to this email or contact support@clipforge.ai
          </Text>

          <Hr style={hr} />

          <Text style={footer}>
            <strong>ClipForge</strong> - AI-Powered Video Repurposing
            <br />
            <Link href={`${process.env.FRONTEND_URL || 'http://localhost:3001'}/dashboard`} style={link}>
              Dashboard
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

export default FeatureAnnouncementEmail;

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

const badge = {
  textAlign: 'center' as const,
  margin: '32px 0 16px 0',
};

const badgeText = {
  display: 'inline-block',
  backgroundColor: '#8b5cf6',
  color: '#ffffff',
  fontSize: '12px',
  fontWeight: 'bold',
  padding: '6px 16px',
  borderRadius: '20px',
  letterSpacing: '0.5px',
};

const h1 = {
  color: '#1f2937',
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '16px 40px 32px 40px',
  textAlign: 'center' as const,
};

const text = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 40px',
};

const benefitsBox = {
  backgroundColor: '#f0fdf4',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 40px',
  border: '1px solid #86efac',
};

const benefitsTitle = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#1f2937',
  margin: '0 0 16px 0',
};

const benefitItem = {
  fontSize: '16px',
  color: '#374151',
  margin: '12px 0',
  lineHeight: '24px',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 40px',
};

const button = {
  backgroundColor: '#8b5cf6',
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
  fontSize: '14px',
  color: '#6b7280',
  lineHeight: '22px',
  margin: '24px 40px',
  padding: '16px',
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
  textAlign: 'center' as const,
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
