#!/bin/bash

echo "🚀 Testing Email System Directly"
echo "================================="
echo ""

# Test welcome email directly via Resend service
echo "📧 Sending test welcome email..."
echo ""

# Execute inside Docker container
docker exec clipforge-api node -e "
const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

async function sendTest() {
  try {
    const result = await resend.emails.send({
      from: 'ClipForge <noreply@clipforge.ai>',
      to: 'gautam@hubhopper.com',
      subject: '🎉 Test Email - ClipForge Email System',
      html: '<h1>Success!</h1><p>Your email system is working perfectly!</p><p>This is a test email sent at ' + new Date().toISOString() + '</p>'
    });
    console.log('✅ Email sent successfully!');
    console.log('Email ID:', result.id);
  } catch (error) {
    console.error('❌ Error sending email:', error.message);
  }
}

sendTest();
"

echo ""
echo "✅ Test complete! Check your inbox at gautam@hubhopper.com"
echo "   (Also check SPAM folder)"
