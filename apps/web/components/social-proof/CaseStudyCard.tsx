'use client';

import { ArrowRight, TrendingUp, Clock, DollarSign } from 'lucide-react';
import Link from 'next/link';

interface CaseStudy {
  id: string;
  title: string;
  company: string;
  industry: string;
  challenge: string;
  solution: string;
  results: {
    metric: string;
    value: string;
    icon: React.ReactNode;
  }[];
  quote: string;
  author: string;
  authorTitle: string;
  image: string;
  slug: string;
}

/**
 * Case Study Card Component
 * Detailed success stories with metrics
 * 
 * Features:
 * - Before/after metrics
 * - Customer quotes
 * - Industry-specific
 * - Link to full case study
 */

const CASE_STUDIES: CaseStudy[] = [
  {
    id: '1',
    title: 'How Sarah Grew Her YouTube Channel 10x in 6 Months',
    company: 'Sarah\'s Tech Reviews',
    industry: 'YouTube Creator',
    challenge: 'Spending 15+ hours/week editing clips for social media, missing posting deadlines, low engagement on short-form content.',
    solution: 'Switched to ClipForge for automated clip detection and caption generation. Now creates 10+ clips per video in under 15 minutes.',
    results: [
      {
        metric: 'Time Saved',
        value: '94%',
        icon: <Clock className="w-5 h-5" />,
      },
      {
        metric: 'Channel Growth',
        value: '10x',
        icon: <TrendingUp className="w-5 h-5" />,
      },
      {
        metric: 'Revenue Increase',
        value: '+$15K/mo',
        icon: <DollarSign className="w-5 h-5" />,
      },
    ],
    quote: 'ClipForge transformed my content strategy. I went from struggling to post 2 clips per week to easily creating 40+ clips per month. My engagement skyrocketed and I finally hit 250K subscribers!',
    author: 'Sarah Chen',
    authorTitle: 'YouTube Creator, 250K subscribers',
    image: '/case-studies/sarah-tech-reviews.jpg',
    slug: 'sarah-tech-reviews',
  },
  {
    id: '2',
    title: 'Podcast Agency Scales from 5 to 50 Clients with ClipForge',
    company: 'PodcastPro Agency',
    industry: 'Agency',
    challenge: 'Manual clip editing for clients was bottleneck. Could only handle 5 clients with 3 editors. Clients demanding more clips for social.',
    solution: 'Implemented ClipForge for all client accounts. Automated 80% of clip creation workflow. Editors now focus on high-value customization.',
    results: [
      {
        metric: 'Client Capacity',
        value: '10x',
        icon: <TrendingUp className="w-5 h-5" />,
      },
      {
        metric: 'Cost Reduction',
        value: '60%',
        icon: <DollarSign className="w-5 h-5" />,
      },
      {
        metric: 'Delivery Time',
        value: '-75%',
        icon: <Clock className="w-5 h-5" />,
      },
    ],
    quote: 'ClipForge allowed us to scale 10x without hiring more editors. We went from 5 clients to 50 clients in 4 months. Our profit margins doubled because we can deliver more value with less manual work.',
    author: 'Marcus Rodriguez',
    authorTitle: 'CEO, PodcastPro Agency',
    image: '/case-studies/podcastpro-agency.jpg',
    slug: 'podcastpro-agency',
  },
];

export default function CaseStudyCard({ caseStudy }: { caseStudy?: CaseStudy }) {
  const study = caseStudy || CASE_STUDIES[0];

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-white">
        <div className="text-sm font-semibold uppercase tracking-wide mb-2 opacity-90">
          {study.industry} • Case Study
        </div>
        <h3 className="text-2xl font-bold mb-2">
          {study.title}
        </h3>
        <p className="text-indigo-100">
          {study.company}
        </p>
      </div>

      {/* Content */}
      <div className="p-8">
        {/* Challenge & Solution */}
        <div className="mb-8">
          <div className="mb-4">
            <h4 className="font-semibold text-gray-900 mb-2">Challenge</h4>
            <p className="text-gray-600 text-sm">
              {study.challenge}
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Solution</h4>
            <p className="text-gray-600 text-sm">
              {study.solution}
            </p>
          </div>
        </div>

        {/* Results */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {study.results.map((result, index) => (
            <div
              key={index}
              className="bg-gray-50 rounded-lg p-4 text-center"
            >
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 mb-2">
                {result.icon}
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {result.value}
              </div>
              <div className="text-xs text-gray-600">
                {result.metric}
              </div>
            </div>
          ))}
        </div>

        {/* Quote */}
        <div className="bg-indigo-50 border-l-4 border-indigo-600 p-6 mb-6">
          <p className="text-gray-700 italic mb-4">
            "{study.quote}"
          </p>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
              {study.author.charAt(0)}
            </div>
            <div>
              <div className="font-semibold text-gray-900">
                {study.author}
              </div>
              <div className="text-sm text-gray-600">
                {study.authorTitle}
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <Link
          href={`/case-studies/${study.slug}`}
          className="inline-flex items-center gap-2 text-indigo-600 font-semibold hover:text-indigo-700 transition-colors"
        >
          Read Full Case Study
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

// Export case studies for use in other components
export { CASE_STUDIES };
