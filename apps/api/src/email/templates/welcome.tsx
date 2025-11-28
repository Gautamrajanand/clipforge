import * as React from 'react';
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface WelcomeEmailProps {
  userName?: string;
  userEmail: string;
  tier: string;
  credits: number;
}

export const WelcomeEmail = ({
  userName = 'there',
  userEmail,
  tier,
  credits,
}: WelcomeEmailProps) => {
  const previewText = `Welcome to ClipForge! Start creating amazing video clips today.`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={h1}>🎬 Welcome to ClipForge!</Heading>
          </Section>

          <Section style={content}>
            <Text style={paragraph}>Hi {userName},</Text>
            
            <Text style={paragraph}>
              Welcome to ClipForge! We're thrilled to have you on board. Your account has been successfully created and you're ready to start creating amazing video content.
            </Text>

            <Section style={statsBox}>
              <Text style={statsTitle}>Your Account Details</Text>
              <Text style={statsItem}>📧 Email: {userEmail}</Text>
              <Text style={statsItem}>💎 Plan: {tier}</Text>
              <Text style={statsItem}>⚡ Credits: {credits}</Text>
            </Section>

            <Text style={paragraph}>
              <strong>What you can do with ClipForge:</strong>
            </Text>

            <ul style={list}>
              <li style={listItem}>✨ Generate AI-powered video clips automatically</li>
              <li style={listItem}>🎯 Reframe videos to any aspect ratio</li>
              <li style={listItem}>📝 Add AI-generated subtitles</li>
              <li style={listItem}>🎨 Customize and edit your clips</li>
              <li style={listItem}>📊 Track your projects and usage</li>
            </ul>

            <Section style={buttonContainer}>
              <Button style={button} href="http://localhost:3001/dashboard">
                Get Started
              </Button>
            </Section>

            <Text style={paragraph}>
              Need help getting started? Check out our{' '}
              <Link href="http://localhost:3001/help" style={link}>
                Help Center
              </Link>{' '}
              or reply to this email with any questions.
            </Text>

            <Text style={paragraph}>
              Happy creating! 🚀
            </Text>

            <Text style={signature}>
              The ClipForge Team
            </Text>
          </Section>

          <Section style={footer}>
            <Text style={footerText}>
              © 2025 ClipForge. All rights reserved.
            </Text>
            <Text style={footerText}>
              You're receiving this email because you signed up for ClipForge.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default WelcomeEmail;

// Styles
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

const header = {
  padding: '32px 48px',
  textAlign: 'center' as const,
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
};

const h1 = {
  color: '#ffffff',
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '0',
  padding: '0',
};

const content = {
  padding: '0 48px',
};

const paragraph = {
  color: '#525f7f',
  fontSize: '16px',
  lineHeight: '24px',
  textAlign: 'left' as const,
  marginBottom: '16px',
};

const statsBox = {
  backgroundColor: '#f6f9fc',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
};

const statsTitle = {
  color: '#32325d',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 16px 0',
};

const statsItem = {
  color: '#525f7f',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '8px 0',
};

const list = {
  color: '#525f7f',
  fontSize: '16px',
  lineHeight: '24px',
  paddingLeft: '20px',
  marginBottom: '16px',
};

const listItem = {
  marginBottom: '8px',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#667eea',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 32px',
};

const link = {
  color: '#667eea',
  textDecoration: 'underline',
};

const signature = {
  color: '#8898aa',
  fontSize: '16px',
  lineHeight: '24px',
  marginTop: '32px',
};

const footer = {
  padding: '0 48px',
  marginTop: '32px',
  borderTop: '1px solid #e6ebf1',
  paddingTop: '32px',
};

const footerText = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  textAlign: 'center' as const,
  margin: '8px 0',
};
