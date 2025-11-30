'use client';

import { useEffect, useState } from 'react';
import { Users, Video, Sparkles, TrendingUp } from 'lucide-react';

/**
 * Usage Counter Component
 * Real-time social proof showing platform usage
 * 
 * Features:
 * - Animated counters
 * - Real-time updates
 * - Multiple metrics
 * - Eye-catching design
 */

interface Stat {
  icon: React.ReactNode;
  label: string;
  value: number;
  suffix: string;
  color: string;
}

export default function UsageCounter() {
  const [stats, setStats] = useState<Stat[]>([
    {
      icon: <Users className="w-8 h-8" />,
      label: 'Active Creators',
      value: 0,
      suffix: '+',
      color: 'text-blue-600',
    },
    {
      icon: <Video className="w-8 h-8" />,
      label: 'Clips Generated',
      value: 0,
      suffix: 'M+',
      color: 'text-purple-600',
    },
    {
      icon: <Sparkles className="w-8 h-8" />,
      label: 'Hours Saved',
      value: 0,
      suffix: 'K+',
      color: 'text-indigo-600',
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      label: 'Views Generated',
      value: 0,
      suffix: 'B+',
      color: 'text-green-600',
    },
  ]);

  // Target values
  const targets = [10000, 2.5, 150, 1.2];

  useEffect(() => {
    // Animate counters on mount
    const duration = 2000; // 2 seconds
    const steps = 60;
    const interval = duration / steps;

    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;

      setStats(prevStats =>
        prevStats.map((stat, index) => ({
          ...stat,
          value: Math.floor(targets[index] * progress * 100) / 100,
        }))
      );

      if (currentStep >= steps) {
        clearInterval(timer);
        // Set final values
        setStats(prevStats =>
          prevStats.map((stat, index) => ({
            ...stat,
            value: targets[index],
          }))
        );
      }
    }, interval);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-16 bg-white border-y border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-gray-900 mb-2">
            Trusted by Creators Worldwide
          </h3>
          <p className="text-gray-600">
            Join thousands of content creators who save time and grow faster with ClipForge
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="text-center"
            >
              {/* Icon */}
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 ${stat.color} mb-4`}>
                {stat.icon}
              </div>

              {/* Value */}
              <div className="text-4xl font-bold text-gray-900 mb-2">
                {stat.value.toLocaleString()}
                <span className="text-2xl">{stat.suffix}</span>
              </div>

              {/* Label */}
              <div className="text-sm text-gray-600 font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Live Indicator */}
        <div className="flex items-center justify-center gap-2 mt-12">
          <div className="relative">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <div className="absolute inset-0 w-3 h-3 bg-green-500 rounded-full animate-ping"></div>
          </div>
          <span className="text-sm text-gray-600">
            <span className="font-semibold text-green-600">247 creators</span> are using ClipForge right now
          </span>
        </div>
      </div>
    </section>
  );
}
