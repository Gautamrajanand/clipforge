import type { Metadata } from 'next';
import { Providers } from './providers';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'),
  title: {
    default: 'ClipForge - AI-Powered Video Clip Generator | Turn Long Videos Into Viral Shorts',
    template: '%s | ClipForge',
  },
  description: 'Transform long-form videos into viral short clips with AI. Automatic clip detection, multi-platform export (TikTok, Instagram Reels, YouTube Shorts), and professional captions. 10x faster than manual editing.',
  keywords: [
    'AI video editing',
    'video clip generator',
    'viral clips',
    'YouTube Shorts maker',
    'Instagram Reels editor',
    'TikTok video editor',
    'automatic clip detection',
    'AI captions',
    'video repurposing',
    'content creation tool',
    'social media video editor',
    'short form content',
    'video marketing',
    'podcast clips',
    'webinar clips',
  ],
  authors: [{ name: 'ClipForge', url: 'https://clipforge.ai' }],
  creator: 'ClipForge',
  publisher: 'ClipForge',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'ClipForge',
    title: 'ClipForge - AI-Powered Video Clip Generator',
    description: 'Transform long-form videos into viral short clips with AI. Automatic clip detection, multi-platform export, and professional captions.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'ClipForge - AI Video Clip Generator',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ClipForge - AI-Powered Video Clip Generator',
    description: 'Transform long-form videos into viral short clips with AI. 10x faster than manual editing.',
    images: ['/twitter-image.png'],
    creator: '@clipforge',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    // yandex: 'yandex-verification-code',
    // bing: 'bing-verification-code',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'ClipForge',
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'USD',
      lowPrice: '0',
      highPrice: '79',
      offerCount: '3',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '127',
    },
    description: 'AI-powered video clip generator that transforms long-form videos into viral short clips automatically.',
    featureList: [
      'Automatic clip detection with AI',
      'Multi-platform export (TikTok, Instagram Reels, YouTube Shorts)',
      'Professional AI-generated captions',
      'Auto reframe for different aspect ratios',
      'Virality scoring',
      'Batch export',
    ],
  };

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
