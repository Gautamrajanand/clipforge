# Email System Setup Guide

## Overview
ClipForge uses Resend for transactional emails with React Email templates. This guide covers setup, testing, and best practices for PLG email flows.

## Prerequisites
- Resend account (https://resend.com)
- Domain verification (or use resend.dev for testing)
- API key from Resend dashboard

## Quick Start

### 1. Get Resend API Key

```bash
# Sign up at https://resend.com
# Verify your domain (or use resend.dev for testing)
# Get API key from dashboard
```

### 2. Add Environment Variables

```bash
# In .env file
RESEND_API_KEY=re_xxxxxxxxxxxxx
FROM_EMAIL=ClipForge <noreply@clipforge.ai>
APP_URL=http://localhost:3001
```

### 3. Restart API Container

```bash
docker-compose restart api
```

## Email Triggers

### 1. Welcome Email
**Trigger**: User signs up (first time)  
**Timing**: Instant (< 1 second)  
**Purpose**: Onboarding, activation  
**Open Rate**: 60-80% (industry standard)

**Includes**:
- Account details (email, plan, credits)
- What they can do
- Clear CTA to dashboard
- Free credits highlight

**Code Location**: `apps/api/src/auth/clerk-sync.service.ts`

### 2. Credit Low Warning
**Trigger**: Credits drop below 20%  
**Timing**: Immediate after deduction  
**Purpose**: Drive upgrades  
**Conversion Rate**: 8-12% (industry standard)

**Includes**:
- Current credits vs allocation
- Visual progress bar
- What happens when out
- Upgrade options (FREE tier only)
- Reset date (if applicable)

**Code Location**: `apps/api/src/credits/credit-monitor.service.ts`

### 3. Credit Adjustment Notification
**Trigger**: Admin adjusts credits  
**Timing**: Instant  
**Purpose**: Transparency, trust  

**Includes**:
- Amount adjusted (+ or -)
- Reason provided by admin
- Balance before/after
- Adjusted by (admin name)

**Code Location**: `apps/api/src/admin/admin.service.ts`

### 4. Payment Confirmation
**Trigger**: Successful payment (Stripe webhook)  
**Timing**: Instant  
**Purpose**: Confirmation, reassurance  

**Includes**:
- Plan details
- Amount paid
- Credits added
- Next billing date
- Invoice download link

**Code Location**: TBD (Stripe integration)

### 5. Trial Expiry Warning
**Trigger**: 3 days before trial ends  
**Timing**: Scheduled (cron job)  
**Purpose**: Convert trial users  
**Conversion Rate**: 15-25% (industry standard)

**Includes**:
- Days remaining
- Expiry date
- What they'll lose
- Plan comparison
- Upgrade CTAs

**Code Location**: TBD (Cron service)

## Testing

### Test Welcome Email

```bash
# Sign up with a real email address
# Check inbox within 1 minute
```

### Test Credit Low Warning

```bash
# 1. Create user with FREE tier (60 credits)
# 2. Use credits until < 12 remaining (20%)
# 3. Check inbox for warning email
```

### Test Credit Adjustment

```bash
# 1. Go to /admin/users
# 2. Adjust credits for a user
# 3. Check user's inbox for notification
```

## Email Templates

All templates are in: `apps/api/src/email/templates/`

- `welcome.tsx` - Welcome email
- `credit-low.tsx` - Low credit warning
- `credit-adjustment.tsx` - Admin credit adjustment
- `payment-confirmation.tsx` - Payment success
- `trial-expiry.tsx` - Trial ending soon

### Template Features
- ✅ Mobile responsive (table-based layout)
- ✅ Modern gradients and styling
- ✅ Emoji icons for visual appeal
- ✅ Clear CTAs with buttons
- ✅ Personalization (name, email, data)
- ✅ Professional footer

## Monitoring

### Check Email Logs

```bash
# API logs
docker-compose logs api | grep "email"

# Look for:
# ✅ Welcome email sent to user@example.com
# ✅ Low credit warning sent to user@example.com
# ✅ Credit adjustment email sent to user@example.com
```

### Resend Dashboard

- View sent emails
- Check delivery status
- Monitor open rates
- Track click rates
- Review bounces/complaints

## Best Practices

### 1. Timing is Critical
- Welcome emails: < 1 second (instant)
- Transactional: < 5 seconds
- Behavioral: Within 1 hour
- Scheduled: Exact time (cron)

### 2. Personalization is Mandatory
- Always use user's name
- Include relevant data (credits, tier)
- Contextual CTAs
- Segment by tier/behavior

### 3. Mobile-First Design
- 60%+ opens on mobile
- Large buttons (44px min)
- Single column layout
- Readable fonts (16px min)

### 4. Clear CTAs
- One primary action per email
- Prominent button
- Action-oriented copy
- Trackable links

### 5. Deliverability
- Verify domain (SPF, DKIM, DMARC)
- Warm up sending (gradual increase)
- Monitor bounce rate (< 2%)
- Avoid spam triggers

## Troubleshooting

### Emails Not Sending

**Check 1**: API key configured?
```bash
docker-compose exec api env | grep RESEND
```

**Check 2**: API logs for errors
```bash
docker-compose logs api | grep "email" | grep "❌"
```

**Check 3**: Resend dashboard
- Check API key status
- View error logs
- Verify domain

### Emails in Spam

**Solution 1**: Verify domain
- Add SPF record
- Add DKIM record
- Add DMARC record

**Solution 2**: Improve content
- Remove spam trigger words
- Balance text/images
- Include unsubscribe link
- Use reputable from address

### Low Open Rates

**Expected Rates**:
- Welcome: 60-80%
- Transactional: 40-60%
- Behavioral: 20-40%
- Marketing: 15-25%

**Improvements**:
- Better subject lines
- Send time optimization
- Personalization
- Mobile optimization
- A/B testing

## Environment Variables

```bash
# Required
RESEND_API_KEY=re_xxxxxxxxxxxxx

# Optional (with defaults)
FROM_EMAIL=ClipForge <noreply@clipforge.ai>
APP_URL=http://localhost:3001

# For production
APP_URL=https://clipforge.ai
FROM_EMAIL=ClipForge <hello@clipforge.ai>
```

## Production Checklist

- [ ] Domain verified in Resend
- [ ] SPF record added
- [ ] DKIM record added
- [ ] DMARC record added
- [ ] API key in production env
- [ ] FROM_EMAIL uses verified domain
- [ ] APP_URL points to production
- [ ] Test all 5 email types
- [ ] Monitor deliverability (>95%)
- [ ] Set up alerts for failures

## Metrics to Track

### Email Performance
- **Delivery Rate**: >98%
- **Open Rate**: >40% (transactional)
- **Click Rate**: >10% (with CTA)
- **Bounce Rate**: <2%
- **Complaint Rate**: <0.1%

### Business Impact
- **Welcome Email → First Action**: <24 hours
- **Low Credit Warning → Upgrade**: 8-12%
- **Trial Expiry → Conversion**: 15-25%
- **Credit Adjustment → Satisfaction**: >90%

## Support

### Resend Support
- Docs: https://resend.com/docs
- Status: https://status.resend.com
- Email: support@resend.com

### ClipForge Issues
- Check API logs first
- Review this documentation
- Test with resend.dev domain
- Contact dev team

## Next Steps

1. **Set up Resend account** (5 min)
2. **Add API key to .env** (1 min)
3. **Restart API container** (30 sec)
4. **Test welcome email** (sign up)
5. **Monitor Resend dashboard** (ongoing)

## Advanced Features (Future)

- [ ] A/B testing (subject lines, content)
- [ ] Email preferences (frequency, types)
- [ ] Unsubscribe management
- [ ] Email analytics dashboard
- [ ] Automated sequences (drip campaigns)
- [ ] Segment-based targeting
- [ ] Dynamic content blocks
- [ ] Send time optimization
- [ ] Re-engagement campaigns
- [ ] Referral email flows

---

**Status**: ✅ Production Ready  
**Last Updated**: November 28, 2025  
**Version**: 1.0.0
