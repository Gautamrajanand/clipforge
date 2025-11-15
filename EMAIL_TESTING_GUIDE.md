# 📧 Email Notifications Testing Guide

## Overview
ClipForge now sends beautiful email notifications when video processing completes, matching the professional style of Podcastle.

## Email Types

### 1. AI Clips Ready 🎉
- **Trigger**: When clip detection completes
- **Subject**: "Your Clips are Ready!"
- **Content**: Shows number of clips detected
- **CTA**: "View My Clips" button

### 2. AI Subtitles Ready ✨
- **Trigger**: When captioned video generation completes
- **Subject**: "Your Subtitles are Ready!"
- **Content**: Notifies user their subtitled video is ready
- **CTA**: "View My Video" button

### 3. AI Reframe Ready 📐
- **Trigger**: When video reframing completes
- **Subject**: "Your Reframed Video is Ready!"
- **Content**: Shows the aspect ratio used
- **CTA**: "View My Video" button

## Setup Instructions

### Option 1: Gmail (Recommended for Testing)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Name it "ClipForge"
   - Copy the 16-character password

3. **Configure Environment Variables**:
   ```bash
   # Add to .env or docker-compose.yml
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-16-char-app-password
   SMTP_FROM=ClipForge <your-email@gmail.com>
   APP_URL=http://localhost:3001
   ```

4. **Restart API**:
   ```bash
   docker-compose restart api
   ```

### Option 2: SendGrid

1. **Create SendGrid Account**: https://signup.sendgrid.com/
2. **Generate API Key**: Settings → API Keys → Create API Key
3. **Configure**:
   ```bash
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_USER=apikey
   SMTP_PASS=your-sendgrid-api-key
   SMTP_FROM=ClipForge <noreply@yourdomain.com>
   APP_URL=http://localhost:3001
   ```

### Option 3: AWS SES

1. **Verify Email**: AWS SES Console → Email Addresses → Verify
2. **Get SMTP Credentials**: SMTP Settings → Create SMTP Credentials
3. **Configure**:
   ```bash
   SMTP_HOST=email-smtp.us-east-1.amazonaws.com
   SMTP_PORT=587
   SMTP_USER=your-smtp-username
   SMTP_PASS=your-smtp-password
   SMTP_FROM=ClipForge <verified@yourdomain.com>
   APP_URL=http://localhost:3001
   ```

## Testing Steps

### Test AI Clips Email

1. **Upload a video** (or use existing project)
2. **Wait for transcription** to complete
3. **Wait for clip detection** to complete (status: READY)
4. **Check your email inbox** for "Your Clips are Ready!"
5. **Click "View My Clips"** button - should open project page

### Test AI Subtitles Email

1. **Go to AI Subtitles mode** on a project
2. **Click "Export with Captions"**
3. **Wait for processing** to complete
4. **Check your email inbox** for "Your Subtitles are Ready!"
5. **Click "View My Video"** button - should open project page

### Test AI Reframe Email

1. **Go to AI Reframe mode** on a project
2. **Select aspect ratio** (e.g., 9:16)
3. **Click "Reframe Video"**
4. **Wait for processing** to complete
5. **Check your email inbox** for "Your Reframed Video is Ready!"
6. **Click "View My Video"** button - should open project page

## Verification Checklist

- [ ] Email arrives within 30 seconds of processing completion
- [ ] Subject line is correct
- [ ] Email renders properly (no broken HTML)
- [ ] Celebration icon displays correctly
- [ ] CTA button is visible and styled
- [ ] CTA button links to correct project URL
- [ ] Email looks good on mobile
- [ ] Email looks good in Gmail/Outlook/Apple Mail
- [ ] From address shows "ClipForge"
- [ ] No spam folder issues

## Troubleshooting

### No Email Received

1. **Check API logs**:
   ```bash
   docker logs clipforge-api | grep -i email
   ```

2. **Look for**:
   - "⚠️  SMTP credentials not configured" → Configure SMTP
   - "✅ Email service initialized" → SMTP configured correctly
   - "✅ Clips ready email sent to..." → Email sent successfully
   - "❌ Failed to send email" → Check SMTP credentials

3. **Check spam folder**

4. **Verify SMTP credentials**:
   ```bash
   # Test SMTP connection
   docker-compose exec api node -e "
   const nodemailer = require('nodemailer');
   const transport = nodemailer.createTransport({
     host: process.env.SMTP_HOST,
     port: process.env.SMTP_PORT,
     auth: {
       user: process.env.SMTP_USER,
       pass: process.env.SMTP_PASS
     }
   });
   transport.verify().then(console.log).catch(console.error);
   "
   ```

### Email Looks Broken

- Check if email client supports HTML emails
- Try viewing in Gmail web interface
- Check browser console for any errors

### Wrong Project URL

- Verify `APP_URL` environment variable is set correctly
- Should match your frontend URL (e.g., http://localhost:3001)

## Email Template Customization

To customize email templates, edit:
```
apps/api/src/email/email.service.ts
```

Methods:
- `getClipsReadyTemplate()` - AI Clips email
- `getSubtitlesReadyTemplate()` - AI Subtitles email
- `getReframeReadyTemplate()` - AI Reframe email

## Production Considerations

### Before Launch:

1. **Use a dedicated email service** (SendGrid, AWS SES, Mailgun)
2. **Set up SPF/DKIM/DMARC** records for your domain
3. **Use a custom domain** for from address (e.g., noreply@clipforge.ai)
4. **Monitor email deliverability** (bounce rates, spam complaints)
5. **Add unsubscribe link** (required by CAN-SPAM)
6. **Implement email preferences** (let users opt out)
7. **Add email tracking** (opens, clicks)
8. **Set up email templates** in your ESP dashboard
9. **Test with multiple email clients** (Gmail, Outlook, Apple Mail, etc.)
10. **Monitor sending limits** (most ESPs have daily limits)

### Recommended Services:

- **SendGrid**: 100 emails/day free, great deliverability
- **AWS SES**: $0.10 per 1,000 emails, requires verification
- **Mailgun**: 5,000 emails/month free for 3 months
- **Postmark**: Best deliverability, $10/month for 10,000 emails

## Support

If you encounter issues:
1. Check API logs: `docker logs clipforge-api`
2. Verify SMTP settings in docker-compose.yml
3. Test SMTP connection manually
4. Check email service status (Gmail, SendGrid, etc.)
