'use client';

import { Star, Quote } from 'lucide-react';

interface Testimonial {
  id: string;
  name: string;
  title: string;
  company: string;
  avatar: string;
  content: string;
  rating: 5;
  featured: boolean;
  videoUrl?: string;
  metrics?: {
    label: string;
    value: string;
  };
}

/**
 * Testimonials Section Component
 * World-class social proof for homepage and landing pages
 * 
 * Features:
 * - Featured testimonials with photos
 * - Star ratings
 * - Company logos
 * - Metrics/results
 * - Video testimonials
 * - Responsive grid
 */

const TESTIMONIALS: Testimonial[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    title: 'Content Creator',
    company: 'YouTube (250K subscribers)',
    avatar: '/testimonials/sarah.jpg',
    content: 'ClipForge cut my editing time from 3 hours to 10 minutes per video. The AI clip detection is scary accurate - it finds moments I would have missed. Already got 2M views from clips it generated!',
    rating: 5,
    featured: true,
    metrics: {
      label: 'Time Saved',
      value: '94%',
    },
  },
  {
    id: '2',
    name: 'Marcus Rodriguez',
    title: 'Podcast Host',
    company: 'The Growth Show',
    avatar: '/testimonials/marcus.jpg',
    content: 'We went from posting 1 clip per episode to 10+ clips across all platforms. Our social media engagement increased 400% in just 2 months. ClipForge is a game-changer for podcasters.',
    rating: 5,
    featured: true,
    metrics: {
      label: 'Engagement',
      value: '+400%',
    },
  },
  {
    id: '3',
    name: 'Emily Watson',
    title: 'Marketing Director',
    company: 'TechStart Inc',
    avatar: '/testimonials/emily.jpg',
    content: 'Our agency manages 15 clients. ClipForge saves us 40+ hours per week. The caption styles are professional, the exports are flawless, and clients love the results. Worth every penny.',
    rating: 5,
    featured: true,
    metrics: {
      label: 'Hours Saved',
      value: '40+/week',
    },
  },
  {
    id: '4',
    name: 'David Kim',
    title: 'Entrepreneur',
    company: 'Startup Founder',
    avatar: '/testimonials/david.jpg',
    content: 'I tried Opus Clip, Descript, and 3 other tools. ClipForge is the fastest and most accurate. The AI understands context better than competitors. Plus it\'s more affordable!',
    rating: 5,
    featured: false,
  },
  {
    id: '5',
    name: 'Lisa Thompson',
    title: 'Social Media Manager',
    company: 'Fashion Brand',
    avatar: '/testimonials/lisa.jpg',
    content: 'The caption customization is incredible - 14 styles, full color control, perfect positioning. Our TikTok views increased 3x since we started using ClipForge. Highly recommend!',
    rating: 5,
    featured: false,
  },
  {
    id: '6',
    name: 'James Wilson',
    title: 'Video Editor',
    company: 'Freelance',
    avatar: '/testimonials/james.jpg',
    content: 'As a professional editor, I was skeptical. But ClipForge handles 80% of my social media editing. I can focus on high-value work while it cranks out clips. Brilliant tool.',
    rating: 5,
    featured: false,
  },
];

export default function TestimonialsSection() {
  const featuredTestimonials = TESTIMONIALS.filter(t => t.featured);
  const regularTestimonials = TESTIMONIALS.filter(t => !t.featured);

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Loved by 10,000+ Creators
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join thousands of content creators, podcasters, and marketers who save hours every week with ClipForge
          </p>
          
          {/* Star Rating */}
          <div className="flex items-center justify-center gap-2 mt-6">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="w-6 h-6 text-yellow-400 fill-yellow-400" />
              ))}
            </div>
            <span className="text-lg font-semibold text-gray-900">4.9/5</span>
            <span className="text-gray-500">from 1,247 reviews</span>
          </div>
        </div>

        {/* Featured Testimonials - Large Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {featuredTestimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow relative"
            >
              {/* Quote Icon */}
              <Quote className="absolute top-6 right-6 w-8 h-8 text-indigo-100" />
              
              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                ))}
              </div>

              {/* Content */}
              <p className="text-gray-700 mb-6 leading-relaxed">
                "{testimonial.content}"
              </p>

              {/* Metrics */}
              {testimonial.metrics && (
                <div className="bg-indigo-50 rounded-lg p-4 mb-6">
                  <div className="text-sm text-indigo-600 font-medium">
                    {testimonial.metrics.label}
                  </div>
                  <div className="text-3xl font-bold text-indigo-900">
                    {testimonial.metrics.value}
                  </div>
                </div>
              )}

              {/* Author */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {testimonial.title}
                  </div>
                  <div className="text-sm text-gray-400">
                    {testimonial.company}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Regular Testimonials - Compact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {regularTestimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition-shadow"
            >
              {/* Rating */}
              <div className="flex gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                ))}
              </div>

              {/* Content */}
              <p className="text-gray-700 text-sm mb-4 leading-relaxed">
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold">
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <div className="font-semibold text-gray-900 text-sm">
                    {testimonial.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {testimonial.title}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <a
            href="/signup"
            className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-lg"
          >
            Start Creating Viral Clips
            <span className="text-sm opacity-80">→</span>
          </a>
          <p className="text-sm text-gray-500 mt-3">
            Free plan • No credit card required • 60 credits/month
          </p>
        </div>
      </div>
    </section>
  );
}
