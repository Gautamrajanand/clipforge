'use client';

import { ClerkProvider } from '@clerk/nextjs';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { AnalyticsProvider } from '@/components/providers/AnalyticsProvider';
import { PostHogProvider, PostHogPageView } from '@/lib/posthog';
import IntercomWidget from '@/components/IntercomWidget';

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: undefined,
        variables: {
          colorPrimary: '#10b981', // emerald-500
          colorText: '#111827', // gray-900
        },
      }}
    >
      <PostHogProvider>
        <QueryClientProvider client={queryClient}>
          <AnalyticsProvider>
            <PostHogPageView />
            <IntercomWidget />
            {children}
            <Toaster position="top-right" />
          </AnalyticsProvider>
        </QueryClientProvider>
      </PostHogProvider>
    </ClerkProvider>
  );
}
