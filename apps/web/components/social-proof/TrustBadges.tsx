'use client';

import { Shield, Lock, Zap, Award, CheckCircle, Star } from 'lucide-react';

/**
 * Trust Badges Component
 * Build credibility and reduce friction
 * 
 * Features:
 * - Security badges
 * - Performance guarantees
 * - Quality assurances
 * - Awards/recognition
 */

const BADGES = [
  {
    icon: <Shield className="w-6 h-6" />,
    title: 'Enterprise Security',
    description: 'Bank-level encryption',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    icon: <Lock className="w-6 h-6" />,
    title: 'GDPR Compliant',
    description: 'Your data is safe',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: '99.9% Uptime',
    description: 'Always available',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
  },
  {
    icon: <Award className="w-6 h-6" />,
    title: 'Product Hunt',
    description: '#1 Product of the Day',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
  },
  {
    icon: <CheckCircle className="w-6 h-6" />,
    title: 'Money-Back Guarantee',
    description: '30-day refund policy',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
  {
    icon: <Star className="w-6 h-6" />,
    title: '4.9/5 Rating',
    description: 'From 1,247 reviews',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
  },
];

export default function TrustBadges() {
  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {BADGES.map((badge, index) => (
            <div
              key={index}
              className="bg-white rounded-lg p-4 text-center hover:shadow-md transition-shadow"
            >
              {/* Icon */}
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${badge.bgColor} ${badge.color} mb-3`}>
                {badge.icon}
              </div>

              {/* Title */}
              <div className="font-semibold text-gray-900 text-sm mb-1">
                {badge.title}
              </div>

              {/* Description */}
              <div className="text-xs text-gray-500">
                {badge.description}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
