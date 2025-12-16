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

interface OnboardingDay7EmailProps {
  userName?: string;
  tier: string;
  creditsUsed: number;
  creditsRemaining: number;
}

export const OnboardingDay7Email = ({
  userName = 'there',
  tier,
  creditsUsed,
  creditsRemaining,
}: OnboardingDay7EmailProps) => {
  const previewText = tier === 'FREE' ? 'Your trial is ending soon - Upgrade to keep creating' : 'One week with ClipForge!';

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>🎉 One Week with ClipForge!</Heading>
          
          <Text style={text}>Hi {userName},</Text>
          
          <Text style={text}>
            It's been a week since you joined ClipForge. We hope you're loving the platform!
          </Text>

          <Section style={usageBox}>
            <Text style={usageTitle}>Your Usage This Week</Text>
            <Text style={usageInfo}>
              <strong>Credits Used:</strong> {creditsUsed} minutes
            </Text>
            <Text style={usageInfo}>
              <strong>Credits Remaining:</strong> {creditsRemaining} minutes
            </Text>
            <Text style={usageInfo}>
              <strong>Current Plan:</strong> {tier}
            </Text>
          </Section>

          {tier === 'FREE' && creditsRemaining < 20 && (
            <>
              <Text style={text}>
                <strong>You're running low on credits!</strong> Upgrade to get more minutes and unlock premium features:
              </Text>

              <Section style={featureList}>
                <Text style={featureItem}>✅ 150-300 minutes per month</Text>
                <Text style={featureItem}>✅ No watermark on exports</Text>
                <Text style={featureItem}>✅ All 14+ caption styles</Text>
                <Text style={featureItem}>✅ AI Reframe & Subtitles</Text>
                <Text style={featureItem}>✅ Priority support</Text>
              </Section>

              <Section style={buttonContainer}>
                <Button
                  style={upgradeButton}
                  href={`${process.env.FRONTEND_URL || 'http://localhost:3001'}/pricing`}
                >
                  Upgrade Now - From $29/mo
                </Button>
              </Section>
            </>
          )}

          {tier !== 'FREE' && (
            <>
              <Text style={text}>
                <strong>Here's what you can do next:</strong>
              </Text>

              <Section style={tipBox}>
                <Text style={tipTitle}>📊 Track Your Performance</Text>
                <Text style={tipText}>
                  Monitor which clips get the most engagement and refine your content strategy.
                </Text>
              </Section>

              <Section style={tipBox}>
                <Text style={tipTitle}>🎨 Build Your Brand</Text>
                <Text style={tipText}>
                  Use consistent caption styles and aspect ratios to create a recognizable brand identity.
                </Text>
              </Section>

              <Section style={tipBox}>
                <Text style={tipTitle}>⚡ Batch Process</Text>
                <Text style={tipText}>
                  Upload multiple videos at once to save time and maintain a consistent posting schedule.
                </Text>
              </Section>

              <Section style={buttonContainer}>
                <Button
                  style={button}
                  href={`${process.env.FRONTEND_URL || 'http://localhost:3001'}/dashboard`}
                >
                  Continue Creating
                </Button>
              </Section>
            </>
          )}

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

export default OnboardingDay7Email;

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

const usageBox = {
  backgroundColor: '#f0f9ff',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 40px',
  border: '1px solid #7dd3fc',
};

const usageTitle = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#1f2937',
  margin: '0 0 12px 0',
};

const usageInfo = {
  fontSize: '14px',
  color: '#6b7280',
  margin: '8px 0',
};

const featureList = {
  margin: '24px 40px',
};

const featureItem = {
  fontSize: '16px',
  color: '#374151',
  margin: '12px 0',
  lineHeight: '24px',
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
