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

interface MonthlyUsageReportEmailProps {
  userName?: string;
  month: string;
  projectsCreated: number;
  clipsGenerated: number;
  minutesProcessed: number;
  creditsUsed: number;
  creditsRemaining: number;
  tier: string;
}

export const MonthlyUsageReportEmail = ({
  userName = 'there',
  month,
  projectsCreated,
  clipsGenerated,
  minutesProcessed,
  creditsUsed,
  creditsRemaining,
  tier,
}: MonthlyUsageReportEmailProps) => {
  const previewText = `Your ${month} ClipForge report - ${clipsGenerated} clips created!`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>📊 Your {month} Report</Heading>
          
          <Text style={text}>Hi {userName},</Text>
          
          <Text style={text}>
            Here's a summary of your ClipForge activity in {month}:
          </Text>

          <Section style={statsGrid}>
            <div style={statCard}>
              <Text style={statNumber}>{projectsCreated}</Text>
              <Text style={statLabel}>Projects Created</Text>
            </div>
            <div style={statCard}>
              <Text style={statNumber}>{clipsGenerated}</Text>
              <Text style={statLabel}>Clips Generated</Text>
            </div>
            <div style={statCard}>
              <Text style={statNumber}>{minutesProcessed}</Text>
              <Text style={statLabel}>Minutes Processed</Text>
            </div>
          </Section>

          <Section style={creditsBox}>
            <Text style={creditsTitle}>Credit Usage</Text>
            <div style={creditsBar}>
              <div style={{...creditsUsed as any, width: `${(creditsUsed / (creditsUsed + creditsRemaining)) * 100}%`}} />
            </div>
            <Text style={creditsInfo}>
              {creditsUsed} used • {creditsRemaining} remaining
            </Text>
          </Section>

          {tier === 'FREE' && creditsRemaining < 20 && (
            <Section style={upgradeBox}>
              <Text style={upgradeTitle}>⚡ Running Low on Credits?</Text>
              <Text style={upgradeText}>
                Upgrade to get 2.5-5x more credits and unlock all premium features!
              </Text>
              <Button
                style={upgradeButton}
                href={`${process.env.FRONTEND_URL || 'http://localhost:3001'}/pricing`}
              >
                View Plans
              </Button>
            </Section>
          )}

          <Text style={text}>
            <strong>Keep the momentum going!</strong> Your credits will reset at the beginning of next month.
          </Text>

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
            <Link href={`${process.env.FRONTEND_URL || 'http://localhost:3001'}/credits`} style={link}>
              Credits
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

export default MonthlyUsageReportEmail;

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

const statsGrid = {
  display: 'flex',
  gap: '16px',
  margin: '32px 40px',
  justifyContent: 'space-between',
};

const statCard = {
  flex: 1,
  backgroundColor: '#f0fdf4',
  borderRadius: '8px',
  padding: '20px',
  textAlign: 'center' as const,
  border: '1px solid #86efac',
};

const statNumber = {
  fontSize: '32px',
  fontWeight: 'bold',
  color: '#16a34a',
  margin: '0 0 8px 0',
};

const statLabel = {
  fontSize: '12px',
  color: '#6b7280',
  margin: '0',
};

const creditsBox = {
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 40px',
};

const creditsTitle = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#1f2937',
  margin: '0 0 12px 0',
};

const creditsBar = {
  width: '100%',
  height: '12px',
  backgroundColor: '#e5e7eb',
  borderRadius: '6px',
  overflow: 'hidden',
  margin: '12px 0',
};

const creditsUsedBar = {
  height: '100%',
  backgroundColor: '#8b5cf6',
  borderRadius: '6px',
};

const creditsInfo = {
  fontSize: '14px',
  color: '#6b7280',
  margin: '8px 0 0 0',
  textAlign: 'center' as const,
};

const upgradeBox = {
  backgroundColor: '#fef3c7',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 40px',
  textAlign: 'center' as const,
  border: '2px solid #fbbf24',
};

const upgradeTitle = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#92400e',
  margin: '0 0 8px 0',
};

const upgradeText = {
  fontSize: '14px',
  color: '#92400e',
  margin: '0 0 16px 0',
};

const upgradeButton = {
  backgroundColor: '#16a34a',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 32px',
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
