import { Metadata } from 'next';
import LandingTemplate from '@/components/landing/LandingTemplate';
import { getOrganizationSchema, getFAQSchema } from '@/lib/structuredData';

export const metadata: Metadata = {
  title: 'ClipForge for Podcasters - Turn Episodes into Viral Clips',
  description: 'Transform your podcast episodes into engaging social media clips. AI-powered clip generation, automatic captions, and audiograms for podcasters.',
};

export default function PodcastersPage() {
  const faqs = [
    { question: 'Can I use audio-only files?', answer: 'Yes! Upload audio files and we\'ll create audiograms with animated waveforms and captions.' },
    { question: 'How does ClipForge find the best moments?', answer: 'Our AI analyzes your content for engaging topics, emotional peaks, and shareable moments.' },
    { question: 'Can I add my podcast artwork?', answer: 'Absolutely! Customize with your podcast logo, colors, and branding.' },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([getOrganizationSchema(), getFAQSchema(faqs)]) }} />
      <LandingTemplate
        badge="For Podcasters"
        title="Turn Your Podcast Episodes Into Viral Clips"
        subtitle="Transform long-form podcast content into engaging social media clips. AI-powered clip generation, automatic captions, and audiograms that drive listeners."
        benefits={[
          { icon: '🎙️', title: 'Audio & Video', description: 'Works with both audio-only and video podcasts. Create audiograms or video clips.' },
          { icon: '⚡', title: '10x Faster', description: 'Create 10 clips in minutes. No more hours of manual editing.' },
          { icon: '📈', title: 'Grow Faster', description: 'Get more listeners with viral clips on TikTok, Instagram, and YouTube.' },
        ]}
        features={[
          { icon: '✂️', title: 'AI Clip Generation', description: 'Find the most shareable moments automatically' },
          { icon: '🎨', title: 'Audiograms', description: 'Animated waveforms with your podcast artwork' },
          { icon: '💬', title: 'Auto Captions', description: '95%+ accuracy with 14 animated styles' },
          { icon: '🎯', title: 'Topic Detection', description: 'AI identifies key topics and timestamps' },
        ]}
        stats={[
          { value: '50K+', label: 'Podcast Clips' },
          { value: '10x', label: 'More Reach' },
          { value: '5 min', label: 'Processing Time' },
        ]}
        faqs={faqs}
      />
    </>
  );
}
