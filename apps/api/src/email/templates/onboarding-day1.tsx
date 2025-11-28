import * as React from 'react';
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface OnboardingDay1EmailProps {
  userName?: string;
  userEmail: string;
  hasCreatedClip: boolean;
  credits: number;
}

export const OnboardingDay1Email = ({
  userName = 'there',
  userEmail,
  hasCreatedClip,
  credits,
}: OnboardingDay1EmailProps) => {
  const previewText = hasCreatedClip 
    ? "Great start! Here's what to do next with ClipForge"
    : "Create your first AI-powered clip in under 5 minutes";

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header with gradient */}
          <Section style={header}>
            <Heading style={h1}>
              {hasCreatedClip ? '🎉 You\'re Off to a Great Start!' : '🚀 Ready to Create Your First Clip?'}
            </Heading>
          </Section>

          <Section style={content}>
            <Text style={paragraph}>Hi {userName},</Text>
            
            {!hasCreatedClip ? (
              <>
                <Text style={paragraph}>
                  You signed up for ClipForge yesterday, but haven't created your first clip yet. 
                  We know getting started can feel overwhelming, so we've made it super simple!
                </Text>

                <Section style={highlightBox}>
                  <Text style={highlightTitle}>⚡ Create Your First Clip in 3 Steps:</Text>
                  
                  <div style={stepContainer}>
                    <div style={stepNumber}>1</div>
                    <div style={stepContent}>
                      <Text style={stepTitle}>Upload Your Video</Text>
                      <Text style={stepDescription}>
                        Drop any video file (up to 120 minutes) or paste a YouTube link
                      </Text>
                    </div>
                  </div>

                  <div style={stepContainer}>
                    <div style={stepNumber}>2</div>
                    <div style={stepContent}>
                      <Text style={stepTitle}>Let AI Work Its Magic</Text>
                      <Text style={stepDescription}>
                        Our AI analyzes your video and finds the best moments automatically
                      </Text>
                    </div>
                  </div>

                  <div style={stepContainer}>
                    <div style={stepNumber}>3</div>
                    <div style={stepContent}>
                      <Text style={stepTitle}>Download & Share</Text>
                      <Text style={stepDescription}>
                        Get your clips in minutes, ready to post on social media
                      </Text>
                    </div>
                  </div>
                </Section>

                <Section style={buttonContainer}>
                  <Button style={primaryButton} href="http://localhost:3001/dashboard">
                    Create Your First Clip →
                  </Button>
                </Section>

                <Text style={paragraph}>
                  <strong>💡 Pro Tip:</strong> Your first clip usually takes 5-10 minutes. 
                  Perfect time to grab a coffee! ☕
                </Text>
              </>
            ) : (
              <>
                <Text style={paragraph}>
                  Awesome! You've already created your first clip. You're ahead of 70% of new users! 🎊
                </Text>

                <Section style={statsBox}>
                  <Text style={statsTitle}>Your ClipForge Stats</Text>
                  <div style={statRow}>
                    <Text style={statLabel}>Credits Remaining:</Text>
                    <Text style={statValue}>{credits} credits</Text>
                  </div>
                  <div style={statRow}>
                    <Text style={statLabel}>Days Left in Trial:</Text>
                    <Text style={statValue}>6 days</Text>
                  </div>
                </Section>

                <Text style={paragraph}>
                  <strong>🎯 What's Next?</strong>
                </Text>

                <Section style={featureGrid}>
                  <div style={featureCard}>
                    <Text style={featureIcon}>✂️</Text>
                    <Text style={featureTitle}>Try AI Clips</Text>
                    <Text style={featureDescription}>
                      Let AI find the best moments in your videos
                    </Text>
                  </div>

                  <div style={featureCard}>
                    <Text style={featureIcon}>🎨</Text>
                    <Text style={featureTitle}>Add Captions</Text>
                    <Text style={featureDescription}>
                      14 professional caption styles to choose from
                    </Text>
                  </div>

                  <div style={featureCard}>
                    <Text style={featureIcon}>📱</Text>
                    <Text style={featureTitle}>AI Reframe</Text>
                    <Text style={featureDescription}>
                      Auto-crop for vertical social media formats
                    </Text>
                  </div>
                </Section>

                <Section style={buttonContainer}>
                  <Button style={primaryButton} href="http://localhost:3001/dashboard">
                    Create Another Clip →
                  </Button>
                </Section>
              </>
            )}

            <Hr style={divider} />

            {/* Social proof */}
            <Section style={socialProof}>
              <Text style={socialProofTitle}>Join 10,000+ Creators</Text>
              <Text style={socialProofText}>
                "ClipForge cut my editing time from 2 hours to 10 minutes. Game changer!" 
                <br />
                <span style={socialProofAuthor}>— Sarah K., YouTube Creator</span>
              </Text>
            </Section>

            {/* Help section */}
            <Section style={helpSection}>
              <Text style={helpTitle}>Need Help Getting Started?</Text>
              <Text style={helpText}>
                • Watch our <Link href="http://localhost:3001/tutorials" style={link}>2-minute tutorial</Link>
                <br />
                • Check out <Link href="http://localhost:3001/examples" style={link}>example clips</Link>
                <br />
                • Reply to this email with questions (we respond in &lt;2 hours!)
              </Text>
            </Section>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              You're receiving this because you signed up for ClipForge.
              <br />
              <Link href="http://localhost:3001/settings/emails" style={footerLink}>
                Email Preferences
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

// Styles - Modern, clean design inspired by Stripe and Linear
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '0',
  marginBottom: '64px',
  maxWidth: '600px',
  borderRadius: '8px',
  overflow: 'hidden',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)',
};

const header = {
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  padding: '40px 40px 40px 40px',
  textAlign: 'center' as const,
};

const h1 = {
  color: '#ffffff',
  fontSize: '28px',
  fontWeight: '700',
  margin: '0',
  lineHeight: '1.3',
};

const content = {
  padding: '40px',
};

const paragraph = {
  color: '#525f7f',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0 0 16px',
};

const highlightBox = {
  backgroundColor: '#f8f9fa',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
  border: '2px solid #e3e8ee',
};

const highlightTitle = {
  color: '#32325d',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 20px',
};

const stepContainer = {
  display: 'flex',
  alignItems: 'flex-start',
  marginBottom: '20px',
};

const stepNumber = {
  backgroundColor: '#667eea',
  color: '#ffffff',
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '16px',
  fontWeight: '700',
  marginRight: '16px',
  flexShrink: 0,
};

const stepContent = {
  flex: 1,
};

const stepTitle = {
  color: '#32325d',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 4px',
};

const stepDescription = {
  color: '#525f7f',
  fontSize: '14px',
  lineHeight: '1.5',
  margin: '0',
};

const statsBox = {
  backgroundColor: '#f0f4ff',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
  border: '1px solid #d6e0ff',
};

const statsTitle = {
  color: '#32325d',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 16px',
};

const statRow = {
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: '8px',
};

const statLabel = {
  color: '#525f7f',
  fontSize: '14px',
  margin: '0',
};

const statValue = {
  color: '#32325d',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0',
};

const featureGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: '16px',
  margin: '24px 0',
};

const featureCard = {
  textAlign: 'center' as const,
  padding: '16px',
  backgroundColor: '#f8f9fa',
  borderRadius: '8px',
};

const featureIcon = {
  fontSize: '32px',
  margin: '0 0 8px',
};

const featureTitle = {
  color: '#32325d',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0 0 4px',
};

const featureDescription = {
  color: '#525f7f',
  fontSize: '12px',
  lineHeight: '1.4',
  margin: '0',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const primaryButton = {
  backgroundColor: '#667eea',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 32px',
  boxShadow: '0 4px 6px rgba(102, 126, 234, 0.25)',
};

const divider = {
  borderColor: '#e3e8ee',
  margin: '32px 0',
};

const socialProof = {
  backgroundColor: '#fffbf0',
  borderLeft: '4px solid #ffc107',
  padding: '20px',
  margin: '24px 0',
  borderRadius: '4px',
};

const socialProofTitle = {
  color: '#32325d',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0 0 8px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
};

const socialProofText = {
  color: '#525f7f',
  fontSize: '15px',
  lineHeight: '1.6',
  margin: '0',
  fontStyle: 'italic',
};

const socialProofAuthor = {
  fontStyle: 'normal',
  fontWeight: '500',
  color: '#32325d',
};

const helpSection = {
  backgroundColor: '#f8f9fa',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
};

const helpTitle = {
  color: '#32325d',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 12px',
};

const helpText = {
  color: '#525f7f',
  fontSize: '14px',
  lineHeight: '1.8',
  margin: '0',
};

const link = {
  color: '#667eea',
  textDecoration: 'underline',
};

const footer = {
  padding: '32px 40px',
  backgroundColor: '#f6f9fc',
  borderTop: '1px solid #e3e8ee',
};

const footerText = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '1.6',
  margin: '0',
  textAlign: 'center' as const,
};

const footerLink = {
  color: '#667eea',
  textDecoration: 'underline',
};

export default OnboardingDay1Email;
