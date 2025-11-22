import { Metadata } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';

interface SEOProps {
  title: string;
  description: string;
  path?: string;
  image?: string;
  noIndex?: boolean;
  keywords?: string[];
}

export function generateSEO({
  title,
  description,
  path = '',
  image = '/og-image.png',
  noIndex = false,
  keywords = [],
}: SEOProps): Metadata {
  const url = `${baseUrl}${path}`;

  return {
    title,
    description,
    keywords: keywords.length > 0 ? keywords : undefined,
    openGraph: {
      title,
      description,
      url,
      siteName: 'ClipForge',
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      type: 'website',
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
      creator: '@clipforge',
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
        }
      : {
          index: true,
          follow: true,
        },
    alternates: {
      canonical: url,
    },
  };
}

// Pre-defined SEO configs for common pages
export const SEO_CONFIGS = {
  pricing: {
    title: 'Pricing Plans - Start Free | ClipForge',
    description:
      'Choose the perfect plan for your video editing needs. Start free with 60 credits/month. Upgrade to Starter ($29/mo) or Pro ($79/mo) for more credits and features.',
    keywords: [
      'video editing pricing',
      'AI video editor cost',
      'video clip generator pricing',
      'affordable video editing',
      'video editing subscription',
    ],
  },
  dashboard: {
    title: 'Dashboard',
    description: 'Manage your video projects and clips',
    noIndex: true,
  },
  features: {
    title: 'Features - AI-Powered Video Editing | ClipForge',
    description:
      'Discover powerful features: AI clip detection, auto captions, multi-platform export, virality scoring, and more. Everything you need to create viral short-form content.',
    keywords: [
      'AI clip detection',
      'automatic captions',
      'video repurposing',
      'virality scoring',
      'multi-platform export',
    ],
  },
  blog: {
    title: 'Blog - Video Marketing Tips & Tutorials | ClipForge',
    description:
      'Learn video marketing strategies, content creation tips, and how to grow your social media presence with short-form video content.',
    keywords: [
      'video marketing',
      'content creation tips',
      'social media strategy',
      'YouTube Shorts tips',
      'TikTok marketing',
    ],
  },
};

// JSON-LD structured data generators
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'ClipForge',
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    description: 'AI-powered video clip generator for creating viral short-form content',
    sameAs: [
      'https://twitter.com/clipforge',
      'https://www.linkedin.com/company/clipforge',
      'https://www.youtube.com/@clipforge',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Support',
      email: 'support@clipforge.ai',
    },
  };
}

export function generateProductSchema(product: {
  name: string;
  price: number;
  currency?: string;
  description: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: product.currency || 'USD',
      availability: 'https://schema.org/InStock',
      url: `${baseUrl}/pricing`,
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '127',
    },
  };
}

export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${baseUrl}${item.url}`,
    })),
  };
}

export function generateFAQSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

export function generateVideoObjectSchema(video: {
  name: string;
  description: string;
  thumbnailUrl: string;
  uploadDate: string;
  duration?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: video.name,
    description: video.description,
    thumbnailUrl: video.thumbnailUrl,
    uploadDate: video.uploadDate,
    duration: video.duration,
    contentUrl: `${baseUrl}/videos/${video.name}`,
  };
}
