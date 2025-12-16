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

interface OnboardingDay14EmailProps {
  userName?: string;
  tier: string;
  totalProjects: number;
  totalClips: number;
  totalMinutesProcessed: number;
}

export const OnboardingDay14Email = ({
  userName = 'there',
  tier,
  totalProjects,
  totalClips,
  totalMinutesProcessed,
}: OnboardingDay14EmailProps) => {
  const previewText = `2 weeks with ClipForge - You've created ${totalClips} clips!`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>🚀 Two Weeks of Creating!</Heading>
          
          <Text style={text}>Hi {userName},</Text>
          
          <Text style={text}>
            It's been two weeks since you joined ClipForge. Here's your impact:
          </Text>

          <Section style={statsBox}>
            <div style={statRow}>
              <div style={statItem}>
                <Text style={statNumber}>{totalProjects}</Text>
                <Text style={statLabel}>Projects</Text>
              </div>
              <div style={statItem}>
                <Text style={statNumber}>{totalClips}</Text>
                <Text style={statLabel}>Clips Created</Text>
              </div>
              <div style={statItem}>
                <Text style={statNumber}>{totalMinutesProcessed}</Text>
                <Text style={statLabel}>Minutes Processed</Text>
              </div>
            </div>
          </Section>

          {tier === 'FREE' && (
            <>
              <Text style={text}>
                <strong>Ready to level up?</strong> You've seen what ClipForge can do. Here's what you get with a paid plan:
              </Text>

              <Section style={comparisonBox}>
                <div style={comparisonColumn}>
                  <Text style={comparisonTitle}>FREE (Current)</Text>
                  <Text style={comparisonItem}>✓ 60 minutes/month</Text>
                  <Text style={comparisonItem}>✓ Basic features</Text>
                  <Text style={comparisonItem}>⚠️ Watermark on exports</Text>
                  <Text style={comparisonItem}>⚠️ 48-hour project expiry</Text>
                </div>
                <div style={comparisonColumn}>
                  <Text style={comparisonTitlePro}>STARTER ($29/mo)</Text>
                  <Text style={comparisonItemPro}>✓ 150 minutes/month</Text>
                  <Text style={comparisonItemPro}>✓ All features</Text>
                  <Text style={comparisonItemPro}>✓ No watermark</Text>
                  <Text style={comparisonItemPro}>✓ 90-day storage</Text>
                </div>
              </Section>

              <Section style={buttonContainer}>
                <Button
                  style={upgradeButton}
                  href={`${process.env.FRONTEND_URL || 'http://localhost:3001'}/pricing`}
                >
                  Upgrade to Starter - $29/mo
                </Button>
              </Section>

              <Text style={guaranteeText}>
                💯 <strong>30-day money-back guarantee.</strong> Try it risk-free!
              </Text>
            </>
          )}

          {tier !== 'FREE' && (
            <>
              <Text style={text}>
                <strong>You're crushing it!</strong> Here are some advanced tips:
              </Text>

              <Section style={tipBox}>
                <Text style={tipTitle}>🎯 Optimize for Each Platform</Text>
                <Text style={tipText}>
                  TikTok loves 15-30s clips, Instagram prefers 30-60s, and YouTube Shorts work best at 45-60s. 
                  Adjust your clip length accordingly.
                </Text>
              </Section>

              <Section style={tipBox}>
                <Text style={tipTitle}>📈 Analyze What Works</Text>
                <Text style={tipText}>
                  Track which caption styles and aspect ratios get the most engagement, then double down on what works.
                </Text>
              </Section>

              <Section style={tipBox}>
                <Text style={tipTitle}>⚡ Create a Content Calendar</Text>
                <Text style={tipText}>
                  Batch-create clips on Sundays, schedule posts throughout the week. Consistency is key to growth.
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
            </>
          )}

          <Hr style={hr} />

          <Text style={helpText}>
            <strong>Need help or have feedback?</strong> We'd love to hear from you! Reply to this email 
            or reach out to support@clipforge.ai
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

export default OnboardingDay14Email;

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
  backgroundColor: '#f0fdf4',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 40px',
  border: '1px solid #86efac',
};

const statRow = {
  display: 'flex',
  justifyContent: 'space-around',
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

const comparisonBox = {
  display: 'flex',
  gap: '16px',
  margin: '24px 40px',
};

const comparisonColumn = {
  flex: 1,
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
  padding: '20px',
  border: '1px solid #e5e7eb',
};

const comparisonTitle = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#6b7280',
  margin: '0 0 16px 0',
  textAlign: 'center' as const,
};

const comparisonTitlePro = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#8b5cf6',
  margin: '0 0 16px 0',
  textAlign: 'center' as const,
};

const comparisonItem = {
  fontSize: '14px',
  color: '#6b7280',
  margin: '8px 0',
};

const comparisonItemPro = {
  fontSize: '14px',
  color: '#374151',
  margin: '8px 0',
  fontWeight: '500' as const,
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

const guaranteeText = {
  fontSize: '14px',
  color: '#374151',
  textAlign: 'center' as const,
  margin: '16px 40px',
};

const helpText = {
  fontSize: '14px',
  color: '#374151',
  lineHeight: '22px',
  margin: '24px 40px',
  padding: '16px',
  backgroundColor: '#f0f9ff',
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
