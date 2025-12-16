'use client';

import { useState } from 'react';
import { X, Clock, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

interface ProjectExpiryNudgeProps {
  expiresAt: string;
  projectTitle: string;
  onDismiss?: () => void;
}

export default function ProjectExpiryNudge({ 
  expiresAt, 
  projectTitle,
  onDismiss 
}: ProjectExpiryNudgeProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  // Calculate hours until expiry
  const now = new Date();
  const expiryDate = new Date(expiresAt);
  const hoursUntilExpiry = Math.floor((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60));
  
  // Only show if expiring within 24 hours
  if (isDismissed || hoursUntilExpiry > 24 || hoursUntilExpiry < 0) return null;

  const isUrgent = hoursUntilExpiry <= 6;

  return (
    <div className={`${
      isUrgent 
        ? 'bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-500' 
        : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500'
    } rounded-lg p-4 mb-6 relative`}>
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex items-start">
        <div className="flex-shrink-0">
          {isUrgent ? (
            <AlertTriangle className="w-6 h-6 text-red-600" />
          ) : (
            <Clock className="w-6 h-6 text-blue-600" />
          )}
        </div>
        <div className="ml-3 flex-1">
          <h3 className={`text-sm font-semibold ${isUrgent ? 'text-red-900' : 'text-blue-900'}`}>
            {isUrgent ? '⚠️ Project Expiring Soon!' : 'Project Expiring in 24 Hours'}
          </h3>
          <p className={`text-sm ${isUrgent ? 'text-red-800' : 'text-blue-800'} mt-1`}>
            <strong>"{projectTitle}"</strong> will be deleted in{' '}
            <strong>{hoursUntilExpiry} {hoursUntilExpiry === 1 ? 'hour' : 'hours'}</strong>.
            {' '}Upgrade to keep your projects forever!
          </p>
          
          <div className="mt-3 space-y-2">
            <div className="flex items-center gap-3">
              <Link
                href="/pricing"
                className={`inline-flex items-center px-4 py-2 ${
                  isUrgent 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : 'bg-blue-600 hover:bg-blue-700'
                } text-white text-sm font-medium rounded-lg transition-colors`}
              >
                Upgrade Now - Save Project
              </Link>
              <span className="text-xs text-gray-600">
                Starter: 90 days • Pro: Forever
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
