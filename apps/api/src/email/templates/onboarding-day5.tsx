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

interface OnboardingDay5EmailProps {
  userName?: string;
  projectCount: number;
  clipCount: number;
}

export const OnboardingDay5Email = ({
  userName = 'there',
  projectCount,
  clipCount,
}: OnboardingDay5EmailProps) => {
  const previewText = `You've created ${clipCount} clips so far! Here's what's next`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>🎯 Your Progress So Far</Heading>
          
          <Text style={text}>Hi {userName},</Text>
          
          <Text style={text}>
            You've been using ClipForge for 5 days now. Here's what you've accomplished:
          </Text>

          <Section style={statsBox}>
            <div style={statItem}>
              <Text style={statNumber}>{projectCount}</Text>
              <Text style={statLabel}>Projects Created</Text>
            </div>
            <div style={statItem}>
              <Text style={statNumber}>{clipCount}</Text>
              <Text style={statLabel}>Clips Generated</Text>
            </div>
          </Section>

          <Text style={text}>
            <strong>Here are 3 tips to get even more from ClipForge:</strong>
          </Text>

          <Section style={tipBox}>
            <Text style={tipTitle}>💡 Tip 1: Try Different Aspect Ratios</Text>
            <Text style={tipText}>
              Export your clips in multiple formats (9:16 for TikTok, 1:1 for Instagram, 16:9 for YouTube) 
              to maximize reach across platforms.
            </Text>
          </Section>

          <Section style={tipBox}>
            <Text style={tipTitle}>💡 Tip 2: Customize Caption Styles</Text>
            <Text style={tipText}>
              We have 14+ caption styles! Try MrBeast, Neon, or Rainbow styles to match your brand 
              and increase engagement.
            </Text>
          </Section>

          <Section style={tipBox}>
            <Text style={tipTitle}>💡 Tip 3: Use AI Reframe</Text>
            <Text style={tipText}>
              Automatically reframe your landscape videos to vertical format with smart cropping 
              or picture-in-picture layouts.
            </Text>
          </Section>

          <Section style={buttonContainer}>
            <Button
              style={button}
              href={`${process.env.FRONTEND_URL || 'http://localhost:3001'}/dashboard`}
            >
              Create More Clips
            </Button>
          </Section>

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

export default OnboardingDay5Email;

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

const statsBox = {
  display: 'flex',
  justifyContent: 'space-around',
  margin: '32px 40px',
  padding: '24px',
  backgroundColor: '#f0fdf4',
  borderRadius: '8px',
  border: '1px solid #86efac',
};

const statItem = {
  textAlign: 'center' as const,
};

const statNumber = {
  fontSize: '36px',
  fontWeight: 'bold',
  color: '#16a34a',
  margin: '0',
};

const statLabel = {
  fontSize: '14px',
  color: '#6b7280',
  margin: '8px 0 0 0',
};

const tipBox = {
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
  padding: '16px 24px',
  margin: '16px 40px',
  borderLeft: '4px solid #8b5cf6',
};

const tipTitle = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#1f2937',
  margin: '0 0 8px 0',
};

const tipText = {
  fontSize: '14px',
  color: '#6b7280',
  lineHeight: '22px',
  margin: '0',
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
