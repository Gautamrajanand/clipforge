'use client';

import { useState } from 'react';
import { X, Upload, Heart } from 'lucide-react';

interface SelectProjectModalProps {
  onClose: () => void;
  onSelect: (project: any) => void;
}

export function SelectProjectModal({ onClose, onSelect }: SelectProjectModalProps) {
  const [activeTab, setActiveTab] = useState<'projects' | 'likes'>('projects');

  // Mock projects - replace with actual API call
  const projects = [
    {
      id: '1',
      title: 'clip-cmhkwy88300005f4...',
      thumbnail: '/api/placeholder/200/150',
      duration: '00:55',
      daysUntilExpiry: 2,
    },
    {
      id: '2',
      title: 'clip-cmhkwy88300005f4...',
      thumbnail: '/api/placeholder/200/150',
      duration: '00:55',
      daysUntilExpiry: 2,
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[80vh] overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Select project</h2>
            <p className="text-sm text-gray-600 mt-1">
              Select the project that contains the clip you would like to schedule.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Tabs and Upload Button */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab('projects')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'projects'
                  ? 'bg-gray-50 text-gray-900'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Projects
            </button>
            <button
              onClick={() => setActiveTab('likes')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                activeTab === 'likes'
                  ? 'bg-gray-50 text-gray-900'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Heart className="w-4 h-4" />
              Likes
            </button>
          </div>
          <button className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-900 font-medium rounded-lg transition-colors flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Upload own video
          </button>
        </div>

        {/* Projects Grid */}
        <div className="p-6 overflow-y-auto max-h-[50vh]">
          {activeTab === 'projects' ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {projects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => onSelect(project)}
                  className="group relative bg-gray-50 rounded-lg overflow-hidden hover:ring-2 hover:ring-primary-500 transition-all"
                >
                  {/* Thumbnail */}
                  <div className="aspect-video bg-gray-700 relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center">
                        <div className="w-0 h-0 border-l-8 border-l-white border-y-6 border-y-transparent ml-1"></div>
                      </div>
                    </div>
                    {/* Duration Badge */}
                    <div className="absolute top-2 right-2 px-2 py-1 bg-black/80 text-gray-900 text-xs rounded">
                      {project.duration}
                    </div>
                  </div>

                  {/* Project Info */}
                  <div className="p-3">
                    <p className="text-sm text-gray-900 truncate mb-1">{project.title}</p>
                    <p className="text-xs text-gray-500">
                      {project.daysUntilExpiry} days before expiring
                    </p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Heart className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-600">No liked clips yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
