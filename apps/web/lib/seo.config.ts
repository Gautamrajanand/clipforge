const SEO_CONFIG = {
  defaultTitle: 'ClipForge - AI-Powered Video Repurposing for Social Media',
  titleTemplate: '%s | ClipForge',
  description: 'Transform long videos into viral short clips with AI. Generate captions, reframe for social media, and create engaging content in minutes. Free tier available.',
  canonical: 'https://clipforge.ai',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://clipforge.ai',
    siteName: 'ClipForge',
    title: 'ClipForge - AI-Powered Video Repurposing',
    description: 'Transform long videos into viral short clips with AI. Generate captions, reframe for social media, and create engaging content in minutes.',
    images: [
      {
        url: 'https://clipforge.ai/og-image.png',
        width: 1200,
        height: 630,
        alt: 'ClipForge - AI Video Repurposing',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    handle: '@clipforge',
    site: '@clipforge',
    cardType: 'summary_large_image',
  },
  additionalMetaTags: [
    {
      name: 'viewport',
      content: 'width=device-width, initial-scale=1',
    },
    {
      name: 'keywords',
      content: 'video editing, AI clips, social media content, video repurposing, captions, subtitles, TikTok, Instagram Reels, YouTube Shorts, content creation',
    },
    {
      name: 'author',
      content: 'ClipForge',
    },
    {
      name: 'robots',
      content: 'index, follow',
    },
    {
      property: 'og:type',
      content: 'website',
    },
  ],
  additionalLinkTags: [
    {
      rel: 'icon',
      href: '/favicon.ico',
    },
    {
      rel: 'apple-touch-icon',
      href: '/apple-touch-icon.png',
      sizes: '180x180',
    },
    {
      rel: 'manifest',
      href: '/site.webmanifest',
    },
  ],
};

export default SEO_CONFIG;

// Page-specific SEO configs
export const PAGE_SEO = {
  home: {
    title: 'AI-Powered Video Repurposing for Social Media',
    description: 'Transform long videos into viral short clips with AI. Generate captions, reframe for social media, and create engaging content in minutes. Start free today.',
    canonical: 'https://clipforge.ai',
  },
  dashboard: {
    title: 'Dashboard',
    description: 'Manage your video projects, generate AI clips, and track your content creation progress.',
    noindex: true,
  },
  pricing: {
    title: 'Pricing Plans - Start Free or Upgrade',
    description: 'Choose the perfect plan for your content creation needs. Free tier with 60 minutes/month, or upgrade for unlimited features starting at $29/month.',
    canonical: 'https://clipforge.ai/pricing',
  },
  features: {
    aiClips: {
      title: 'AI Clips - Automatic Viral Moment Detection',
      description: 'Let AI find the most engaging moments in your videos and create viral-ready clips with captions automatically.',
      canonical: 'https://clipforge.ai/features/ai-clips',
    },
    aiReframe: {
      title: 'AI Reframe - Convert Videos for Social Media',
      description: 'Automatically reframe landscape videos to vertical format (9:16) perfect for TikTok, Instagram Reels, and YouTube Shorts.',
      canonical: 'https://clipforge.ai/features/ai-reframe',
    },
    aiSubtitles: {
      title: 'AI Subtitles - Multi-Language Captions',
      description: 'Generate accurate subtitles in 20+ languages with customizable styles. Increase engagement and accessibility.',
      canonical: 'https://clipforge.ai/features/ai-subtitles',
    },
  },
  blog: {
    title: 'Blog - Video Marketing Tips & Guides',
    description: 'Learn video marketing strategies, content creation tips, and how to grow your social media presence.',
    canonical: 'https://clipforge.ai/blog',
  },
};
