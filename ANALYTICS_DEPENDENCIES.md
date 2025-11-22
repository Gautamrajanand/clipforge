# Analytics Dependencies

## Required NPM Packages

### Install in Frontend (`apps/web`)

```bash
cd apps/web

# Mixpanel
npm install mixpanel-browser
npm install --save-dev @types/mixpanel-browser

# Google Analytics 4
npm install react-ga4

# PostHog (Optional)
npm install posthog-js
```

## Environment Variables

Add to `.env.local`:

```bash
# Mixpanel
NEXT_PUBLIC_MIXPANEL_TOKEN=your_mixpanel_project_token

# Google Analytics 4
NEXT_PUBLIC_GA4_MEASUREMENT_ID=G-XXXXXXXXXX

# PostHog (Optional)
NEXT_PUBLIC_POSTHOG_KEY=phc_your_posthog_key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

## Getting API Keys

### Mixpanel
1. Go to https://mixpanel.com/
2. Sign up / Log in
3. Create new project "ClipForge"
4. Go to Settings → Project Settings
5. Copy "Project Token"

### Google Analytics 4
1. Go to https://analytics.google.com/
2. Create new GA4 property
3. Go to Admin → Data Streams
4. Create web stream for your domain
5. Copy "Measurement ID" (starts with G-)

### PostHog (Optional)
1. Go to https://posthog.com/
2. Sign up / Log in
3. Create new project
4. Go to Settings → Project
5. Copy "Project API Key"

## Integration Steps

### 1. Install Dependencies
```bash
cd apps/web
npm install mixpanel-browser react-ga4 posthog-js
npm install --save-dev @types/mixpanel-browser
```

### 2. Add Environment Variables
Create/update `.env.local` with your API keys

### 3. Wrap App with AnalyticsProvider
In `apps/web/app/layout.tsx`:

```tsx
import { AnalyticsProvider } from '@/components/providers/AnalyticsProvider';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AnalyticsProvider>
          {children}
        </AnalyticsProvider>
      </body>
    </html>
  );
}
```

### 4. Use Analytics in Components
```tsx
import { useAnalytics } from '@/hooks/useAnalytics';

function MyComponent() {
  const { track } = useAnalytics();
  
  const handleClick = () => {
    track('button_clicked', { buttonName: 'Upgrade' });
  };
  
  return <button onClick={handleClick}>Upgrade</button>;
}
```

## Verification

### Check Browser Console
After installing and configuring, you should see:
```
✅ Mixpanel initialized
✅ GA4 initialized
✅ PostHog initialized (if configured)
```

### Check Network Tab
Look for requests to:
- `api.mixpanel.com` (Mixpanel)
- `google-analytics.com` (GA4)
- `app.posthog.com` (PostHog)

### Check Dashboards
- Mixpanel: Events should appear in Live View
- GA4: Real-time reports should show activity
- PostHog: Events should appear in Activity

## Testing in Development

Analytics will work in development mode with debug logging enabled. Check console for:
```
📊 Event tracked: project_created { projectId: '123', type: 'CLIPS' }
👤 User identified: user_123 { email: 'test@example.com', tier: 'FREE' }
📄 Page viewed: Dashboard
```

## Production Deployment

Before deploying to production:
1. ✅ Verify all API keys are set in production environment
2. ✅ Test analytics in staging environment
3. ✅ Confirm events appear in dashboards
4. ✅ Set up alerts for key metrics
5. ✅ Configure data retention policies
