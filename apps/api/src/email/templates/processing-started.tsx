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

interface ProcessingStartedEmailProps {
  userName?: string;
  projectTitle: string;
  projectId: string;
  processingType: 'AI Clips' | 'AI Reframe' | 'AI Subtitles' | 'Export';
  estimatedTime?: string;
}

export const ProcessingStartedEmail = ({
  userName = 'there',
  projectTitle,
  projectId,
  processingType,
  estimatedTime = '5-10 minutes',
}: ProcessingStartedEmailProps) => {
  const previewText = `Your ${processingType} processing has started for "${projectTitle}"`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>⚙️ Processing Started</Heading>
          
          <Text style={text}>Hi {userName},</Text>
          
          <Text style={text}>
            Great news! We've started processing your video:
          </Text>

          <Section style={projectBox}>
            <Text style={projectTitle as any}>{projectTitle}</Text>
            <Text style={processingInfo}>
              <strong>Type:</strong> {processingType}
            </Text>
            <Text style={processingInfo}>
              <strong>Estimated time:</strong> {estimatedTime}
            </Text>
          </Section>

          <Text style={text}>
            We'll send you another email as soon as your {processingType.toLowerCase()} is ready. 
            You can also check the progress in your dashboard.
          </Text>

          <Section style={buttonContainer}>
            <Button
              style={button}
              href={`${process.env.FRONTEND_URL || 'http://localhost:3001'}/project/${projectId}`}
            >
              View Project
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
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default ProcessingStartedEmail;

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

const projectBox = {
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 40px',
  border: '1px solid #e5e7eb',
};

const projectTitle = {
  color: '#1f2937',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 12px 0',
};

const processingInfo = {
  color: '#6b7280',
  fontSize: '14px',
  margin: '8px 0',
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
