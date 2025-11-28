import * as React from 'react';
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface CreditAdjustmentEmailProps {
  userName?: string;
  amount: number;
  reason: string;
  balanceBefore: number;
  balanceAfter: number;
  adjustedBy: string;
}

export const CreditAdjustmentEmail = ({
  userName = 'there',
  amount,
  reason,
  balanceBefore,
  balanceAfter,
  adjustedBy,
}: CreditAdjustmentEmailProps) => {
  const isPositive = amount > 0;
  const previewText = `Your ClipForge credits have been ${isPositive ? 'increased' : 'decreased'} by ${Math.abs(amount)}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={isPositive ? headerPositive : headerNegative}>
            <Heading style={h1}>
              {isPositive ? '✨ Credits Added' : '📉 Credits Adjusted'}
            </Heading>
          </Section>

          <Section style={content}>
            <Text style={paragraph}>Hi {userName},</Text>
            
            <Text style={paragraph}>
              Your ClipForge credit balance has been {isPositive ? 'increased' : 'decreased'} by an administrator.
            </Text>

            <Section style={isPositive ? adjustmentBoxPositive : adjustmentBoxNegative}>
              <Text style={adjustmentTitle}>Credit Adjustment Details</Text>
              
              <div style={adjustmentRow}>
                <Text style={adjustmentLabel}>Amount:</Text>
                <Text style={isPositive ? adjustmentValuePositive : adjustmentValueNegative}>
                  {isPositive ? '+' : ''}{amount} credits
                </Text>
              </div>

              <div style={adjustmentRow}>
                <Text style={adjustmentLabel}>Previous Balance:</Text>
                <Text style={adjustmentValue}>{balanceBefore} credits</Text>
              </div>

              <div style={adjustmentRow}>
                <Text style={adjustmentLabel}>New Balance:</Text>
                <Text style={adjustmentValueBold}>{balanceAfter} credits</Text>
              </div>

              <div style={adjustmentRow}>
                <Text style={adjustmentLabel}>Reason:</Text>
                <Text style={adjustmentValue}>{reason}</Text>
              </div>

              <div style={adjustmentRow}>
                <Text style={adjustmentLabel}>Adjusted By:</Text>
                <Text style={adjustmentValue}>{adjustedBy}</Text>
              </div>
            </Section>

            {isPositive && (
              <Text style={paragraph}>
                🎉 Great news! You now have more credits to create amazing video content. Start using them right away!
              </Text>
            )}

            {!isPositive && balanceAfter < 20 && (
              <Text style={warningText}>
                ⚠️ Your credit balance is low. Consider upgrading your plan or managing your usage to avoid interruptions.
              </Text>
            )}

            <Section style={buttonContainer}>
              <Button style={button} href="http://localhost:3001/dashboard">
                View Dashboard
              </Button>
            </Section>

            <Text style={paragraph}>
              If you have any questions about this adjustment, please contact our support team.
            </Text>

            <Text style={signature}>
              The ClipForge Team
            </Text>
          </Section>

          <Section style={footer}>
            <Text style={footerText}>
              © 2025 ClipForge. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default CreditAdjustmentEmail;

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

const headerPositive = {
  padding: '32px 48px',
  textAlign: 'center' as const,
  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
};

const headerNegative = {
  padding: '32px 48px',
  textAlign: 'center' as const,
  background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
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

const adjustmentBoxPositive = {
  backgroundColor: '#f0fdf4',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
  border: '2px solid #10b981',
};

const adjustmentBoxNegative = {
  backgroundColor: '#f6f9fc',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
  border: '2px solid #6366f1',
};

const adjustmentTitle = {
  color: '#32325d',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 16px 0',
};

const adjustmentRow = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '12px',
};

const adjustmentLabel = {
  color: '#525f7f',
  fontSize: '14px',
  margin: '0',
};

const adjustmentValue = {
  color: '#32325d',
  fontSize: '14px',
  margin: '0',
};

const adjustmentValueBold = {
  color: '#32325d',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0',
};

const adjustmentValuePositive = {
  color: '#10b981',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0',
};

const adjustmentValueNegative = {
  color: '#ef4444',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0',
};

const warningText = {
  color: '#f59e0b',
  fontSize: '16px',
  lineHeight: '24px',
  backgroundColor: '#fef3c7',
  padding: '16px',
  borderRadius: '8px',
  marginBottom: '16px',
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
