import type { Metadata } from 'next';
import { Providers } from './providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'ClipForge - Turn Long Videos Into Viral Clips Instantly',
  description: 'AI-powered clip detection finds the best moments in your videos automatically. Upload once, export multiple clips, and share everywhere.',
  keywords: ['AI video editing', 'video clips', 'viral clips', 'content creation', 'YouTube Shorts', 'Instagram Reels', 'TikTok', 'clip detection'],
  authors: [{ name: 'ClipForge' }],
  creator: 'ClipForge',
  publisher: 'ClipForge',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'ClipForge - Turn Long Videos Into Viral Clips Instantly',
    description: 'AI-powered clip detection finds the best moments in your videos automatically.',
    type: 'website',
    locale: 'en_US',
    siteName: 'ClipForge',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ClipForge - Turn Long Videos Into Viral Clips Instantly',
    description: 'AI-powered clip detection finds the best moments in your videos automatically.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
