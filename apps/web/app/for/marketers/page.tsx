import { Metadata } from 'next';
import LandingTemplate from '@/components/landing/LandingTemplate';
import { getOrganizationSchema, getFAQSchema } from '@/lib/structuredData';

export const metadata: Metadata = {
  title: 'ClipForge for Marketers - Scale Video Content Production',
  description: 'Scale your video marketing with AI. Turn webinars, testimonials, and long-form content into dozens of social media clips in minutes.',
};

export default function MarketersPage() {
  const faqs = [
    { question: 'How many clips can I create from one video?', answer: 'Typically 5-15 clips from a 30-minute video, depending on content density and engagement.' },
    { question: 'Can I maintain brand consistency?', answer: 'Yes! Customize colors, fonts, logos, and caption styles to match your brand guidelines.' },
    { question: 'Does it work with webinars?', answer: 'Absolutely! Perfect for webinars, product demos, customer testimonials, and thought leadership content.' },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([getOrganizationSchema(), getFAQSchema(faqs)]) }} />
      <LandingTemplate
        badge="For Marketers"
        title="Scale Your Video Marketing With AI"
        subtitle="Your complete post-recording toolkit. Extract viral moments, convert to any aspect ratio, and add professional captions—all powered by AI. Maximize ROI from every video asset."
        benefits={[
          { icon: '📊', title: 'Scale Production', description: 'Create 10x more content from existing video assets without hiring more editors.' },
          { icon: '💰', title: 'Lower CAC', description: 'Reduce customer acquisition costs with more engaging social content.' },
          { icon: '🎯', title: 'Brand Consistency', description: 'Maintain brand guidelines across all clips with custom templates.' },
        ]}
        features={[
          { icon: '✂️', title: 'AI Clips', description: 'Extract key moments from webinars and demos' },
          { icon: '📱', title: 'AI Reframe', description: 'Convert to 9:16, 1:1, 4:5 for all platforms' },
          { icon: '📝', title: 'AI Subtitles', description: 'Add captions to full videos in 14 styles' },
          { icon: '💬', title: 'Branded Captions', description: 'Custom colors, fonts, and styles' },
          { icon: '📤', title: 'Smart Export', description: 'Multiple formats and resolutions' },
          { icon: '📈', title: 'Performance Tracking', description: 'Analytics to optimize your content strategy' },
        ]}
        stats={[
          { value: '10x', label: 'More Content' },
          { value: '80%', label: 'Cost Savings' },
          { value: '5 min', label: 'Per Video' },
        ]}
        faqs={faqs}
      />
    </>
  );
}
