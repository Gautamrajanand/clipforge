# Stripe Live Mode Setup Guide

**Date:** November 29, 2025  
**Goal:** Switch from Stripe test mode to live mode for production payments  
**Duration:** 1 hour (estimated)

---

## 🎯 **Objective**

Configure Stripe for production use with live API keys, webhooks, and real payment processing.

---

## ✅ **Prerequisites**

Before starting, ensure you have:

1. ✅ Stripe account created
2. ✅ Business information submitted to Stripe
3. ✅ Bank account connected for payouts
4. ✅ Identity verification complete
5. ✅ Tax information submitted

---

## 📋 **Step-by-Step Guide**

### **Step 1: Activate Stripe Account**

1. Log in to [Stripe Dashboard](https://dashboard.stripe.com)
2. Complete business profile:
   - Business name: ClipForge
   - Business type: Software/SaaS
   - Website: https://clipforge.ai
   - Description: AI-powered video clipping platform
3. Submit required documents:
   - Business registration (if applicable)
   - ID verification
   - Tax forms (W-9 for US, equivalent for other countries)
4. Connect bank account for payouts
5. Wait for Stripe approval (usually 1-2 business days)

---

### **Step 2: Get Live API Keys**

1. Go to [API Keys](https://dashboard.stripe.com/apikeys)
2. Click "Reveal live key token"
3. Copy the following keys:
   - **Publishable key:** `pk_live_...`
   - **Secret key:** `sk_live_...`
4. Store securely (never commit to git!)

---

### **Step 3: Create Products & Prices**

#### **STARTER Plan**

1. Go to [Products](https://dashboard.stripe.com/products)
2. Click "Add product"
3. Configure:
   - **Name:** ClipForge STARTER
   - **Description:** 150 credits/month, AI Clips, No watermark
   - **Pricing:**
     - Monthly: $19/month
     - Yearly: $190/year (save $38)
   - **Billing period:** Monthly or Yearly
   - **Payment type:** Recurring
4. Save and copy Price IDs:
   - Monthly: `price_xxx_monthly`
   - Yearly: `price_xxx_yearly`

#### **PRO Plan**

1. Click "Add product"
2. Configure:
   - **Name:** ClipForge PRO
   - **Description:** 300 credits/month, Team workspace (2 seats), Brand templates
   - **Pricing:**
     - Monthly: $49/month
     - Yearly: $490/year (save $98)
3. Save and copy Price IDs

#### **BUSINESS Plan**

1. Click "Add product"
2. Configure:
   - **Name:** ClipForge BUSINESS
   - **Description:** Unlimited credits, 10+ seats, Custom branding, API access
   - **Pricing:**
     - Monthly: $99/month
     - Yearly: $990/year (save $198)
3. Save and copy Price IDs

---

### **Step 4: Configure Webhooks**

1. Go to [Webhooks](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. Configure:
   - **Endpoint URL:** `https://api.clipforge.ai/v1/webhooks/stripe`
   - **Description:** ClipForge production webhook
   - **Events to send:**
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
     - `customer.created`
     - `customer.updated`
4. Save and copy **Webhook signing secret:** `whsec_...`

---

### **Step 5: Update Environment Variables**

Update `.env` file with live keys:

```bash
# Stripe Live Mode
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Stripe Price IDs (Live)
STRIPE_STARTER_MONTHLY_PRICE_ID=price_xxxxxxxxxxxxxxxxxxxxx
STRIPE_STARTER_YEARLY_PRICE_ID=price_xxxxxxxxxxxxxxxxxxxxx
STRIPE_PRO_MONTHLY_PRICE_ID=price_xxxxxxxxxxxxxxxxxxxxx
STRIPE_PRO_YEARLY_PRICE_ID=price_xxxxxxxxxxxxxxxxxxxxx
STRIPE_BUSINESS_MONTHLY_PRICE_ID=price_xxxxxxxxxxxxxxxxxxxxx
STRIPE_BUSINESS_YEARLY_PRICE_ID=price_xxxxxxxxxxxxxxxxxxxxx
```

---

### **Step 6: Update Frontend Environment**

Update `apps/web/.env.local`:

```bash
# Stripe Live Mode (Frontend)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

### **Step 7: Test Live Mode**

#### **Test Checkout Flow**

1. Start services: `docker-compose up -d`
2. Open app: http://localhost:3001
3. Sign up with real email
4. Click "Upgrade to STARTER"
5. Use **real credit card** (will be charged!)
6. Complete payment
7. Verify:
   - Payment appears in Stripe Dashboard
   - Subscription created
   - User tier updated in database
   - Credits allocated (150)

#### **Test Webhook**

1. Go to Stripe Dashboard → Webhooks
2. Click on your webhook endpoint
3. Click "Send test webhook"
4. Select event: `checkout.session.completed`
5. Verify:
   - Webhook received (check logs)
   - Event processed correctly
   - Database updated

---

### **Step 8: Configure Razorpay (India)**

1. Log in to [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Go to Settings → API Keys
3. Generate live keys:
   - **Key ID:** `rzp_live_...`
   - **Key Secret:** `...`
4. Create plans:
   - STARTER: ₹1,499/month
   - PRO: ₹3,999/month
   - BUSINESS: ₹7,999/month
5. Configure webhook:
   - URL: `https://api.clipforge.ai/v1/webhooks/razorpay`
   - Secret: Generate and save
6. Update `.env`:

```bash
# Razorpay Live Mode
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
RAZORPAY_WEBHOOK_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

### **Step 9: Security Checklist**

Before going live, verify:

- [ ] API keys are in `.env` (not committed to git)
- [ ] `.env` is in `.gitignore`
- [ ] Webhook secrets are secure
- [ ] HTTPS enabled on production domain
- [ ] Stripe webhook endpoint uses HTTPS
- [ ] Test mode keys removed from production
- [ ] Database backups enabled
- [ ] Error logging configured (Sentry)
- [ ] Rate limiting active
- [ ] CORS configured correctly

---

### **Step 10: Monitoring Setup**

1. **Stripe Dashboard Monitoring:**
   - Enable email notifications for failed payments
   - Set up daily revenue reports
   - Configure dispute alerts

2. **Application Monitoring:**
   - Check webhook delivery logs
   - Monitor subscription creation/cancellation
   - Track failed payment attempts
   - Alert on webhook failures

3. **Database Monitoring:**
   - Verify subscription status updates
   - Check credit allocation
   - Monitor transaction logs

---

## 🧪 **Testing Checklist**

### **Payment Flow**
- [ ] Checkout session creates successfully
- [ ] Payment processes correctly
- [ ] Webhook received and processed
- [ ] Subscription created in database
- [ ] User tier updated
- [ ] Credits allocated
- [ ] Email sent (subscription confirmation)

### **Subscription Management**
- [ ] Upgrade works (FREE → STARTER → PRO)
- [ ] Downgrade works (PRO → STARTER → FREE)
- [ ] Cancel subscription works
- [ ] Reactivate subscription works
- [ ] Billing portal accessible

### **Webhook Events**
- [ ] `checkout.session.completed` processed
- [ ] `customer.subscription.created` processed
- [ ] `customer.subscription.updated` processed
- [ ] `customer.subscription.deleted` processed
- [ ] `invoice.payment_succeeded` processed
- [ ] `invoice.payment_failed` processed

### **Error Handling**
- [ ] Failed payment handled gracefully
- [ ] Expired card handled
- [ ] Insufficient funds handled
- [ ] Webhook retry works
- [ ] User notified of issues

---

## ⚠️ **Important Notes**

### **Live Mode Differences**

1. **Real Money:**
   - All transactions use real credit cards
   - Actual charges will be made
   - Refunds affect real money

2. **Webhook Delivery:**
   - Must use HTTPS (not HTTP)
   - Must be publicly accessible
   - Must respond within 30 seconds

3. **Testing:**
   - Use small amounts for testing ($0.50)
   - Refund test transactions immediately
   - Monitor Stripe Dashboard closely

4. **Compliance:**
   - PCI compliance required
   - GDPR compliance if EU customers
   - Tax collection may be required

---

## 🚨 **Rollback Plan**

If issues occur in live mode:

1. **Immediate:**
   - Switch back to test keys
   - Restart services
   - Notify users of maintenance

2. **Investigation:**
   - Check Stripe Dashboard for errors
   - Review webhook logs
   - Check database consistency

3. **Fix:**
   - Identify root cause
   - Test fix in staging
   - Re-deploy to production

4. **Communication:**
   - Email affected users
   - Offer refunds if needed
   - Update status page

---

## ✅ **Success Criteria**

Live mode is ready when:

1. ✅ All test payments succeed
2. ✅ Webhooks process correctly
3. ✅ Subscriptions create/update/cancel
4. ✅ Credits allocate correctly
5. ✅ Emails send properly
6. ✅ No errors in logs
7. ✅ Monitoring active
8. ✅ Security verified

---

## 📝 **Post-Launch Monitoring**

### **First 24 Hours:**
- Monitor every transaction
- Check webhook delivery
- Verify database updates
- Watch for errors

### **First Week:**
- Daily revenue reports
- Failed payment analysis
- Webhook success rate
- User feedback

### **Ongoing:**
- Weekly financial reports
- Monthly churn analysis
- Quarterly security audit
- Continuous monitoring

---

## 🎉 **Next Steps After Live Mode**

1. ✅ Test real payment flow
2. ✅ Monitor first transactions
3. ✅ Verify webhook processing
4. ✅ Update documentation
5. ✅ Proceed to Day 3 (AI Reframe framing)

---

**Status:** Ready to configure  
**Risk Level:** Medium (real money involved)  
**Estimated Time:** 1 hour  
**Dependencies:** Stripe account approval
