import { Metadata } from 'next';
import LandingTemplate from '@/components/landing/LandingTemplate';
import { getOrganizationSchema, getFAQSchema } from '@/lib/structuredData';

export const metadata: Metadata = {
  title: 'ClipForge for Agencies - White-Label Video Repurposing',
  description: 'Deliver more value to clients with AI-powered video repurposing. Scale your agency services without scaling your team.',
};

export default function AgenciesPage() {
  const faqs = [
    { question: 'Do you offer white-label solutions?', answer: 'Yes! BUSINESS and ENTERPRISE tiers include white-label options and API access for seamless integration.' },
    { question: 'Can we manage multiple clients?', answer: 'Absolutely! Create separate organizations for each client with dedicated credits and branding.' },
    { question: 'Is there API access?', answer: 'Yes, BUSINESS tier includes full API access with 100 requests/hour for automation and integration.' },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([getOrganizationSchema(), getFAQSchema(faqs)]) }} />
      <LandingTemplate
        badge="For Agencies"
        title="Scale Your Agency With AI Video Repurposing"
        subtitle="Deliver more value to clients without hiring more editors. White-label solutions, API access, and multi-client management."
        benefits={[
          { icon: '🚀', title: 'Scale Services', description: 'Handle 10x more clients without increasing headcount or overhead.' },
          { icon: '🏷️', title: 'White-Label', description: 'Rebrand as your own service with custom domains and branding.' },
          { icon: '💼', title: 'Higher Margins', description: 'Increase profit margins by 300% compared to manual editing.' },
        ]}
        features={[
          { icon: '🔌', title: 'API Access', description: 'Full API for automation and custom workflows' },
          { icon: '👥', title: 'Multi-Client', description: 'Manage unlimited clients with separate accounts' },
          { icon: '🎨', title: 'Custom Branding', description: 'White-label with your agency branding' },
          { icon: '📊', title: 'Client Reporting', description: 'Detailed analytics and performance reports' },
        ]}
        stats={[
          { value: '500+', label: 'Agencies' },
          { value: '10x', label: 'Client Capacity' },
          { value: '300%', label: 'Margin Increase' },
        ]}
        faqs={faqs}
      />
    </>
  );
}
