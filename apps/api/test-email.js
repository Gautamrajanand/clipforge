// Quick test script to verify Resend email sending
const { Resend } = require('resend');

const resend = new Resend('re_L4SBCzhx_X1EH2fPhGN9fKDYy5bHkfJAL');

async function testEmail() {
  try {
    console.log('🧪 Testing Resend email...');
    
    const { data, error } = await resend.emails.send({
      from: 'Acme <onboarding@resend.dev>', // Use resend.dev for testing
      to: ['gautam@hubhopper.com'], // Must use the email that owns the Resend account
      subject: '🧪 Test Email from ClipForge',
      html: '<h1>Test Email</h1><p>If you receive this, Resend is working!</p>',
    });

    if (error) {
      console.error('❌ Error:', error);
      return;
    }

    console.log('✅ Email sent successfully!');
    console.log('📧 Email ID:', data.id);
  } catch (error) {
    console.error('❌ Failed:', error.message);
  }
}

testEmail();
