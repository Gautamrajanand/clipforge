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

interface InactivityReengagementEmailProps {
  userName?: string;
  daysSinceLastActivity: number;
  lastClipCreated?: string;
  creditsRemaining: number;
  tier: string;
  trialDaysLeft?: number;
}

export const InactivityReengagementEmail = ({
  userName = 'there',
  daysSinceLastActivity,
  lastClipCreated,
  creditsRemaining,
  tier,
  trialDaysLeft,
}: InactivityReengagementEmailProps) => {
  const previewText = `We miss you! Come back and create amazing clips with ClipForge`;
  const isTrialUser = tier === 'FREE' && trialDaysLeft !== undefined;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={h1}>
              {daysSinceLastActivity === 7 ? '👋 We Miss You!' : '🔔 Your ClipForge Account'}
            </Heading>
          </Section>

          <Section style={content}>
            <Text style={paragraph}>Hi {userName},</Text>
            
            <Text style={paragraph}>
              It's been {daysSinceLastActivity} days since you last used ClipForge
              {lastClipCreated && ` (your last clip: "${lastClipCreated}")`}. 
              We noticed you haven't been back and wanted to check in.
            </Text>

            {/* Different messaging based on user type */}
            {isTrialUser && trialDaysLeft! > 0 ? (
              <Section style={urgencyBox}>
                <Text style={urgencyIcon}>⏰</Text>
                <Text style={urgencyTitle}>Your Trial is Expiring Soon!</Text>
                <Text style={urgencyText}>
                  You have <strong>{trialDaysLeft} days left</strong> in your free trial with {creditsRemaining} credits remaining. 
                  Don't let them go to waste!
                </Text>
                <Button style={urgencyButton} href="http://localhost:3001/dashboard">
                  Use Your Free Credits →
                </Button>
              </Section>
            ) : isTrialUser && trialDaysLeft! <= 0 ? (
              <Section style={expiredBox}>
                <Text style={expiredIcon}>😢</Text>
                <Text style={expiredTitle}>Your Trial Has Ended</Text>
                <Text style={expiredText}>
                  Your 7-day free trial expired. But it's not too late! 
                  Upgrade now and get 20% off your first month.
                </Text>
                <Button style={expiredButton} href="http://localhost:3001/pricing?code=COMEBACK20">
                  Get 20% Off →
                </Button>
              </Section>
            ) : (
              <Section style={welcomeBackBox}>
                <Text style={welcomeBackIcon}>🎬</Text>
                <Text style={welcomeBackTitle}>Ready to Create Again?</Text>
                <Text style={welcomeBackText}>
                  You still have {creditsRemaining} credits waiting for you. 
                  Let's turn those videos into viral clips!
                </Text>
              </Section>
            )}

            <Hr style={divider} />

            {/* What's new section */}
            <Section style={whatsNewSection}>
              <Text style={sectionTitle}>✨ What's New Since You Left</Text>
              
              <div style={updateItem}>
                <Text style={updateIcon}>🚀</Text>
                <div style={updateContent}>
                  <Text style={updateTitle}>Faster Processing</Text>
                  <Text style={updateDescription}>
                    We've made AI Clips 2x faster. Your 10-minute video now processes in just 3 minutes!
                  </Text>
                </div>
              </div>

              <div style={updateItem}>
                <Text style={updateIcon}>🎨</Text>
                <div style={updateContent}>
                  <Text style={updateTitle}>New Caption Styles</Text>
                  <Text style={updateDescription}>
                    Added 3 new viral caption styles: Mr. Beast, Alex Hormozi, and Ali Abdaal.
                  </Text>
                </div>
              </div>

              <div style={updateItem}>
                <Text style={updateIcon}>📱</Text>
                <div style={updateContent}>
                  <Text style={updateTitle}>Better Mobile Experience</Text>
                  <Text style={updateDescription}>
                    Create and edit clips on your phone. Perfect for on-the-go creators!
                  </Text>
                </div>
              </div>
            </Section>

            <Section style={buttonContainer}>
              <Button style={primaryButton} href="http://localhost:3001/dashboard">
                Create a Clip Now →
              </Button>
            </Section>

            <Hr style={divider} />

            {/* Quick wins section */}
            <Section style={quickWinsSection}>
              <Text style={sectionTitle}>⚡ Quick Wins (5 Minutes Each)</Text>
              <Text style={paragraph}>
                Not sure where to start? Try these quick projects:
              </Text>

              <div style={quickWinCard}>
                <Text style={quickWinNumber}>1</Text>
                <div>
                  <Text style={quickWinTitle}>Repurpose Old Content</Text>
                  <Text style={quickWinDescription}>
                    Upload an old YouTube video and let AI find the best moments. 
                    Get 5-10 clips instantly.
                  </Text>
                </div>
              </div>

              <div style={quickWinCard}>
                <Text style={quickWinNumber}>2</Text>
                <div>
                  <Text style={quickWinTitle}>Try AI Reframe</Text>
                  <Text style={quickWinDescription}>
                    Convert one horizontal video to vertical for TikTok/Reels. 
                    Takes 2 minutes.
                  </Text>
                </div>
              </div>

              <div style={quickWinCard}>
                <Text style={quickWinNumber}>3</Text>
                <div>
                  <Text style={quickWinTitle}>Add Captions</Text>
                  <Text style={quickWinDescription}>
                    Take any clip and add viral-style captions. 
                    Boost engagement by 80%.
                  </Text>
                </div>
              </div>
            </Section>

            <Hr style={divider} />

            {/* Social proof */}
            <Section style={testimonialSection}>
              <Text style={testimonialQuote}>
                "I almost gave up on ClipForge, but came back after this email. 
                Now I'm creating 20+ clips per week and my engagement is through the roof!"
              </Text>
              <Text style={testimonialAuthor}>
                — Marcus T., Content Creator
              </Text>
            </Section>

            {/* Help section */}
            <Section style={helpSection}>
              <Text style={helpTitle}>Need Help? We're Here!</Text>
              <Text style={helpText}>
                Maybe you left because something wasn't working? Let us help:
              </Text>
              <ul style={helpList}>
                <li>Reply to this email with your questions</li>
                <li><Link href="http://localhost:3001/tutorials" style={link}>Watch our tutorials</Link></li>
                <li><Link href="http://localhost:3001/support" style={link}>Check the help center</Link></li>
                <li>Book a free 15-min onboarding call</li>
              </ul>
            </Section>

            {/* Final CTA */}
            <Section style={finalCtaSection}>
              <Text style={finalCtaTitle}>
                {isTrialUser && trialDaysLeft! > 0 
                  ? `Don't Waste Your ${trialDaysLeft} Days!`
                  : 'Give ClipForge Another Try'}
              </Text>
              <Text style={finalCtaText}>
                {isTrialUser && trialDaysLeft! > 0
                  ? `Your free trial ends soon. Create at least one clip before it's gone!`
                  : `You have ${creditsRemaining} credits ready to use. What are you waiting for?`}
              </Text>
              <Button style={finalCtaButton} href="http://localhost:3001/dashboard">
                {isTrialUser && trialDaysLeft! > 0 ? 'Use My Trial →' : 'Start Creating →'}
              </Button>
            </Section>

            {/* Unsubscribe option */}
            <Section style={unsubscribeSection}>
              <Text style={unsubscribeText}>
                Not interested? <Link href="http://localhost:3001/settings/emails" style={unsubscribeLink}>
                  Update your email preferences
                </Link> or let us know why you're leaving.
              </Text>
            </Section>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              You're receiving this because you haven't used ClipForge recently.
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

const urgencyBox = {
  background: 'linear-gradient(135deg, #fff3cd 0%, #ffe69c 100%)',
  borderRadius: '8px',
  padding: '32px',
  textAlign: 'center' as const,
  margin: '24px 0',
  border: '2px solid #ffc107',
};

const urgencyIcon = {
  fontSize: '48px',
  margin: '0 0 12px',
};

const urgencyTitle = {
  color: '#856404',
  fontSize: '22px',
  fontWeight: '700',
  margin: '0 0 12px',
};

const urgencyText = {
  color: '#856404',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0 0 20px',
};

const urgencyButton = {
  backgroundColor: '#ffc107',
  borderRadius: '6px',
  color: '#000000',
  fontSize: '16px',
  fontWeight: '700',
  textDecoration: 'none',
  display: 'inline-block',
  padding: '14px 32px',
  boxShadow: '0 4px 6px rgba(255, 193, 7, 0.3)',
};

const expiredBox = {
  backgroundColor: '#ffebee',
  borderRadius: '8px',
  padding: '32px',
  textAlign: 'center' as const,
  margin: '24px 0',
  border: '2px solid #ef5350',
};

const expiredIcon = {
  fontSize: '48px',
  margin: '0 0 12px',
};

const expiredTitle = {
  color: '#c62828',
  fontSize: '22px',
  fontWeight: '700',
  margin: '0 0 12px',
};

const expiredText = {
  color: '#d32f2f',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0 0 20px',
};

const expiredButton = {
  backgroundColor: '#ef5350',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '700',
  textDecoration: 'none',
  display: 'inline-block',
  padding: '14px 32px',
  boxShadow: '0 4px 6px rgba(239, 83, 80, 0.3)',
};

const welcomeBackBox = {
  backgroundColor: '#e8f5e9',
  borderRadius: '8px',
  padding: '32px',
  textAlign: 'center' as const,
  margin: '24px 0',
  border: '2px solid #66bb6a',
};

const welcomeBackIcon = {
  fontSize: '48px',
  margin: '0 0 12px',
};

const welcomeBackTitle = {
  color: '#2e7d32',
  fontSize: '22px',
  fontWeight: '700',
  margin: '0 0 12px',
};

const welcomeBackText = {
  color: '#388e3c',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0',
};

const whatsNewSection = {
  margin: '32px 0',
};

const sectionTitle = {
  color: '#32325d',
  fontSize: '20px',
  fontWeight: '700',
  margin: '0 0 20px',
};

const updateItem = {
  display: 'flex',
  alignItems: 'flex-start',
  marginBottom: '20px',
  padding: '16px',
  backgroundColor: '#f8f9fa',
  borderRadius: '8px',
};

const updateIcon = {
  fontSize: '28px',
  marginRight: '16px',
  margin: '0',
};

const updateContent = {
  flex: 1,
};

const updateTitle = {
  color: '#32325d',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 4px',
};

const updateDescription = {
  color: '#525f7f',
  fontSize: '14px',
  lineHeight: '1.5',
  margin: '0',
};

const quickWinsSection = {
  margin: '32px 0',
};

const quickWinCard = {
  display: 'flex',
  alignItems: 'flex-start',
  padding: '20px',
  backgroundColor: '#f0f4ff',
  borderRadius: '8px',
  marginBottom: '12px',
  border: '1px solid #d6e0ff',
};

const quickWinNumber = {
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
  margin: '0',
};

const quickWinTitle = {
  color: '#32325d',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 4px',
};

const quickWinDescription = {
  color: '#525f7f',
  fontSize: '14px',
  lineHeight: '1.5',
  margin: '0',
};

const testimonialSection = {
  backgroundColor: '#f8f9fa',
  borderLeft: '4px solid #667eea',
  padding: '24px',
  margin: '24px 0',
  borderRadius: '4px',
};

const testimonialQuote = {
  color: '#32325d',
  fontSize: '16px',
  lineHeight: '1.6',
  fontStyle: 'italic',
  margin: '0 0 12px',
};

const testimonialAuthor = {
  color: '#8898aa',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0',
};

const helpSection = {
  backgroundColor: '#f8f9fa',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
};

const helpTitle = {
  color: '#32325d',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 12px',
};

const helpText = {
  color: '#525f7f',
  fontSize: '14px',
  margin: '0 0 12px',
};

const helpList = {
  color: '#525f7f',
  fontSize: '14px',
  lineHeight: '1.8',
  margin: '0',
  paddingLeft: '20px',
};

const finalCtaSection = {
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  borderRadius: '8px',
  padding: '40px',
  textAlign: 'center' as const,
  margin: '32px 0',
};

const finalCtaTitle = {
  color: '#ffffff',
  fontSize: '24px',
  fontWeight: '700',
  margin: '0 0 12px',
};

const finalCtaText = {
  color: '#ffffff',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0 0 24px',
  opacity: 0.95,
};

const finalCtaButton = {
  backgroundColor: '#ffffff',
  borderRadius: '6px',
  color: '#667eea',
  fontSize: '18px',
  fontWeight: '700',
  textDecoration: 'none',
  display: 'inline-block',
  padding: '16px 40px',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
};

const unsubscribeSection = {
  textAlign: 'center' as const,
  margin: '32px 0 0',
};

const unsubscribeText = {
  color: '#8898aa',
  fontSize: '13px',
  margin: '0',
};

const unsubscribeLink = {
  color: '#667eea',
  textDecoration: 'underline',
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

export default InactivityReengagementEmail;
