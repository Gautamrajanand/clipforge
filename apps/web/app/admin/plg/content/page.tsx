'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { fetchWithAuth } from '@/lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

import { Plus, Edit, Trash2, Eye, EyeOff, Save } from 'lucide-react';

interface OnboardingStep {
  id: string;
  step: number;
  title: string;
  subtitle?: string;
  description: string;
  icon?: string;
  imageUrl?: string;
  ctaText: string;
  ctaUrl?: string;
  isActive: boolean;
  order: number;
}

export default function PLGContentManager() {
  const { getToken } = useAuth();
  const [steps, setSteps] = useState<OnboardingStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingStep, setEditingStep] = useState<OnboardingStep | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadSteps();
  }, []);

  const loadSteps = async () => {
    try {
      setLoading(true);
      const response = await fetchWithAuth(`${API_URL}/admin/plg/content/onboarding`, {
        getToken,
      });
      
      if (response.ok) {
        const data = await response.json();
        setSteps(data);
      } else {
        console.error('Failed to load steps:', response.status);
        // Show empty state if no steps
        setSteps([]);
      }
    } catch (error) {
      console.error('Failed to load steps:', error);
      setSteps([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (step: OnboardingStep) => {
    try {
      // TODO: Implement API endpoint
      // await fetchWithAuth(`${API_URL}/admin/plg/content/onboarding`, {
      //   getToken,
      //   method: step.id ? 'PUT' : 'POST',
      //   body: JSON.stringify(step),
      // });
      loadSteps();
      setShowForm(false);
      setEditingStep(null);
    } catch (error) {
      console.error('Failed to save step:', error);
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      // TODO: Implement API endpoint
      console.log('Toggle active:', id, isActive);
      loadSteps();
    } catch (error) {
      console.error('Failed to toggle active:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this step?')) return;
    try {
      // TODO: Implement API endpoint
      console.log('Delete:', id);
      loadSteps();
    } catch (error) {
      console.error('Failed to delete step:', error);
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">PLG Content Manager</h1>
            <p className="text-gray-600 mt-1">
              Control onboarding flows, popups, and user messaging
            </p>
          </div>
          <button
            onClick={() => {
              setEditingStep(null);
              setShowForm(true);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Step
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex gap-6">
            <button className="px-4 py-2 border-b-2 border-blue-600 text-blue-600 font-medium">
              Onboarding Steps
            </button>
            <button className="px-4 py-2 border-b-2 border-transparent text-gray-500 hover:text-gray-700">
              Popups & Modals
            </button>
            <button className="px-4 py-2 border-b-2 border-transparent text-gray-500 hover:text-gray-700">
              Banners
            </button>
            <button className="px-4 py-2 border-b-2 border-transparent text-gray-500 hover:text-gray-700">
              Email Templates
            </button>
          </nav>
        </div>

        {/* Onboarding Steps List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading...</div>
          ) : steps.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500 mb-4">No onboarding steps yet</p>
              <button
                onClick={() => setShowForm(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create First Step
              </button>
            </div>
          ) : (
            steps.map((step) => (
              <div
                key={step.id}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{step.icon || '📝'}</span>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Step {step.step}: {step.title}
                        </h3>
                        {step.subtitle && (
                          <p className="text-sm text-gray-600">{step.subtitle}</p>
                        )}
                      </div>
                      {!step.isActive && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                          Inactive
                        </span>
                      )}
                    </div>
                    <p className="text-gray-700 mt-2">{step.description}</p>
                    <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                      <span>CTA: {step.ctaText}</span>
                      {step.ctaUrl && <span>→ {step.ctaUrl}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleActive(step.id, !step.isActive)}
                      className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                      title={step.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {step.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => {
                        setEditingStep(step);
                        setShowForm(true);
                      }}
                      className="p-2 text-blue-600 hover:text-blue-700 rounded-lg hover:bg-blue-50"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(step.id)}
                      className="p-2 text-red-600 hover:text-red-700 rounded-lg hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Edit Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {editingStep ? 'Edit Step' : 'Add New Step'}
              </h2>
              
              {/* Form fields would go here */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Step Number
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    defaultValue={editingStep?.step || steps.length + 1}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    defaultValue={editingStep?.title || ''}
                    placeholder="Welcome to ClipForge!"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    defaultValue={editingStep?.description || ''}
                    placeholder="Explain what this step is about..."
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Icon/Emoji
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      defaultValue={editingStep?.icon || ''}
                      placeholder="🎉"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CTA Text
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      defaultValue={editingStep?.ctaText || 'Next'}
                      placeholder="Get Started"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingStep(null);
                  }}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSave(editingStep || {} as OnboardingStep)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Step
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">💡 How it works</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Create multi-step onboarding flows that guide new users</li>
            <li>• Control when and where popups appear</li>
            <li>• A/B test different messaging and CTAs</li>
            <li>• All content is managed here - no code changes needed!</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
