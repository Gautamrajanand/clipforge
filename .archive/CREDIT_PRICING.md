# Credit Pricing & Usage

## Credit Calculation

**Base Rate:** 1 credit = 1 minute of video processing

## Processing Methods

### 1. Direct Upload
- **Cost:** 1 credit per minute
- **Use Case:** User uploads video file directly
- **Example:** 10-minute video = 10 credits

### 2. URL Import (YouTube, Vimeo, Rumble, etc.)
- **Cost:** 1.5 credits per minute (50% premium)
- **Use Case:** Import from external URL
- **Reason:** Accounts for external download overhead and bandwidth
- **Example:** 10-minute video = 15 credits

## Tier Allocations

### FREE Tier
- **Monthly Credits:** 60 credits
- **Equivalent:** ~60 minutes direct upload OR ~40 minutes URL import
- **Project Expiry:** 48 hours
- **Watermark:** Yes (on all exports)

### STARTER Tier ($29/month)
- **Monthly Credits:** 150 credits
- **Equivalent:** ~150 minutes direct upload OR ~100 minutes URL import
- **Project Expiry:** 90 days
- **Watermark:** No

### PRO Tier ($79/month)
- **Monthly Credits:** 300 credits
- **Equivalent:** ~300 minutes direct upload OR ~200 minutes URL import
- **Project Expiry:** Never
- **Watermark:** No

### BUSINESS Tier ($99/month)
- **Monthly Credits:** 1000 credits
- **Equivalent:** ~1000 minutes direct upload OR ~666 minutes URL import
- **Project Expiry:** Never
- **Watermark:** No
- **Team Features:** Yes

## Credit Deduction Types

All processing types use the same base calculation (1 credit/min or 1.5 credits/min for URL):

1. **CLIPS Processing** - AI clip detection and generation
2. **REFRAME Processing** - AI reframing to different aspect ratios
3. **CAPTIONS Processing** - Subtitle generation and burning

## Credit Renewal

- **Frequency:** Monthly (30 days from last reset)
- **Unused Credits:** Do not roll over
- **Cron Job:** Runs daily at 2 AM to check for renewal

## Low Credit Warnings

- **Threshold:** 10 credits or fewer
- **Notification:** Daily check at 10 AM
- **Action:** Email notification (when email service is enabled)

## Credit Transaction Log

All credit operations are logged in the `CreditTransaction` table:
- **DEDUCTION_CLIPS** - Credits used for clip processing
- **DEDUCTION_REFRAME** - Credits used for reframe processing
- **DEDUCTION_CAPTIONS** - Credits used for caption processing
- **ADDITION_PURCHASE** - Credits added via subscription
- **ADDITION_RENEWAL** - Credits added via monthly renewal
- **ADDITION_TRIAL** - Credits added for trial
- **ADDITION_REFUND** - Credits refunded
- **ADDITION_MANUAL** - Credits manually added by admin

## Examples

### Example 1: FREE Tier User
- Uploads 5-minute video directly → 5 credits deducted
- Imports 10-minute YouTube video → 15 credits deducted
- **Total Used:** 20 credits
- **Remaining:** 40 credits

### Example 2: STARTER Tier User
- Imports 20-minute podcast from YouTube → 30 credits deducted
- Uploads 30-minute webinar → 30 credits deducted
- Imports 15-minute tutorial → 23 credits deducted (rounded up)
- **Total Used:** 83 credits
- **Remaining:** 67 credits

### Example 3: PRO Tier User
- Imports 60-minute interview → 90 credits deducted
- Uploads 45-minute presentation → 45 credits deducted
- Imports 30-minute demo → 45 credits deducted
- **Total Used:** 180 credits
- **Remaining:** 120 credits
