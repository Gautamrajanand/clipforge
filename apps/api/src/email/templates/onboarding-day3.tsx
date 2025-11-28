import * as React from 'react';
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

interface OnboardingDay3EmailProps {
  userName?: string;
  clipsCreated: number;
  creditsUsed: number;
  creditsRemaining: number;
}

export const OnboardingDay3Email = ({
  userName = 'there',
  clipsCreated,
  creditsUsed,
  creditsRemaining,
}: OnboardingDay3EmailProps) => {
  const previewText = `You've created ${clipsCreated} clips! Here's how to get even more from ClipForge`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={h1}>
              🎓 Master ClipForge in 5 Minutes
            </Heading>
          </Section>

          <Section style={content}>
            <Text style={paragraph}>Hi {userName},</Text>
            
            <Text style={paragraph}>
              You've been using ClipForge for 3 days now{clipsCreated > 0 && ` and created ${clipsCreated} clips`}! 
              Here are the features that will 10x your content creation:
            </Text>

            {/* Progress bar */}
            {clipsCreated > 0 && (
              <Section style={progressSection}>
                <Text style={progressTitle}>Your Progress</Text>
                <div style={progressBar}>
                  <div style={{...progressFill, width: `${Math.min((clipsCreated / 5) * 100, 100)}%`}} />
                </div>
                <Text style={progressText}>
                  {clipsCreated}/5 clips created • {creditsRemaining} credits remaining
                </Text>
              </Section>
            )}

            {/* Feature showcase */}
            <Section style={featureSection}>
              <Text style={sectionTitle}>🚀 Power Features You Should Try</Text>

              {/* Feature 1 */}
              <div style={featureBlock}>
                <div style={featureHeader}>
                  <Text style={featureIcon}>✂️</Text>
                  <Text style={featureTitle}>AI Clips - Find Viral Moments</Text>
                </div>
                <Text style={featureDescription}>
                  Our AI analyzes your entire video and automatically identifies the most engaging moments. 
                  Perfect for podcasts, webinars, and long-form content.
                </Text>
                <div style={featureMeta}>
                  <span style={featureBadge}>⚡ 10x faster than manual editing</span>
                  <span style={featureCost}>1 credit = 1 minute</span>
                </div>
              </div>

              {/* Feature 2 */}
              <div style={featureBlock}>
                <div style={featureHeader}>
                  <Text style={featureIcon}>💬</Text>
                  <Text style={featureTitle}>AI Captions - 14 Styles</Text>
                </div>
                <Text style={featureDescription}>
                  Add professional captions in seconds. Choose from 14 viral styles including 
                  Mr. Beast, Alex Hormozi, and Ali Abdaal formats.
                </Text>
                <div style={featureMeta}>
                  <span style={featureBadge}>📈 80% higher engagement</span>
                  <span style={featureCost}>Free with any clip</span>
                </div>
              </div>

              {/* Feature 3 */}
              <div style={featureBlock}>
                <div style={featureHeader}>
                  <Text style={featureIcon}>📱</Text>
                  <Text style={featureTitle}>AI Reframe - Auto Vertical</Text>
                </div>
                <Text style={featureDescription}>
                  Automatically crop horizontal videos to vertical (9:16) for TikTok, Instagram Reels, 
                  and YouTube Shorts. AI keeps the speaker in frame.
                </Text>
                <div style={featureMeta}>
                  <span style={featureBadge}>🎯 Perfect for social</span>
                  <span style={featureCost}>1 credit per video</span>
                </div>
              </div>
            </Section>

            <Section style={buttonContainer}>
              <Button style={primaryButton} href="http://localhost:3001/dashboard">
                Try These Features Now →
              </Button>
            </Section>

            <Hr style={divider} />

            {/* Pro tips */}
            <Section style={tipsSection}>
              <Text style={sectionTitle}>💡 Pro Tips from Top Creators</Text>
              
              <div style={tipItem}>
                <Text style={tipNumber}>1</Text>
                <div style={tipContent}>
                  <Text style={tipTitle}>Upload longer videos</Text>
                  <Text style={tipDescription}>
                    AI Clips works best with 10-60 minute videos. More content = better clips.
                  </Text>
                </div>
              </div>

              <div style={tipItem}>
                <Text style={tipNumber}>2</Text>
                <div style={tipContent}>
                  <Text style={tipTitle}>Batch process multiple videos</Text>
                  <Text style={tipDescription}>
                    Upload 5 videos at once, let them process overnight. Wake up to 50+ clips ready to post.
                  </Text>
                </div>
              </div>

              <div style={tipItem}>
                <Text style={tipNumber}>3</Text>
                <div style={tipContent}>
                  <Text style={tipTitle}>Use caption styles strategically</Text>
                  <Text style={tipDescription}>
                    Mr. Beast style for entertainment, Hormozi for business, Ali Abdaal for education.
                  </Text>
                </div>
              </div>
            </Section>

            <Hr style={divider} />

            {/* CTA based on usage */}
            {clipsCreated === 0 ? (
              <Section style={ctaBox}>
                <Text style={ctaTitle}>⏰ Your Trial is Ticking</Text>
                <Text style={ctaText}>
                  You have {creditsRemaining} credits and 4 days left in your free trial. 
                  Don't let them go to waste!
                </Text>
                <Section style={buttonContainer}>
                  <Button style={secondaryButton} href="http://localhost:3001/dashboard">
                    Create Your First Clip
                  </Button>
                </Section>
              </Section>
            ) : clipsCreated < 3 ? (
              <Section style={ctaBox}>
                <Text style={ctaTitle}>🎯 Challenge: Create 5 Clips</Text>
                <Text style={ctaText}>
                  You're at {clipsCreated}/5 clips. Users who create 5+ clips in their first week 
                  are 3x more likely to upgrade. Can you do it?
                </Text>
              </Section>
            ) : (
              <Section style={ctaBox}>
                <Text style={ctaTitle}>🌟 You're Crushing It!</Text>
                <Text style={ctaText}>
                  {clipsCreated} clips created! You're in the top 20% of users. 
                  Ready to unlock unlimited clips with PRO?
                </Text>
                <Section style={buttonContainer}>
                  <Button style={secondaryButton} href="http://localhost:3001/pricing">
                    View PRO Plans →
                  </Button>
                </Section>
              </Section>
            )}

            {/* Help section */}
            <Section style={helpSection}>
              <Text style={helpTitle}>Questions? We're Here to Help</Text>
              <Text style={helpText}>
                • 📺 <Link href="http://localhost:3001/tutorials" style={link}>Watch video tutorials</Link>
                <br />
                • 📖 <Link href="http://localhost:3001/docs" style={link}>Read the documentation</Link>
                <br />
                • 💬 Reply to this email (we respond in &lt;2 hours)
                <br />
                • 🎯 <Link href="http://localhost:3001/examples" style={link}>See example clips</Link>
              </Text>
            </Section>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              You're receiving this because you're in your ClipForge trial.
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

// Styles
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
  padding: '40px',
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

const progressSection = {
  backgroundColor: '#f8f9fa',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
};

const progressTitle = {
  color: '#32325d',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0 0 12px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
};

const progressBar = {
  backgroundColor: '#e3e8ee',
  borderRadius: '4px',
  height: '8px',
  overflow: 'hidden',
  marginBottom: '8px',
};

const progressFill = {
  backgroundColor: '#667eea',
  height: '100%',
  transition: 'width 0.3s ease',
};

const progressText = {
  color: '#525f7f',
  fontSize: '12px',
  margin: '0',
};

const featureSection = {
  margin: '32px 0',
};

const sectionTitle = {
  color: '#32325d',
  fontSize: '20px',
  fontWeight: '700',
  margin: '0 0 24px',
};

const featureBlock = {
  backgroundColor: '#f8f9fa',
  borderRadius: '8px',
  padding: '20px',
  marginBottom: '16px',
  border: '1px solid #e3e8ee',
};

const featureHeader = {
  display: 'flex',
  alignItems: 'center',
  marginBottom: '12px',
};

const featureIcon = {
  fontSize: '24px',
  marginRight: '12px',
  margin: '0',
};

const featureTitle = {
  color: '#32325d',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0',
};

const featureDescription = {
  color: '#525f7f',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '0 0 12px',
};

const featureMeta = {
  display: 'flex',
  gap: '12px',
  flexWrap: 'wrap' as const,
};

const featureBadge = {
  backgroundColor: '#e8f5e9',
  color: '#2e7d32',
  fontSize: '12px',
  fontWeight: '600',
  padding: '4px 8px',
  borderRadius: '4px',
};

const featureCost = {
  color: '#8898aa',
  fontSize: '12px',
};

const tipsSection = {
  margin: '32px 0',
};

const tipItem = {
  display: 'flex',
  alignItems: 'flex-start',
  marginBottom: '20px',
};

const tipNumber = {
  backgroundColor: '#667eea',
  color: '#ffffff',
  width: '28px',
  height: '28px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '14px',
  fontWeight: '700',
  marginRight: '16px',
  flexShrink: 0,
  margin: '0',
};

const tipContent = {
  flex: 1,
};

const tipTitle = {
  color: '#32325d',
  fontSize: '15px',
  fontWeight: '600',
  margin: '0 0 4px',
};

const tipDescription = {
  color: '#525f7f',
  fontSize: '14px',
  lineHeight: '1.5',
  margin: '0',
};

const ctaBox = {
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  borderRadius: '8px',
  padding: '32px',
  textAlign: 'center' as const,
  margin: '32px 0',
};

const ctaTitle = {
  color: '#ffffff',
  fontSize: '20px',
  fontWeight: '700',
  margin: '0 0 12px',
};

const ctaText = {
  color: '#ffffff',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0 0 20px',
  opacity: 0.95,
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '24px 0',
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

const secondaryButton = {
  backgroundColor: '#ffffff',
  borderRadius: '6px',
  color: '#667eea',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 32px',
  border: '2px solid rgba(255, 255, 255, 0.3)',
};

const divider = {
  borderColor: '#e3e8ee',
  margin: '32px 0',
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

export default OnboardingDay3Email;
