# Payment Gateway Setup Guide

This guide covers setting up both **Stripe** (global markets) and **Razorpay** (India) payment gateways.

---

## 🌍 Stripe Setup (Global Markets)

### 1. Create Stripe Account
1. Go to [https://dashboard.stripe.com/register](https://dashboard.stripe.com/register)
2. Sign up for a free account
3. Complete business verification (for production)

### 2. Get API Keys
1. Navigate to **Developers → API Keys**
2. Copy your keys:
   - **Publishable key**: `pk_test_...` (for frontend)
   - **Secret key**: `sk_test_...` (for backend)

### 3. Create Products & Prices
1. Go to **Products → Add Product**
2. Create three products:

#### STARTER Plan
- Name: `ClipForge Starter`
- Description: `300 minutes/month, 3 API keys, 30 req/min`
- Pricing:
  - Monthly: `$19/month` → Copy Price ID: `price_starter_monthly`
  - Yearly: `$190/year` → Copy Price ID: `price_starter_yearly`

#### PRO Plan
- Name: `ClipForge Pro`
- Description: `1000 minutes/month, 10 API keys, 100 req/min`
- Pricing:
  - Monthly: `$49/month` → Copy Price ID: `price_pro_monthly`
  - Yearly: `$490/year` → Copy Price ID: `price_pro_yearly`

#### BUSINESS Plan
- Name: `ClipForge Business`
- Description: `5000 minutes/month, 50 API keys, 500 req/min`
- Pricing:
  - Monthly: `$99/month` → Copy Price ID: `price_business_monthly`
  - Yearly: `$990/year` → Copy Price ID: `price_business_yearly`

### 4. Update Price IDs in Code
Edit `apps/api/src/payments/payments.service.ts`:
```typescript
private readonly plans = {
  STARTER: {
    stripe: {
      monthly: 'price_1ABC123...', // Your actual price ID
      yearly: 'price_1XYZ789...',
      // ...
    },
  },
  // ... repeat for PRO and BUSINESS
};
```

### 5. Set Up Webhooks
1. Go to **Developers → Webhooks**
2. Click **Add endpoint**
3. Endpoint URL: `https://your-domain.com/v1/payments/webhooks/stripe`
4. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy **Signing secret**: `whsec_...`

### 6. Add to Environment Variables
```bash
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

---

## 🇮🇳 Razorpay Setup (India)

### 1. Create Razorpay Account
1. Go to [https://dashboard.razorpay.com/signup](https://dashboard.razorpay.com/signup)
2. Sign up with your business details
3. Complete KYC verification (for production)

### 2. Get API Keys
1. Navigate to **Settings → API Keys**
2. Generate Test/Live keys:
   - **Key ID**: `rzp_test_...`
   - **Key Secret**: `...` (keep this secret!)

### 3. Create Subscription Plans
1. Go to **Subscriptions → Plans → Create Plan**
2. Create three plans:

#### STARTER Plan
- Plan Name: `ClipForge Starter`
- Billing Frequency: `Monthly` / `Yearly`
- Amount:
  - Monthly: `₹1,499` → Copy Plan ID: `plan_starter_monthly`
  - Yearly: `₹14,990` → Copy Plan ID: `plan_starter_yearly`

#### PRO Plan
- Plan Name: `ClipForge Pro`
- Billing Frequency: `Monthly` / `Yearly`
- Amount:
  - Monthly: `₹3,999` → Copy Plan ID: `plan_pro_monthly`
  - Yearly: `₹39,990` → Copy Plan ID: `plan_pro_yearly`

#### BUSINESS Plan
- Plan Name: `ClipForge Business`
- Billing Frequency: `Monthly` / `Yearly`
- Amount:
  - Monthly: `₹7,999` → Copy Plan ID: `plan_business_monthly`
  - Yearly: `₹79,990` → Copy Plan ID: `plan_business_yearly`

### 4. Update Plan IDs in Code
Edit `apps/api/src/payments/payments.service.ts`:
```typescript
private readonly plans = {
  STARTER: {
    razorpay: {
      monthly: 'plan_ABC123...', // Your actual plan ID
      yearly: 'plan_XYZ789...',
      // ...
    },
  },
  // ... repeat for PRO and BUSINESS
};
```

### 5. Set Up Webhooks
1. Go to **Settings → Webhooks**
2. Click **Create Webhook**
3. Webhook URL: `https://your-domain.com/v1/payments/webhooks/razorpay`
4. Select events:
   - `subscription.activated`
   - `subscription.cancelled`
   - `payment.captured`
   - `payment.failed`
5. Copy **Webhook Secret**

### 6. Add to Environment Variables
```bash
RAZORPAY_KEY_ID="rzp_test_..."
RAZORPAY_KEY_SECRET="..."
RAZORPAY_WEBHOOK_SECRET="..."
```

---

## 🧪 Testing

### Test Mode
Both Stripe and Razorpay provide test modes:

**Stripe Test Cards:**
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- 3D Secure: `4000 0025 0000 3155`

**Razorpay Test Cards:**
- Success: Any valid card number (e.g., `4111 1111 1111 1111`)
- CVV: Any 3 digits
- Expiry: Any future date

### Local Testing with Webhooks
Use **ngrok** or **Stripe CLI** to test webhooks locally:

```bash
# Stripe CLI
stripe listen --forward-to localhost:3000/v1/payments/webhooks/stripe

# ngrok
ngrok http 3000
# Then update webhook URL in dashboard
```

---

## 🚀 Production Checklist

### Stripe
- [ ] Switch to live API keys (`sk_live_...`)
- [ ] Update webhook endpoint to production URL
- [ ] Enable production mode in dashboard
- [ ] Set up billing portal
- [ ] Configure tax settings
- [ ] Set up email receipts

### Razorpay
- [ ] Complete KYC verification
- [ ] Switch to live API keys (`rzp_live_...`)
- [ ] Update webhook endpoint to production URL
- [ ] Configure payment methods (UPI, Cards, NetBanking)
- [ ] Set up automatic settlements
- [ ] Enable email notifications

### General
- [ ] Test complete payment flow
- [ ] Test subscription cancellation
- [ ] Test failed payments
- [ ] Test webhook delivery
- [ ] Set up monitoring/alerts
- [ ] Document customer support process

---

## 🔒 Security Best Practices

1. **Never commit API keys** to version control
2. **Use environment variables** for all secrets
3. **Verify webhook signatures** (already implemented)
4. **Use HTTPS** in production
5. **Rotate keys** periodically
6. **Monitor for suspicious activity**
7. **Set up fraud detection** (Stripe Radar, Razorpay Shield)

---

## 📊 Pricing Strategy

### Current Pricing (as of Nov 2025)

| Plan | Global (USD) | India (INR) | Credits/Month | API Keys | Rate Limit |
|------|-------------|-------------|---------------|----------|------------|
| FREE | $0 | ₹0 | 60 min | 1 | 10 req/min |
| STARTER | $19 | ₹1,499 | 300 min | 3 | 30 req/min |
| PRO | $49 | ₹3,999 | 1000 min | 10 | 100 req/min |
| BUSINESS | $99 | ₹7,999 | 5000 min | 50 | 500 req/min |

**Yearly Discount:** ~17% (10 months price for 12 months)

---

## 🆘 Troubleshooting

### Webhook Not Receiving Events
1. Check webhook URL is publicly accessible
2. Verify webhook secret matches
3. Check webhook event selection
4. Review webhook logs in dashboard

### Payment Failing
1. Check API keys are correct
2. Verify test mode vs live mode
3. Check customer has valid payment method
4. Review error logs

### Subscription Not Updating
1. Check webhook is processing correctly
2. Verify database updates in webhook handler
3. Check organization ID mapping
4. Review application logs

---

## 📞 Support

- **Stripe Support:** [https://support.stripe.com](https://support.stripe.com)
- **Razorpay Support:** [https://razorpay.com/support](https://razorpay.com/support)
- **ClipForge Docs:** `/docs/PAYMENT_SETUP.md`

---

**Last Updated:** November 20, 2025
