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

interface WeeklySummaryEmailProps {
  userName?: string;
  weekStart: string;
  weekEnd: string;
  clipsCreated: number;
  videosProcessed: number;
  creditsUsed: number;
  creditsRemaining: number;
  totalMinutesProcessed: number;
  mostUsedFeature: string;
  tier: string;
}

export const WeeklySummaryEmail = ({
  userName = 'there',
  weekStart,
  weekEnd,
  clipsCreated,
  videosProcessed,
  creditsUsed,
  creditsRemaining,
  totalMinutesProcessed,
  mostUsedFeature,
  tier,
}: WeeklySummaryEmailProps) => {
  const previewText = `Your ClipForge week: ${clipsCreated} clips created, ${totalMinutesProcessed} minutes processed`;
  const timeSaved = Math.round(totalMinutesProcessed * 0.8); // Assume 80% time saved vs manual editing

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={h1}>📊 Your ClipForge Week</Heading>
            <Text style={headerSubtitle}>
              {weekStart} - {weekEnd}
            </Text>
          </Section>

          <Section style={content}>
            <Text style={paragraph}>Hi {userName},</Text>
            
            {clipsCreated > 0 ? (
              <>
                <Text style={paragraph}>
                  Great week! Here's what you accomplished with ClipForge:
                </Text>

                {/* Stats grid */}
                <Section style={statsGrid}>
                  <div style={statCard}>
                    <Text style={statIcon}>✂️</Text>
                    <Text style={statValue}>{clipsCreated}</Text>
                    <Text style={statLabel}>Clips Created</Text>
                  </div>

                  <div style={statCard}>
                    <Text style={statIcon}>🎬</Text>
                    <Text style={statValue}>{videosProcessed}</Text>
                    <Text style={statLabel}>Videos Processed</Text>
                  </div>

                  <div style={statCard}>
                    <Text style={statIcon}>⏱️</Text>
                    <Text style={statValue}>{totalMinutesProcessed}</Text>
                    <Text style={statLabel}>Minutes Processed</Text>
                  </div>

                  <div style={statCard}>
                    <Text style={statIcon}>⚡</Text>
                    <Text style={statValue}>{timeSaved}</Text>
                    <Text style={statLabel}>Minutes Saved</Text>
                  </div>
                </Section>

                {/* Time saved highlight */}
                <Section style={highlightBox}>
                  <Text style={highlightIcon}>🎉</Text>
                  <Text style={highlightTitle}>
                    You saved {timeSaved} minutes this week!
                  </Text>
                  <Text style={highlightText}>
                    That's {Math.round(timeSaved / 60)} hours you can spend creating more content 
                    instead of editing. Keep it up!
                  </Text>
                </Section>

                {/* Credits status */}
                <Section style={creditsSection}>
                  <div style={creditsHeader}>
                    <Text style={creditsTitle}>Credit Usage</Text>
                    <Text style={creditsTier}>{tier} Plan</Text>
                  </div>
                  
                  <div style={creditsBar}>
                    <div style={{
                      ...creditsBarFill,
                      width: `${Math.min((creditsUsed / (creditsUsed + creditsRemaining)) * 100, 100)}%`
                    }} />
                  </div>
                  
                  <div style={creditsStats}>
                    <div>
                      <Text style={creditsLabel}>Used This Week</Text>
                      <Text style={creditsValue}>{creditsUsed} credits</Text>
                    </div>
                    <div style={{textAlign: 'right' as const}}>
                      <Text style={creditsLabel}>Remaining</Text>
                      <Text style={creditsValue}>{creditsRemaining} credits</Text>
                    </div>
                  </div>

                  {creditsRemaining < 20 && tier === 'FREE' && (
                    <Section style={warningBox}>
                      <Text style={warningText}>
                        ⚠️ You're running low on credits! Upgrade to PRO for 300 credits/month.
                      </Text>
                      <Button style={warningButton} href="http://localhost:3001/pricing">
                        View Plans →
                      </Button>
                    </Section>
                  )}
                </Section>

                {/* Most used feature */}
                <Section style={featureSection}>
                  <Text style={featureTitle}>🌟 Your Favorite Feature</Text>
                  <div style={featureCard}>
                    <Text style={featureName}>{mostUsedFeature}</Text>
                    <Text style={featureDescription}>
                      {mostUsedFeature === 'AI Clips' && 'You love finding viral moments automatically!'}
                      {mostUsedFeature === 'AI Captions' && 'Captions are key to engagement - great choice!'}
                      {mostUsedFeature === 'AI Reframe' && 'Vertical videos are crushing it on social!'}
                    </Text>
                  </div>
                </Section>

                <Hr style={divider} />

                {/* Recommendations */}
                <Section style={recommendationsSection}>
                  <Text style={sectionTitle}>💡 Recommendations for Next Week</Text>
                  
                  {clipsCreated < 5 && (
                    <div style={recommendationItem}>
                      <Text style={recommendationIcon}>🎯</Text>
                      <div>
                        <Text style={recommendationTitle}>Create more clips</Text>
                        <Text style={recommendationText}>
                          You created {clipsCreated} clips. Try for 10 next week to maximize your reach!
                        </Text>
                      </div>
                    </div>
                  )}

                  {mostUsedFeature !== 'AI Captions' && (
                    <div style={recommendationItem}>
                      <Text style={recommendationIcon}>💬</Text>
                      <div>
                        <Text style={recommendationTitle}>Try AI Captions</Text>
                        <Text style={recommendationText}>
                          Videos with captions get 80% more engagement. Add them in one click!
                        </Text>
                      </div>
                    </div>
                  )}

                  {mostUsedFeature !== 'AI Reframe' && (
                    <div style={recommendationItem}>
                      <Text style={recommendationIcon}>📱</Text>
                      <div>
                        <Text style={recommendationTitle}>Go vertical with AI Reframe</Text>
                        <Text style={recommendationText}>
                          Vertical videos perform 3x better on TikTok and Instagram Reels.
                        </Text>
                      </div>
                    </div>
                  )}
                </Section>

                <Section style={buttonContainer}>
                  <Button style={primaryButton} href="http://localhost:3001/dashboard">
                    Create More Clips →
                  </Button>
                </Section>
              </>
            ) : (
              <>
                <Text style={paragraph}>
                  We noticed you didn't create any clips this week. Everything okay?
                </Text>

                <Section style={inactiveBox}>
                  <Text style={inactiveTitle}>🤔 Need Help Getting Started?</Text>
                  <Text style={inactiveText}>
                    We're here to help! Here are some resources:
                  </Text>
                  <ul style={inactiveList}>
                    <li><Link href="http://localhost:3001/tutorials" style={link}>Watch 2-minute tutorial</Link></li>
                    <li><Link href="http://localhost:3001/examples" style={link}>See example clips</Link></li>
                    <li>Reply to this email with questions</li>
                  </ul>
                  <Button style={secondaryButton} href="http://localhost:3001/dashboard">
                    Create Your First Clip
                  </Button>
                </Section>
              </>
            )}

            <Hr style={divider} />

            {/* Social proof */}
            <Section style={socialSection}>
              <Text style={socialTitle}>Join the Community</Text>
              <Text style={socialText}>
                10,000+ creators are using ClipForge to grow their audience. 
                Share your wins with #ClipForge!
              </Text>
              <div style={socialLinks}>
                <Link href="https://twitter.com/clipforge" style={socialLink}>Twitter</Link>
                <span style={socialDivider}>•</span>
                <Link href="https://discord.gg/clipforge" style={socialLink}>Discord</Link>
                <span style={socialDivider}>•</span>
                <Link href="https://instagram.com/clipforge" style={socialLink}>Instagram</Link>
              </div>
            </Section>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              You're receiving weekly summaries because you're an active ClipForge user.
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
  margin: '0 0 8px',
  lineHeight: '1.3',
};

const headerSubtitle = {
  color: '#ffffff',
  fontSize: '14px',
  margin: '0',
  opacity: 0.9,
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

const statsGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: '16px',
  margin: '24px 0',
};

const statCard = {
  backgroundColor: '#f8f9fa',
  borderRadius: '8px',
  padding: '20px',
  textAlign: 'center' as const,
  border: '1px solid #e3e8ee',
};

const statIcon = {
  fontSize: '32px',
  margin: '0 0 8px',
};

const statValue = {
  color: '#32325d',
  fontSize: '32px',
  fontWeight: '700',
  margin: '0',
  lineHeight: '1',
};

const statLabel = {
  color: '#8898aa',
  fontSize: '12px',
  fontWeight: '500',
  margin: '8px 0 0',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
};

const highlightBox = {
  background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
  borderRadius: '8px',
  padding: '24px',
  textAlign: 'center' as const,
  margin: '24px 0',
  border: '2px solid #81c784',
};

const highlightIcon = {
  fontSize: '48px',
  margin: '0 0 12px',
};

const highlightTitle = {
  color: '#2e7d32',
  fontSize: '20px',
  fontWeight: '700',
  margin: '0 0 8px',
};

const highlightText = {
  color: '#388e3c',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '0',
};

const creditsSection = {
  backgroundColor: '#f8f9fa',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
};

const creditsHeader = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '16px',
};

const creditsTitle = {
  color: '#32325d',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0',
};

const creditsTier = {
  backgroundColor: '#667eea',
  color: '#ffffff',
  fontSize: '12px',
  fontWeight: '600',
  padding: '4px 12px',
  borderRadius: '12px',
  margin: '0',
};

const creditsBar = {
  backgroundColor: '#e3e8ee',
  borderRadius: '4px',
  height: '8px',
  overflow: 'hidden',
  marginBottom: '12px',
};

const creditsBarFill = {
  backgroundColor: '#667eea',
  height: '100%',
};

const creditsStats = {
  display: 'flex',
  justifyContent: 'space-between',
};

const creditsLabel = {
  color: '#8898aa',
  fontSize: '12px',
  margin: '0 0 4px',
};

const creditsValue = {
  color: '#32325d',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0',
};

const warningBox = {
  backgroundColor: '#fff3cd',
  borderRadius: '6px',
  padding: '16px',
  marginTop: '16px',
  textAlign: 'center' as const,
};

const warningText = {
  color: '#856404',
  fontSize: '14px',
  margin: '0 0 12px',
};

const warningButton = {
  backgroundColor: '#ffc107',
  borderRadius: '6px',
  color: '#000000',
  fontSize: '14px',
  fontWeight: '600',
  textDecoration: 'none',
  display: 'inline-block',
  padding: '10px 24px',
};

const featureSection = {
  margin: '24px 0',
};

const featureTitle = {
  color: '#32325d',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 12px',
};

const featureCard = {
  backgroundColor: '#f0f4ff',
  borderRadius: '8px',
  padding: '20px',
  border: '1px solid #d6e0ff',
};

const featureName = {
  color: '#667eea',
  fontSize: '18px',
  fontWeight: '700',
  margin: '0 0 8px',
};

const featureDescription = {
  color: '#525f7f',
  fontSize: '14px',
  margin: '0',
};

const recommendationsSection = {
  margin: '24px 0',
};

const sectionTitle = {
  color: '#32325d',
  fontSize: '18px',
  fontWeight: '700',
  margin: '0 0 20px',
};

const recommendationItem = {
  display: 'flex',
  alignItems: 'flex-start',
  marginBottom: '16px',
  padding: '16px',
  backgroundColor: '#f8f9fa',
  borderRadius: '8px',
};

const recommendationIcon = {
  fontSize: '24px',
  marginRight: '12px',
  margin: '0',
};

const recommendationTitle = {
  color: '#32325d',
  fontSize: '15px',
  fontWeight: '600',
  margin: '0 0 4px',
};

const recommendationText = {
  color: '#525f7f',
  fontSize: '13px',
  lineHeight: '1.5',
  margin: '0',
};

const inactiveBox = {
  backgroundColor: '#fff8e1',
  borderRadius: '8px',
  padding: '32px',
  textAlign: 'center' as const,
  margin: '24px 0',
  border: '2px solid #ffd54f',
};

const inactiveTitle = {
  color: '#f57c00',
  fontSize: '20px',
  fontWeight: '700',
  margin: '0 0 12px',
};

const inactiveText = {
  color: '#e65100',
  fontSize: '16px',
  margin: '0 0 16px',
};

const inactiveList = {
  color: '#e65100',
  fontSize: '14px',
  lineHeight: '1.8',
  textAlign: 'left' as const,
  margin: '0 auto 20px',
  maxWidth: '300px',
};

const socialSection = {
  textAlign: 'center' as const,
  padding: '24px',
  backgroundColor: '#f8f9fa',
  borderRadius: '8px',
};

const socialTitle = {
  color: '#32325d',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 8px',
};

const socialText = {
  color: '#525f7f',
  fontSize: '14px',
  margin: '0 0 16px',
};

const socialLinks = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '12px',
};

const socialLink = {
  color: '#667eea',
  fontSize: '14px',
  fontWeight: '600',
  textDecoration: 'none',
};

const socialDivider = {
  color: '#8898aa',
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

const secondaryButton = {
  backgroundColor: '#667eea',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: '600',
  textDecoration: 'none',
  display: 'inline-block',
  padding: '12px 24px',
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

export default WeeklySummaryEmail;
