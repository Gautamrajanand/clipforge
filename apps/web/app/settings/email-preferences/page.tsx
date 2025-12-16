'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import {
  Mail,
  Bell,
  TrendingUp,
  CreditCard,
  AlertCircle,
  CheckCircle,
  Loader2,
  Save,
} from 'lucide-react';
import Link from 'next/link';
import { fetchWithAuth } from '@/lib/api';

interface EmailPreferences {
  // Transactional (cannot be disabled)
  transactional: boolean;
  
  // Product Updates
  productUpdates: boolean;
  featureAnnouncements: boolean;
  
  // Account & Credits
  creditsLow: boolean;
  creditsReset: boolean;
  trialReminders: boolean;
  
  // Usage & Activity
  weeklyDigest: boolean;
  monthlyReport: boolean;
  inactivityReminders: boolean;
  
  // Marketing
  tips: boolean;
  caseStudies: boolean;
  promotions: boolean;
}

const defaultPreferences: EmailPreferences = {
  transactional: true,
  productUpdates: true,
  featureAnnouncements: true,
  creditsLow: true,
  creditsReset: true,
  trialReminders: true,
  weeklyDigest: true,
  monthlyReport: true,
  inactivityReminders: true,
  tips: true,
  caseStudies: true,
  promotions: true,
};

export default function EmailPreferencesPage() {
  const { getToken } = useAuth();
  const [preferences, setPreferences] = useState<EmailPreferences>(defaultPreferences);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const response = await fetchWithAuth('/v1/users/email-preferences', {
        method: 'GET',
        getToken,
      });
      const data = await response.json();
      setPreferences({ ...defaultPreferences, ...data });
    } catch (error) {
      console.error('Failed to load email preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setSaved(false);

      await fetchWithAuth('/v1/users/email-preferences', {
        method: 'PUT',
        getToken,
        body: JSON.stringify(preferences),
      });

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Failed to save email preferences:', error);
      alert('Failed to save preferences. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const togglePreference = (key: keyof EmailPreferences) => {
    if (key === 'transactional') return; // Cannot disable transactional emails
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleAll = (enabled: boolean) => {
    setPreferences({
      transactional: true, // Always enabled
      productUpdates: enabled,
      featureAnnouncements: enabled,
      creditsLow: enabled,
      creditsReset: enabled,
      trialReminders: enabled,
      weeklyDigest: enabled,
      monthlyReport: enabled,
      inactivityReminders: enabled,
      tips: enabled,
      caseStudies: enabled,
      promotions: enabled,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            ← Back to Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Email Preferences</h1>
              <p className="mt-2 text-gray-600">
                Manage which emails you receive from ClipForge
              </p>
            </div>
            <Mail className="w-12 h-12 text-primary-500" />
          </div>
        </div>

        {/* Save Banner */}
        {saved && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
            <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
            <p className="text-sm font-medium text-green-900">
              Email preferences saved successfully!
            </p>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mb-6 flex gap-3">
          <button
            onClick={() => toggleAll(true)}
            className="px-4 py-2 bg-primary-100 hover:bg-primary-200 text-primary-700 font-medium rounded-lg transition-colors text-sm"
          >
            Enable All
          </button>
          <button
            onClick={() => toggleAll(false)}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors text-sm"
          >
            Disable All (except required)
          </button>
        </div>

        {/* Transactional Emails */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center mb-4">
            <Bell className="w-5 h-5 text-gray-700 mr-3" />
            <h2 className="text-lg font-semibold text-gray-900">Transactional Emails</h2>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Essential emails about your account and projects. These cannot be disabled.
          </p>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Account & Security</p>
                <p className="text-sm text-gray-600">Welcome, password resets, security alerts</p>
              </div>
              <div className="flex items-center">
                <span className="text-sm text-gray-500 mr-3">Required</span>
                <div className="w-12 h-6 bg-primary-500 rounded-full flex items-center justify-end px-1 cursor-not-allowed opacity-50">
                  <div className="w-4 h-4 bg-white rounded-full" />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Project Status</p>
                <p className="text-sm text-gray-600">Processing complete, errors, export ready</p>
              </div>
              <div className="flex items-center">
                <span className="text-sm text-gray-500 mr-3">Required</span>
                <div className="w-12 h-6 bg-primary-500 rounded-full flex items-center justify-end px-1 cursor-not-allowed opacity-50">
                  <div className="w-4 h-4 bg-white rounded-full" />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Billing & Payments</p>
                <p className="text-sm text-gray-600">Invoices, payment confirmations, subscription changes</p>
              </div>
              <div className="flex items-center">
                <span className="text-sm text-gray-500 mr-3">Required</span>
                <div className="w-12 h-6 bg-primary-500 rounded-full flex items-center justify-end px-1 cursor-not-allowed opacity-50">
                  <div className="w-4 h-4 bg-white rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Updates */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center mb-4">
            <TrendingUp className="w-5 h-5 text-gray-700 mr-3" />
            <h2 className="text-lg font-semibold text-gray-900">Product Updates</h2>
          </div>

          <div className="space-y-3">
            <EmailToggle
              label="Product Updates"
              description="New features, improvements, and product news"
              enabled={preferences.productUpdates}
              onToggle={() => togglePreference('productUpdates')}
            />
            <EmailToggle
              label="Feature Announcements"
              description="Major feature launches and updates"
              enabled={preferences.featureAnnouncements}
              onToggle={() => togglePreference('featureAnnouncements')}
            />
          </div>
        </div>

        {/* Account & Credits */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center mb-4">
            <CreditCard className="w-5 h-5 text-gray-700 mr-3" />
            <h2 className="text-lg font-semibold text-gray-900">Account & Credits</h2>
          </div>

          <div className="space-y-3">
            <EmailToggle
              label="Low Credits Alert"
              description="When you're running low on credits (< 20%)"
              enabled={preferences.creditsLow}
              onToggle={() => togglePreference('creditsLow')}
            />
            <EmailToggle
              label="Credits Reset"
              description="Monthly credit renewal notifications"
              enabled={preferences.creditsReset}
              onToggle={() => togglePreference('creditsReset')}
            />
            <EmailToggle
              label="Trial Reminders"
              description="Free trial expiration reminders"
              enabled={preferences.trialReminders}
              onToggle={() => togglePreference('trialReminders')}
            />
          </div>
        </div>

        {/* Usage & Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center mb-4">
            <AlertCircle className="w-5 h-5 text-gray-700 mr-3" />
            <h2 className="text-lg font-semibold text-gray-900">Usage & Activity</h2>
          </div>

          <div className="space-y-3">
            <EmailToggle
              label="Weekly Digest"
              description="Weekly summary of your projects and activity"
              enabled={preferences.weeklyDigest}
              onToggle={() => togglePreference('weeklyDigest')}
            />
            <EmailToggle
              label="Monthly Report"
              description="Monthly usage report and insights"
              enabled={preferences.monthlyReport}
              onToggle={() => togglePreference('monthlyReport')}
            />
            <EmailToggle
              label="Inactivity Reminders"
              description="Gentle reminders if you haven't used ClipForge in a while"
              enabled={preferences.inactivityReminders}
              onToggle={() => togglePreference('inactivityReminders')}
            />
          </div>
        </div>

        {/* Marketing & Education */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center mb-4">
            <Mail className="w-5 h-5 text-gray-700 mr-3" />
            <h2 className="text-lg font-semibold text-gray-900">Marketing & Education</h2>
          </div>

          <div className="space-y-3">
            <EmailToggle
              label="Tips & Best Practices"
              description="Video editing tips and how to get the most from ClipForge"
              enabled={preferences.tips}
              onToggle={() => togglePreference('tips')}
            />
            <EmailToggle
              label="Case Studies"
              description="Success stories from other creators"
              enabled={preferences.caseStudies}
              onToggle={() => togglePreference('caseStudies')}
            />
            <EmailToggle
              label="Promotions & Offers"
              description="Special offers, discounts, and promotions"
              enabled={preferences.promotions}
              onToggle={() => togglePreference('promotions')}
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-between bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div>
            <p className="font-medium text-gray-900">Save your preferences</p>
            <p className="text-sm text-gray-600">Changes will take effect immediately</p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                Save Preferences
              </>
            )}
          </button>
        </div>

        {/* Unsubscribe Info */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900">Need to unsubscribe completely?</p>
              <p className="text-sm text-blue-700 mt-1">
                You can unsubscribe from all marketing emails using the link at the bottom of any email we send you.
                Transactional emails (like project notifications and billing) will still be sent.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmailToggle({
  label,
  description,
  enabled,
  onToggle,
}: {
  label: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
      <div className="flex-1">
        <p className="font-medium text-gray-900">{label}</p>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
      <button
        onClick={onToggle}
        className={`ml-4 w-12 h-6 rounded-full transition-colors flex items-center ${
          enabled ? 'bg-primary-500 justify-end' : 'bg-gray-300 justify-start'
        } px-1`}
      >
        <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
      </button>
    </div>
  );
}
